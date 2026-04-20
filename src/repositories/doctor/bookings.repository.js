import { prisma } from '../../config/database.js';
import { bookingScheduleOrderBy } from '../../utils/booking-schedule.utils.js';

export const findManyByDoctor = ({ where, skip, take }) =>
  prisma.booking.findMany({
    where,
    skip,
    take,
    orderBy: bookingScheduleOrderBy('desc'),
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true,
          phone: true
        }
      },
      doctor: {
        select: {
          id: true,
          // sessionPrices: {
          //   select: {
          //     duration: true,
          //     price: true
          //   }
          // }
          hourlyRate: true
        }
      }
    }
  });

export const count = (where) => prisma.booking.count({ where });

export const findDetailedById = (id) =>
  prisma.booking.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true,
          phone: true,
          email: true
        }
      },
      doctor: {
        select: {
          id: true,
          name: true,
          specialties: {
            select: {
              specialty: true
            }
          },
          avatar: true,
          phone: true,
          email: true,
          rating: true,
          // sessionPrices: {
          //   select: {
          //     duration: true,
          //     price: true
          //   }
          // }
          hourlyRate: true
        }
      }
    }
  });

export const findById = (id) =>
  prisma.booking.findUnique({
    where: { id }
  });

export const updateBooking = (id, data) =>
  prisma.booking.update({
    where: { id },
    data
  });

export const createNotification = (data) =>
  prisma.notification.create({
    data
  });
