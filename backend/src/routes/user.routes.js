import express from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { moderateTextMiddleware } from '../middleware/moderateText.middleware.js';
import * as authController from '../controllers/user/auth.controller.js';
import * as otpController from '../controllers/user/otp.controller.js';
import * as articlesController from '../controllers/user/articles.controller.js';
import * as doctorsController from '../controllers/user/doctors.controller.js';
import * as bookingsController from '../controllers/user/bookings.controller.js';
import * as messagesController from '../controllers/user/messages.controller.js';
import * as notificationsController from '../controllers/user/notifications.controller.js';
import * as settingsController from '../controllers/user/settings.controller.js';
import * as childrenController from '../controllers/user/children.controller.js';
import * as packagesController from '../controllers/user/packages.controller.js';
import * as productsController from '../controllers/user/products.controller.js';
import * as cartController from '../controllers/user/cart.controller.js';
import * as ordersController from '../controllers/user/orders.controller.js';
import * as assessmentController from '../controllers/user/assessment.controller.js';
import * as maharaActivitiesController from '../controllers/user/mahara-activities.controller.js';

const router = express.Router();

// ============================================
// Authentication Routes
// ============================================

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/verify-email', authController.verifyEmail);
router.get('/auth/me', authenticateUser, authController.getMe);

// ============================================
// OTP Authentication Routes (Mobile App)
// ============================================

router.post('/auth/send-otp', otpController.sendOTP);
router.post('/auth/verify-otp', otpController.verifyOTP);
router.post('/auth/resend-otp', otpController.resendOTP);

// Legacy routes (for backward compatibility)
router.post('/auth/otp/send', otpController.sendOTP);
router.post('/auth/otp/verify', otpController.verifyOTP);
router.post('/auth/otp/resend', otpController.resendOTP);

// ============================================
// Articles Routes (Doctor Articles)
// ============================================

router.get('/articles', authenticateUser, articlesController.getAllArticles);
router.get('/articles/:id', authenticateUser, articlesController.getArticleById);

// ============================================
// Doctors Routes
// ============================================

router.get('/doctors', authenticateUser, doctorsController.getAllDoctors);
router.get('/doctors/:id/available-slots', authenticateUser, doctorsController.getDoctorAvailableSlots);
router.get('/doctors/:id', authenticateUser, doctorsController.getDoctorById);

// ============================================
// Child Profiles Routes
// ============================================

router.get('/children', authenticateUser, childrenController.getUserChildren);
router.post('/children', authenticateUser, childrenController.createChild);
router.post('/children/survey', authenticateUser, childrenController.submitChildSurvey);
router.get('/children/:id', authenticateUser, childrenController.getChildById);
router.put('/children/:id', authenticateUser, childrenController.updateChild);
router.delete('/children/:id', authenticateUser, childrenController.deleteChild);

// ============================================
// Bookings Routes
// ============================================

router.get('/bookings', authenticateUser, bookingsController.getUserBookings);
router.post('/bookings', authenticateUser, bookingsController.createBooking);
router.get('/bookings/:id', authenticateUser, bookingsController.getBookingById);
router.put('/bookings/:id/cancel', authenticateUser, bookingsController.cancelBooking);
router.put('/bookings/:id/reschedule', authenticateUser, bookingsController.rescheduleBooking);

// ============================================
// Messages Routes
// ============================================

router.get('/messages', authenticateUser, messagesController.getUserMessages);
router.get('/messages/conversation/:userId', authenticateUser, messagesController.getConversation);
router.post('/messages', authenticateUser, moderateTextMiddleware, messagesController.sendMessage);

// ============================================
// Notifications Routes
// ============================================

router.get('/notifications', authenticateUser, notificationsController.getUserNotifications);
router.put('/notifications/:id/read', authenticateUser, notificationsController.markAsRead);
router.put('/notifications/read-all', authenticateUser, notificationsController.markAllAsRead);

// ============================================
// Packages Routes
// ============================================

router.get('/packages', packagesController.getPackages);
router.get('/packages/active', authenticateUser, packagesController.getActivePackage);
router.get('/packages/my-packages', authenticateUser, packagesController.getUserPackages);
router.get('/packages/:id', packagesController.getPackageById);
router.post('/packages/purchase', authenticateUser, packagesController.purchasePackage);

// ============================================
// Products & Store Routes
// ============================================

router.get('/products', productsController.getProducts);
router.get('/products/:id', productsController.getProductById);
router.post('/products/:id/reviews', authenticateUser, productsController.addProductReview);

// ============================================
// Cart Routes
// ============================================

router.get('/cart', authenticateUser, cartController.getCart);
router.post('/cart', authenticateUser, cartController.addToCart);
router.put('/cart/:id', authenticateUser, cartController.updateCartItem);
router.delete('/cart/:id', authenticateUser, cartController.removeFromCart);
router.delete('/cart', authenticateUser, cartController.clearCart);

// ============================================
// Orders Routes
// ============================================

router.get('/orders', authenticateUser, ordersController.getUserOrders);
router.get('/orders/:id', authenticateUser, ordersController.getOrderById);
router.post('/orders', authenticateUser, ordersController.createOrder);
router.put('/orders/:id/cancel', authenticateUser, ordersController.cancelOrder);

// ============================================
// Settings Routes
// ============================================

router.get('/settings', authenticateUser, settingsController.getUserSettings);
router.put('/settings', authenticateUser, settingsController.updateUserSettings);
router.put('/settings/password', authenticateUser, settingsController.changePassword);

// ============================================
// Assessment Routes
// ============================================

router.get('/assessments/tests', assessmentController.getTests);
router.get('/assessments/tests/:testId/questions', assessmentController.getTestQuestions);
router.post('/assessments/submit-result', authenticateUser, assessmentController.submitAssessmentResult);

// ============================================
// Mahara Kids Activity Routes
// ============================================

router.get('/mahara/activities/current', authenticateUser, maharaActivitiesController.getCurrentActivity);
router.post('/mahara/activities/submit', authenticateUser, maharaActivitiesController.submitActivityInteraction);

export default router;


