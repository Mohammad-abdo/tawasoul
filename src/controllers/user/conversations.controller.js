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

export const getConversationById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const conversation = await conversationsService.getConversationById(conversationId);

    if (!conversation) {
      return res.status(404).json({ success: false, error: { message: 'Conversation not found' } });
    }

    if (conversation.userId !== userId) {
      return res.status(403).json({ success: false, error: { message: 'You do not have permission to view this conversation' } });
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    logger.error('Get conversation by ID error:', error);
    next(error);
  }
};

export const createConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({ success: false, error: { message: 'Doctor ID is required' } });
    }

    const conversation = await conversationsService.createConversation(userId, doctorId);

    res.status(201).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    logger.error('Create conversation error:', error);
    next(error);
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    await conversationsService.deleteConversation(conversationId, userId);

    res.json({
      success: true,
      data: { message: 'Conversation deleted successfully' }
    });
  } catch (error) {
    logger.error('Delete conversation error:', error);
    next(error);
  }
};