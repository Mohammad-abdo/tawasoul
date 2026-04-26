import * as conversationsService from '../../services/doctor/conversations.service.js';
import * as messagesRepo from '../../repositories/doctor/messages.repository.js';
import * as conversationsRepo from '../../repositories/doctor/conversations.repository.js';
import { logger } from '../../utils/logger.js';

export const getDoctorConversations = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const { page = 1, limit = 20 } = req.query;

    const result = await conversationsService.getDoctorConversations(doctorId, { page, limit });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get doctor conversations error:', error);
    next(error);
  }
};

export const getConversationMessages = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    let conversation = await conversationsRepo.findConversation({ id: conversationId });

    if (!conversation) {
      // Try finding by userId and doctorId
      conversation = await conversationsRepo.findConversation({
        userId_doctorId: { userId: conversationId, doctorId }
      });
    }

    if (!conversation) {
      return res.json({
        success: true,
        data: { messages: [], pagination: { page: 1, limit: parseInt(limit), total: 0, pages: 0 } }
      });
    }

    const msgWhere = { conversationId: conversation.id };
    const [messages, total] = await Promise.all([
      messagesRepo.findMessages({ 
        where: msgWhere, 
        skip, 
        take, 
        orderBy: [
          { createdAt: 'desc' },
          { id: 'desc' }
        ] 
      }),
      messagesRepo.countMessages(msgWhere)
    ]);

    await messagesRepo.markMessagesAsRead({
      where: { conversationId: conversation.id, senderRole: 'USER', isRead: false },
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
    const doctorId = req.doctor.id;
    const { conversationId } = req.params;

    let conversation = await conversationsRepo.findConversation({ id: conversationId });

    if (!conversation) {
      // Try finding by userId and doctorId
      conversation = await conversationsRepo.findConversation({
        userId_doctorId: { userId: conversationId, doctorId }
      });
    }

    if (!conversation) {
      return res.status(404).json({ success: false, error: { message: 'Conversation not found' } });
    }

    if (conversation.doctorId !== doctorId) {
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
    const doctorId = req.doctor.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: { message: 'User ID is required' } });
    }

    const conversation = await conversationsService.createConversation(doctorId, userId);

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
    const doctorId = req.doctor.id;
    const { conversationId } = req.params;

    await conversationsService.deleteConversation(conversationId, doctorId);

    res.json({
      success: true,
      data: { message: 'Conversation deleted successfully' }
    });
  } catch (error) {
    logger.error('Delete conversation error:', error);
    next(error);
  }
};
