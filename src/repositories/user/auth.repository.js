import { prisma } from '../../config/database.js';

export const findByUsername = (username) =>
  prisma.user.findUnique({ where: { username } });

export const findByEmail = (email) =>
  prisma.user.findUnique({ where: { email } });

export const findById = (id) =>
  prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          bookings: true
        }
      }
    }
  });

export const createUser = (data) =>
  prisma.user.create({
    data,
    select: {
      id: true,
      username: true,
      email: true,
      phone: true,
      avatar: true,
      isActive: true,
      isApproved: true,
      createdAt: true
    }
  });

export const updateUser = (id, data) =>
  prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      isEmailVerified: true,
      emailVerificationToken: true,
      emailVerificationExpiry: true
    }
  });

export const findUserByVerificationToken = (token) =>
  prisma.user.findFirst({
    where: { emailVerificationToken: token }
  });
