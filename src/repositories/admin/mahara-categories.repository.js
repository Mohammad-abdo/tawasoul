import { prisma } from '../../config/database.js';

export const findMany = () =>
  prisma.activityCategory.findMany({
    orderBy: { createdAt: 'asc' }
  });

export const findById = (id) =>
  prisma.activityCategory.findUnique({
    where: { id }
  });

export const createCategory = (data) =>
  prisma.activityCategory.create({
    data
  });

export const updateCategory = (id, data) =>
  prisma.activityCategory.update({
    where: { id },
    data
  });

export const deleteCategory = (id) =>
  prisma.activityCategory.delete({
    where: { id }
  });
