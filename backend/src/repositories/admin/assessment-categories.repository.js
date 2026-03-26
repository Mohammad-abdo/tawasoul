import { prisma } from '../../config/database.js';

export const findMany = ({ skip, take }) =>
  prisma.assessmentCategory.findMany({
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { tests: true }
      }
    }
  });

export const count = () => prisma.assessmentCategory.count();

export const findById = (id) =>
  prisma.assessmentCategory.findUnique({
    where: { id },
    include: {
      tests: true
    }
  });

export const findByIdSimple = (id) =>
  prisma.assessmentCategory.findUnique({
    where: { id }
  });

export const createCategory = (data) =>
  prisma.assessmentCategory.create({
    data
  });

export const updateCategory = (id, data) =>
  prisma.assessmentCategory.update({
    where: { id },
    data
  });

export const deleteCategory = (id) =>
  prisma.assessmentCategory.delete({
    where: { id }
  });
