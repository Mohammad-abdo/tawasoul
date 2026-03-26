import * as categoryRepo from '../../repositories/admin/assessment-categories.repository.js';
import { createHttpError } from '../../utils/httpError.js';

export const getAllCategories = async ({ page = 1, limit = 20 }) => {
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  const skip = (parsedPage - 1) * parsedLimit;

  const [categories, total] = await Promise.all([
    categoryRepo.findMany({ skip, take: parsedLimit }),
    categoryRepo.count()
  ]);

  return {
    categories,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      pages: Math.ceil(total / parsedLimit)
    }
  };
};

export const getCategoryById = async (id) => {
  const category = await categoryRepo.findById(id);
  if (!category) {
    throw createHttpError(404, 'CATEGORY_NOT_FOUND', 'Category not found');
  }
  return category;
};

export const createCategory = async ({ name, nameAr }) => {
  if (!name || !nameAr) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Name (English and Arabic) is required');
  }

  return categoryRepo.createCategory({ name, nameAr });
};

export const updateCategory = async (id, { name, nameAr }) => {
  const category = await categoryRepo.findByIdSimple(id);
  if (!category) {
    throw createHttpError(404, 'CATEGORY_NOT_FOUND', 'Category not found');
  }

  return categoryRepo.updateCategory(id, {
    ...(name && { name }),
    ...(nameAr && { nameAr })
  });
};

export const deleteCategory = async (id) => {
  const category = await categoryRepo.findByIdSimple(id);
  if (!category) {
    throw createHttpError(404, 'CATEGORY_NOT_FOUND', 'Category not found');
  }

  await categoryRepo.deleteCategory(id);
};
