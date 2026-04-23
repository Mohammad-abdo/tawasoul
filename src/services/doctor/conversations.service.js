import * as conversationsRepo from '../../repositories/doctor/conversations.repository.js';

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