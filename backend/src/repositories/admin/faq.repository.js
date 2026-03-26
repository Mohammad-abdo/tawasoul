import { prisma } from '../../config/database.js';

export const findMany = (where) =>
  prisma.fAQ.findMany({
    where,
    orderBy: { order: 'asc' }
  });

export const findById = (id) =>
  prisma.fAQ.findUnique({
    where: { id }
  });

export const aggregateMaxOrder = () =>
  prisma.fAQ.aggregate({
    _max: { order: true }
  });

export const count = () => prisma.fAQ.count();

export const createFaq = (data) =>
  prisma.fAQ.create({
    data
  });

export const updateFaq = (id, data) =>
  prisma.fAQ.update({
    where: { id },
    data
  });

export const deleteFaq = (id) =>
  prisma.fAQ.delete({
    where: { id }
  });
