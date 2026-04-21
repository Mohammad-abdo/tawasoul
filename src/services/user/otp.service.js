import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { logger } from '../../utils/logger.js';
import { mapRelationType } from '../../utils/relationTypeMapper.js';
import * as otpRepo from '../../repositories/user/otp.repository.js';
import { getUserAccessTokenSecret } from '../../utils/jwt.utils.js';

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const sendSmsOtp = (phone, code) => {
  console.log(`[SMS PLACEHOLDER] Sending OTP ${code} to phone: ${phone}`);
  logger.info(`SMS placeholder: OTP sent to ${phone}`);
};

const OTP_EXPIRY_MINUTES = 10;

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
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

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

  sendSmsOtp(normalizedPhone, otpCode);

  return {
    message: 'OTP sent successfully',
    expiresIn: OTP_EXPIRY_MINUTES * 60
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
  const otpRecord = await otpRepo.findOTPByPhoneAndCode(normalizedPhone, otpCode);

  if (!otpRecord) {
    const err = new Error('OTP code not found');
    err.code = 'OTP_NOT_FOUND';
    err.status = 404;
    throw err;
  }

  if (otpRecord.isUsed) {
    const err = new Error('OTP code has already been used');
    err.code = 'OTP_ALREADY_USED';
    err.status = 400;
    throw err;
  }

  if (otpRecord.expiresAt < new Date()) {
    const err = new Error('OTP code has expired');
    err.code = 'OTP_EXPIRED';
    err.status = 400;
    throw err;
  }

  await otpRepo.markOTPUsed(otpRecord.id);
  const user = await otpRepo.verifyUserPhone(otpRecord.userId);

  const token = jwt.sign(
    { userId: user.id, role: 'USER' },
    getUserAccessTokenSecret(),
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
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

  await otpRepo.invalidatePreviousOTPs(normalizedPhone);
  await otpRepo.createOTP({ userId: user.id, phone: normalizedPhone, code: otpCode, expiresAt });
  sendSmsOtp(normalizedPhone, otpCode);

  return {
    message: 'OTP resent successfully',
    expiresIn: OTP_EXPIRY_MINUTES * 60
  };
};
