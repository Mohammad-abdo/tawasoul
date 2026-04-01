import { prisma } from '../../config/database.js';

export const findMany = ({ where, skip, take, sort }) =>
  prisma.payment.findMany({
    where,
    skip,
    take,
    orderBy: { [sort]: 'desc' },
    include: {
      package: {
        select: {
          id: true,
          name: true,
          nameAr: true,
          price: true
        }
      }
    }
  });

export const count = (where) => prisma.payment.count({ where });

export const findById = (id) => prisma.payment.findUnique({ where: { id } });

export const updateStatus = (id, status) =>
  prisma.payment.update({
    where: { id },
    data: { status }
  });

export const createActivityLog = (data) =>
  prisma.activityLog.create({
    data
  });
