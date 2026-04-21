import express from 'express';
import * as authController from '../controllers/user/auth.controller.js';

const router = express.Router();

router.get('/verify-email', authController.verifyEmail);

export default router;
