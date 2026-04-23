import { prisma } from '../../config/database.js';

export const findMessages = ({ where, skip, take, orderBy }) =>
  prisma.message.findMany({ where, skip, take, orderBy });

export const countMessages = (where) =>
  prisma.message.count({ where });

export const markMessagesAsRead = ({ where, data }) =>
  prisma.message.updateMany({ where, data });

export const createMessage = (data) =>
  prisma.message.create({ data });

export const findUserById = (id) =>
  prisma.user.findUnique({ where: { id } });

export const createNotification = (data) =>
  prisma.notification.create({ data });