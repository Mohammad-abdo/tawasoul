import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get Doctor Payments
 */
export const getDoctorPayments = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const { status, page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = { doctorId };
    if (status) {
      where.status = status;
    }

    // Get payments
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true
                }
              },
              sessionType: true,
              duration: true,
              scheduledAt: true
            }
          }
        }
      }),
      prisma.payment.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get doctor payments error:', error);
    next(error);
  }
};

/**
 * Get Doctor Earnings
 */
export const getDoctorEarnings = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const { period = 'all' } = req.query; // all, month, year

    // Build date filter
    let dateFilter = {};
    if (period === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      dateFilter = { createdAt: { gte: oneMonthAgo } };
    } else if (period === 'year') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      dateFilter = { createdAt: { gte: oneYearAgo } };
    }

    // Get earnings summary
    const [
      totalEarnings,
      completedEarnings,
      pendingEarnings,
      totalWithdrawals,
      pendingWithdrawals
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          doctorId,
          ...dateFilter
        },
        _sum: {
          amount: true
        },
        _count: true
      }),
      prisma.payment.aggregate({
        where: {
          doctorId,
          status: 'COMPLETED',
          ...dateFilter
        },
        _sum: {
          amount: true
        },
        _count: true
      }),
      prisma.payment.aggregate({
        where: {
          doctorId,
          status: 'PENDING',
          ...dateFilter
        },
        _sum: {
          amount: true
        },
        _count: true
      }),
      prisma.withdrawal.aggregate({
        where: {
          doctorId,
          status: 'COMPLETED',
          ...dateFilter
        },
        _sum: {
          amount: true
        }
      }),
      prisma.withdrawal.aggregate({
        where: {
          doctorId,
          status: { in: ['PENDING', 'PROCESSING'] }
        },
        _sum: {
          amount: true
        }
      })
    ]);

    const availableBalance = (completedEarnings._sum.amount || 0) - (totalWithdrawals._sum.amount || 0);

    res.json({
      success: true,
      data: {
        total: {
          amount: totalEarnings._sum.amount || 0,
          count: totalEarnings._count || 0
        },
        completed: {
          amount: completedEarnings._sum.amount || 0,
          count: completedEarnings._count || 0
        },
        pending: {
          amount: pendingEarnings._sum.amount || 0,
          count: pendingEarnings._count || 0
        },
        withdrawals: {
          total: totalWithdrawals._sum.amount || 0,
          pending: pendingWithdrawals._sum.amount || 0
        },
        availableBalance
      }
    });
  } catch (error) {
    logger.error('Get doctor earnings error:', error);
    next(error);
  }
};

