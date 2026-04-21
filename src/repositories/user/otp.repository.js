import { prisma } from '../../config/database.js';

export const findUserByPhone = (phone) =>
  prisma.user.findUnique({ where: { phone } });

export const invalidatePreviousOTPs = (phone) =>
  prisma.otpCode.updateMany({
    where: { phone, isUsed: false },
    data: { isUsed: true }
  });

export const createOTP = (data) =>
  prisma.otpCode.create({ data });

export const createUser = (data) =>
  prisma.user.create({ data });

export const findValidOTP = (phone, code) =>
  prisma.otpCode.findFirst({
    where: {
      phone,
      code,
      isUsed: false,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

export const findOTPByPhoneAndCode = (phone, code) =>
  prisma.otpCode.findFirst({
    where: { phone, code },
    orderBy: { createdAt: 'desc' }
  });

export const markOTPUsed = (id) =>
  prisma.otpCode.update({ where: { id }, data: { isUsed: true } });

export const verifyUserPhone = (id) =>
  prisma.user.update({
    where: { id },
    data: { isPhoneVerified: true },
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
