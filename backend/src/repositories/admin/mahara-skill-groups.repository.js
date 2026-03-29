import { prisma } from '../../config/database.js';

export const findMany = (where) =>
  prisma.skillGroup.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    include: {
      category: true
    }
  });

export const findById = (id) =>
  prisma.skillGroup.findUnique({
    where: { id },
    include: {
      category: true
    }
  });

export const findByIdSimple = (id) =>
  prisma.skillGroup.findUnique({
    where: { id }
  });

export const findCategoryById = (id) =>
  prisma.activityCategory.findUnique({
    where: { id }
  });

export const createSkillGroup = (data) =>
  prisma.skillGroup.create({
    data
  });

export const updateSkillGroup = (id, data) =>
  prisma.skillGroup.update({
    where: { id },
    data
  });

export const deleteSkillGroup = (id) =>
  prisma.skillGroup.delete({
    where: { id }
  });
