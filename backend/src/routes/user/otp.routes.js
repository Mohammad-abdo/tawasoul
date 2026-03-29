import express from 'express';
import * as otpController from '../../controllers/user/otp.controller.js';

const router = express.Router();

router.post('/send-otp', otpController.sendOTP);
router.post('/verify-otp', otpController.verifyOTP);
router.post('/resend-otp', otpController.resendOTP);

router.post('/otp/send', otpController.sendOTP);
router.post('/otp/verify', otpController.verifyOTP);
router.post('/otp/resend', otpController.resendOTP);

export default router;
