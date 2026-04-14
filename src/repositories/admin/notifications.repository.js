import { prisma } from '../../config/database.js';

export const findMany = ({ where, skip, take }) =>
  prisma.notification.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true
        }
      }
    }
  });

export const count = (where) => prisma.notification.count({ where });

export const markAsRead = (id) =>
  prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });

export const markAllAsRead = () =>
  prisma.notification.updateMany({
    where: { isRead: false },
    data: { isRead: true }
  });

export const deleteNotification = (id) =>
  prisma.notification.delete({
    where: { id }
  });

export const clearAll = () => prisma.notification.deleteMany({});
