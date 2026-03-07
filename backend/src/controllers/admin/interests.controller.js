import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All Interests
 */
export const getAllInterests = async (req, res, next) => {
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
          message: 'Database connection failed'
        },
        data: {
          interests: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
        }
      });
    }

    const {
      page = 1,
      limit = 20,
      search = '',
      sort = 'createdAt'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [interests, total] = await Promise.all([
      prisma.interest.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sort]: 'desc' }
      }),
      prisma.interest.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        interests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get interests error:', error);
    next(error);
  }
};

/**
 * Get Interest by ID
 */
export const getInterestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const interest = await prisma.interest.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            posts: true
          }
        }
      }
    });

    if (!interest) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INTEREST_NOT_FOUND',
          message: 'Interest not found'
        }
      });
    }

    res.json({
      success: true,
      data: interest
    });
  } catch (error) {
    logger.error('Get interest error:', error);
    next(error);
  }
};

/**
 * Create Interest
 */
export const createInterest = async (req, res, next) => {
  try {
    const { name, nameAr, description, icon, isActive = true } = req.body;

    if (!name || !nameAr) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name and nameAr are required'
        }
      });
    }

    const interest = await prisma.interest.create({
      data: {
        name,
        nameAr,
        description,
        icon,
        isActive
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'CREATE',
        entityType: 'INTEREST',
        entityId: interest.id,
        description: `Created interest: ${interest.nameAr}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.status(201).json({
      success: true,
      data: interest,
      message: 'Interest created successfully'
    });
  } catch (error) {
    logger.error('Create interest error:', error);
    next(error);
  }
};

/**
 * Update Interest
 */
export const updateInterest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, nameAr, description, icon, isActive } = req.body;

    const interest = await prisma.interest.findUnique({ where: { id } });

    if (!interest) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INTEREST_NOT_FOUND',
          message: 'Interest not found'
        }
      });
    }

    const updatedInterest = await prisma.interest.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(nameAr && { nameAr }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(isActive !== undefined && { isActive })
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'UPDATE',
        entityType: 'INTEREST',
        entityId: id,
        description: `Updated interest: ${updatedInterest.nameAr}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: updatedInterest,
      message: 'Interest updated successfully'
    });
  } catch (error) {
    logger.error('Update interest error:', error);
    next(error);
  }
};

/**
 * Delete Interest
 */
export const deleteInterest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const interest = await prisma.interest.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            posts: true
          }
        }
      }
    });

    if (!interest) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INTEREST_NOT_FOUND',
          message: 'Interest not found'
        }
      });
    }

    // Check if interest is used
    if (interest._count.users > 0 || interest._count.posts > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'INTEREST_IN_USE',
          message: 'Cannot delete interest that is in use'
        }
      });
    }

    await prisma.interest.delete({ where: { id } });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'DELETE',
        entityType: 'INTEREST',
        entityId: id,
        description: `Deleted interest: ${interest.nameAr}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Interest deleted successfully'
    });
  } catch (error) {
    logger.error('Delete interest error:', error);
    next(error);
  }
};

/**
 * Get Interest Usage Statistics
 */
export const getInterestUsage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const interest = await prisma.interest.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            posts: true
          }
        }
      }
    });

    if (!interest) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INTEREST_NOT_FOUND',
          message: 'Interest not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        interest,
        usage: {
          usersCount: interest._count.users,
          postsCount: interest._count.posts
        }
      }
    });
  } catch (error) {
    logger.error('Get interest usage error:', error);
    next(error);
  }
};

/**
 * Activate Interest
 */
export const activateInterest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const interest = await prisma.interest.update({
      where: { id },
      data: { isActive: true }
    });

    res.json({
      success: true,
      data: interest,
      message: 'Interest activated successfully'
    });
  } catch (error) {
    logger.error('Activate interest error:', error);
    next(error);
  }
};

/**
 * Deactivate Interest
 */
export const deactivateInterest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const interest = await prisma.interest.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      data: interest,
      message: 'Interest deactivated successfully'
    });
  } catch (error) {
    logger.error('Deactivate interest error:', error);
    next(error);
  }
};

