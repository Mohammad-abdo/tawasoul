import bcrypt from 'bcryptjs';
import * as settingsRepo from '../../repositories/user/settings.repository.js';

export const getUserSettings = async (userId) => {
  const user = await settingsRepo.findById(userId);
  if (!user) {
    const err = new Error('User not found'); err.code = 'USER_NOT_FOUND'; err.status = 404; throw err;
  }
  return user;
};

export const updateUserSettings = async (userId, body) => {
  const { email, phone, avatar, allowPrivateMsg, isAnonymous } = body;
  const updateData = {};

  if (email !== undefined) {
    const existing = await settingsRepo.findByEmail(email);
    if (existing && existing.id !== userId) {
      const err = new Error('Email already exists'); err.code = 'EMAIL_EXISTS'; err.status = 409; throw err;
    }
    updateData.email = email;
  }

  if (phone !== undefined) updateData.phone = phone;
  if (avatar !== undefined) updateData.avatar = avatar;
  if (allowPrivateMsg !== undefined) updateData.allowPrivateMsg = allowPrivateMsg;
  if (isAnonymous !== undefined) updateData.isAnonymous = isAnonymous;

  return settingsRepo.updateUser(userId, updateData);
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    const err = new Error('Current password and new password are required'); err.code = 'VALIDATION_ERROR'; err.status = 400; throw err;
  }

  if (newPassword.length < 6) {
    const err = new Error('New password must be at least 6 characters'); err.code = 'VALIDATION_ERROR'; err.status = 400; throw err;
  }

  const user = await settingsRepo.findByIdWithPassword(userId);
  if (!user) {
    const err = new Error('User not found'); err.code = 'USER_NOT_FOUND'; err.status = 404; throw err;
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    const err = new Error('Current password is incorrect'); err.code = 'INVALID_PASSWORD'; err.status = 401; throw err;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await settingsRepo.updatePassword(userId, hashedPassword);
};
