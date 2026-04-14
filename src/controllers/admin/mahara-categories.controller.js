import { logger } from '../../utils/logger.js';
import * as maharaCategoriesService from '../../services/admin/mahara-categories.service.js';

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

export const getAllActivityCategories = async (req, res, next) => {
  try {
    const data = await maharaCategoriesService.getAllActivityCategories();
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Get activity categories error:', error);
    next(error);
  }
};

export const getActivityCategoryById = async (req, res, next) => {
  try {
    const data = await maharaCategoriesService.getActivityCategoryById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Get activity category error:', error);
    next(error);
  }
};

export const createActivityCategory = async (req, res, next) => {
  try {
    const data = await maharaCategoriesService.createActivityCategory(req.body);
    logger.info(`Activity category created: ${data.id} by admin ${req.admin.id}`);
    res.status(201).json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Create activity category error:', error);
    next(error);
  }
};

export const updateActivityCategory = async (req, res, next) => {
  try {
    const data = await maharaCategoriesService.updateActivityCategory(req.params.id, req.body);
    logger.info(`Activity category updated: ${req.params.id} by admin ${req.admin.id}`);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Update activity category error:', error);
    next(error);
  }
};

export const deleteActivityCategory = async (req, res, next) => {
  try {
    await maharaCategoriesService.deleteActivityCategory(req.params.id);
    logger.info(`Activity category deleted: ${req.params.id} by admin ${req.admin.id}`);
    res.json({
      success: true,
      message: 'Activity category deleted successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Delete activity category error:', error);
    next(error);
  }
};
