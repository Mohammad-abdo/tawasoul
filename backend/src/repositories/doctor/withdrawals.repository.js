import { prisma } from '../../config/database.js';

export const findManyByDoctor = ({ where, skip, take }) =>
  prisma.withdrawal.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  });

export const count = (where) => prisma.withdrawal.count({ where });

export const aggregateCompletedEarnings = (doctorId) =>
  prisma.payment.aggregate({
    where: {
      doctorId,
      status: 'COMPLETED'
    },
    _sum: {
      amount: true
    }
  });

export const aggregateCompletedWithdrawals = (doctorId) =>
  prisma.withdrawal.aggregate({
    where: {
      doctorId,
      status: 'COMPLETED'
    },
    _sum: {
      amount: true
    }
  });

export const countPendingWithdrawals = (doctorId) =>
  prisma.withdrawal.count({
    where: {
      doctorId,
      status: { in: ['PENDING', 'PROCESSING'] }
    }
  });

export const createWithdrawal = (data) =>
  prisma.withdrawal.create({
    data
  });
