import { logger } from '../../utils/logger.js';
import * as paymentsService from '../../services/admin/payments.service.js';

const handleServiceError = (res, error) => {
  if (!error.status) return false;
  res.status(error.status).json({
    success: false,
    error: { code: error.code, message: error.message }
  });
  return true;
};

export const getAllPayments = async (req, res, next) => {
  try {
    const data = await paymentsService.getAllPayments(req.query);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Get payments error:', error);
    next(error);
  }
};

export const updatePaymentStatus = async (req, res, next) => {
  try {
    const data = await paymentsService.updatePaymentStatus(req.params.id, req.body, {
      adminId: req.admin.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    res.json({
      success: true,
      data,
      message: 'Payment status updated successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Update payment error:', error);
    next(error);
  }
};
