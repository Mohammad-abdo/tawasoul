import { prisma } from '../../config/database.js';

export const findMany = ({ where, skip, take }) =>
  prisma.booking.findMany({
    where,
    skip,
    take,
    orderBy: { scheduledAt: 'desc' },
    include: {
      doctor: {
        select: {
          id: true,
          name: true,
          specialties: {
            select: {
              specialty: true
            },
            take: 1
          },
          avatar: true,
          rating: true,
          isVerified: true,
          // sessionPrices: { select: { duration: true, price: true } }
          hourlyRate: true
        }
      }
    }
  });

export const count = (where) => prisma.booking.count({ where });

export const findById = (id) =>
  prisma.booking.findUnique({
    where: { id },
    include: {
      doctor: {
        select: {
          id: true,
          name: true,
          specialties: {
            select: {
              specialty: true
            },
            take: 1
          },
          avatar: true,
          rating: true,
          isVerified: true,
          phone: true,
          // sessionPrices: { select: { duration: true, price: true } }
          hourlyRate: true
        }
      }
    }
  });

export const findByIdSimple = (id) => prisma.booking.findUnique({ where: { id } });

// export const findDoctorWithPrices = (doctorId) =>
//   prisma.doctor.findUnique({ where: { id: doctorId }, include: { sessionPrices: true } });
export const findDoctorForBooking = (doctorId) =>
  prisma.doctor.findUnique({
    where: { id: doctorId },
    select: {
      id: true,
      isActive: true,
      isApproved: true,
      hourlyRate: true
    }
  });

export const findChild = (childId) => prisma.child.findUnique({ where: { id: childId } });

export const createBooking = (data) =>
  prisma.booking.create({
    data,
    include: {
      doctor: {
        select: {
          id: true,
          name: true,
          specialties: {
            select: {
              specialty: true
            },
            take: 1
          },
          avatar: true
        }
      }
    }
  });

export const cancelBooking = (id, reason) =>
  prisma.booking.update({
    where: { id },
    data: { status: 'CANCELLED', cancelledAt: new Date(), cancellationReason: reason || 'Cancelled by user' }
  });

export const rescheduleBooking = (id, data) =>
  prisma.booking.update({
    where: { id },
    data,
    include: {
      doctor: {
        select: {
          id: true,
          name: true,
          specialties: {
            select: {
              specialty: true
            },
            take: 1
          },
          avatar: true,
          rating: true
        }
      },
      child: { select: { id: true, name: true, profileImage: true } }
    }
  });
