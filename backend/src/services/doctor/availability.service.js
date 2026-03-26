import * as availabilityRepo from '../../repositories/doctor/availability.repository.js';
import { createHttpError } from '../../utils/httpError.js';
import { parseTimeSlots } from '../../utils/availability.js';

const formatAvailability = (availability) =>
  availability.map((item) => ({
    id: item.id,
    dayOfWeek: item.dayOfWeek,
    timeSlots: parseTimeSlots(item.timeSlots),
    isActive: item.isActive,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }));

export const getAvailability = async (doctorId) => {
  const availability = await availabilityRepo.findByDoctorId(doctorId);
  return formatAvailability(availability);
};

export const updateAvailability = async (doctorId, body) => {
  const availability = Array.isArray(body) ? body : body.availability;

  if (!Array.isArray(availability)) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Availability must be an array');
  }

  const normalizedAvailability = [];
  for (const item of availability) {
    if (typeof item.dayOfWeek !== 'number' || item.dayOfWeek < 0 || item.dayOfWeek > 6) {
      throw createHttpError(400, 'VALIDATION_ERROR', 'Invalid dayOfWeek. Must be 0-6 (Sunday=0)');
    }

    const timeSlots = parseTimeSlots(item.timeSlots);
    if (!Array.isArray(timeSlots)) {
      throw createHttpError(400, 'VALIDATION_ERROR', 'timeSlots must be an array');
    }

    normalizedAvailability.push({
      dayOfWeek: item.dayOfWeek,
      timeSlots,
      isActive: item.isActive
    });
  }

  const createdAvailability = await availabilityRepo.replaceAvailability(doctorId, normalizedAvailability);
  return formatAvailability(createdAvailability);
};
