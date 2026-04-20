import { prisma } from '../../config/database.js';
import { aggregatePaymentsByCalendarMonth } from '../../utils/dashboard-aggregates.js';
import { bookingScheduleOrderBy } from '../../utils/booking-schedule.utils.js';

export const countBookings = (where) => prisma.booking.count({ where });

export const aggregatePayments = (where) =>
  prisma.payment.aggregate({
    where,
    _sum: {
      amount: true
    }
  });

export const countArticles = (doctorId) =>
  prisma.article.count({
    where: { authorId: doctorId }
  });

export const findUpcomingBookings = (doctorId) =>
  prisma.booking.findMany({
    where: {
      doctorId,
      status: { in: ['PENDING', 'CONFIRMED'] }
    },
    orderBy: bookingScheduleOrderBy('asc'),
    include: {
      user: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatar: true
        }
      }
    }
  });

export const findRecentBookings = (doctorId) =>
  prisma.booking.findMany({
    where: { doctorId },
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatar: true
        }
      }
    }
  });

export const groupMonthlyEarnings = async (doctorId, sinceDate) => {
  const payments = await prisma.payment.findMany({
    where: {
      doctorId,
      status: 'COMPLETED',
      createdAt: { gte: sinceDate }
    },
    select: { amount: true, createdAt: true }
  });
  return aggregatePaymentsByCalendarMonth(payments, sinceDate, 6);
};
