import { logger } from '../../utils/logger.js';
import * as availabilityService from '../../services/doctor/availability.service.js';

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

export const getAvailability = async (req, res, next) => {
  try {
    const data = await availabilityService.getAvailability(req.doctor.id);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Get availability error:', error);
    next(error);
  }
};

export const updateAvailability = async (req, res, next) => {
  try {
    const data = await availabilityService.updateAvailability(req.doctor.id, req.body);
    logger.info(`Availability updated for doctor: ${req.doctor.id}`);
    res.json({
      success: true,
      data,
      message: 'Availability updated successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Update availability error:', error);
    next(error);
  }
};
