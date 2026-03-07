import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get Dashboard Statistics
 */
export const getDashboardStats = async (req, res, next) => {
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
          totalUsers: 0,
          totalDoctors: 0,
          activeUsers: 0,
          activeDoctors: 0,
          pendingDoctors: 0,
          totalBookings: 0,
          todayBookings: 0,
          totalRevenue: 0,
          todayRevenue: 0,
          pendingWithdrawals: 0,
          openSupportTickets: 0,
          totalPosts: 0,
          totalArticles: 0,
          recentActivity: []
        }
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalDoctors,
      activeUsers,
      activeDoctors,
      pendingDoctors,
      totalBookings,
      todayBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
      totalRevenue,
      todayRevenue,
      pendingWithdrawals,
      openSupportTickets,
      totalChildren,
      activePackages,
      totalPackages,
      totalProducts,
      totalOrders,
      pendingOrders
    ] = await Promise.all([
      prisma.user.count(),
      prisma.doctor.count(),
      prisma.user.count({ where: { isActive: true, isApproved: true } }),
      prisma.doctor.count({ where: { isActive: true, isApproved: true } }),
      prisma.doctor.count({ where: { isApproved: false } }),
      prisma.booking.count(),
      prisma.booking.count({
        where: {
          createdAt: { gte: today }
        }
      }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' }
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'COMPLETED',
          createdAt: { gte: today }
        }
      }),
      prisma.withdrawal.count({
        where: { status: 'PENDING' }
      }),
      prisma.supportTicket.count({
        where: { status: 'OPEN' }
      }),
      prisma.child.count(),
      prisma.userPackage.count({ where: { status: 'ACTIVE' } }),
      prisma.package.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } })
    ]);

    // Get recent activity
    const recentActivity = await prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: { name: true }
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalDoctors,
        activeUsers,
        activeDoctors,
        pendingDoctors,
        totalBookings,
        todayBookings,
        completedBookings,
        pendingBookings,
        cancelledBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        todayRevenue: todayRevenue._sum.amount || 0,
        pendingWithdrawals,
        openSupportTickets,
        totalChildren,
        activePackages,
        totalPackages,
        totalProducts,
        totalOrders,
        pendingOrders,
        recentActivity: recentActivity.map(activity => ({
          id: activity.id,
          action: activity.action,
          entityType: activity.entityType,
          description: activity.description,
          adminName: activity.admin?.name,
          time: activity.createdAt
        }))
      }
    });
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    next(error);
  }
};

/**
 * Get Dashboard Analytics
 */
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, period = 'daily' } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get user registrations
    const userRegistrations = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: start, lte: end }
      },
      _count: true
    });

    // Get booking statistics
    const bookingStats = await prisma.booking.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: start, lte: end }
      },
      _count: true
    });

    // Get revenue by date
    const revenueByDate = await prisma.payment.groupBy({
      by: ['createdAt'],
      where: {
        status: 'COMPLETED',
        createdAt: { gte: start, lte: end }
      },
      _sum: { amount: true }
    });

    res.json({
      success: true,
      data: {
        userRegistrations,
        bookingStats,
        revenueByDate,
        period,
        startDate: start,
        endDate: end
      }
    });
  } catch (error) {
    logger.error('Dashboard analytics error:', error);
    next(error);
  }
};

