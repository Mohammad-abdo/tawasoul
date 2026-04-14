import { logger } from '../../utils/logger.js';
import * as authService from '../../services/user/auth.service.js';

/**
 * User Registration
 */
export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    logger.info(`User registered: ${result.user.username}`);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        error: { code: error.code, message: error.message }
      });
    }
    logger.error('User registration error:', error);
    next(error);
  }
};

/**
 * User Login
 */
export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    logger.info(`User logged in: ${result.user.username}`);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        error: { code: error.code, message: error.message }
      });
    }
    logger.error('User login error:', error);
    next(error);
  }
};

/**
 * Verify Email
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Verification token is required' }
      });
    }

    // TODO: Implement email verification logic
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    logger.error('Email verification error:', error);
    next(error);
  }
};

/**
 * Get Current User
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({ success: true, data: user });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        error: { code: error.code, message: error.message }
      });
    }
    logger.error('Get user error:', error);
    next(error);
  }
};
