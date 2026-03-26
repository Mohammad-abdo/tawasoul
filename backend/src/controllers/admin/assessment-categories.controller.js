import { logger } from '../../utils/logger.js';
import * as categoryService from '../../services/admin/assessment-categories.service.js';

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

export const getAllCategories = async (req, res, next) => {
  try {
    const data = await categoryService.getAllCategories(req.query);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Get all assessment categories error:', error);
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const data = await categoryService.getCategoryById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Get assessment category by ID error:', error);
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const data = await categoryService.createCategory(req.body);
    logger.info(`Assessment Category created: ${data.id} by admin ${req.admin.id}`);
    res.status(201).json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Create assessment category error:', error);
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const data = await categoryService.updateCategory(req.params.id, req.body);
    logger.info(`Assessment Category updated: ${req.params.id} by admin ${req.admin.id}`);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Update assessment category error:', error);
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    logger.info(`Assessment Category deleted: ${req.params.id} by admin ${req.admin.id}`);
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Delete assessment category error:', error);
    next(error);
  }
};
