import { prisma } from '../../config/database.js';

export const findById = (id) =>
  prisma.user.findUnique({
    where: { id },
    select: {
      id: true, username: true, email: true, phone: true, avatar: true,
      allowPrivateMsg: true, isAnonymous: true,
      interests: { include: { interest: true } }
    }
  });

export const findByIdWithPassword = (id) =>
  prisma.user.findUnique({ where: { id } });

export const findByEmail = (email) =>
  prisma.user.findUnique({ where: { email } });

export const deleteInterests = (userId) =>
  prisma.userInterest.deleteMany({ where: { userId } });

export const createInterests = (userId, interests) =>
  prisma.userInterest.createMany({
    data: interests.map(interestId => ({ userId, interestId }))
  });

export const updateUser = (id, data) =>
  prisma.user.update({
    where: { id },
    data,
    select: {
      id: true, username: true, email: true, phone: true, avatar: true,
      allowPrivateMsg: true, isAnonymous: true,
      interests: { include: { interest: true } }
    }
  });

export const updatePassword = (id, hashedPassword) =>
  prisma.user.update({ where: { id }, data: { password: hashedPassword } });
