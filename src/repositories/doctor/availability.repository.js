import { prisma } from '../../config/database.js';

export const findByDoctorId = (doctorId) =>
  prisma.availability.findMany({
    where: { doctorId },
    orderBy: { dayOfWeek: 'asc' }
  });

export const findBookingsForDoctor = async (doctorId, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const monthStart = start.getMonth() + 1;
  const monthEnd = end.getMonth() + 1;
  const year = start.getFullYear();

  const bookings = await prisma.booking.findMany({
    where: {
      doctorId,
      status: { not: 'CANCELLED' },
      scheduledYear: year
    },
    select: {
      scheduledYear: true,
      scheduledMonth: true,
      scheduledDay: true,
      scheduledTime: true
    }
  });

  const startTs = start.setHours(0, 0, 0, 0);
  const endTs = end.setHours(23, 59, 59, 999);

  return bookings.filter((b) => {
    const bookingDate = new Date(b.scheduledYear, b.scheduledMonth - 1, b.scheduledDay);
    const ts = bookingDate.getTime();
    return ts >= startTs && ts <= endTs;
  });
};

export const replaceAvailability = async (doctorId, availability) => {
  await prisma.availability.deleteMany({
    where: { doctorId }
  });

  return Promise.all(
    availability.map((item) =>
      prisma.availability.create({
        data: {
          doctorId,
          dayOfWeek: item.dayOfWeek,
          timeSlots: JSON.stringify(item.timeSlots),
          isActive: item.isActive !== undefined ? item.isActive : true
        }
      })
    )
  );
};
