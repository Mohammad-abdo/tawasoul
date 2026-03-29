import jwt from 'jsonwebtoken';
import { logger } from '../../utils/logger.js';
import { mapRelationType } from '../../utils/relationTypeMapper.js';
import * as otpRepo from '../../repositories/user/otp.repository.js';

const generateOTP = () => {
  const TEST_MODE = process.env.OTP_TEST_MODE !== 'false';
  const TEST_OTP = process.env.TEST_OTP || '12345';

  if (TEST_MODE || process.env.NODE_ENV !== 'production') {
    logger.info(`🧪 TEST MODE: Using fixed OTP: ${TEST_OTP}`);
    return TEST_OTP;
  }

  return Math.floor(10000 + Math.random() * 90000).toString();
};

const isTestMode = () =>
  process.env.OTP_TEST_MODE !== 'false' || process.env.NODE_ENV !== 'production';

export const sendOTP = async ({ phone, fullName, relationType, agreedToTerms }) => {
  if (!phone) {
    const err = new Error('Phone number is required');
    err.code = 'VALIDATION_ERROR';
    err.status = 400;
    throw err;
  }

  if (agreedToTerms === false || agreedToTerms === undefined) {
    const err = new Error('You must agree to the terms and conditions');
    err.code = 'VALIDATION_ERROR';
    err.status = 400;
    throw err;
  }

  const cleanedPhone = phone.replace(/\s/g, '').replace(/^\+/, '');
  const phoneRegex = /^[0-9]{10,15}$/;
  if (!phoneRegex.test(cleanedPhone)) {
    const err = new Error('Invalid phone number format');
    err.code = 'INVALID_PHONE';
    err.status = 400;
    throw err;
  }

  const normalizedPhone = cleanedPhone;
  const otpCode = generateOTP();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);

  let user = await otpRepo.findUserByPhone(normalizedPhone);

  if (user) {
    await otpRepo.invalidatePreviousOTPs(normalizedPhone);
    await otpRepo.createOTP({ userId: user.id, phone: normalizedPhone, code: otpCode, expiresAt });
  } else {
    if (!fullName) {
      const err = new Error('Full name is required for new users');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      throw err;
    }

    const mappedRelationType = relationType ? mapRelationType(relationType) : null;

    user = await otpRepo.createUser({
      fullName,
      phone: normalizedPhone,
      relationType: mappedRelationType,
      isPhoneVerified: false,
      isActive: true,
      isApproved: true
    });

    await otpRepo.createOTP({ userId: user.id, phone: normalizedPhone, code: otpCode, expiresAt });
  }

  const testMode = isTestMode();
  if (testMode) {
    logger.info(`🧪 TEST MODE - OTP for ${normalizedPhone}: ${otpCode}`);
  } else {
    logger.info(`📱 OTP sent via SMS to: ${normalizedPhone}`);
  }

  return {
    message: 'OTP sent successfully',
    ...(testMode && { otp: otpCode }),
    expiresIn: 600
  };
};

export const verifyOTP = async ({ phone, code, otp }) => {
  const otpCode = code || otp;

  if (!phone || !otpCode) {
    const err = new Error('Phone number and OTP code are required');
    err.code = 'VALIDATION_ERROR';
    err.status = 400;
    throw err;
  }

  const normalizedPhone = phone.replace(/\s/g, '').replace(/^\+/, '');

  const otpRecord = await otpRepo.findValidOTP(normalizedPhone, otpCode);

  if (!otpRecord) {
    const err = new Error('Invalid or expired OTP code');
    err.code = 'INVALID_OTP';
    err.status = 400;
    throw err;
  }

  await otpRepo.markOTPUsed(otpRecord.id);
  const user = await otpRepo.verifyUserPhone(otpRecord.userId);

  const token = jwt.sign(
    { userId: user.id, role: 'USER' },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '30d' }
  );

  logger.info(`User authenticated via OTP: ${user.id}`);
  return { user, token, message: 'OTP verified successfully' };
};

export const resendOTP = async ({ phone }) => {
  if (!phone) {
    const err = new Error('Phone number is required');
    err.code = 'VALIDATION_ERROR';
    err.status = 400;
    throw err;
  }

  const normalizedPhone = phone.replace(/\s/g, '').replace(/^\+/, '');

  const user = await otpRepo.findUserByPhone(normalizedPhone);
  if (!user) {
    const err = new Error('User not found. Please register first.');
    err.code = 'USER_NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const otpCode = generateOTP();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);

  await otpRepo.invalidatePreviousOTPs(normalizedPhone);
  await otpRepo.createOTP({ userId: user.id, phone: normalizedPhone, code: otpCode, expiresAt });

  const testMode = isTestMode();
  if (testMode) {
    logger.info(`🧪 TEST MODE - Resent OTP for ${normalizedPhone}: ${otpCode}`);
  } else {
    logger.info(`📱 OTP resent via SMS to: ${normalizedPhone}`);
  }

  return {
    message: 'OTP resent successfully',
    ...(testMode && { otp: otpCode }),
    expiresIn: 600
  };
};
