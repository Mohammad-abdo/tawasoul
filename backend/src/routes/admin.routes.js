import express from 'express';
import { authenticateAdmin, requireRole } from '../middleware/auth.middleware.js';
import { authRateLimiter, reportRateLimiter } from '../middleware/rateLimiter.middleware.js';

// Import Controllers
import * as authController from '../controllers/admin/auth.controller.js';
import * as dashboardController from '../controllers/admin/dashboard.controller.js';
import * as usersController from '../controllers/admin/users.controller.js';
import * as doctorsController from '../controllers/admin/doctors.controller.js';
import * as bookingsController from '../controllers/admin/bookings.controller.js';
import * as supportController from '../controllers/admin/support.controller.js';
import * as childrenController from '../controllers/admin/children.controller.js';
import * as packagesController from '../controllers/admin/packages.controller.js';
import * as productsController from '../controllers/admin/products.controller.js';
import * as ordersController from '../controllers/admin/orders.controller.js';
import * as couponsController from '../controllers/admin/coupons.controller.js';
import * as activityLogsController from '../controllers/admin/activity-logs.controller.js';
import * as paymentsController from '../controllers/admin/payments.controller.js';
import * as withdrawalsController from '../controllers/admin/withdrawals.controller.js';
import * as reportsController from '../controllers/admin/reports.controller.js';
import * as pageContentController from '../controllers/admin/page-content.controller.js';
import * as adminsController from '../controllers/admin/admins.controller.js';
import * as bulkController from '../controllers/admin/bulk.controller.js';
import * as settingsController from '../controllers/admin/settings.controller.js';
import * as onboardingController from '../controllers/admin/onboarding.controller.js';
import * as notificationsController from '../controllers/admin/notifications.controller.js';
import * as homeSlidersController from '../controllers/admin/home-sliders.controller.js';
import * as homeServicesController from '../controllers/admin/home-services.controller.js';
import * as homeArticlesController from '../controllers/admin/home-articles.controller.js';
import * as faqController from '../controllers/admin/faq.controller.js';
import * as assessmentsController from '../controllers/admin/assessments.controller.js';
import * as maharaCategoriesController from '../controllers/admin/mahara-categories.controller.js';
import * as maharaSkillGroupsController from '../controllers/admin/mahara-skill-groups.controller.js';
import * as maharaActivitiesController from '../controllers/admin/mahara-activities.controller.js';
import { uploadSingleImage, uploadAssessmentFiles, uploadActivityAssets } from '../middleware/upload.middleware.js';

const router = express.Router();

// ============================================
// Authentication Routes
// ============================================

router.post('/auth/login', authRateLimiter, authController.login);
router.post('/auth/logout', authenticateAdmin, authController.logout);
router.get('/auth/me', authenticateAdmin, authController.getMe);

// ============================================
// Dashboard Routes
// ============================================

router.get('/dashboard', authenticateAdmin, dashboardController.getDashboardStats);
router.get('/dashboard/analytics', authenticateAdmin, dashboardController.getDashboardAnalytics);

// ============================================
// User Management Routes
// ============================================

router.get('/users', authenticateAdmin, usersController.getAllUsers);
router.get('/users/:id', authenticateAdmin, usersController.getUserById);
router.post('/users', authenticateAdmin, usersController.createUser);
router.put('/users/:id', authenticateAdmin, usersController.updateUser);
router.put('/users/:id/approve', authenticateAdmin, usersController.approveUser);
router.put('/users/:id/reject', authenticateAdmin, usersController.rejectUser);
router.put('/users/:id/activate', authenticateAdmin, usersController.activateUser);
router.put('/users/:id/deactivate', authenticateAdmin, usersController.deactivateUser);
router.delete('/users/:id', authenticateAdmin, usersController.deleteUser);

// ============================================
// Doctor Management Routes
// ============================================

router.get('/doctors', authenticateAdmin, doctorsController.getAllDoctors);
router.get('/doctors/:id', authenticateAdmin, doctorsController.getDoctorById);
router.post('/doctors', authenticateAdmin, doctorsController.createDoctor);
router.put('/doctors/:id', authenticateAdmin, doctorsController.updateDoctor);
router.put('/doctors/:id/approve', authenticateAdmin, doctorsController.approveDoctor);
router.put('/doctors/:id/reject', authenticateAdmin, doctorsController.rejectDoctor);
router.put('/doctors/:id/verify', authenticateAdmin, doctorsController.verifyDoctor);
router.put('/doctors/:id/unverify', authenticateAdmin, doctorsController.unverifyDoctor);
router.put('/doctors/:id/activate', authenticateAdmin, doctorsController.activateDoctor);
router.put('/doctors/:id/deactivate', authenticateAdmin, doctorsController.deactivateDoctor);
router.delete('/doctors/:id', authenticateAdmin, doctorsController.deleteDoctor);

// ============================================
// Children Management Routes
// ============================================

router.get('/children', authenticateAdmin, childrenController.getAllChildren);
router.get('/children/:id', authenticateAdmin, childrenController.getChildById);
router.delete('/children/:id', authenticateAdmin, childrenController.deleteChild);

// ============================================
// Bookings Routes
// ============================================

router.get('/bookings', authenticateAdmin, bookingsController.getAllBookings);
router.get('/bookings/:id', authenticateAdmin, bookingsController.getBookingById);
router.put('/bookings/:id/status', authenticateAdmin, bookingsController.updateBookingStatus);
router.put('/bookings/:id/cancel', authenticateAdmin, bookingsController.cancelBooking);

// ============================================
// Support Tickets Routes
// ============================================

router.get('/support/tickets', authenticateAdmin, supportController.getAllTickets);
router.get('/support/tickets/:id', authenticateAdmin, supportController.getTicketById);
router.post('/support/tickets/:id/replies', authenticateAdmin, supportController.addReply);
router.put('/support/tickets/:id/status', authenticateAdmin, supportController.updateTicketStatus);
router.put('/support/tickets/:id/assign', authenticateAdmin, supportController.assignTicket);

// ============================================
// Packages Management Routes
// ============================================

router.get('/packages', authenticateAdmin, packagesController.getAllPackages);
router.get('/packages/:id', authenticateAdmin, packagesController.getPackageById);
router.post('/packages', authenticateAdmin, packagesController.createPackage);
router.put('/packages/:id', authenticateAdmin, packagesController.updatePackage);
router.delete('/packages/:id', authenticateAdmin, packagesController.deletePackage);
router.put('/packages/:id/activate', authenticateAdmin, packagesController.activatePackage);
router.put('/packages/:id/deactivate', authenticateAdmin, packagesController.deactivatePackage);

// ============================================
// Products Management Routes
// ============================================

router.get('/products', authenticateAdmin, productsController.getAllProducts);
router.get('/products/:id', authenticateAdmin, productsController.getProductById);
router.post('/products', authenticateAdmin, productsController.createProduct);
router.put('/products/:id', authenticateAdmin, productsController.updateProduct);
router.delete('/products/:id', authenticateAdmin, productsController.deleteProduct);
router.put('/products/:id/activate', authenticateAdmin, productsController.activateProduct);
router.put('/products/:id/deactivate', authenticateAdmin, productsController.deactivateProduct);

// ============================================
// Orders Management Routes
// ============================================

router.get('/orders', authenticateAdmin, ordersController.getAllOrders);
router.get('/orders/:id', authenticateAdmin, ordersController.getOrderById);
router.put('/orders/:id/status', authenticateAdmin, ordersController.updateOrderStatus);
router.put('/orders/:id/cancel', authenticateAdmin, ordersController.cancelOrder);

// ============================================
// Coupons Routes
// ============================================

router.get('/coupons', authenticateAdmin, couponsController.getAllCoupons);
router.get('/coupons/:id', authenticateAdmin, couponsController.getCouponById);
router.get('/coupons/:id/usage', authenticateAdmin, couponsController.getCouponUsage);
router.post('/coupons', authenticateAdmin, couponsController.createCoupon);
router.put('/coupons/:id', authenticateAdmin, couponsController.updateCoupon);
router.delete('/coupons/:id', authenticateAdmin, couponsController.deleteCoupon);
router.put('/coupons/:id/activate', authenticateAdmin, couponsController.activateCoupon);
router.put('/coupons/:id/deactivate', authenticateAdmin, couponsController.deactivateCoupon);

// ============================================
// Activity Logs Routes
// ============================================

router.get('/activity-logs', authenticateAdmin, activityLogsController.getAllActivityLogs);
router.get('/activity-logs/:id', authenticateAdmin, activityLogsController.getActivityLogById);
router.get('/activity-logs/stats', authenticateAdmin, activityLogsController.getActivityStats);
router.get('/activity-logs/export', authenticateAdmin, activityLogsController.exportActivityLogs);

// ============================================
// Payments & Withdrawals Routes
// ============================================

router.get('/payments', authenticateAdmin, paymentsController.getAllPayments);
router.put('/payments/:id/status', authenticateAdmin, paymentsController.updatePaymentStatus);

router.get('/withdrawals', authenticateAdmin, withdrawalsController.getAllWithdrawals);
router.get('/withdrawals/:id', authenticateAdmin, withdrawalsController.getWithdrawalById);
router.put('/withdrawals/:id/approve', authenticateAdmin, withdrawalsController.approveWithdrawal);
router.put('/withdrawals/:id/reject', authenticateAdmin, withdrawalsController.rejectWithdrawal);

// ============================================
// Reports Routes
// ============================================

router.get('/reports', authenticateAdmin, reportsController.getAllReports);
router.get('/reports/:id', authenticateAdmin, reportsController.getReportById);
router.get('/reports/:id/status', authenticateAdmin, reportsController.getReportStatus);
router.post('/reports/generate', authenticateAdmin, reportRateLimiter, reportsController.generateReport);
router.get('/reports/:id/download', authenticateAdmin, reportsController.downloadReport);
router.delete('/reports/:id', authenticateAdmin, reportsController.deleteReport);

// ============================================
// Page Content Routes
// ============================================

router.get('/pages', authenticateAdmin, pageContentController.getAllPages);
router.get('/pages/:pageType', authenticateAdmin, pageContentController.getPageByType);
router.put('/pages/:pageType', authenticateAdmin, pageContentController.updatePageContent);
router.post('/pages/initialize', authenticateAdmin, pageContentController.initializePages);

// ============================================
// Settings Routes
// ============================================

router.get('/settings', authenticateAdmin, settingsController.getSettings);
router.put('/settings', authenticateAdmin, settingsController.updateSettings);

// ============================================
// Onboarding Routes
// ============================================

router.get('/onboarding', authenticateAdmin, onboardingController.getAllOnboarding);
router.get('/onboarding/:id', authenticateAdmin, onboardingController.getOnboardingById);
router.post('/onboarding', authenticateAdmin, uploadSingleImage('image'), onboardingController.createOnboarding);
router.put('/onboarding/:id', authenticateAdmin, uploadSingleImage('image'), onboardingController.updateOnboarding);
router.delete('/onboarding/:id', authenticateAdmin, onboardingController.deleteOnboarding);
router.post('/onboarding/reorder', authenticateAdmin, onboardingController.reorderOnboarding);

// ============================================
// Home Sliders Routes
// ============================================

router.get('/home-sliders', authenticateAdmin, homeSlidersController.getAllHomeSliders);
router.get('/home-sliders/:id', authenticateAdmin, homeSlidersController.getHomeSliderById);
router.post('/home-sliders', authenticateAdmin, uploadSingleImage('image'), homeSlidersController.createHomeSlider);
router.put('/home-sliders/:id', authenticateAdmin, uploadSingleImage('image'), homeSlidersController.updateHomeSlider);
router.delete('/home-sliders/:id', authenticateAdmin, homeSlidersController.deleteHomeSlider);
router.post('/home-sliders/reorder', authenticateAdmin, homeSlidersController.reorderHomeSliders);

// ============================================
// Home Services Routes
// ============================================

router.get('/home-services', authenticateAdmin, homeServicesController.getAllHomeServices);
router.get('/home-services/:id', authenticateAdmin, homeServicesController.getHomeServiceById);
router.post('/home-services', authenticateAdmin, uploadSingleImage('image'), homeServicesController.createHomeService);
router.put('/home-services/:id', authenticateAdmin, uploadSingleImage('image'), homeServicesController.updateHomeService);
router.delete('/home-services/:id', authenticateAdmin, homeServicesController.deleteHomeService);

// ============================================
// Home Articles Routes
// ============================================

router.get('/home-articles', authenticateAdmin, homeArticlesController.getAllHomeArticles);
router.get('/home-articles/:id', authenticateAdmin, homeArticlesController.getHomeArticleById);
router.post('/home-articles', authenticateAdmin, uploadSingleImage('image'), homeArticlesController.createHomeArticle);
router.put('/home-articles/:id', authenticateAdmin, uploadSingleImage('image'), homeArticlesController.updateHomeArticle);
router.delete('/home-articles/:id', authenticateAdmin, homeArticlesController.deleteHomeArticle);

// ============================================
// FAQ Routes
// ============================================

router.get('/faqs', authenticateAdmin, faqController.getAllFAQs);
router.get('/faqs/:id', authenticateAdmin, faqController.getFAQById);
router.post('/faqs', authenticateAdmin, faqController.createFAQ);
router.put('/faqs/:id', authenticateAdmin, faqController.updateFAQ);
router.delete('/faqs/:id', authenticateAdmin, faqController.deleteFAQ);

// ============================================
// Notifications Routes
// ============================================

router.get('/notifications', authenticateAdmin, notificationsController.getAdminNotifications);
router.put('/notifications/read-all', authenticateAdmin, notificationsController.markAllAsRead);
router.put('/notifications/:id/read', authenticateAdmin, notificationsController.markAsRead);
router.delete('/notifications/clear-all', authenticateAdmin, notificationsController.clearAllNotifications);
router.delete('/notifications/:id', authenticateAdmin, notificationsController.deleteNotification);


// ============================================
// Bulk Operations Routes
// ============================================

router.post('/bulk/users/approve', authenticateAdmin, bulkController.bulkApproveUsers);
router.post('/bulk/users/reject', authenticateAdmin, bulkController.bulkRejectUsers);
router.post('/bulk/users/activate', authenticateAdmin, bulkController.bulkApproveUsers); // Reuse
router.post('/bulk/users/deactivate', authenticateAdmin, bulkController.bulkRejectUsers); // Reuse
router.post('/bulk/doctors/approve', authenticateAdmin, bulkController.bulkApproveDoctors);
router.post('/bulk/doctors/reject', authenticateAdmin, bulkController.bulkRejectDoctors);
router.post('/bulk/bookings/cancel', authenticateAdmin, bulkController.bulkCancelBookings);
router.post('/bulk/orders/update-status', authenticateAdmin, bulkController.bulkUpdateOrderStatus);

// ============================================
// Admin Management Routes (SUPER_ADMIN only)
// ============================================

router.get('/admins', authenticateAdmin, requireRole('SUPER_ADMIN'), adminsController.getAllAdmins);
router.get('/admins/:id', authenticateAdmin, requireRole('SUPER_ADMIN'), adminsController.getAdminById);
router.post('/admins', authenticateAdmin, requireRole('SUPER_ADMIN'), adminsController.createAdmin);
router.put('/admins/:id', authenticateAdmin, requireRole('SUPER_ADMIN'), adminsController.updateAdmin);
router.put('/admins/:id/password', authenticateAdmin, requireRole('SUPER_ADMIN'), adminsController.changeAdminPassword);
router.put('/admins/:id/activate', authenticateAdmin, requireRole('SUPER_ADMIN'), adminsController.activateAdmin);
router.put('/admins/:id/deactivate', authenticateAdmin, requireRole('SUPER_ADMIN'), adminsController.deactivateAdmin);
router.delete('/admins/:id', authenticateAdmin, requireRole('SUPER_ADMIN'), adminsController.deleteAdmin);

// ============================================
// Assessments Management Routes
// ============================================

// Categories for Assessments/Scales
import * as assessmentCategoriesController from '../controllers/admin/assessment-categories.controller.js';

router.get('/assessments/categories', authenticateAdmin, assessmentCategoriesController.getAllCategories);
router.get('/assessments/categories/:id', authenticateAdmin, assessmentCategoriesController.getCategoryById);
router.post('/assessments/categories', authenticateAdmin, assessmentCategoriesController.createCategory);
router.put('/assessments/categories/:id', authenticateAdmin, assessmentCategoriesController.updateCategory);
router.delete('/assessments/categories/:id', authenticateAdmin, assessmentCategoriesController.deleteCategory);

// Tests Routes
router.get('/assessments/tests', authenticateAdmin, assessmentsController.getAllTests);
router.get('/assessments/tests/:id', authenticateAdmin, assessmentsController.getTestById);
router.post('/assessments/tests', authenticateAdmin, assessmentsController.createTest);
router.put('/assessments/tests/:id', authenticateAdmin, assessmentsController.updateTest);
router.delete('/assessments/tests/:id', authenticateAdmin, assessmentsController.deleteTest);

// Questions Routes
router.get('/assessments/tests/:testId/questions', authenticateAdmin, assessmentsController.getTestQuestions);
router.get('/assessments/questions/:id', authenticateAdmin, assessmentsController.getQuestionById);
router.post('/assessments/tests/:testId/questions', authenticateAdmin, uploadAssessmentFiles(), assessmentsController.createQuestion);
router.put('/assessments/questions/:id', authenticateAdmin, uploadAssessmentFiles(), assessmentsController.updateQuestion);
router.delete('/assessments/questions/:id', authenticateAdmin, assessmentsController.deleteQuestion);

// ============================================
// Mahara Kids Activities Management Routes
// ============================================

// Categories
router.get('/mahara/categories', authenticateAdmin, maharaCategoriesController.getAllActivityCategories);
router.get('/mahara/categories/:id', authenticateAdmin, maharaCategoriesController.getActivityCategoryById);
router.post('/mahara/categories', authenticateAdmin, maharaCategoriesController.createActivityCategory);
router.put('/mahara/categories/:id', authenticateAdmin, maharaCategoriesController.updateActivityCategory);
router.delete('/mahara/categories/:id', authenticateAdmin, maharaCategoriesController.deleteActivityCategory);

// Skill Groups
router.get('/mahara/skill-groups', authenticateAdmin, maharaSkillGroupsController.getAllSkillGroups);
router.get('/mahara/skill-groups/:id', authenticateAdmin, maharaSkillGroupsController.getSkillGroupById);
router.post('/mahara/skill-groups', authenticateAdmin, maharaSkillGroupsController.createSkillGroup);
router.put('/mahara/skill-groups/:id', authenticateAdmin, maharaSkillGroupsController.updateSkillGroup);
router.delete('/mahara/skill-groups/:id', authenticateAdmin, maharaSkillGroupsController.deleteSkillGroup);

// Activities
router.get('/mahara/activities', authenticateAdmin, maharaActivitiesController.getAllActivities);
router.get('/mahara/activities/:id', authenticateAdmin, maharaActivitiesController.getActivityById);
router.post('/mahara/activities', authenticateAdmin, uploadActivityAssets(), maharaActivitiesController.createActivity);
router.put('/mahara/activities/:id', authenticateAdmin, uploadActivityAssets(), maharaActivitiesController.updateActivity);
router.delete('/mahara/activities/:id', authenticateAdmin, maharaActivitiesController.deleteActivity);

export default router;

