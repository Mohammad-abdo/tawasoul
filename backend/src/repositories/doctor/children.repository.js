import { prisma } from '../../config/database.js';

export const findDistinctChildrenByDoctor = (doctorId) =>
  prisma.booking.findMany({
    where: { doctorId },
    include: {
      child: {
        include: {
          user: {
            select: {
              fullName: true,
              phone: true,
              avatar: true
            }
          }
        }
      }
    },
    distinct: ['childId']
  });

export const findDoctorChildAccess = (doctorId, childId) =>
  prisma.booking.findFirst({
    where: { doctorId, childId }
  });

export const findChildDetails = (doctorId, childId) =>
  prisma.child.findUnique({
    where: { id: childId },
    include: {
      user: {
        select: {
          fullName: true,
          phone: true,
          email: true,
          avatar: true,
          relationType: true
        }
      },
      assessmentResults: {
        include: {
          question: {
            include: {
              test: true
            }
          }
        },
        orderBy: { timestamp: 'desc' }
      },
      bookings: {
        where: { doctorId },
        orderBy: { scheduledAt: 'desc' },
        take: 5
      }
    }
  });
