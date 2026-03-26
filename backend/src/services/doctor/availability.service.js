import * as availabilityRepo from '../../repositories/doctor/availability.repository.js';
import { createHttpError } from '../../utils/httpError.js';

const formatAvailability = (availability) =>
  availability.map((item) => ({
    id: item.id,
    dayOfWeek: item.dayOfWeek,
    timeSlots: JSON.parse(item.timeSlots || '[]'),
    isActive: item.isActive,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }));

export const getAvailability = async (doctorId) => {
  const availability = await availabilityRepo.findByDoctorId(doctorId);
  return formatAvailability(availability);
};

export const updateAvailability = async (doctorId, { availability }) => {
  if (!Array.isArray(availability)) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Availability must be an array');
  }

  for (const item of availability) {
    if (typeof item.dayOfWeek !== 'number' || item.dayOfWeek < 0 || item.dayOfWeek > 6) {
      throw createHttpError(400, 'VALIDATION_ERROR', 'Invalid dayOfWeek. Must be 0-6 (Sunday=0)');
    }

    if (!Array.isArray(item.timeSlots)) {
      throw createHttpError(400, 'VALIDATION_ERROR', 'timeSlots must be an array');
    }
  }

  const createdAvailability = await availabilityRepo.replaceAvailability(doctorId, availability);
  return formatAvailability(createdAvailability);
};
