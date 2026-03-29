import { logger } from '../../utils/logger.js';
import * as withdrawalsService from '../../services/doctor/withdrawals.service.js';

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

export const getDoctorWithdrawals = async (req, res, next) => {
  try {
    const data = await withdrawalsService.getDoctorWithdrawals(req.doctor.id, req.query);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Get doctor withdrawals error:', error);
    next(error);
  }
};

export const requestWithdrawal = async (req, res, next) => {
  try {
    const data = await withdrawalsService.requestWithdrawal(req.doctor.id, req.body);
    logger.info(`Withdrawal requested: ${data.id} by doctor ${req.doctor.id}`);
    res.status(201).json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Request withdrawal error:', error);
    next(error);
  }
};
