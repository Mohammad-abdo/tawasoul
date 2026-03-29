import * as skillGroupRepo from '../../repositories/admin/mahara-skill-groups.repository.js';
import { createHttpError } from '../../utils/httpError.js';

export const getAllSkillGroups = ({ categoryId }) => {
  const where = {};
  if (categoryId) {
    where.categoryId = categoryId;
  }

  return skillGroupRepo.findMany(where);
};

export const getSkillGroupById = async (id) => {
  const skillGroup = await skillGroupRepo.findById(id);
  if (!skillGroup) {
    throw createHttpError(404, 'SKILL_GROUP_NOT_FOUND', 'Skill group not found');
  }
  return skillGroup;
};

export const createSkillGroup = async ({ categoryId, name }) => {
  if (!categoryId || !name) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Category ID and name are required');
  }

  const category = await skillGroupRepo.findCategoryById(categoryId);
  if (!category) {
    throw createHttpError(404, 'ACTIVITY_CATEGORY_NOT_FOUND', 'Activity category not found');
  }

  return skillGroupRepo.createSkillGroup({ categoryId, name });
};

export const updateSkillGroup = async (id, { name }) => {
  const skillGroup = await skillGroupRepo.findByIdSimple(id);
  if (!skillGroup) {
    throw createHttpError(404, 'SKILL_GROUP_NOT_FOUND', 'Skill group not found');
  }

  return skillGroupRepo.updateSkillGroup(id, {
    ...(name !== undefined && { name })
  });
};

export const deleteSkillGroup = async (id) => {
  const skillGroup = await skillGroupRepo.findByIdSimple(id);
  if (!skillGroup) {
    throw createHttpError(404, 'SKILL_GROUP_NOT_FOUND', 'Skill group not found');
  }

  await skillGroupRepo.deleteSkillGroup(id);
};
