import { logger } from '../../utils/logger.js';
import * as staticPagesService from '../../services/public/static-pages.service.js';

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

export const getStaticPage = async (req, res, next) => {
  try {
    const data = await staticPagesService.getStaticPage(req.params.pageType);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Get static page error:', error);
    next(error);
  }
};

export const getOnboardingSlides = async (req, res, next) => {
  try {
    const data = await staticPagesService.getOnboardingSlides(req.query);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Get onboarding slides error:', error);
    next(error);
  }
};

export const getOnboardingPages = async (req, res, next) => {
  try {
    const data = await staticPagesService.getOnboardingPages(req.query);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Get onboarding pages error:', error);
    next(error);
  }
};

export const getHomePage1 = async (req, res, next) => {
  try {
    const data = await staticPagesService.getHomePage1();
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Get home page 1 error:', error);
    next(error);
  }
};

export const getHomePage2 = async (req, res, next) => {
  try {
    const data = await staticPagesService.getHomePage2();
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Get home page 2 error:', error);
    next(error);
  }
};
