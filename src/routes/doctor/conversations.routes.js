import express from 'express';
import { authenticateDoctor } from '../../middleware/auth.middleware.js';
import * as conversationsController from '../../controllers/doctor/conversations.controller.js';

const router = express.Router();

router.use(authenticateDoctor);

router.get('', conversationsController.getDoctorConversations);

router.post('', conversationsController.createConversation);

router.get('/:conversationId', conversationsController.getConversationMessages);

router.get('/:conversationId/details', conversationsController.getConversationById);

router.delete('/:conversationId', conversationsController.deleteConversation);

export default router;
