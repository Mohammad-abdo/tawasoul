import * as messagesService from '../../services/user/messages.service.js';
import * as messagesRepo from '../../repositories/user/messages.repository.js';
import * as conversationsRepo from '../../repositories/user/conversations.repository.js';
import { getIo } from '../../socket/index.js';
import { logger } from '../../utils/logger.js';

export const sendMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      doctorId,
      content,
      messageType = 'TEXT',
      imageUrl,
      videoUrl,
      fileUrl,
      fileName,
      voiceUrl,
      voiceDuration
    } = req.body;

    const message = await messagesService.sendMessage(userId, {
      doctorId, content, messageType, imageUrl, videoUrl, fileUrl, fileName, voiceUrl, voiceDuration
    });

    const socketNotification = {
      type: 'NEW_MESSAGE',
      title: 'رسالة جديدة',
      message: `لديك رسالة جديدة من ${req.user.username || req.user.fullName || 'أحد المستخدمين'}`,
      createdAt: new Date().toISOString(),
    };

    try {
      const io = getIo();
      io.to(`doctor-${doctorId}`).emit('receive-message', message);
      io.to(`doctor-${doctorId}`).emit('new-notification', socketNotification);
    } catch (socketError) {
      logger.error('Socket error:', socketError);
    }

    return res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    logger.error('Send message error:', error);
    next(error);
  }
};

export const getMessageById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    const message = await messagesService.getMessageById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, error: { message: 'Message not found' } });
    }

    if (message.senderId !== userId || message.senderRole !== 'USER') {
      return res.status(403).json({ success: false, error: { message: 'You do not have permission to view this message' } });
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    logger.error('Get message by ID error:', error);
    next(error);
  }
};

export const updateMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await messagesService.updateMessage(messageId, userId, { content });

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    logger.error('Update message error:', error);
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    await messagesService.deleteMessage(messageId, userId);

    res.json({
      success: true,
      data: { message: 'Message deleted successfully' }
    });
  } catch (error) {
    logger.error('Delete message error:', error);
    next(error);
  }
};