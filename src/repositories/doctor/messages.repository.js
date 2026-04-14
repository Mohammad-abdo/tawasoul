import { prisma } from '../../config/database.js';

// --- Conversation Methods ---

export const findConversations = ({ where, skip, take, orderBy, include }) =>
  prisma.conversation.findMany({ where, skip, take, orderBy, include });

export const countConversations = (where) => 
  prisma.conversation.count({ where });

export const findConversation = (where) =>
  prisma.conversation.findUnique({ where });

export const upsertConversation = ({ where, update, create }) =>
  prisma.conversation.upsert({ where, update, create });

// --- Message Methods ---

export const findMessages = ({ where, skip, take, orderBy }) =>
  prisma.message.findMany({ where, skip, take, orderBy });

export const countMessages = (where) => 
  prisma.message.count({ where });

export const markMessagesAsRead = ({ where, data }) =>
  prisma.message.updateMany({ where, data });

export const createMessage = (data) =>
  prisma.message.create({ data });

// --- Other Entity Methods ---

export const findUserById = (id) =>
  prisma.user.findUnique({ where: { id } });

export const createNotification = (data) =>
  prisma.notification.create({ data });