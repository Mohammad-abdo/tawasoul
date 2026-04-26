import express from 'express';
import authRoutes from './doctor/auth.routes.js';
import dashboardRoutes from './doctor/dashboard.routes.js';
import bookingsRoutes from './doctor/bookings.routes.js';
import availabilityRoutes from './doctor/availability.routes.js';
import articlesRoutes from './doctor/articles.routes.js';
import paymentsRoutes from './doctor/payments.routes.js';
import walletRoutes from './doctor/wallet.routes.js';
import withdrawalsRoutes from './doctor/withdrawals.routes.js';
import childrenRoutes from './doctor/children.routes.js';
import assessmentRoutes from './doctor/assessment.routes.js';
import conversationsRoutes from './doctor/conversations.routes.js';
import messagesRoutes from './doctor/messages.routes.js';
import addressRoutes from './doctor/address.routes.js';
import { moderateTextMiddleware } from '../middleware/moderateText.middleware.js';
import * as messagesController from '../controllers/doctor/messages.controller.js';
import { authenticateDoctor } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/availability', availabilityRoutes);
router.use('/articles', articlesRoutes);
router.use('/', paymentsRoutes);
router.use('/wallet', walletRoutes);
router.use('/withdrawals', withdrawalsRoutes);
router.use('/children', childrenRoutes);
router.use('/assessments', assessmentRoutes);
// router.use('/conversation', conversationsRoutes);
router.use('/conversations', conversationsRoutes);
router.use('/messages', messagesRoutes);
router.post('/send', authenticateDoctor, moderateTextMiddleware, messagesController.sendMessageToUser);
router.use('/address', addressRoutes);

export default router;
