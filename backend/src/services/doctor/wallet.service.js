import { prisma } from '../../config/database.js';
import { ensureDoctorWallet } from '../../utils/wallet.utils.js';
import { createHttpError } from '../../utils/httpError.js';

const serializeWalletTransaction = (transaction) => ({
  id: transaction.id,
  type: transaction.type,
  amount: Number(transaction.amount || 0),
  description: transaction.description,
  createdAt: transaction.createdAt
});

const serializeWithdrawalRequest = (request) => ({
  id: request.id,
  amount: Number(request.amount || 0),
  status: request.status,
  createdAt: request.createdAt,
  resolvedAt: request.resolvedAt
});

export const getDoctorWallet = async (doctorId) => {
  const wallet = await prisma.$transaction(async (tx) => {
    const ensuredWallet = await ensureDoctorWallet(tx, doctorId);
    const [transactions, withdrawalRequests] = await Promise.all([
      tx.walletTransaction.findMany({
        where: { walletId: ensuredWallet.id },
        orderBy: { createdAt: 'desc' }
      }),
      tx.withdrawalRequest.findMany({
        where: { walletId: ensuredWallet.id },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      ...ensuredWallet,
      transactions,
      withdrawalRequests
    };
  });

  return {
    id: wallet.id,
    balance: Number(wallet.balance || 0),
    transactions: wallet.transactions.map(serializeWalletTransaction),
    withdrawalRequests: wallet.withdrawalRequests.map(serializeWithdrawalRequest)
  };
};

export const requestWithdrawal = async (doctorId, { amount }) => {
  const requestedAmount = Number(amount);

  if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'amount must be a valid number greater than zero');
  }

  const withdrawalRequest = await prisma.$transaction(async (tx) => {
    const wallet = await ensureDoctorWallet(tx, doctorId);
    const currentBalance = Number(wallet.balance || 0);

    if (requestedAmount > currentBalance) {
      throw createHttpError(400, 'INSUFFICIENT_BALANCE', 'Requested amount exceeds current wallet balance');
    }

    return tx.withdrawalRequest.create({
      data: {
        walletId: wallet.id,
        doctorId,
        amount: requestedAmount
      }
    });
  });

  return serializeWithdrawalRequest(withdrawalRequest);
};
