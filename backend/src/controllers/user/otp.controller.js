import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { mapRelationType } from '../../utils/relationTypeMapper.js';

/**
 * Generate OTP
 * For testing: Returns fixed "12345"
 * For production: Will use SMS service (Twilio, AWS SNS, etc.)
 */
const generateOTP = () => {
  // TEST MODE: Use fixed OTP for development/testing
  // TODO: In production, remove this and implement proper SMS service
  const TEST_MODE = process.env.OTP_TEST_MODE !== 'false'; // Default to test mode
  const TEST_OTP = process.env.TEST_OTP || '12345'; // Default test OTP
  
  if (TEST_MODE || process.env.NODE_ENV !== 'production') {
    logger.info(`🧪 TEST MODE: Using fixed OTP: ${TEST_OTP}`);
    return TEST_OTP;
  }
  
  // Production: Generate random OTP (will be sent via SMS)
  return Math.floor(10000 + Math.random() * 90000).toString();
};

/**
 * Send OTP to phone number
 */
export const sendOTP = async (req, res, next) => {
  try {
    const { phone, fullName, relationType, agreedToTerms } = req.body;

    // Validation
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Phone number is required'
        }
      });
    }

    // Check if user agreed to terms (for new registrations)
    if (agreedToTerms === false || agreedToTerms === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'You must agree to the terms and conditions'
        }
      });
    }

    // Validate phone format (basic validation)
    // Accept digits only (mobile app sends digits without +)
    const cleanedPhone = phone.replace(/\s/g, '').replace(/^\+/, '');
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PHONE',
          message: 'Invalid phone number format'
        }
      });
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

    // Normalize phone for database lookup (store without +)
    const normalizedPhone = cleanedPhone;
    
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { phone: normalizedPhone }
    });

    if (user) {
      // User exists - login flow
      // Invalidate previous OTPs for this phone
      await prisma.otpCode.updateMany({
        where: {
          phone: normalizedPhone,
          isUsed: false
        },
        data: {
          isUsed: true
        }
      });

      // Create new OTP
      await prisma.otpCode.create({
        data: {
          userId: user.id,
          phone: normalizedPhone,
          code: otpCode,
          expiresAt
        }
      });
    } else {
      // New user - registration flow
      if (!fullName) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Full name is required for new users'
          }
        });
      }

      // Map Arabic relation type to enum
      const mappedRelationType = relationType ? mapRelationType(relationType) : null;

      // Create user (not verified yet)
      user = await prisma.user.create({
        data: {
          fullName,
          phone: normalizedPhone,
          relationType: mappedRelationType,
          isPhoneVerified: false,
          isActive: true,
          isApproved: true
        }
      });

      // Create OTP
      await prisma.otpCode.create({
        data: {
          userId: user.id,
          phone: normalizedPhone,
          code: otpCode,
          expiresAt
        }
      });
    }

    // TODO: Send OTP via SMS service (Twilio, AWS SNS, etc.)
    // In TEST MODE: OTP is logged and returned in response
    // In PRODUCTION: OTP will be sent via SMS, not returned in response
    const isTestMode = process.env.OTP_TEST_MODE !== 'false' || process.env.NODE_ENV !== 'production';
    
    if (isTestMode) {
      logger.info(`🧪 TEST MODE - OTP for ${normalizedPhone}: ${otpCode}`);
      logger.info(`📱 Use OTP: ${otpCode} to verify login`);
    } else {
      // Production: Send via SMS service
      // await sendSMS(normalizedPhone, otpCode);
      logger.info(`📱 OTP sent via SMS to: ${normalizedPhone}`);
    }

    res.json({
      success: true,
      data: {
        message: 'OTP sent successfully',
        // In TEST MODE: Return OTP in response for easy testing
        // In PRODUCTION: OTP will be sent via SMS only, not in response
        ...(isTestMode && { otp: otpCode }),
        expiresIn: 600 // 10 minutes in seconds
      }
    });
  } catch (error) {
    logger.error('Send OTP error:', error);
    next(error);
  }
};

/**
 * Verify OTP and authenticate user
 */
export const verifyOTP = async (req, res, next) => {
  try {
    // Support both 'code' and 'otp' parameter names for mobile compatibility
    const { phone, code, otp } = req.body;
    const otpCode = code || otp;

    // Validation
    if (!phone || !otpCode) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Phone number and OTP code are required'
        }
      });
    }

    // Normalize phone number
    const normalizedPhone = phone.replace(/\s/g, '').replace(/^\+/, '');

    // Find valid OTP
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        phone: normalizedPhone,
        code: otpCode,
        isUsed: false,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: true
      }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OTP',
          message: 'Invalid or expired OTP code'
        }
      });
    }

    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true }
    });

    // Update user phone verification status
    const user = await prisma.user.update({
      where: { id: otpRecord.userId },
      data: {
        isPhoneVerified: true
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        relationType: true,
        language: true,
        avatar: true,
        isActive: true,
        isApproved: true,
        isPhoneVerified: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const jwt = (await import('jsonwebtoken')).default;
    const token = jwt.sign(
      { userId: user.id, role: 'USER' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    logger.info(`User authenticated via OTP: ${user.id}`);

    res.json({
      success: true,
      data: {
        user,
        token,
        message: 'OTP verified successfully'
      }
    });
  } catch (error) {
    logger.error('Verify OTP error:', error);
    next(error);
  }
};

/**
 * Resend OTP
 */
export const resendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Phone number is required'
        }
      });
    }

    // Normalize phone number
    const normalizedPhone = phone.replace(/\s/g, '').replace(/^\+/, '');

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { phone: normalizedPhone }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found. Please register first.'
        }
      });
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Invalidate previous OTPs
    await prisma.otpCode.updateMany({
      where: {
        phone: normalizedPhone,
        isUsed: false
      },
      data: {
        isUsed: true
      }
    });

    // Create new OTP
    await prisma.otpCode.create({
      data: {
        userId: user.id,
        phone: normalizedPhone,
        code: otpCode,
        expiresAt
      }
    });

    // TODO: Send OTP via SMS service
    const isTestMode = process.env.OTP_TEST_MODE !== 'false' || process.env.NODE_ENV !== 'production';
    
    if (isTestMode) {
      logger.info(`🧪 TEST MODE - Resent OTP for ${normalizedPhone}: ${otpCode}`);
      logger.info(`📱 Use OTP: ${otpCode} to verify login`);
    } else {
      // Production: Send via SMS service
      // await sendSMS(normalizedPhone, otpCode);
      logger.info(`📱 OTP resent via SMS to: ${normalizedPhone}`);
    }

    res.json({
      success: true,
      data: {
        message: 'OTP resent successfully',
        // In TEST MODE: Return OTP in response for easy testing
        // In PRODUCTION: OTP will be sent via SMS only, not in response
        ...(isTestMode && { otp: otpCode }),
        expiresIn: 600
      }
    });
  } catch (error) {
    logger.error('Resend OTP error:', error);
    next(error);
  }
};

