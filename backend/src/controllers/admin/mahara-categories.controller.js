import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All Activity Categories
 */
export const getAllActivityCategories = async (req, res, next) => {
  try {
    const categories = await prisma.activityCategory.findMany({
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('Get activity categories error:', error);
    next(error);
  }
};

/**
 * Get Activity Category by ID
 */
export const getActivityCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.activityCategory.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACTIVITY_CATEGORY_NOT_FOUND',
          message: 'Activity category not found'
        }
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    logger.error('Get activity category error:', error);
    next(error);
  }
};

/**
 * Create Activity Category
 */
export const createActivityCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Category name is required'
        }
      });
    }

    const category = await prisma.activityCategory.create({
      data: { name }
    });

    logger.info(`Activity category created: ${category.id} by admin ${req.admin.id}`);

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    logger.error('Create activity category error:', error);
    next(error);
  }
};

/**
 * Update Activity Category
 */
export const updateActivityCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await prisma.activityCategory.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACTIVITY_CATEGORY_NOT_FOUND',
          message: 'Activity category not found'
        }
      });
    }

    const updatedCategory = await prisma.activityCategory.update({
      where: { id },
      data: {
        ...(name !== undefined && { name })
      }
    });

    logger.info(`Activity category updated: ${id} by admin ${req.admin.id}`);

    res.json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    logger.error('Update activity category error:', error);
    next(error);
  }
};

/**
 * Delete Activity Category
 */
export const deleteActivityCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.activityCategory.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACTIVITY_CATEGORY_NOT_FOUND',
          message: 'Activity category not found'
        }
      });
    }

    await prisma.activityCategory.delete({
      where: { id }
    });

    logger.info(`Activity category deleted: ${id} by admin ${req.admin.id}`);

    res.json({
      success: true,
      message: 'Activity category deleted successfully'
    });
  } catch (error) {
    logger.error('Delete activity category error:', error);
    next(error);
  }
};
