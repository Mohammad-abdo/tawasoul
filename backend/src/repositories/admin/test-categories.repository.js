import { prisma } from '../../config/database.js';

export const findManyTestCategories = ({ skip, take }) =>
  prisma.testCategory.findMany({
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { tests: true }
      }
    }
  });

export const countTestCategories = () => prisma.testCategory.count();

export const findTestCategoryById = (id) =>
  prisma.testCategory.findUnique({
    where: { id },
    include: {
      tests: true
    }
  });

export const findTestCategoryByIdSimple = (id) =>
  prisma.testCategory.findUnique({
    where: { id }
  });

export const createTestCategory = (data) =>
  prisma.testCategory.create({
    data
  });

export const updateTestCategory = (id, data) =>
  prisma.testCategory.update({
    where: { id },
    data
  });

export const deleteTestCategory = (id) =>
  prisma.testCategory.delete({
    where: { id }
  });
