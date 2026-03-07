import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All Coupons
 */
export const getAllCoupons = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      code = '',
      isActive,
      expired,
      sort = 'createdAt'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (code) {
      where.code = { contains: code, mode: 'insensitive' };
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (expired === 'true') {
      where.validUntil = { lt: new Date() };
    } else if (expired === 'false') {
      where.validUntil = { gte: new Date() };
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sort]: 'desc' },
        include: {
          _count: {
            select: {
              doctorCoupons: true,
              userCoupons: true
            }
          }
        }
      }),
      prisma.coupon.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        coupons,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get coupons error:', error);
    next(error);
  }
};

/**
 * Get Coupon by ID
 */
export const getCouponById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        doctorCoupons: {
          include: {
            doctor: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        userCoupons: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COUPON_NOT_FOUND',
          message: 'Coupon not found'
        }
      });
    }

    res.json({
      success: true,
      data: coupon
    });
  } catch (error) {
    logger.error('Get coupon error:', error);
    next(error);
  }
};

/**
 * Create Coupon
 */
export const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      type,
      value,
      minAmount,
      maxDiscount,
      usageLimit,
      usageLimitPerUser,
      validFrom,
      validUntil,
      applicableTo = 'ALL',
      doctorIds = [],
      userIds = [],
      isActive = true
    } = req.body;

    if (!code || !type || !value || !validFrom || !validUntil) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Code, type, value, validFrom, and validUntil are required'
        }
      });
    }

    // Check if code exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code }
    });

    if (existingCoupon) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'COUPON_EXISTS',
          message: 'Coupon code already exists'
        }
      });
    }

    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code,
        type,
        value,
        minAmount,
        maxDiscount,
        usageLimit,
        usageLimitPerUser,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        applicableTo,
        isActive
      }
    });

    // Add doctor/user associations if applicable
    if (applicableTo === 'SPECIFIC_DOCTORS' && doctorIds.length > 0) {
      await prisma.doctorCoupon.createMany({
        data: doctorIds.map(doctorId => ({
          couponId: coupon.id,
          doctorId
        }))
      });
    }

    if (applicableTo === 'SPECIFIC_USERS' && userIds.length > 0) {
      await prisma.userCoupon.createMany({
        data: userIds.map(userId => ({
          couponId: coupon.id,
          userId
        }))
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'CREATE',
        entityType: 'COUPON',
        entityId: coupon.id,
        description: `Created coupon: ${coupon.code}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.status(201).json({
      success: true,
      data: coupon,
      message: 'Coupon created successfully'
    });
  } catch (error) {
    logger.error('Create coupon error:', error);
    next(error);
  }
};

/**
 * Update Coupon
 */
export const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      code,
      type,
      value,
      minAmount,
      maxDiscount,
      usageLimit,
      usageLimitPerUser,
      validFrom,
      validUntil,
      isActive
    } = req.body;

    const coupon = await prisma.coupon.findUnique({ where: { id } });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COUPON_NOT_FOUND',
          message: 'Coupon not found'
        }
      });
    }

    // Check if code exists (if changed)
    if (code && code !== coupon.code) {
      const existingCoupon = await prisma.coupon.findUnique({
        where: { code }
      });

      if (existingCoupon) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'COUPON_EXISTS',
            message: 'Coupon code already exists'
          }
        });
      }
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(type && { type }),
        ...(value !== undefined && { value }),
        ...(minAmount !== undefined && { minAmount }),
        ...(maxDiscount !== undefined && { maxDiscount }),
        ...(usageLimit !== undefined && { usageLimit }),
        ...(usageLimitPerUser !== undefined && { usageLimitPerUser }),
        ...(validFrom && { validFrom: new Date(validFrom) }),
        ...(validUntil && { validUntil: new Date(validUntil) }),
        ...(isActive !== undefined && { isActive })
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'UPDATE',
        entityType: 'COUPON',
        entityId: id,
        description: `Updated coupon: ${updatedCoupon.code}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: updatedCoupon,
      message: 'Coupon updated successfully'
    });
  } catch (error) {
    logger.error('Update coupon error:', error);
    next(error);
  }
};

/**
 * Delete Coupon
 */
export const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.findUnique({ where: { id } });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COUPON_NOT_FOUND',
          message: 'Coupon not found'
        }
      });
    }

    await prisma.coupon.delete({ where: { id } });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'DELETE',
        entityType: 'COUPON',
        entityId: id,
        description: `Deleted coupon: ${coupon.code}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    logger.error('Delete coupon error:', error);
    next(error);
  }
};

/**
 * Activate Coupon
 */
export const activateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: { isActive: true }
    });

    res.json({
      success: true,
      data: coupon,
      message: 'Coupon activated successfully'
    });
  } catch (error) {
    logger.error('Activate coupon error:', error);
    next(error);
  }
};

/**
 * Deactivate Coupon
 */
export const deactivateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      data: coupon,
      message: 'Coupon deactivated successfully'
    });
  } catch (error) {
    logger.error('Deactivate coupon error:', error);
    next(error);
  }
};

/**
 * Get Coupon Usage Statistics
 */
export const getCouponUsage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            doctorCoupons: true,
            userCoupons: true
          }
        }
      }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COUPON_NOT_FOUND',
          message: 'Coupon not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        coupon,
        usage: {
          usedCount: coupon.usedCount,
          usageLimit: coupon.usageLimit,
          usageLimitPerUser: coupon.usageLimitPerUser,
          applicableTo: coupon.applicableTo,
          doctorsCount: coupon._count.doctorCoupons,
          usersCount: coupon._count.userCoupons
        }
      }
    });
  } catch (error) {
    logger.error('Get coupon usage error:', error);
    next(error);
  }
};


