import * as maharaCategoriesRepo from '../../repositories/admin/mahara-categories.repository.js';
import { createHttpError } from '../../utils/httpError.js';

export const getAllActivityCategories = () => maharaCategoriesRepo.findMany();

export const getActivityCategoryById = async (id) => {
  const category = await maharaCategoriesRepo.findById(id);
  if (!category) {
    throw createHttpError(404, 'ACTIVITY_CATEGORY_NOT_FOUND', 'Activity category not found');
  }
  return category;
};

export const createActivityCategory = async ({ name }) => {
  if (!name) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Category name is required');
  }

  return maharaCategoriesRepo.createCategory({ name });
};

export const updateActivityCategory = async (id, { name }) => {
  const category = await maharaCategoriesRepo.findById(id);
  if (!category) {
    throw createHttpError(404, 'ACTIVITY_CATEGORY_NOT_FOUND', 'Activity category not found');
  }

  return maharaCategoriesRepo.updateCategory(id, {
    ...(name !== undefined && { name })
  });
};

export const deleteActivityCategory = async (id) => {
  const category = await maharaCategoriesRepo.findById(id);
  if (!category) {
    throw createHttpError(404, 'ACTIVITY_CATEGORY_NOT_FOUND', 'Activity category not found');
  }

  await maharaCategoriesRepo.deleteCategory(id);
};
