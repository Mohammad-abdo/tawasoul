import { prisma } from '../../config/database.js';

export const findByEmail = (email) =>
  prisma.doctor.findUnique({
    where: { email }
  });

export const findByEmailWithSpecialties = (email) =>
  prisma.doctor.findUnique({
    where: { email },
    include: {
      specialties: true
    }
  });

export const createDoctor = (data) =>
  prisma.doctor.create({
    data,
    include: {
      specialties: {
        select: {
          specialty: true
        },
        take: 1
      }
    }
  });

export const findById = (id) =>
  prisma.doctor.findUnique({
    where: { id },
    include: {
      specialties: true,
      _count: {
        select: {
          bookings: true,
          articles: true
        }
      }
    }
  });

export const updateDoctor = (id, data) =>
  prisma.doctor.update({
    where: { id },
    data,
    include: {
      specialties: true
    }
  });

export const replaceSpecialties = async (doctorId, specialties) => {
  await prisma.doctorSpecialty.deleteMany({
    where: { doctorId }
  });

  if (specialties.length > 0) {
    await prisma.doctorSpecialty.createMany({
      data: specialties.map((specialty) => ({
        doctorId,
        specialty
      }))
    });
  }
};

export const upsertSessionPrice = (doctorId, duration, price) =>
  prisma.sessionPrice.upsert({
    where: {
      doctorId_duration: {
        doctorId,
        duration
      }
    },
    update: { price },
    create: {
      doctorId,
      duration,
      price
    }
  });

export const replaceSessionPrices = async (doctorId, price) => {
  return null;
};
