import * as conversationsService from '../../services/user/conversations.service.js';
import * as messagesRepo from '../../repositories/user/messages.repository.js';
import * as conversationsRepo from '../../repositories/user/conversations.repository.js';
import { getIo } from '../../socket/index.js';
import { logger } from '../../utils/logger.js';

export const getUserConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const result = await conversationsService.getUserConversations(userId, { page, limit });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get conversations error:', error);
    next(error);
  }
};

export const getConversationMessages = async (req, res, next) => {
  try {
    const conversationId = req.params.conversationId;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const conversation = await conversationsRepo.findConversation({ id: conversationId });

    if (!conversation) {
      return res.json({
        success: true,
        data: { messages: [], pagination: { page: 1, limit: parseInt(limit), total: 0, pages: 0 } }
      });
    }

    const msgWhere = { conversationId: conversation.id };
    const [messages, total] = await Promise.all([
      messagesRepo.findMessages({ where: msgWhere, skip, take, orderBy: { createdAt: 'desc' } }),
      messagesRepo.countMessages(msgWhere)
    ]);

    await messagesRepo.markMessagesAsRead({
      where: { conversationId: conversation.id, senderRole: 'DOCTOR', isRead: false },
      data: { isRead: true }
    });

    res.json({
      success: true,
      data: {
        conversationId: conversation.id,
        messages,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
      }
    });
  } catch (error) {
    logger.error('Get conversation messages error:', error);
    next(error);
  }
};