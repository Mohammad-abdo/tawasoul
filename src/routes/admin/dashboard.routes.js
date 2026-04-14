import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import * as dashboardController from '../../controllers/admin/dashboard.controller.js';

const router = express.Router();

router.get('/', authenticateAdmin, dashboardController.getDashboardStats);
router.get('/analytics', authenticateAdmin, dashboardController.getDashboardAnalytics);

export default router;
