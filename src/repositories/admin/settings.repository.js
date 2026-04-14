import { prisma } from '../../config/database.js';

export const findFirst = () => prisma.appSettings.findFirst();

export const createSettings = (data) =>
  prisma.appSettings.create({
    data
  });

export const updateSettings = (id, data) =>
  prisma.appSettings.update({
    where: { id },
    data
  });
