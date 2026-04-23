import express from 'express';
import { authenticateUser } from '../../middleware/auth.middleware.js';
import * as conversationsController from '../../controllers/user/conversations.controller.js';

const router = express.Router();

router.get('/conversations', authenticateUser, conversationsController.getUserConversations);

router.get('/conversations/:conversationId', authenticateUser, conversationsController.getConversationMessages);

export default router;