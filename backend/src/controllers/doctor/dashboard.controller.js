import { logger } from '../../utils/logger.js';
import * as dashboardService from '../../services/doctor/dashboard.service.js';

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

export const getDashboardStats = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardStats(req.doctor.id);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Get dashboard stats error:', error);
    next(error);
  }
};
