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

    if (!userId) {
      return res.status(400).json({ success: false, error: { message: 'User ID is required' } });
    }

    const user = await messagesRepo.findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    const conversation = await conversationsRepo.upsertConversation({
      where: { userId_doctorId: { userId, doctorId } },
      update: { updatedAt: new Date() },
      create: { userId, doctorId }
    });

    const message = await messagesRepo.createMessage({
      conversationId: conversation.id,
      senderId: doctorId,
      senderRole: 'DOCTOR',
      content: content ? content.trim() : null,
      messageType,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      voiceUrl: voiceUrl || null,
      voiceDuration: voiceDuration ? parseInt(voiceDuration) : null
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