import express from 'express';
import { authenticateUser } from '../../middleware/auth.middleware.js';
import { moderateTextMiddleware } from '../../middleware/moderateText.middleware.js';
import * as messagesController from '../../controllers/user/messages.controller.js';

const router = express.Router();

router.post('/send', authenticateUser, moderateTextMiddleware, messagesController.sendMessage);

router.get('/:messageId', authenticateUser, messagesController.getMessageById);

router.patch('/:messageId', authenticateUser, moderateTextMiddleware, messagesController.updateMessage);

router.delete('/:messageId', authenticateUser, messagesController.deleteMessage);

export default router;