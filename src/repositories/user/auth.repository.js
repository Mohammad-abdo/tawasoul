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
          bookings: true,
          sentMessages: true,
          receivedMessages: true
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
