import { prisma } from '../../config/database.js';

export const findMany = (where) =>
  prisma.homeArticle.findMany({
    where,
    orderBy: { order: 'asc' }
  });

export const findById = (id) =>
  prisma.homeArticle.findUnique({
    where: { id }
  });

export const aggregateMaxOrder = () =>
  prisma.homeArticle.aggregate({
    _max: { order: true }
  });

export const count = () => prisma.homeArticle.count();

export const createArticle = (data) =>
  prisma.homeArticle.create({
    data
  });

export const updateArticle = (id, data) =>
  prisma.homeArticle.update({
    where: { id },
    data
  });

export const deleteArticle = (id) =>
  prisma.homeArticle.delete({
    where: { id }
  });
