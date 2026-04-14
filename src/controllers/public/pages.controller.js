import { logger } from '../../utils/logger.js';
import * as pagesService from '../../services/public/pages.service.js';

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

export const getPageByType = async (req, res, next) => {
  try {
    const data = await pagesService.getPageByType(req.params.pageType);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Get public page error:', error);
    next(error);
  }
};

export const getAllPages = async (req, res, next) => {
  try {
    const data = await pagesService.getAllPages();
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Get all public pages error:', error);
    next(error);
  }
};
