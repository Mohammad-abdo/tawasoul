import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All Admins
 */
export const getAllAdmins = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      isActive,
      sort = 'createdAt'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [admins, total] = await Promise.all([
      prisma.admin.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sort]: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.admin.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        admins,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get admins error:', error);
    next(error);
  }
};

/**
 * Get Admin by ID
 */
export const getAdminById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const admin = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ADMIN_NOT_FOUND',
          message: 'Admin not found'
        }
      });
    }

    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    logger.error('Get admin error:', error);
    next(error);
  }
};

/**
 * Create Admin
 */
export const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role = 'ADMIN', isActive = true } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, email, and password are required'
        }
      });
    }

    // Check if email exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email already exists'
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isActive
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'CREATE',
        entityType: 'ADMIN',
        entityId: admin.id,
        description: `Created admin: ${admin.name} (${admin.role})`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.status(201).json({
      success: true,
      data: admin,
      message: 'Admin created successfully'
    });
  } catch (error) {
    logger.error('Create admin error:', error);
    next(error);
  }
};

/**
 * Update Admin
 */
export const updateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    // Prevent updating self
    if (id === req.admin.id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_UPDATE_SELF',
          message: 'Cannot update your own account'
        }
      });
    }

    const admin = await prisma.admin.findUnique({ where: { id } });

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ADMIN_NOT_FOUND',
          message: 'Admin not found'
        }
      });
    }

    // Check if email exists (if changed)
    if (email && email !== admin.email) {
      const existingAdmin = await prisma.admin.findUnique({
        where: { email }
      });

      if (existingAdmin) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Email already exists'
          }
        });
      }
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(isActive !== undefined && { isActive })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'UPDATE',
        entityType: 'ADMIN',
        entityId: id,
        description: `Updated admin: ${updatedAdmin.name}`,
        changes: { before: admin, after: updatedAdmin },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: updatedAdmin,
      message: 'Admin updated successfully'
    });
  } catch (error) {
    logger.error('Update admin error:', error);
    next(error);
  }
};

/**
 * Change Admin Password
 */
export const changeAdminPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'New password is required'
        }
      });
    }

    const admin = await prisma.admin.findUnique({ where: { id } });

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ADMIN_NOT_FOUND',
          message: 'Admin not found'
        }
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.admin.update({
      where: { id },
      data: { password: hashedPassword }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'CHANGE_PASSWORD',
        entityType: 'ADMIN',
        entityId: id,
        description: `Changed password for admin: ${admin.name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change admin password error:', error);
    next(error);
  }
};

/**
 * Activate Admin
 */
export const activateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const admin = await prisma.admin.update({
      where: { id },
      data: { isActive: true }
    });

    res.json({
      success: true,
      data: admin,
      message: 'Admin activated successfully'
    });
  } catch (error) {
    logger.error('Activate admin error:', error);
    next(error);
  }
};

/**
 * Deactivate Admin
 */
export const deactivateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deactivating self
    if (id === req.admin.id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_DEACTIVATE_SELF',
          message: 'Cannot deactivate your own account'
        }
      });
    }

    const admin = await prisma.admin.update({
      where: { id },
      data: { isActive: false }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'DEACTIVATE',
        entityType: 'ADMIN',
        entityId: id,
        description: `Deactivated admin: ${admin.name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: admin,
      message: 'Admin deactivated successfully'
    });
  } catch (error) {
    logger.error('Deactivate admin error:', error);
    next(error);
  }
};

/**
 * Delete Admin
 */
export const deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (id === req.admin.id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_DELETE_SELF',
          message: 'Cannot delete your own account'
        }
      });
    }

    const admin = await prisma.admin.findUnique({ where: { id } });

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ADMIN_NOT_FOUND',
          message: 'Admin not found'
        }
      });
    }

    await prisma.admin.delete({ where: { id } });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'DELETE',
        entityType: 'ADMIN',
        entityId: id,
        description: `Deleted admin: ${admin.name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    logger.error('Delete admin error:', error);
    next(error);
  }
};


