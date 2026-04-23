import { prisma } from '../../config/database.js';

export const findConversations = ({ where, skip, take, orderBy, include }) =>
  prisma.conversation.findMany({ where, skip, take, orderBy, include });

export const countConversations = (where) =>
  prisma.conversation.count({ where });

export const findConversation = (where) =>
  prisma.conversation.findUnique({ where });

export const upsertConversation = ({ where, update, create }) =>
  prisma.conversation.upsert({ where, update, create });