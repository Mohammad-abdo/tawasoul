import express from 'express';
import { authenticateDoctor } from '../../middleware/auth.middleware.js';
import * as authController from '../../controllers/doctor/auth.controller.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateDoctor, authController.getMe);
router.put('/profile', authenticateDoctor, authController.updateProfile);

export default router;
