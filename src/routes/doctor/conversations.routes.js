import express from 'express';
import { authenticateDoctor } from '../../middleware/auth.middleware.js';
import * as conversationsController from '../../controllers/doctor/conversations.controller.js';

const router = express.Router();

router.use(authenticateDoctor);

router.get('/conversations', conversationsController.getDoctorConversations);

router.get('/conversation/:userId', conversationsController.getConversationMessages);

export default router;