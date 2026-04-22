import * as messagesRepo from '../../repositories/user/messages.repository.js';
import { getIo } from '../../socket/index.js';
import { logger } from '../../utils/logger.js';

/**
 * Get User's Conversations List
 */
export const getUserConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { userId };

    const [conversations, total] = await Promise.all([
      messagesRepo.findConversations({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          doctor: { select: { id: true, name: true, avatar: true, specialties: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 }
        }
      }),
      messagesRepo.countConversations(where)
    ]);

    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get conversations error:', error);
    next(error);
  }
};

/**
 * Get Messages for a specific Doctor
 */
export const getConversationMessages = async (req, res, next) => {
  try {
    const conversationId = req.params.conversationId;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // 1. ندور على المحادثة
    const conversation = await messagesRepo.findConversation({
      id: conversationId
    });

    if (!conversation) {
      return res.json({
        success: true,
        data: { messages: [], pagination: { page: 1, limit: parseInt(limit), total: 0, pages: 0 } }
      });
    }

    // 2. نجيب الرسائل
    const msgWhere = { conversationId: conversation.id };
    const [messages, total] = await Promise.all([
      messagesRepo.findMessages({
        where: msgWhere,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      messagesRepo.countMessages(msgWhere)
    ]);

    // 3. نعلم على الرسائل اللي جاية من الدكتور إنها اتقرت
    await messagesRepo.markMessagesAsRead({
      where: {
        conversationId: conversation.id,
        senderRole: 'DOCTOR',
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({
      success: true,
      data: {
        conversationId: conversation.id,
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get conversation messages error:', error);
    next(error);
  }
};

/**
 * Send Message (User to Doctor)
 */
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

    // 1. نتأكد إن الدكتور موجود
    const doctor = await messagesRepo.findDoctorById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, error: { message: 'Doctor not found' } });
    }

    // 2. نجيب المحادثة أو نكريتها
    const conversation = await messagesRepo.upsertConversation({
      where: {
        userId_doctorId: { userId, doctorId }
      },
      update: { updatedAt: new Date() },
      create: { userId, doctorId }
    });

    // 3. نكريت الرسالة
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

    
        // 4. نبعت إشعار للدكتور (Socket). ملاحظة: جدول notifications مربوط بالـ User فقط في الـ schema.
        // لذلك لا نخزن إشعار للدكتور في جدول notifications حتى لا نفشل بسبب FK.
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


    // 6. نرد على الـ API مرة واحدة
    return res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    logger.error('Send message error:', error);
    next(error);
  }
};