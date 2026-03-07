import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get Admin Notifications
 */
export const getAdminNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false, type } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (unreadOnly === 'true') {
      where.isRead = false;
    }
    if (type) {
      where.type = type;
    }

    // Get admin notifications (all notifications for admin dashboard)
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            }
          }
        }
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          ...where,
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
    logger.error('Get admin notifications error:', error);
    next(error);
  }
};

/**
 * Mark Notification as Read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
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
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true }
    });

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    logger.error('Mark all notifications as read error:', error);
    next(error);
  }
};

/**
 * Delete Notification
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.notification.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    logger.error('Delete notification error:', error);
    next(error);
  }
};

/**
 * Clear All Notifications
 */
export const clearAllNotifications = async (req, res, next) => {
  try {
    await prisma.notification.deleteMany({});

    res.json({
      success: true,
      message: 'All notifications cleared'
    });
  } catch (error) {
    logger.error('Clear all notifications error:', error);
    next(error);
  }
};

