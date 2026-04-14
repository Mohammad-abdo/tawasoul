import { logger } from '../../utils/logger.js';
import * as homeService from '../../services/public/home.service.js';

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

export const getHomePageData = async (req, res, next) => {
  try {
    const data = await homeService.getHomePageData();
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Get home page data error:', error);
    next(error);
  }
};

export const getFAQs = async (req, res, next) => {
  try {
    const data = await homeService.getFAQs(req.query);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Get FAQs error:', error);
    next(error);
  }
};
