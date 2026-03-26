import { prisma } from '../../config/database.js';

export const findMany = ({ where, skip, take, sort }) =>
  prisma.withdrawal.findMany({
    where,
    skip,
    take,
    orderBy: { [sort]: 'desc' },
    include: {
      doctor: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

export const count = (where) => prisma.withdrawal.count({ where });

export const findById = (id) =>
  prisma.withdrawal.findUnique({
    where: { id },
    include: {
      doctor: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          specialization: true
        }
      }
    }
  });

export const findByIdSimple = (id) =>
  prisma.withdrawal.findUnique({
    where: { id }
  });

export const updateWithdrawal = (id, data) =>
  prisma.withdrawal.update({
    where: { id },
    data
  });

export const createActivityLog = (data) =>
  prisma.activityLog.create({
    data
  });
