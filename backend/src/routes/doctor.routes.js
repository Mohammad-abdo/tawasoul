import express from 'express';
import { authenticateDoctor } from '../middleware/auth.middleware.js';
import { moderateContentMiddleware } from '../middleware/contentModeration.middleware.js';
import * as authController from '../controllers/doctor/auth.controller.js';
import * as dashboardController from '../controllers/doctor/dashboard.controller.js';
import * as bookingsController from '../controllers/doctor/bookings.controller.js';
import * as availabilityController from '../controllers/doctor/availability.controller.js';
import * as articlesController from '../controllers/doctor/articles.controller.js';
import * as paymentsController from '../controllers/doctor/payments.controller.js';
import * as withdrawalsController from '../controllers/doctor/withdrawals.controller.js';
import * as childrenController from '../controllers/doctor/children.controller.js';
import * as assessmentController from '../controllers/user/assessment.controller.js';

const router = express.Router();

// ============================================
// Authentication Routes
// ============================================

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticateDoctor, authController.getMe);
router.put('/auth/profile', authenticateDoctor, authController.updateProfile);

// ============================================
// Dashboard Routes
// ============================================

router.get('/dashboard', authenticateDoctor, dashboardController.getDashboardStats);

// ============================================
// Bookings Routes
// ============================================

router.get('/bookings', authenticateDoctor, bookingsController.getDoctorBookings);
router.get('/bookings/:id', authenticateDoctor, bookingsController.getBookingById);
router.put('/bookings/:id/confirm', authenticateDoctor, bookingsController.confirmBooking);
router.put('/bookings/:id/cancel', authenticateDoctor, bookingsController.cancelBooking);
router.put('/bookings/:id/complete', authenticateDoctor, bookingsController.completeBooking);

// ============================================
// Availability Routes
// ============================================

router.get('/availability', authenticateDoctor, availabilityController.getAvailability);
router.put('/availability', authenticateDoctor, availabilityController.updateAvailability);

// ============================================
// Articles Routes
// ============================================

router.get('/articles', authenticateDoctor, articlesController.getDoctorArticles);
router.post('/articles', authenticateDoctor, moderateContentMiddleware, articlesController.createArticle);
router.put('/articles/:id', authenticateDoctor, moderateContentMiddleware, articlesController.updateArticle);
router.delete('/articles/:id', authenticateDoctor, articlesController.deleteArticle);

// ============================================
// Payments Routes
// ============================================

router.get('/payments', authenticateDoctor, paymentsController.getDoctorPayments);
router.get('/earnings', authenticateDoctor, paymentsController.getDoctorEarnings);

// ============================================
// Withdrawals Routes
// ============================================

router.get('/withdrawals', authenticateDoctor, withdrawalsController.getDoctorWithdrawals);
router.post('/withdrawals', authenticateDoctor, withdrawalsController.requestWithdrawal);

// ============================================
// Children & Assessment Routes
// ============================================

router.get('/children', authenticateDoctor, childrenController.getMyChildren);
router.get('/children/:childId', authenticateDoctor, childrenController.getChildDetails);

// Assessment Routes (Doctors can access tests)
router.get('/assessments/tests', authenticateDoctor, assessmentController.getTests);
router.get('/assessments/tests/:testId/questions', authenticateDoctor, assessmentController.getTestQuestions);
router.post('/assessments/submit-result', authenticateDoctor, assessmentController.submitAssessmentResult);

export default router;


