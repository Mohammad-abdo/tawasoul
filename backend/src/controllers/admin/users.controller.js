import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All Users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      logger.error('Database connection error:', dbError);
      return res.status(503).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Database connection failed. Please check database configuration.'
        },
        data: {
          users: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0
          }
        }
      });
    }

    const {
      page = 1,
      limit = 20,
      search = '',
      isActive,
      isApproved,
      sort = 'createdAt'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (isApproved !== undefined) {
      where.isApproved = isApproved === 'true';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sort]: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          avatar: true,
          isActive: true,
          isApproved: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get users error:', error);
    next(error);
  }
};

/**
 * Get User by ID
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        posts: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        bookings: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            doctor: {
              select: { name: true, specialization: true }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Get user error:', error);
    next(error);
  }
};

/**
 * Create User
 */
export const createUser = async (req, res, next) => {
  try {
    const { username, email, phone, password, isActive, isApproved } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Username and password are required'
        }
      });
    }

    // Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USERNAME_EXISTS',
          message: 'Username already exists'
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        phone,
        password: hashedPassword,
        isActive: isActive !== undefined ? isActive : true,
        isApproved: isApproved !== undefined ? isApproved : true
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        isActive: true,
        isApproved: true,
        createdAt: true
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'CREATE',
        entityType: 'USER',
        entityId: user.id,
        description: `Created user: ${user.username}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
    logger.error('Create user error:', error);
    next(error);
  }
};

/**
 * Update User
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, phone, isActive, isApproved } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(username && { username }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(isActive !== undefined && { isActive }),
        ...(isApproved !== undefined && { isApproved })
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        isActive: true,
        isApproved: true,
        updatedAt: true
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'UPDATE',
        entityType: 'USER',
        entityId: id,
        description: `Updated user: ${updatedUser.username}`,
        changes: { before: user, after: updatedUser },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error) {
    logger.error('Update user error:', error);
    next(error);
  }
};

/**
 * Approve User
 */
export const approveUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: { isApproved: true }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'APPROVE',
        entityType: 'USER',
        entityId: id,
        description: `Approved user: ${user.username}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: user,
      message: 'User approved successfully'
    });
  } catch (error) {
    logger.error('Approve user error:', error);
    next(error);
  }
};

/**
 * Reject User
 */
export const rejectUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isApproved: false, isActive: false }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'REJECT',
        entityType: 'USER',
        entityId: id,
        description: `Rejected user: ${user.username}. Reason: ${reason || 'No reason provided'}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: user,
      message: 'User rejected successfully'
    });
  } catch (error) {
    logger.error('Reject user error:', error);
    next(error);
  }
};

/**
 * Activate User
 */
export const activateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: true }
    });

    res.json({
      success: true,
      data: user,
      message: 'User activated successfully'
    });
  } catch (error) {
    logger.error('Activate user error:', error);
    next(error);
  }
};

/**
 * Deactivate User
 */
export const deactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'DEACTIVATE',
        entityType: 'USER',
        entityId: id,
        description: `Deactivated user: ${user.username}. Reason: ${reason || 'No reason provided'}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: user,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    logger.error('Deactivate user error:', error);
    next(error);
  }
};

/**
 * Delete User
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    await prisma.user.delete({ where: { id } });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'DELETE',
        entityType: 'USER',
        entityId: id,
        description: `Deleted user: ${user.username}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    next(error);
  }
};

