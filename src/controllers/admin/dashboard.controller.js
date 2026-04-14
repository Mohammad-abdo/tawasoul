import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import {
  getMonthBuckets,
  aggregateRevenueAndBookingsByMonth,
  getWeekBuckets,
  countUsersAndDoctorsInRanges
} from '../../utils/dashboard-aggregates.js';

/**
 * Get Dashboard Statistics
 */
export const getDashboardStats = async (req, res, next) => {
  try {
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
          recentActivity: [],
          revenueByMonth: [],
          weeklyUserGrowth: [],
          userStatusBreakdown: [],
          completionRate: 0
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
      pendingOrders,
      pendingUsers,
      disabledUsers
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
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { isApproved: false } }),
      prisma.user.count({ where: { isApproved: true, isActive: false } })
    ]);

    const monthBuckets = getMonthBuckets(new Date(), 6);
    const rangeStart = monthBuckets[0].start;
    const weekBuckets = getWeekBuckets(new Date());
    const weekRangeStart = weekBuckets[0].start;

    const [paymentsForCharts, bookingsForCharts, usersForWeeks, doctorsForWeeks] =
      await Promise.all([
        prisma.payment.findMany({
          where: { status: 'COMPLETED', createdAt: { gte: rangeStart } },
          select: { amount: true, createdAt: true }
        }),
        prisma.booking.findMany({
          where: { createdAt: { gte: rangeStart } },
          select: { createdAt: true }
        }),
        prisma.user.findMany({
          where: { createdAt: { gte: weekRangeStart } },
          select: { createdAt: true }
        }),
        prisma.doctor.findMany({
          where: { createdAt: { gte: weekRangeStart } },
          select: { createdAt: true }
        })
      ]);

    const revenueByMonth = aggregateRevenueAndBookingsByMonth(
      paymentsForCharts,
      bookingsForCharts,
      monthBuckets
    );
    const weeklyUserGrowth = countUsersAndDoctorsInRanges(
      usersForWeeks,
      doctorsForWeeks,
      weekBuckets
    );

    const userStatusBreakdown = [
      { name: 'نشط', value: activeUsers, color: '#875FD8' },
      { name: 'بانتظار الموافقة', value: pendingUsers, color: '#A384E1' },
      { name: 'معطل', value: disabledUsers, color: '#C2ADEB' }
    ];

    const completionRate =
      totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;

    let recentActivity = [];
    try {
      recentActivity = await prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: { name: true }
          }
        }
      });
    } catch (logErr) {
      logger.warn('ActivityLog fetch failed:', logErr);
    }

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
        pendingUsers,
        disabledUsers,
        completionRate,
        revenueByMonth,
        weeklyUserGrowth,
        userStatusBreakdown,
        recentActivity: recentActivity.map((activity) => ({
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

function aggregateByDay(rows, dateField) {
  const map = new Map();
  for (const row of rows) {
    const d = row[dateField];
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

function aggregatePaymentSumByDay(payments) {
  const map = new Map();
  for (const p of payments) {
    const d = p.createdAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    map.set(key, (map.get(key) || 0) + (p.amount || 0));
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue }));
}

/**
 * Get Dashboard Analytics (date-bucketed; avoids invalid Prisma groupBy on DateTime)
 */
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const { period = 'daily' } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid startDate or endDate'
        }
      });
    }

    const [users, bookingRows, payments] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { createdAt: true }
      }),
      prisma.booking.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { status: true, createdAt: true }
      }),
      prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: start, lte: end }
        },
        select: { amount: true, createdAt: true }
      })
    ]);

    const bookingByStatusMap = new Map();
    for (const b of bookingRows) {
      bookingByStatusMap.set(b.status, (bookingByStatusMap.get(b.status) || 0) + 1);
    }
    const bookingStats = [...bookingByStatusMap.entries()].map(([status, _count]) => ({
      status,
      _count
    }));

    const userRegistrations = aggregateByDay(users, 'createdAt');
    const revenueByDate = aggregatePaymentSumByDay(payments);

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
