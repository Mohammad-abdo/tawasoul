import express from 'express';
import { authenticateUser } from '../../middleware/auth.middleware.js';
import { moderateTextMiddleware } from '../../middleware/moderateText.middleware.js';
import * as messagesController from '../../controllers/user/messages.controller.js';

const router = express.Router();

// جلب قائمة المحادثات (الصندوق الوارد)
router.get('/conversations', authenticateUser, messagesController.getUserConversations);

// جلب رسائل محادثة معينة مع دكتور
router.get('/conversations/:conversationId', authenticateUser, messagesController.getConversationMessages);

// إرسال رسالة
router.post('/send', authenticateUser, moderateTextMiddleware, messagesController.sendMessage);

export default router;