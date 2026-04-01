import { prisma } from '../../config/database.js';

export const findManyByDoctor = ({ where, skip, take }) =>
  prisma.payment.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      package: {
        select: {
          id: true,
          name: true,
          nameAr: true,
          price: true
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
