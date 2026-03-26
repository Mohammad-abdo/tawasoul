import { logger } from '../../utils/logger.js';
import * as articlesService from '../../services/doctor/articles.service.js';

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

export const getDoctorArticles = async (req, res, next) => {
  try {
    const data = await articlesService.getDoctorArticles(req.doctor.id, req.query);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Get doctor articles error:', error);
    next(error);
  }
};

export const createArticle = async (req, res, next) => {
  try {
    const data = await articlesService.createArticle(req.doctor.id, req.body);
    logger.info(`Article created: ${data.id} by doctor ${req.doctor.id}`);
    res.status(201).json({
      success: true,
      message: 'تم نشر المقال بنجاح',
      data
    });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Create article error:', error);
    next(error);
  }
};

export const updateArticle = async (req, res, next) => {
  try {
    const data = await articlesService.updateArticle(req.doctor.id, req.params.id, req.body);
    logger.info(`Article updated: ${req.params.id} by doctor ${req.doctor.id}`);
    res.json({
      success: true,
      message: 'تم تحديث المقال بنجاح',
      data
    });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Update article error:', error);
    next(error);
  }
};

export const deleteArticle = async (req, res, next) => {
  try {
    await articlesService.deleteArticle(req.doctor.id, req.params.id);
    logger.info(`Article deleted: ${req.params.id} by doctor ${req.doctor.id}`);
    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Delete article error:', error);
    next(error);
  }
};
