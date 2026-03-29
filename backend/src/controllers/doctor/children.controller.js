import { logger } from '../../utils/logger.js';
import * as childrenService from '../../services/doctor/children.service.js';

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

export const getMyChildren = async (req, res, next) => {
  try {
    const data = await childrenService.getMyChildren(req.doctor.id);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Get doctor children error:', error);
    next(error);
  }
};

export const getChildDetails = async (req, res, next) => {
  try {
    const data = await childrenService.getChildDetails(req.doctor.id, req.params.childId);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Get doctor child details error:', error);
    next(error);
  }
};
