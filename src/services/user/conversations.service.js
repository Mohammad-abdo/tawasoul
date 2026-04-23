import * as conversationsRepo from '../../repositories/user/conversations.repository.js';
import * as messagesRepo from '../../repositories/user/messages.repository.js';
import { createHttpError } from '../../utils/httpError.js';

export const getUserConversations = async (userId, { page = 1, limit = 20 }) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);
  const where = { userId };

  const [conversations, total] = await Promise.all([
    conversationsRepo.findConversations({
      where,
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
      include: {
        doctor: { select: { id: true, name: true, avatar: true, specialties: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    }),
    conversationsRepo.countConversations(where)
  ]);

  return { conversations, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } };
};

export const getConversationById = async (conversationId) => {
  return await conversationsRepo.findConversation({ id: conversationId });
};

export const createConversation = async (userId, doctorId) => {
  const doctor = await messagesRepo.findDoctorById(doctorId);
  if (!doctor) {
    throw createHttpError(404, 'DOCTOR_NOT_FOUND', 'Doctor not found');
  }

  const existingConversation = await conversationsRepo.findConversationByUserAndDoctor({ userId_doctorId: { userId, doctorId } });
  if (existingConversation) {
    return existingConversation;
  }

  return await conversationsRepo.createConversation({ userId, doctorId });
};

export const deleteConversation = async (conversationId, userId) => {
  const conversation = await conversationsRepo.findConversation({ id: conversationId });
  if (!conversation) {
    throw createHttpError(404, 'CONVERSATION_NOT_FOUND', 'Conversation not found');
  }
  if (conversation.userId !== userId) {
    throw createHttpError(403, 'FORBIDDEN', 'You do not have permission to delete this conversation');
  }
  return await conversationsRepo.deleteConversation({ id: conversationId });
};