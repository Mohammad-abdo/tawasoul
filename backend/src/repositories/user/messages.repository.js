import { prisma } from '../../config/database.js';

const msgInclude = {
  sender: { select: { id: true, username: true, avatar: true } },
  receiver: { select: { id: true, username: true, avatar: true } }
};

export const findMany = ({ where, skip, take, orderBy }) =>
  prisma.message.findMany({ where, skip, take, orderBy, include: msgInclude });

export const count = (where) => prisma.message.count({ where });

export const markRead = (senderId, receiverId) =>
  prisma.message.updateMany({
    where: { senderId, receiverId, isRead: false },
    data: { isRead: true }
  });

export const findReceiver = (receiverId) =>
  prisma.user.findUnique({ where: { id: receiverId }, select: { id: true, allowPrivateMsg: true } });

export const createMessage = (data) =>
  prisma.message.create({ data, include: msgInclude });

export const createNotification = (data) =>
  prisma.notification.create({ data });
