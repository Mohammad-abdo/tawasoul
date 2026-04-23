import * as conversationsRepo from '../../repositories/doctor/conversations.repository.js';
import * as messagesRepo from '../../repositories/doctor/messages.repository.js';
import { createHttpError } from '../../utils/httpError.js';

export const getDoctorConversations = async (doctorId, { page = 1, limit = 20 }) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);
  const where = { doctorId };

  const [conversations, total] = await Promise.all([
    conversationsRepo.findConversations({
      where,
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, username: true, avatar: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    }),
    conversationsRepo.countConversations(where)
  ]);

  return { conversations, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } };
};

export const getConversationByUserId = async (userId, doctorId) => {
  return await conversationsRepo.findConversation({ userId_doctorId: { userId, doctorId } });
};

export const createConversation = async (doctorId, userId) => {
  const user = await messagesRepo.findUserById(userId);
  if (!user) {
    throw createHttpError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const existingConversation = await conversationsRepo.findConversationByUserAndDoctor({ userId_doctorId: { userId, doctorId } });
  if (existingConversation) {
    return existingConversation;
  }

  return await conversationsRepo.createConversation({ userId, doctorId });
};

export const deleteConversation = async (conversationId, doctorId) => {
  const conversation = await conversationsRepo.findConversation({ id: conversationId });
  if (!conversation) {
    throw createHttpError(404, 'CONVERSATION_NOT_FOUND', 'Conversation not found');
  }
  if (conversation.doctorId !== doctorId) {
    throw createHttpError(403, 'FORBIDDEN', 'You do not have permission to delete this conversation');
  }
  return await conversationsRepo.deleteConversation({ id: conversationId });
};