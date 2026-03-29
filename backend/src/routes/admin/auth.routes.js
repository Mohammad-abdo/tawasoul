import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import { authRateLimiter } from '../../middleware/rateLimiter.middleware.js';
import * as authController from '../../controllers/admin/auth.controller.js';

const router = express.Router();

router.post('/login', authRateLimiter, authController.login);
router.post('/logout', authenticateAdmin, authController.logout);
router.get('/me', authenticateAdmin, authController.getMe);

export default router;
