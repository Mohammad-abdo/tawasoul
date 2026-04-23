import express from 'express';
import { authenticateUser } from '../../middleware/auth.middleware.js';
import * as conversationsController from '../../controllers/user/conversations.controller.js';

const router = express.Router();

router.get('', authenticateUser, conversationsController.getUserConversations);

router.post('', authenticateUser, conversationsController.createConversation);

router.get('/:conversationId', authenticateUser, conversationsController.getConversationMessages);

router.get('/:conversationId/details', authenticateUser, conversationsController.getConversationById);

router.delete('/:conversationId', authenticateUser, conversationsController.deleteConversation);

export default router;