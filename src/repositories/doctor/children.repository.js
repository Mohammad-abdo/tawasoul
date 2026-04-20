import { prisma } from '../../config/database.js';
import { bookingScheduleOrderBy } from '../../utils/booking-schedule.utils.js';

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
          test: true,
          helpAssessment: {
            include: {
              evaluations: {
                include: {
                  skill: true
                }
              }
            }
          },
          qCarsAnswers: true,
          qAnalogyAnswers: true,
          qVisualMemoryAnswers: true,
          qAuditoryMemoryAnswers: true,
          qSequenceOrderAnswers: true,
          qVerbalNonsenseAnswers: true
        },
        orderBy: { timestamp: 'desc' }
      },
      helpAssessments: {
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          assessmentResult: {
            include: {
              test: true
            }
          },
          evaluations: {
            include: {
              skill: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      bookings: {
        where: { doctorId },
        orderBy: bookingScheduleOrderBy('desc'),
        take: 5
      }
    }
  });
