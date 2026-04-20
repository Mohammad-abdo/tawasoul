import * as availabilityRepo from '../../repositories/doctor/availability.repository.js';
import { createHttpError } from '../../utils/httpError.js';
import { parseTimeSlots } from '../../utils/availability.js';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const buildNext7Days = (availabilityList) => {
  /*  dayOfWeek mapping (0-6):  0 = Sunday, 1 = Monday, ..., 6 = Saturday  This matches JavaScript's Date.getDay() convention, which is also confirmed by the  validation error in updateAvailability: "Invalid dayOfWeek. Must be 0-6 (Sunday=0)"  */
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const availabilityMap = new Map();
  for (const item of availabilityList) {
    const parsedSlots = parseTimeSlots(item.timeSlots);
    if (item.isActive && parsedSlots.length > 0) {
      availabilityMap.set(item.dayOfWeek, parsedSlots);
    }
  }

  const result = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    const dayOfWeek = date.getDay();
    const slots = availabilityMap.get(dayOfWeek) || [];

    const dateStr = date.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      dayName: DAY_NAMES[dayOfWeek],
      slots,
    });
  }

  return result;
};

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
  return buildNext7Days(availability);
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
