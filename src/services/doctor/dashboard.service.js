import * as dashboardRepo from '../../repositories/doctor/dashboard.repository.js';
import { getBookingScheduledDate } from '../../utils/booking-schedule.utils.js';

export const getDashboardStats = async (doctorId) => {
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
    dashboardRepo.countBookings({ doctorId }),
    dashboardRepo.countBookings({ doctorId, status: 'PENDING' }),
    dashboardRepo.countBookings({ doctorId, status: 'COMPLETED' }),
    dashboardRepo.countBookings({ doctorId, status: 'CANCELLED' }),
    dashboardRepo.aggregatePayments({ doctorId, status: 'COMPLETED' }),
    dashboardRepo.aggregatePayments({ doctorId, status: 'PENDING' }),
    dashboardRepo.countArticles(doctorId),
    dashboardRepo.findUpcomingBookings(doctorId),
    dashboardRepo.findRecentBookings(doctorId)
  ]);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlyEarnings = await dashboardRepo.groupMonthlyEarnings(doctorId, sixMonthsAgo);
  const now = new Date();
  const nextUpcomingBookings = upcomingBookings
    .filter((booking) => {
      const scheduledDate = getBookingScheduledDate(booking);
      return scheduledDate && scheduledDate >= now;
    })
    .slice(0, 5);

  return {
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
    upcomingBookings: nextUpcomingBookings.map((booking) => ({
      id: booking.id,
      user: booking.user,
      sessionType: booking.sessionType,
      duration: booking.duration,
      scheduledYear: booking.scheduledYear,
      scheduledMonth: booking.scheduledMonth,
      scheduledDay: booking.scheduledDay,
      scheduledTime: booking.scheduledTime,
      status: booking.status
    })),
    recentBookings: recentBookings.map((booking) => ({
      id: booking.id,
      user: booking.user,
      sessionType: booking.sessionType,
      status: booking.status,
      createdAt: booking.createdAt
    })),
    monthlyEarnings
  };
};
