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

    if (!doctorId) {
      return res.status(400).json({ success: false, error: { message: 'Doctor ID is required' } });
    }

    const doctor = await messagesRepo.findDoctorById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, error: { message: 'Doctor not found' } });
    }

    const conversation = await conversationsRepo.upsertConversation({
      where: { userId_doctorId: { userId, doctorId } },
      update: { updatedAt: new Date() },
      create: { userId, doctorId }
    });

    const message = await messagesRepo.createMessage({
      conversationId: conversation.id,
      senderId: userId,
      senderRole: 'USER',
      content: content ? content.trim() : null,
      messageType,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      voiceUrl: voiceUrl || null,
      voiceDuration: voiceDuration ? parseInt(voiceDuration) : null
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