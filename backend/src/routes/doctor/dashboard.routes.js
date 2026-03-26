import express from 'express';
import { authenticateDoctor } from '../../middleware/auth.middleware.js';
import * as dashboardController from '../../controllers/doctor/dashboard.controller.js';

const router = express.Router();

router.get('/', authenticateDoctor, dashboardController.getDashboardStats);

export default router;
