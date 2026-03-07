import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All Withdrawals
 */
export const getAllWithdrawals = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      doctorId,
      dateFrom,
      dateTo,
      sort = 'createdAt'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (status) {
      where.status = status;
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sort]: 'desc' },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.withdrawal.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        withdrawals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get withdrawals error:', error);
    next(error);
  }
};

/**
 * Get Withdrawal By ID
 */
export const getWithdrawalById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            specialization: true
          }
        }
      }
    });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'WITHDRAWAL_NOT_FOUND',
          message: 'Withdrawal not found'
        }
      });
    }

    res.json({
      success: true,
      data: withdrawal
    });
  } catch (error) {
    logger.error('Get withdrawal by ID error:', error);
    next(error);
  }
};

/**
 * Approve Withdrawal
 */
export const approveWithdrawal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const withdrawal = await prisma.withdrawal.findUnique({ where: { id } });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'WITHDRAWAL_NOT_FOUND',
          message: 'Withdrawal not found'
        }
      });
    }

    if (withdrawal.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Only pending withdrawals can be approved'
        }
      });
    }

    const updatedWithdrawal = await prisma.withdrawal.update({
      where: { id },
      data: {
        status: 'APPROVED',
        processedAt: new Date(),
        adminNotes: notes
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'APPROVE',
        entityType: 'WITHDRAWAL',
        entityId: id,
        description: `Approved withdrawal of ${withdrawal.amount} for doctor ${withdrawal.doctorId}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: updatedWithdrawal,
      message: 'Withdrawal approved successfully'
    });
  } catch (error) {
    logger.error('Approve withdrawal error:', error);
    next(error);
  }
};

/**
 * Reject Withdrawal
 */
export const rejectWithdrawal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Rejection reason is required'
        }
      });
    }

    const withdrawal = await prisma.withdrawal.findUnique({ where: { id } });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'WITHDRAWAL_NOT_FOUND',
          message: 'Withdrawal not found'
        }
      });
    }

    if (withdrawal.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Only pending withdrawals can be rejected'
        }
      });
    }

    const updatedWithdrawal = await prisma.withdrawal.update({
      where: { id },
      data: {
        status: 'REJECTED',
        processedAt: new Date(),
        adminNotes: reason
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'REJECT',
        entityType: 'WITHDRAWAL',
        entityId: id,
        description: `Rejected withdrawal of ${withdrawal.amount}. Reason: ${reason}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: updatedWithdrawal,
      message: 'Withdrawal rejected successfully'
    });
  } catch (error) {
    logger.error('Reject withdrawal error:', error);
    next(error);
  }
};


