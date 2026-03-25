import { logger } from '../../utils/logger.js';
import * as otpService from '../../services/user/otp.service.js';

const handleServiceError = (error, res, next, context) => {
  if (error.status) {
    return res.status(error.status).json({
      success: false,
      error: { code: error.code, message: error.message }
    });
  }
  logger.error(`${context} error:`, error);
  next(error);
};

/**
 * Send OTP to phone number
 */
export const sendOTP = async (req, res, next) => {
  try {
    const data = await otpService.sendOTP(req.body);
    res.json({ success: true, data });
  } catch (error) {
    handleServiceError(error, res, next, 'Send OTP');
  }
};

/**
 * Verify OTP and authenticate user
 */
export const verifyOTP = async (req, res, next) => {
  try {
    const data = await otpService.verifyOTP(req.body);
    res.json({ success: true, data });
  } catch (error) {
    handleServiceError(error, res, next, 'Verify OTP');
  }
};

/**
 * Resend OTP
 */
export const resendOTP = async (req, res, next) => {
  try {
    const data = await otpService.resendOTP(req.body);
    res.json({ success: true, data });
  } catch (error) {
    handleServiceError(error, res, next, 'Resend OTP');
  }
};
