import express from 'express';
import authRoutes from './user/auth.routes.js';
import otpRoutes from './user/otp.routes.js';
import articlesRoutes from './user/articles.routes.js';
import doctorsRoutes from './user/doctors.routes.js';
import childrenRoutes from './user/children.routes.js';
import bookingsRoutes from './user/bookings.routes.js';
import messagesRoutes from './user/messages.routes.js';
import notificationsRoutes from './user/notifications.routes.js';
import packagesRoutes from './user/packages.routes.js';
import productsRoutes from './user/products.routes.js';
import cartRoutes from './user/cart.routes.js';
import ordersRoutes from './user/orders.routes.js';
import settingsRoutes from './user/settings.routes.js';
import assessmentRoutes from './user/assessment.routes.js';
import maharaActivitiesRoutes from './user/mahara-activities.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/auth', otpRoutes);
router.use('/articles', articlesRoutes);
router.use('/doctors', doctorsRoutes);
router.use('/children', childrenRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/messages', messagesRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/packages', packagesRoutes);
router.use('/products', productsRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', ordersRoutes);
router.use('/settings', settingsRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/mahara/activities', maharaActivitiesRoutes);

export default router;
