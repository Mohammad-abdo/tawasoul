import { prisma } from '../../config/database.js';

export const findManyByDoctor = ({ where, skip, take }) =>
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
  });

export const count = (where) => prisma.payment.count({ where });

export const aggregatePayments = (where) =>
  prisma.payment.aggregate({
    where,
    _sum: {
      amount: true
    },
    _count: true
  });

export const aggregateWithdrawals = (where) =>
  prisma.withdrawal.aggregate({
    where,
    _sum: {
      amount: true
    }
  });
