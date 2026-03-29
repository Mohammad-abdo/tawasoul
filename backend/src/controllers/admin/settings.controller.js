import { logger } from '../../utils/logger.js';
import * as settingsService from '../../services/admin/settings.service.js';

const handleServiceError = (res, error) => {
  if (!error.status) {
    return false;
  }

  res.status(error.status).json({
    success: false,
    error: {
      message: error.message,
      code: error.code
    }
  });
  return true;
};

export const getSettings = async (req, res, next) => {
  try {
    const data = await settingsService.getSettings();
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Get settings error:', error);
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const data = await settingsService.updateSettings(req.body);
    res.json({
      success: true,
      data,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Update settings error:', error);
    next(error);
  }
};
