import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get User Notifications
 */
export const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = { userId };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    // Get notifications
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId,
          isRead: false
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get notifications error:', error);
    next(error);
  }
};

/**
 * Mark Notification as Read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOTIFICATION_NOT_FOUND',
          message: 'Notification not found'
        }
      });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only mark your own notifications as read'
        }
      });
    }

    // Update notification
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true
      }
    });

    logger.info(`Notification marked as read: ${id} by user ${userId}`);

    res.json({
      success: true,
      data: updatedNotification
    });
  } catch (error) {
    logger.error('Mark notification as read error:', error);
    next(error);
  }
};

/**
 * Mark All Notifications as Read
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Update all unread notifications
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    logger.info(`All notifications marked as read by user ${userId}`);

    res.json({
      success: true,
      data: {
        count: result.count,
        message: 'All notifications marked as read'
      }
    });
  } catch (error) {
    logger.error('Mark all notifications as read error:', error);
    next(error);
  }
};

