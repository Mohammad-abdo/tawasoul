import { prisma } from '../../config/database.js';

export const findConversations = ({ where, skip, take, orderBy, include }) =>
  prisma.conversation.findMany({ where, skip, take, orderBy, include });

export const countConversations = (where) =>
  prisma.conversation.count({ where });

export const findConversation = (where) =>
  prisma.conversation.findUnique({ where, include: { user: true, doctor: true, messages: true } });

export const findConversationByUserAndDoctor = (where) =>
  prisma.conversation.findUnique({ where });

export const upsertConversation = ({ where, update, create }) =>
  prisma.conversation.upsert({ where, update, create });

export const createConversation = (data) =>
  prisma.conversation.create({ data });

export const deleteConversation = (where) =>
  prisma.conversation.delete({ where });

export const updateConversation = ({ where, data }) =>
  prisma.conversation.update({ where, data });