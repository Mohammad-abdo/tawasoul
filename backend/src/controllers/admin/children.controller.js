import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All Children (Admin)
 */
export const getAllChildren = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, ageGroup, userId } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (ageGroup) where.ageGroup = ageGroup;
    if (userId) where.userId = userId;

    const [children, total] = await Promise.all([
      prisma.child.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              avatar: true
            }
          },
          _count: {
            select: {
              bookings: true
            }
          }
        }
      }),
      prisma.child.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        children,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get all children error:', error);
    next(error);
  }
};

/**
 * Get Child by ID (Admin)
 */
export const getChildById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const child = await prisma.child.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            avatar: true
          }
        },
        bookings: {
          orderBy: { scheduledAt: 'desc' },
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                avatar: true,
                specialization: true
              }
            }
          }
        }
      }
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHILD_NOT_FOUND',
          message: 'Child profile not found'
        }
      });
    }

    res.json({
      success: true,
      data: { child }
    });
  } catch (error) {
    logger.error('Get child error:', error);
    next(error);
  }
};

/**
 * Delete Child (Admin)
 */
export const deleteChild = async (req, res, next) => {
  try {
    const { id } = req.params;

    const child = await prisma.child.findUnique({
      where: { id }
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHILD_NOT_FOUND',
          message: 'Child profile not found'
        }
      });
    }

    await prisma.child.delete({
      where: { id }
    });

    logger.info(`Child profile deleted by admin: ${id}`);

    res.json({
      success: true,
      message: 'Child profile deleted successfully'
    });
  } catch (error) {
    logger.error('Delete child error:', error);
    next(error);
  }
};

