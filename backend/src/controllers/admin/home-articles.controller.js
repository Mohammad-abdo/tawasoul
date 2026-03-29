import { logger } from '../../utils/logger.js';
import * as homeArticlesService from '../../services/admin/home-articles.service.js';

const handleServiceError = (res, error) => {
  if (!error.status) return false;
  res.status(error.status).json({
    success: false,
    error: { code: error.code, message: error.message }
  });
  return true;
};

export const getAllHomeArticles = async (req, res, next) => {
  try {
    const data = await homeArticlesService.getAllHomeArticles(req.query);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Get home articles error:', error);
    next(error);
  }
};

export const getHomeArticleById = async (req, res, next) => {
  try {
    const data = await homeArticlesService.getHomeArticleById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Get home article by id error:', error);
    next(error);
  }
};

export const createHomeArticle = async (req, res, next) => {
  try {
    const data = await homeArticlesService.createHomeArticle(req.body, req.file);
    res.status(201).json({
      success: true,
      data,
      message: 'Home article created successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Create home article error:', error);
    logger.error('Error stack:', error.stack);
    logger.error('Request body:', req.body);
    next(error);
  }
};

export const updateHomeArticle = async (req, res, next) => {
  try {
    const data = await homeArticlesService.updateHomeArticle(req.params.id, req.body, req.file);
    res.json({
      success: true,
      data,
      message: 'Home article updated successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Update home article error:', error);
    next(error);
  }
};

export const deleteHomeArticle = async (req, res, next) => {
  try {
    await homeArticlesService.deleteHomeArticle(req.params.id);
    res.json({
      success: true,
      message: 'Home article deleted successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Delete home article error:', error);
    next(error);
  }
};
