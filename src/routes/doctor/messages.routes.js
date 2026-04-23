import express from 'express';
import { authenticateDoctor } from '../../middleware/auth.middleware.js';
import { moderateTextMiddleware } from '../../middleware/moderateText.middleware.js';
import * as messagesController from '../../controllers/doctor/messages.controller.js';

const router = express.Router();

router.use(authenticateDoctor);

router.post('/send', moderateTextMiddleware, messagesController.sendMessageToUser);

router.get('/:messageId', messagesController.getMessageById);

router.patch('/:messageId', moderateTextMiddleware, messagesController.updateMessage);

router.delete('/:messageId', messagesController.deleteMessage);

export default router;