import * as withdrawalsRepo from '../../repositories/doctor/withdrawals.repository.js';
import { createHttpError } from '../../utils/httpError.js';

export const getDoctorWithdrawals = async (doctorId, { status, page = 1, limit = 20 }) => {
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  const skip = (parsedPage - 1) * parsedLimit;
  const where = { doctorId };
  if (status) where.status = status;

  const [withdrawals, total] = await Promise.all([
    withdrawalsRepo.findManyByDoctor({ where, skip, take: parsedLimit }),
    withdrawalsRepo.count(where)
  ]);

  return {
    withdrawals,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      pages: Math.ceil(total / parsedLimit)
    }
  };
};

export const requestWithdrawal = async (doctorId, { amount, method, accountDetails }) => {
  if (!amount || !method || !accountDetails) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Amount, method, and account details are required');
  }

  if (amount <= 0) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Amount must be greater than 0');
  }

  if (!['BANK_ACCOUNT', 'E_WALLET', 'PAYPAL'].includes(method)) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Invalid withdrawal method');
  }

  const [completedEarnings, totalWithdrawals, pendingWithdrawals] = await Promise.all([
    withdrawalsRepo.aggregateCompletedEarnings(doctorId),
    withdrawalsRepo.aggregateCompletedWithdrawals(doctorId),
    withdrawalsRepo.countPendingWithdrawals(doctorId)
  ]);

  const availableBalance = (completedEarnings._sum.amount || 0) - (totalWithdrawals._sum.amount || 0);
  if (amount > availableBalance) {
    throw createHttpError(400, 'INSUFFICIENT_BALANCE', 'Insufficient balance for withdrawal');
  }

  if (pendingWithdrawals > 0) {
    throw createHttpError(400, 'PENDING_WITHDRAWAL', 'You have a pending withdrawal request');
  }

  const withdrawal = await withdrawalsRepo.createWithdrawal({
    doctorId,
    amount: parseFloat(amount),
    method,
    accountDetails: JSON.stringify(accountDetails),
    status: 'PENDING'
  });

  return {
    id: withdrawal.id,
    amount: withdrawal.amount,
    method: withdrawal.method,
    status: withdrawal.status,
    createdAt: withdrawal.createdAt,
    message: 'Withdrawal request submitted successfully'
  };
};
