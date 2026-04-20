import { prisma } from '../../config/database.js';
import { bookingScheduleOrderBy } from '../../utils/booking-schedule.utils.js';

export const findAllByUserId = (userId) =>
  prisma.child.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

export const findById = (id) =>
  prisma.child.findUnique({
    where: { id },
    include: {
      bookings: {
        orderBy: bookingScheduleOrderBy('desc'),
        take: 5
      }
    }
  });

export const findByIdSimple = (id) =>
  prisma.child.findUnique({ where: { id } });

export const createChild = (data) =>
  prisma.child.create({ data });

export const updateChild = (id, data) =>
  prisma.child.update({ where: { id }, data });

export const deleteChild = (id) =>
  prisma.child.delete({ where: { id } });

export const countByUserId = (userId) =>
  prisma.child.count({ where: { userId } });
