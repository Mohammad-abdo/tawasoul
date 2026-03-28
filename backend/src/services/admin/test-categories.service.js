import * as testCategoryRepo from '../../repositories/admin/test-categories.repository.js';
import { createHttpError } from '../../utils/httpError.js';

export const getAllTestCategories = async ({ page = 1, limit = 20 }) => {
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  const skip = (parsedPage - 1) * parsedLimit;

  const [testCategories, total] = await Promise.all([
    testCategoryRepo.findManyTestCategories({ skip, take: parsedLimit }),
    testCategoryRepo.countTestCategories()
  ]);

  return {
    testCategories,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      pages: Math.ceil(total / parsedLimit)
    }
  };
};

export const getTestCategoryById = async (id) => {
  const testCategory = await testCategoryRepo.findTestCategoryById(id);
  if (!testCategory) {
    throw createHttpError(404, 'TEST_CATEGORY_NOT_FOUND', 'Test category not found');
  }
  return testCategory;
};

export const createTestCategory = async ({ name, nameAr }) => {
  if (!name || !nameAr) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Name (English and Arabic) is required');
  }

  return testCategoryRepo.createTestCategory({ name, nameAr });
};

export const updateTestCategory = async (id, { name, nameAr }) => {
  const testCategory = await testCategoryRepo.findTestCategoryByIdSimple(id);
  if (!testCategory) {
    throw createHttpError(404, 'TEST_CATEGORY_NOT_FOUND', 'Test category not found');
  }

  return testCategoryRepo.updateTestCategory(id, {
    ...(name && { name }),
    ...(nameAr && { nameAr })
  });
};

export const deleteTestCategory = async (id) => {
  const testCategory = await testCategoryRepo.findTestCategoryByIdSimple(id);
  if (!testCategory) {
    throw createHttpError(404, 'TEST_CATEGORY_NOT_FOUND', 'Test category not found');
  }

  await testCategoryRepo.deleteTestCategory(id);
};
