import { logger } from '../../utils/logger.js';
import * as notificationsService from '../../services/admin/notifications.service.js';

const handleServiceError = (res, error) => {
  if (!error.status) {
    return false;
  }

  res.status(error.status).json({
    success: false,
    error: {
      code: error.code,
      message: error.message
    }
  });
  return true;
};

export const getAdminNotifications = async (req, res, next) => {
  try {
    const data = await notificationsService.getAdminNotifications(req.query);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Get admin notifications error:', error);
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const data = await notificationsService.markAsRead(req.params.id);
    res.json({
      success: true,
      data,
      message: 'Notification marked as read'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Mark notification as read error:', error);
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await notificationsService.markAllAsRead();
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Mark all notifications as read error:', error);
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    await notificationsService.deleteNotification(req.params.id);
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Delete notification error:', error);
    next(error);
  }
};

export const clearAllNotifications = async (req, res, next) => {
  try {
    await notificationsService.clearAllNotifications();
    res.json({
      success: true,
      message: 'All notifications cleared'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Clear all notifications error:', error);
    next(error);
  }
};
