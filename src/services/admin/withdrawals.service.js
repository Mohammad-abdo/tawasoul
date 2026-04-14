import * as withdrawalsRepo from '../../repositories/admin/withdrawals.repository.js';
import { createHttpError } from '../../utils/httpError.js';

const formatDoctor = (doctor) => {
  if (!doctor) {
    return doctor;
  }

  return {
    ...doctor,
    specialization: doctor.specialization ?? doctor.specialties?.[0]?.specialty ?? null
  };
};

export const getAllWithdrawals = async ({ page = 1, limit = 20, status, doctorId, dateFrom, dateTo, sort = 'createdAt' }) => {
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  const skip = (parsedPage - 1) * parsedLimit;
  const where = {};

  if (status) where.status = status;
  if (doctorId) where.doctorId = doctorId;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const [withdrawals, total] = await Promise.all([
    withdrawalsRepo.findMany({ where, skip, take: parsedLimit, sort }),
    withdrawalsRepo.count(where)
  ]);

  return {
    withdrawals: withdrawals.map((withdrawal) => ({
      ...withdrawal,
      doctor: formatDoctor(withdrawal.doctor)
    })),
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit)
    }
  };
};

export const getWithdrawalById = async (id) => {
  const withdrawal = await withdrawalsRepo.findById(id);
  if (!withdrawal) {
    throw createHttpError(404, 'WITHDRAWAL_NOT_FOUND', 'Withdrawal not found');
  }
  return {
    ...withdrawal,
    doctor: formatDoctor(withdrawal.doctor)
  };
};

export const approveWithdrawal = async (id, { notes }, context) => {
  const withdrawal = await withdrawalsRepo.findByIdSimple(id);
  if (!withdrawal) {
    throw createHttpError(404, 'WITHDRAWAL_NOT_FOUND', 'Withdrawal not found');
  }
  if (withdrawal.status !== 'PENDING') {
    throw createHttpError(400, 'INVALID_STATUS', 'Only pending withdrawals can be approved');
  }

  const updatedWithdrawal = await withdrawalsRepo.updateWithdrawal(id, {
    status: 'APPROVED',
    processedAt: new Date(),
    adminNotes: notes
  });

  await withdrawalsRepo.createActivityLog({
    adminId: context.adminId,
    action: 'APPROVE',
    entityType: 'WITHDRAWAL',
    entityId: id,
    description: `Approved withdrawal of ${withdrawal.amount} for doctor ${withdrawal.doctorId}`,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent
  });

  return updatedWithdrawal;
};

export const rejectWithdrawal = async (id, { reason }, context) => {
  if (!reason) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Rejection reason is required');
  }

  const withdrawal = await withdrawalsRepo.findByIdSimple(id);
  if (!withdrawal) {
    throw createHttpError(404, 'WITHDRAWAL_NOT_FOUND', 'Withdrawal not found');
  }
  if (withdrawal.status !== 'PENDING') {
    throw createHttpError(400, 'INVALID_STATUS', 'Only pending withdrawals can be rejected');
  }

  const updatedWithdrawal = await withdrawalsRepo.updateWithdrawal(id, {
    status: 'REJECTED',
    processedAt: new Date(),
    adminNotes: reason
  });

  await withdrawalsRepo.createActivityLog({
    adminId: context.adminId,
    action: 'REJECT',
    entityType: 'WITHDRAWAL',
    entityId: id,
    description: `Rejected withdrawal of ${withdrawal.amount}. Reason: ${reason}`,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent
  });

  return updatedWithdrawal;
};
