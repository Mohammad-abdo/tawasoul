import * as notificationsRepo from '../../repositories/admin/notifications.repository.js';

export const getAdminNotifications = async ({ page = 1, limit = 20, unreadOnly = false, type }) => {
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  const skip = (parsedPage - 1) * parsedLimit;
  const where = {};

  if (unreadOnly === 'true') {
    where.isRead = false;
  }
  if (type) {
    where.type = type;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    notificationsRepo.findMany({ where, skip, take: parsedLimit }),
    notificationsRepo.count(where),
    notificationsRepo.count({ ...where, isRead: false })
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      pages: Math.ceil(total / parsedLimit)
    }
  };
};

export const markAsRead = (id) => notificationsRepo.markAsRead(id);
export const markAllAsRead = () => notificationsRepo.markAllAsRead();
export const deleteNotification = (id) => notificationsRepo.deleteNotification(id);
export const clearAllNotifications = () => notificationsRepo.clearAll();
