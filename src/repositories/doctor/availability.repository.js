import { prisma } from '../../config/database.js';

export const findByDoctorId = (doctorId) =>
  prisma.availability.findMany({
    where: { doctorId },
    orderBy: { dayOfWeek: 'asc' }
  });

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
