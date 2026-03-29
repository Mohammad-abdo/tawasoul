import { prisma } from '../../config/database.js';

export const findMany = (where) =>
  prisma.homeService.findMany({
    where,
    orderBy: { order: 'asc' }
  });

export const findById = (id) =>
  prisma.homeService.findUnique({
    where: { id }
  });

export const aggregateMaxOrder = () =>
  prisma.homeService.aggregate({
    _max: { order: true }
  });

export const count = () => prisma.homeService.count();

export const createService = (data) =>
  prisma.homeService.create({
    data
  });

export const updateService = (id, data) =>
  prisma.homeService.update({
    where: { id },
    data
  });

export const deleteService = (id) =>
  prisma.homeService.delete({
    where: { id }
  });
