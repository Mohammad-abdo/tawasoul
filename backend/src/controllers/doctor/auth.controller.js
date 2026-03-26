import { logger } from '../../utils/logger.js';
import * as authService from '../../services/doctor/auth.service.js';

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

export const register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    logger.info(`Doctor registered: ${data.doctor.email}`);
    res.status(201).json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Doctor registration error:', error);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    logger.info(`Doctor logged in: ${data.doctor.email}`);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Doctor login error:', error);
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const data = await authService.getMe(req.doctor.id);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Get doctor error:', error);
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const data = await authService.updateProfile(req.doctor.id, req.body);
    res.json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      data
    });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Update profile error:', error);
    next(error);
  }
};
