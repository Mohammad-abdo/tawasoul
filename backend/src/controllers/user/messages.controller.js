import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get User Messages
 */
export const getUserMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get messages where user is sender or receiver
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          receiver: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      }),
      prisma.message.count({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      })
    ]);

    // Format messages
    const formattedMessages = messages.map(message => ({
      id: message.id,
      sender: message.sender,
      receiver: message.receiver,
      content: message.content,
      messageType: message.messageType,
      imageUrl: message.imageUrl,
      videoUrl: message.videoUrl,
      fileUrl: message.fileUrl,
      fileName: message.fileName,
      voiceUrl: message.voiceUrl,
      voiceDuration: message.voiceDuration,
      isRead: message.isRead,
      isFromMe: message.senderId === userId,
      createdAt: message.createdAt
    }));

    res.json({
      success: true,
      data: {
        messages: formattedMessages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get messages error:', error);
    next(error);
  }
};

/**
 * Get Conversation with Specific User
 */
export const getConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { userId: otherUserId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get messages between two users
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          OR: [
            {
              senderId: userId,
              receiverId: otherUserId
            },
            {
              senderId: otherUserId,
              receiverId: userId
            }
          ]
        },
        skip,
        take,
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          receiver: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      }),
      prisma.message.count({
        where: {
          OR: [
            {
              senderId: userId,
              receiverId: otherUserId
            },
            {
              senderId: otherUserId,
              receiverId: userId
            }
          ]
        }
      })
    ]);

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    // Format messages
    const formattedMessages = messages.map(message => ({
      id: message.id,
      sender: message.sender,
      receiver: message.receiver,
      content: message.content,
      messageType: message.messageType,
      imageUrl: message.imageUrl,
      videoUrl: message.videoUrl,
      fileUrl: message.fileUrl,
      fileName: message.fileName,
      voiceUrl: message.voiceUrl,
      voiceDuration: message.voiceDuration,
      isRead: message.isRead,
      isFromMe: message.senderId === userId,
      createdAt: message.createdAt
    }));

    res.json({
      success: true,
      data: {
        messages: formattedMessages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get conversation error:', error);
    next(error);
  }
};

/**
 * Send Message
 */
export const sendMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { 
      receiverId, 
      content,
      messageType = 'TEXT',
      imageUrl,
      videoUrl,
      fileUrl,
      fileName,
      voiceUrl,
      voiceDuration
    } = req.body;

    // Validation
    if (!receiverId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Receiver ID is required'
        }
      });
    }

    // Validate message type
    if (!['TEXT', 'IMAGE', 'VIDEO', 'FILE', 'VOICE'].includes(messageType)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid message type'
        }
      });
    }

    // Validate content based on message type
    if (messageType === 'TEXT') {
      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Content is required for text messages'
          }
        });
      }
    } else if (messageType === 'IMAGE') {
      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Image URL is required for image messages'
          }
        });
      }
    } else if (messageType === 'VIDEO') {
      if (!videoUrl) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Video URL is required for video messages'
          }
        });
      }
    } else if (messageType === 'FILE') {
      if (!fileUrl || !fileName) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'File URL and file name are required for file messages'
          }
        });
      }
    } else if (messageType === 'VOICE') {
      if (!voiceUrl) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Voice URL is required for voice messages'
          }
        });
      }
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: {
        id: true,
        allowPrivateMsg: true
      }
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Receiver not found'
        }
      });
    }

    // Check if receiver allows private messages
    if (!receiver.allowPrivateMsg) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'MESSAGES_DISABLED',
          message: 'This user does not allow private messages'
        }
      });
    }

    // Check if user is trying to message themselves
    if (userId === receiverId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_RECEIVER',
          message: 'Cannot send message to yourself'
        }
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: userId,
        receiverId,
        content: content ? content.trim() : null,
        messageType,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        voiceUrl: voiceUrl || null,
        voiceDuration: voiceDuration ? parseInt(voiceDuration) : null
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'NEW_MESSAGE',
        title: 'رسالة جديدة',
        message: `لديك رسالة جديدة من ${message.sender.username}`
      }
    });

    logger.info(`Message sent: ${message.id} from ${userId} to ${receiverId}`);

    res.status(201).json({
      success: true,
      data: {
        id: message.id,
        sender: message.sender,
        receiver: message.receiver,
        content: message.content,
        messageType: message.messageType,
        imageUrl: message.imageUrl,
        videoUrl: message.videoUrl,
        fileUrl: message.fileUrl,
        fileName: message.fileName,
        voiceUrl: message.voiceUrl,
        voiceDuration: message.voiceDuration,
        isRead: message.isRead,
        createdAt: message.createdAt
      }
    });
  } catch (error) {
    logger.error('Send message error:', error);
    next(error);
  }
};

