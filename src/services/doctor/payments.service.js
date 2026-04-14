import * as paymentsRepo from '../../repositories/doctor/payments.repository.js';

const getDateFilter = (period) => {
  if (period === 'month') {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return { createdAt: { gte: oneMonthAgo } };
  }

  if (period === 'year') {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return { createdAt: { gte: oneYearAgo } };
  }

  return {};
};

export const getDoctorPayments = async (doctorId, { status, page = 1, limit = 20 }) => {
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  const skip = (parsedPage - 1) * parsedLimit;
  const where = { doctorId };
  if (status) where.status = status;

  const [payments, total] = await Promise.all([
    paymentsRepo.findManyByDoctor({ where, skip, take: parsedLimit }),
    paymentsRepo.count(where)
  ]);

  return {
    payments,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      pages: Math.ceil(total / parsedLimit)
    }
  };
};

export const getDoctorEarnings = async (doctorId, { period = 'all' }) => {
  const dateFilter = getDateFilter(period);

  const [
    totalEarnings,
    completedEarnings,
    pendingEarnings,
    totalWithdrawals,
    pendingWithdrawals
  ] = await Promise.all([
    paymentsRepo.aggregatePayments({ doctorId, ...dateFilter }),
    paymentsRepo.aggregatePayments({ doctorId, status: 'COMPLETED', ...dateFilter }),
    paymentsRepo.aggregatePayments({ doctorId, status: 'PENDING', ...dateFilter }),
    paymentsRepo.aggregateWithdrawals({ doctorId, status: 'COMPLETED', ...dateFilter }),
    paymentsRepo.aggregateWithdrawals({ doctorId, status: { in: ['PENDING', 'PROCESSING'] } })
  ]);

  const availableBalance = (completedEarnings._sum.amount || 0) - (totalWithdrawals._sum.amount || 0);

  return {
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
  };
};
