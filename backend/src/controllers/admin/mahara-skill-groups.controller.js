import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All Skill Groups
 */
export const getAllSkillGroups = async (req, res, next) => {
  try {
    const { categoryId } = req.query;
    const where = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const skillGroups = await prisma.skillGroup.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        category: true
      }
    });

    res.json({
      success: true,
      data: skillGroups
    });
  } catch (error) {
    logger.error('Get skill groups error:', error);
    next(error);
  }
};

/**
 * Get Skill Group by ID
 */
export const getSkillGroupById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const skillGroup = await prisma.skillGroup.findUnique({
      where: { id },
      include: {
        category: true
      }
    });

    if (!skillGroup) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SKILL_GROUP_NOT_FOUND',
          message: 'Skill group not found'
        }
      });
    }

    res.json({
      success: true,
      data: skillGroup
    });
  } catch (error) {
    logger.error('Get skill group error:', error);
    next(error);
  }
};

/**
 * Create Skill Group
 */
export const createSkillGroup = async (req, res, next) => {
  try {
    const { categoryId, name } = req.body;

    if (!categoryId || !name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Category ID and name are required'
        }
      });
    }

    const category = await prisma.activityCategory.findUnique({
      where: { id: categoryId }
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

    const skillGroup = await prisma.skillGroup.create({
      data: {
        categoryId,
        name
      }
    });

    logger.info(`Skill group created: ${skillGroup.id} by admin ${req.admin.id}`);

    res.status(201).json({
      success: true,
      data: skillGroup
    });
  } catch (error) {
    logger.error('Create skill group error:', error);
    next(error);
  }
};

/**
 * Update Skill Group
 */
export const updateSkillGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const skillGroup = await prisma.skillGroup.findUnique({
      where: { id }
    });

    if (!skillGroup) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SKILL_GROUP_NOT_FOUND',
          message: 'Skill group not found'
        }
      });
    }

    const updatedSkillGroup = await prisma.skillGroup.update({
      where: { id },
      data: {
        ...(name !== undefined && { name })
      }
    });

    logger.info(`Skill group updated: ${id} by admin ${req.admin.id}`);

    res.json({
      success: true,
      data: updatedSkillGroup
    });
  } catch (error) {
    logger.error('Update skill group error:', error);
    next(error);
  }
};

/**
 * Delete Skill Group
 */
export const deleteSkillGroup = async (req, res, next) => {
  try {
    const { id } = req.params;

    const skillGroup = await prisma.skillGroup.findUnique({
      where: { id }
    });

    if (!skillGroup) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SKILL_GROUP_NOT_FOUND',
          message: 'Skill group not found'
        }
      });
    }

    await prisma.skillGroup.delete({
      where: { id }
    });

    logger.info(`Skill group deleted: ${id} by admin ${req.admin.id}`);

    res.json({
      success: true,
      message: 'Skill group deleted successfully'
    });
  } catch (error) {
    logger.error('Delete skill group error:', error);
    next(error);
  }
};
