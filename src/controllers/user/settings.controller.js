import { logger } from '../../utils/logger.js';
import * as settingsService from '../../services/user/settings.service.js';

const handleError = (error, res, next, context) => {
  if (error.status) {
    return res.status(error.status).json({
      success: false,
      error: { code: error.code, message: error.message }
    });
  }
  logger.error(`${context} error:`, error);
  next(error);
};

export const getUserSettings = async (req, res, next) => {
  try {
    const data = await settingsService.getUserSettings(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    handleError(error, res, next, 'Get user settings');
  }
};

export const updateUserSettings = async (req, res, next) => {
  try {
    const data = await settingsService.updateUserSettings(req.user.id, req.body);
    logger.info(`User settings updated: ${req.user.id}`);
    res.json({ success: true, data });
  } catch (error) {
    handleError(error, res, next, 'Update user settings');
  }
};

export const changePassword = async (req, res, next) => {
  try {
    await settingsService.changePassword(req.user.id, req.body);
    logger.info(`Password changed for user: ${req.user.id}`);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    handleError(error, res, next, 'Change password');
  }
};
