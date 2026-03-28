import { logger } from '../../utils/logger.js';
import * as testCategoryService from '../../services/admin/test-categories.service.js';

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

export const getAllTestCategories = async (req, res, next) => {
  try {
    const data = await testCategoryService.getAllTestCategories(req.query);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Get all test categories error:', error);
    next(error);
  }
};

export const getTestCategoryById = async (req, res, next) => {
  try {
    const data = await testCategoryService.getTestCategoryById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Get test category by ID error:', error);
    next(error);
  }
};

export const createTestCategory = async (req, res, next) => {
  try {
    const data = await testCategoryService.createTestCategory(req.body);
    logger.info(`Test Category created: ${data.id} by admin ${req.admin.id}`);
    res.status(201).json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Create test category error:', error);
    next(error);
  }
};

export const updateTestCategory = async (req, res, next) => {
  try {
    const data = await testCategoryService.updateTestCategory(req.params.id, req.body);
    logger.info(`Test Category updated: ${req.params.id} by admin ${req.admin.id}`);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Update test category error:', error);
    next(error);
  }
};

export const deleteTestCategory = async (req, res, next) => {
  try {
    await testCategoryService.deleteTestCategory(req.params.id);
    logger.info(`Test Category deleted: ${req.params.id} by admin ${req.admin.id}`);
    res.json({
      success: true,
      message: 'Test category deleted successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Delete test category error:', error);
    next(error);
  }
};
