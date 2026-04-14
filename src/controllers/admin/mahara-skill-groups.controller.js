import { logger } from '../../utils/logger.js';
import * as skillGroupsService from '../../services/admin/mahara-skill-groups.service.js';

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

export const getAllSkillGroups = async (req, res, next) => {
  try {
    const data = await skillGroupsService.getAllSkillGroups(req.query);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Get skill groups error:', error);
    next(error);
  }
};

export const getSkillGroupById = async (req, res, next) => {
  try {
    const data = await skillGroupsService.getSkillGroupById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Get skill group error:', error);
    next(error);
  }
};

export const createSkillGroup = async (req, res, next) => {
  try {
    const data = await skillGroupsService.createSkillGroup(req.body);
    logger.info(`Skill group created: ${data.id} by admin ${req.admin.id}`);
    res.status(201).json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Create skill group error:', error);
    next(error);
  }
};

export const updateSkillGroup = async (req, res, next) => {
  try {
    const data = await skillGroupsService.updateSkillGroup(req.params.id, req.body);
    logger.info(`Skill group updated: ${req.params.id} by admin ${req.admin.id}`);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Update skill group error:', error);
    next(error);
  }
};

export const deleteSkillGroup = async (req, res, next) => {
  try {
    await skillGroupsService.deleteSkillGroup(req.params.id);
    logger.info(`Skill group deleted: ${req.params.id} by admin ${req.admin.id}`);
    res.json({
      success: true,
      message: 'Skill group deleted successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Delete skill group error:', error);
    next(error);
  }
};
