import { prisma } from '../../config/database.js';

export const findMany = (where) =>
  prisma.homeSlider.findMany({
    where,
    orderBy: { order: 'asc' }
  });

export const findById = (id) =>
  prisma.homeSlider.findUnique({
    where: { id }
  });

export const aggregateMaxOrder = () =>
  prisma.homeSlider.aggregate({
    _max: { order: true }
  });

export const count = () => prisma.homeSlider.count();

export const createSlider = (data) =>
  prisma.homeSlider.create({
    data
  });

export const updateSlider = (id, data) =>
  prisma.homeSlider.update({
    where: { id },
    data
  });

export const deleteSlider = (id) =>
  prisma.homeSlider.delete({
    where: { id }
  });
