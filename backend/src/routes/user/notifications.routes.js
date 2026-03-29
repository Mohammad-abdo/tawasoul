import express from 'express';
import { authenticateUser } from '../../middleware/auth.middleware.js';
import * as notificationsController from '../../controllers/user/notifications.controller.js';

const router = express.Router();

router.get('/', authenticateUser, notificationsController.getUserNotifications);
router.put('/:id/read', authenticateUser, notificationsController.markAsRead);
router.put('/read-all', authenticateUser, notificationsController.markAllAsRead);

export default router;
