import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';

const TOKEN_EXPIRY_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS || '30', 10);

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const validateOwnerGuard = (userId, doctorId, adminId) => {
  const setCount = [userId, doctorId, adminId].filter(Boolean).length;
  if (setCount !== 1) {
    const err = new Error('Exactly one owner (userId, doctorId, or adminId) must be set');
    err.code = 'INVALID_OWNER';
    err.status = 400;
    throw err;
  }
};

const resolveOwnerFields = (ownerId, role) => {
  let userId = null;
  let doctorId = null;
  let adminId = null;

  if (role === 'USER') {
    userId = ownerId;
  } else if (role === 'DOCTOR') {
    doctorId = ownerId;
  } else if (role === 'ADMIN') {
    adminId = ownerId;
  }

  validateOwnerGuard(userId, doctorId, adminId);
  return { userId, doctorId, adminId };
};

export const createToken = async (ownerId, role) => {
  const token = crypto.randomBytes(64).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);

  const { userId, doctorId, adminId } = resolveOwnerFields(ownerId, role);

  await prisma.refreshToken.create({
    data: {
      token: tokenHash,
      userId,
      doctorId,
      adminId,
      expiresAt,
      isRevoked: false,
    },
  });

  return token;
};

export const blacklistJwtToken = async (token, ownerId, role) => {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded !== 'object' || typeof decoded.exp !== 'number') {
    const err = new Error('Invalid token');
    err.code = 'INVALID_TOKEN';
    err.status = 401;
    throw err;
  }

  const expiresAt = new Date(decoded.exp * 1000);
  const tokenHash = hashToken(token);
  const { userId, doctorId, adminId } = resolveOwnerFields(ownerId, role);

  await prisma.refreshToken.upsert({
    where: { token: tokenHash },
    update: {
      userId,
      doctorId,
      adminId,
      expiresAt,
      isRevoked: true
    },
    create: {
      token: tokenHash,
      userId,
      doctorId,
      adminId,
      expiresAt,
      isRevoked: true
    }
  });
};

export const isTokenRevoked = async (token) => {
  const tokenHash = hashToken(token);

  const existingToken = await prisma.refreshToken.findUnique({
    where: { token: tokenHash },
    select: {
      isRevoked: true,
      expiresAt: true
    }
  });

  return Boolean(existingToken?.isRevoked && existingToken.expiresAt >= new Date());
};

export const rotateToken = async (oldToken) => {
  const oldTokenHash = hashToken(oldToken);

  const existingToken = await prisma.refreshToken.findUnique({
    where: { token: oldTokenHash },
  });

  if (!existingToken) {
    const err = new Error('Invalid token');
    err.code = 'INVALID_TOKEN';
    err.status = 401;
    throw err;
  }

  if (existingToken.isRevoked) {
    const err = new Error('Token has been revoked');
    err.code = 'TOKEN_REVOKED';
    err.status = 401;
    throw err;
  }

  if (existingToken.expiresAt < new Date()) {
    const err = new Error('Token has expired');
    err.code = 'TOKEN_EXPIRED';
    err.status = 401;
    throw err;
  }

  await prisma.refreshToken.update({
    where: { id: existingToken.id },
    data: { isRevoked: true },
  });

  let ownerId = null;
  let role = null;

  if (existingToken.userId) {
    ownerId = existingToken.userId;
    role = 'USER';
  } else if (existingToken.doctorId) {
    ownerId = existingToken.doctorId;
    role = 'DOCTOR';
  } else if (existingToken.adminId) {
    ownerId = existingToken.adminId;
    role = 'ADMIN';
  }

  const newToken = await createToken(ownerId, role);
  return newToken;
};

export const revokeToken = async (token) => {
  const tokenHash = hashToken(token);

  const existingToken = await prisma.refreshToken.findUnique({
    where: { token: tokenHash },
  });

  if (!existingToken) {
    const err = new Error('Invalid token');
    err.code = 'INVALID_TOKEN';
    err.status = 401;
    throw err;
  }

  await prisma.refreshToken.update({
    where: { id: existingToken.id },
    data: { isRevoked: true },
  });
};

export const revokeAllForOwner = async (ownerId, role) => {
  const { userId, doctorId, adminId } = resolveOwnerFields(ownerId, role);

  await prisma.refreshToken.updateMany({
    where: {
      OR: [
        { userId },
        { doctorId },
        { adminId },
      ],
      isRevoked: false,
    },
    data: { isRevoked: true },
  });
};

export const validateToken = async (token) => {
  const tokenHash = hashToken(token);

  const existingToken = await prisma.refreshToken.findUnique({
    where: { token: tokenHash },
  });

  if (!existingToken) {
    const err = new Error('Invalid token');
    err.code = 'INVALID_TOKEN';
    err.status = 401;
    throw err;
  }

  if (existingToken.isRevoked) {
    const err = new Error('Token has been revoked');
    err.code = 'TOKEN_REVOKED';
    err.status = 401;
    throw err;
  }

  if (existingToken.expiresAt < new Date()) {
    const err = new Error('Token has expired');
    err.code = 'TOKEN_EXPIRED';
    err.status = 401;
    throw err;
  }

  let ownerId = null;
  let role = null;

  if (existingToken.userId) {
    ownerId = existingToken.userId;
    role = 'USER';
  } else if (existingToken.doctorId) {
    ownerId = existingToken.doctorId;
    role = 'DOCTOR';
  } else if (existingToken.adminId) {
    ownerId = existingToken.adminId;
    role = 'ADMIN';
  }

  return { ownerId, role };
};
