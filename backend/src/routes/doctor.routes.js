import express from 'express';
import authRoutes from './doctor/auth.routes.js';
import dashboardRoutes from './doctor/dashboard.routes.js';
import bookingsRoutes from './doctor/bookings.routes.js';
import availabilityRoutes from './doctor/availability.routes.js';
import articlesRoutes from './doctor/articles.routes.js';
import paymentsRoutes from './doctor/payments.routes.js';
import withdrawalsRoutes from './doctor/withdrawals.routes.js';
import childrenRoutes from './doctor/children.routes.js';
import assessmentRoutes from './doctor/assessment.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/availability', availabilityRoutes);
router.use('/articles', articlesRoutes);
router.use('/', paymentsRoutes);
router.use('/withdrawals', withdrawalsRoutes);
router.use('/children', childrenRoutes);
router.use('/assessments', assessmentRoutes);

export default router;
