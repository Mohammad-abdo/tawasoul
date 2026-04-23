import * as messagesService from '../../services/doctor/messages.service.js';
import * as messagesRepo from '../../repositories/doctor/messages.repository.js';
import * as conversationsRepo from '../../repositories/doctor/conversations.repository.js';
import { logger } from '../../utils/logger.js';
import { getIo } from '../../socket/index.js';

export const sendMessageToUser = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const {
      userId,
      content,
      messageType = 'TEXT',
      imageUrl,
      videoUrl,
      fileUrl,
      fileName,
      voiceUrl,
      voiceDuration
    } = req.body;

    const message = await messagesService.sendMessageToUser(doctorId, {
      userId, content, messageType, imageUrl, videoUrl, fileUrl, fileName, voiceUrl, voiceDuration
    });

    const notification = await messagesRepo.createNotification({
      userId: userId,
      type: 'NEW_MESSAGE',
      title: 'رسالة جديدة من الطبيب',
      message: 'لديك رسالة جديدة في المحادثة.'
    });

    try {
      const io = getIo();
      io.to(`user-${userId}`).emit('receive-message', message);
      io.to(`user-${userId}`).emit('new-notification', notification);
    } catch (socketError) {
      logger.error('Socket error:', socketError);
    }

    return res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    logger.error('Doctor send message error:', error);
    next(error);
  }
};

export const getMessageById = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const { messageId } = req.params;

    const message = await messagesService.getMessageById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, error: { message: 'Message not found' } });
    }

    if (message.senderId !== doctorId || message.senderRole !== 'DOCTOR') {
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
    const doctorId = req.doctor.id;
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await messagesService.updateMessage(messageId, doctorId, { content });

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
    const doctorId = req.doctor.id;
    const { messageId } = req.params;

    await messagesService.deleteMessage(messageId, doctorId);

    res.json({
      success: true,
      data: { message: 'Message deleted successfully' }
    });
  } catch (error) {
    logger.error('Delete message error:', error);
    next(error);
  }
};