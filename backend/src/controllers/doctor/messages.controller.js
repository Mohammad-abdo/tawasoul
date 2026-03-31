import * as messagesRepo from '../../repositories/doctor/messages.repository.js';
import { logger } from '../../utils/logger.js';
import { getIo } from '../../socket/index.js';
/**
 * Get Doctor's Conversations List
 */
export const getDoctorConversations = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { doctorId };

    const [conversations, total] = await Promise.all([
      messagesRepo.findConversations({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, username: true, avatar: true } },
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
    logger.error('Get doctor conversations error:', error);
    next(error);
  }
};

/**
 * Get Messages for a specific User
 */
export const getConversationMessages = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // 1. ندور على المحادثة
    const conversation = await messagesRepo.findConversation({
      userId_doctorId: { userId, doctorId }
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

    // 3. نعلم على الرسائل اللي جاية من اليوزر إنها اتقرت
    await messagesRepo.markMessagesAsRead({
      where: {
        conversationId: conversation.id,
        senderRole: 'USER',
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
 * Send Message (Doctor to User)
 */

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
  
      // 1. نتأكد إن اليوزر موجود
      const user = await messagesRepo.findUserById(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: { message: 'User not found' } });
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
        senderId: doctorId,
        senderRole: 'DOCTOR', // هنا الدور DOCTOR
        content: content ? content.trim() : null,
        messageType,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        voiceUrl: voiceUrl || null,
        voiceDuration: voiceDuration ? parseInt(voiceDuration) : null
      });
  
      // 4. نبعت الرسالة للـ Socket الخاص باليوزر عشان تظهرله فوراً

  
      // 5. نبعت إشعار لليوزر (في الداتابيز)
      const notification = await messagesRepo.createNotification({
        userId: userId,
        type: 'NEW_MESSAGE',
        title: 'رسالة جديدة من الطبيب',
        message: 'لديك رسالة جديدة في المحادثة.'
      });

      try {
        const io = getIo();
        // نبعت الرسالة عشان لو هو فاتح الشات
        io.to(`user-${userId}`).emit('receive-message', message);
        
        // نبعت الإشعار عشان لو هو بره الشات (في الصفحة الرئيسية مثلاً)
        io.to(`user-${userId}`).emit('new-notification', notification);
      } catch (socketError) {
        logger.error('Socket error:', socketError);
      }
  
      // 6. نبعت الرد النهائي للفرونت اند مرة واحدة بس
      return res.status(201).json({
        success: true,
        data: message
      });
    } catch (error) {
      logger.error('Doctor send message error:', error);
      next(error);
    }
  };