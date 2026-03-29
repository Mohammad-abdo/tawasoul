import { prisma } from '../../config/database.js';

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
          avatar: true
        }
      }
    }
  });

export const groupMonthlyEarnings = (doctorId, sinceDate) =>
  prisma.payment.groupBy({
    by: ['createdAt'],
    where: {
      doctorId,
      status: 'COMPLETED',
      createdAt: { gte: sinceDate }
    },
    _sum: {
      amount: true
    }
  });
