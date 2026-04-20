import { prisma } from '../../config/database.js';

export const findAllByDoctorId = (doctorId) =>
  prisma.address.findMany({
    where: { doctorId },
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

export const countByDoctorId = (doctorId) =>
  prisma.address.count({ where: { doctorId } });

export const setDefaultForDoctor = async (doctorId, excludeId) => {
  await prisma.address.updateMany({
    where: { doctorId, id: { not: excludeId } },
    data: { isDefault: false }
  });
};
