import * as paymentsRepo from '../../repositories/admin/payments.repository.js';
import { createHttpError } from '../../utils/httpError.js';

export const getAllPayments = async ({ page = 1, limit = 20, status, method, dateFrom, dateTo, sort = 'createdAt' }) => {
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  const skip = (parsedPage - 1) * parsedLimit;
  const where = {};

  if (status) where.status = status;
  if (method) where.method = method;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const [payments, total] = await Promise.all([
    paymentsRepo.findMany({ where, skip, take: parsedLimit, sort }),
    paymentsRepo.count(where)
  ]);

  return {
    payments,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit)
    }
  };
};

export const updatePaymentStatus = async (id, { status }, context) => {
  if (!status) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Status is required');
  }

  const payment = await paymentsRepo.findById(id);
  if (!payment) {
    throw createHttpError(404, 'PAYMENT_NOT_FOUND', 'Payment not found');
  }

  const updatedPayment = await paymentsRepo.updateStatus(id, status);
  await paymentsRepo.createActivityLog({
    adminId: context.adminId,
    action: 'UPDATE',
    entityType: 'PAYMENT',
    entityId: id,
    description: `Updated payment status to ${status}`,
    changes: { before: payment.status, after: status },
    ipAddress: context.ipAddress,
    userAgent: context.userAgent
  });

  return updatedPayment;
};
