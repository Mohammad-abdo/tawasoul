import { prisma } from '../../config/database.js';

export const findChild = (id, userId) =>
  prisma.child.findFirst({ where: { id, userId }, select: { status: true } });

export const findMany = ({ where, skip, take, orderBy }) =>
  prisma.doctor.findMany({
    where, skip, take, orderBy,
    include: {
      specialties: { select: { specialty: true } },
      // sessionPrices: { select: { duration: true, price: true } },
      hourlyRate: true,
      _count: { select: { bookings: true } }
    }
  });

export const count = (where) => prisma.doctor.count({ where });

export const findById = (id) =>
  prisma.doctor.findUnique({
    where: { id },
    include: {
      specialties: { select: { specialty: true } },
      experiences: { orderBy: { startDate: 'desc' }, select: { id: true, title: true, workplace: true, startDate: true, endDate: true } },
      certificates: { orderBy: { startDate: 'desc' }, select: { id: true, title: true, issuer: true, startDate: true, endDate: true, certificateLink: true } },
      education: { orderBy: { startDate: 'desc' }, select: { id: true, degree: true, institution: true, startDate: true, endDate: true } },
      // sessionPrices: { select: { duration: true, price: true } },
      hourlyRate: true,
      availability: { where: { isActive: true }, select: { dayOfWeek: true, timeSlots: true } },
      _count: { select: { bookings: true, articles: true } }
    }
  });

export const findAvailability = (doctorId, dayOfWeek) =>
  prisma.availability.findFirst({ where: { doctorId, dayOfWeek, isActive: true } });

export const findBookingsForDate = (doctorId, dayStart, dayEnd, excludeBookingId) =>
  prisma.booking.findMany({
    where: {
      doctorId,
      status: { not: 'CANCELLED' },
      scheduledAt: {
        gte: dayStart,
        lte: dayEnd
      },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {})
    },
    select: {
      id: true,
      scheduledAt: true,
      duration: true,
      status: true
    }
  });
