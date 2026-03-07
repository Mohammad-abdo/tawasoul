import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get Doctor Dashboard Stats
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;

    // Get stats
    const [
      totalBookings,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      totalEarnings,
      pendingEarnings,
      totalArticles,
      upcomingBookings,
      recentBookings
    ] = await Promise.all([
      prisma.booking.count({
        where: { doctorId }
      }),
      prisma.booking.count({
        where: {
          doctorId,
          status: 'PENDING'
        }
      }),
      prisma.booking.count({
        where: {
          doctorId,
          status: 'COMPLETED'
        }
      }),
      prisma.booking.count({
        where: {
          doctorId,
          status: 'CANCELLED'
        }
      }),
      prisma.payment.aggregate({
        where: {
          doctorId,
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        }
      }),
      prisma.payment.aggregate({
        where: {
          doctorId,
          status: 'PENDING'
        },
        _sum: {
          amount: true
        }
      }),
      prisma.article.count({
        where: { authorId: doctorId }
      }),
      prisma.booking.findMany({
        where: {
          doctorId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          scheduledAt: { gte: new Date() }
        },
        take: 5,
        orderBy: { scheduledAt: 'asc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      }),
      prisma.booking.findMany({
        where: { doctorId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      })
    ]);

    // Get monthly earnings (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyEarnings = await prisma.payment.groupBy({
      by: ['createdAt'],
      where: {
        doctorId,
        status: 'COMPLETED',
        createdAt: { gte: sixMonthsAgo }
      },
      _sum: {
        amount: true
      }
    });

    res.json({
      success: true,
      data: {
        stats: {
          bookings: {
            total: totalBookings,
            pending: pendingBookings,
            completed: completedBookings,
            cancelled: cancelledBookings
          },
          earnings: {
            total: totalEarnings._sum.amount || 0,
            pending: pendingEarnings._sum.amount || 0
          },
          content: {
            articles: totalArticles
          }
        },
        upcomingBookings: upcomingBookings.map(booking => ({
          id: booking.id,
          user: booking.user,
          sessionType: booking.sessionType,
          duration: booking.duration,
          scheduledAt: booking.scheduledAt,
          status: booking.status
        })),
        recentBookings: recentBookings.map(booking => ({
          id: booking.id,
          user: booking.user,
          sessionType: booking.sessionType,
          status: booking.status,
          createdAt: booking.createdAt
        })),
        monthlyEarnings
      }
    });
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    next(error);
  }
};

