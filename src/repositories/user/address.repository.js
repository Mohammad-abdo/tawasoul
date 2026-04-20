import { prisma } from '../../config/database.js';

export const findAllByUserId = (userId) =>
  prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

export const findById = (id) =>
  prisma.address.findUnique({ where: { id } });

export const findByIdSimple = (id) =>
  prisma.address.findUnique({ where: { id } });

export const createAddress = (data) =>
  prisma.address.create({ data });

export const updateAddress = (id, data) =>
  prisma.address.update({ where: { id }, data });

export const deleteAddress = (id) =>
  prisma.address.delete({ where: { id } });

export const countByUserId = (userId) =>
  prisma.address.count({ where: { userId } });

export const setDefaultForUser = async (userId, excludeId) => {
  await prisma.address.updateMany({
    where: { userId, id: { not: excludeId } },
    data: { isDefault: false }
  });
};
