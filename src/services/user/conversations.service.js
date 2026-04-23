import * as conversationsRepo from '../../repositories/user/conversations.repository.js';

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