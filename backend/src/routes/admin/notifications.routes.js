import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import * as notificationsController from '../../controllers/admin/notifications.controller.js';

const router = express.Router();

router.get('/', authenticateAdmin, notificationsController.getAdminNotifications);
router.put('/read-all', authenticateAdmin, notificationsController.markAllAsRead);
router.put('/:id/read', authenticateAdmin, notificationsController.markAsRead);
router.delete('/clear-all', authenticateAdmin, notificationsController.clearAllNotifications);
router.delete('/:id', authenticateAdmin, notificationsController.deleteNotification);

export default router;
