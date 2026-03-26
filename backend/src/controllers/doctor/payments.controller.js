import { logger } from '../../utils/logger.js';
import * as paymentsService from '../../services/doctor/payments.service.js';

const handleServiceError = (res, error) => {
  if (!error.status) {
    return false;
  }

  res.status(error.status).json({
    success: false,
    error: {
      code: error.code,
      message: error.message
    }
  });
  return true;
};

export const getDoctorPayments = async (req, res, next) => {
  try {
    const data = await paymentsService.getDoctorPayments(req.doctor.id, req.query);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Get doctor payments error:', error);
    next(error);
  }
};

export const getDoctorEarnings = async (req, res, next) => {
  try {
    const data = await paymentsService.getDoctorEarnings(req.doctor.id, req.query);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Get doctor earnings error:', error);
    next(error);
  }
};
