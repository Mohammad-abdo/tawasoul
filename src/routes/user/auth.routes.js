import express from 'express';
import { authenticateUser } from '../../middleware/auth.middleware.js';
import * as authController from '../../controllers/user/auth.controller.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify-email', authController.verifyEmail);
router.post('/verify-email', authController.verifyEmail);
router.post('/request-email-verification', authenticateUser, authController.requestEmailVerification);
router.get('/me', authenticateUser, authController.getMe);
router.post('/logout', authenticateUser, authController.logout);

export default router;
