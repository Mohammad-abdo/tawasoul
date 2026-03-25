import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as authRepo from '../../repositories/user/auth.repository.js';

const signToken = (userId) =>
  jwt.sign(
    { userId, role: 'USER' },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '30d' }
  );

export const register = async ({ username, email, phone, password, interests }) => {
  if (!username || !password) {
    const err = new Error('Username and password are required');
    err.code = 'VALIDATION_ERROR';
    err.status = 400;
    throw err;
  }

  if (password.length < 6) {
    const err = new Error('Password must be at least 6 characters');
    err.code = 'VALIDATION_ERROR';
    err.status = 400;
    throw err;
  }

  const existingUser = await authRepo.findByUsername(username);
  if (existingUser) {
    const err = new Error('Username already exists');
    err.code = 'USER_EXISTS';
    err.status = 409;
    throw err;
  }

  if (email) {
    const existingEmail = await authRepo.findByEmail(email);
    if (existingEmail) {
      const err = new Error('Email already exists');
      err.code = 'EMAIL_EXISTS';
      err.status = 409;
      throw err;
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await authRepo.createUser({
    username,
    email: email || null,
    phone: phone || null,
    password: hashedPassword,
    isActive: true,
    isApproved: true,
    interests: interests ? {
      create: interests.map(interestId => ({
        interest: { connect: { id: interestId } }
      }))
    } : undefined
  });

  const token = signToken(user.id);
  return { user, token };
};

export const login = async ({ username, password }) => {
  if (!username || !password) {
    const err = new Error('Username and password are required');
    err.code = 'VALIDATION_ERROR';
    err.status = 400;
    throw err;
  }

  const user = await authRepo.findByUsernameWithInterests(username);

  if (!user) {
    const err = new Error('Invalid username or password');
    err.code = 'INVALID_CREDENTIALS';
    err.status = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error('Your account has been disabled');
    err.code = 'ACCOUNT_DISABLED';
    err.status = 403;
    throw err;
  }

  if (!user.isApproved) {
    const err = new Error('Your account is pending approval');
    err.code = 'ACCOUNT_PENDING';
    err.status = 403;
    throw err;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    const err = new Error('Invalid username or password');
    err.code = 'INVALID_CREDENTIALS';
    err.status = 401;
    throw err;
  }

  const token = signToken(user.id);
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

export const getMe = async (userId) => {
  const user = await authRepo.findById(userId);

  if (!user) {
    const err = new Error('User not found');
    err.code = 'USER_NOT_FOUND';
    err.status = 404;
    throw err;
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
