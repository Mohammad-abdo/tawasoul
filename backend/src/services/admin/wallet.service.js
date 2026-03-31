import { prisma } from '../../config/database.js';
import { createHttpError } from '../../utils/httpError.js';

const doctorSelect = {
  id: true,
  name: true,
  email: true,
  phone: true
};

const serializeWithdrawalRequest = (request) => ({
  id: request.id,
  amount: Number(request.amount || 0),
  status: request.status,
  createdAt: request.createdAt,
  resolvedAt: request.resolvedAt,
  doctor: request.doctor
});

export const getWithdrawalRequests = async ({ status }) => {
  const where = status ? { status } : {};

  const requests = await prisma.withdrawalRequest.findMany({
    where,
    include: {
      doctor: {
        select: doctorSelect
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return {
    requests: requests.map(serializeWithdrawalRequest)
  };
};

export const resolveWithdrawalRequest = async (id, { status }) => {
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'status must be APPROVED or REJECTED');
  }

  const resolved = await prisma.$transaction(async (tx) => {
    const request = await tx.withdrawalRequest.findUnique({
      where: { id },
      include: {
        wallet: true,
        doctor: {
          select: doctorSelect
        }
      }
    });

    if (!request) {
      throw createHttpError(404, 'WITHDRAWAL_REQUEST_NOT_FOUND', 'Withdrawal request not found');
    }

    if (request.status !== 'PENDING') {
      throw createHttpError(400, 'INVALID_STATUS', 'Only pending withdrawal requests can be resolved');
    }

    const resolvedAt = new Date();

    if (status === 'APPROVED') {
      const walletBalance = Number(request.wallet.balance || 0);
      const amount = Number(request.amount || 0);

      if (amount > walletBalance) {
        throw createHttpError(409, 'INSUFFICIENT_BALANCE', 'Wallet balance is no longer sufficient for this withdrawal');
      }

      await tx.doctorWallet.update({
        where: { id: request.walletId },
        data: {
          balance: {
            decrement: request.amount
          }
        }
      });

      await tx.walletTransaction.create({
        data: {
          walletId: request.walletId,
          type: 'WITHDRAWAL',
          amount: request.amount,
          description: `Approved withdrawal request ${request.id}`
        }
      });
    }

    return tx.withdrawalRequest.update({
      where: { id: request.id },
      data: {
        status,
        resolvedAt
      },
      include: {
        doctor: {
          select: doctorSelect
        }
      }
    });
  });

  return serializeWithdrawalRequest(resolved);
};
