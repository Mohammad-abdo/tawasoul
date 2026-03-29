import { prisma } from '../../config/database.js';

export const findManyByDoctor = ({ doctorId, skip, take }) =>
  prisma.article.findMany({
    where: { authorId: doctorId },
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  });

export const countByDoctor = (doctorId) =>
  prisma.article.count({
    where: { authorId: doctorId }
  });

export const createArticle = (data) =>
  prisma.article.create({
    data
  });

export const findById = (id) =>
  prisma.article.findUnique({
    where: { id }
  });

export const updateArticle = (id, data) =>
  prisma.article.update({
    where: { id },
    data
  });

export const deleteArticle = (id) =>
  prisma.article.delete({
    where: { id }
  });
