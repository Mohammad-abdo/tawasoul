import * as availabilityRepo from '../../repositories/doctor/availability.repository.js';
import { createHttpError } from '../../utils/httpError.js';
import { formatDateKey, getSlotStatus, parseTimeSlots } from '../../utils/availability.js';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const buildNext7Days = async (availabilityList, doctorId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const availabilityMap = new Map();
  for (const item of availabilityList) {
    const parsedSlots = parseTimeSlots(item.timeSlots);
    if (item.isActive && parsedSlots.length > 0) {
      availabilityMap.set(item.dayOfWeek, parsedSlots);
    }
  }

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 6);
  const bookings = await availabilityRepo.findBookingsForDoctor(doctorId, today, endDate);

  const bookedSlotKeys = new Set(
    bookings.map((booking) => {
      const dateStr = `${booking.scheduledYear}-${String(booking.scheduledMonth).padStart(2, '0')}-${String(booking.scheduledDay).padStart(2, '0')}`;
      return `${dateStr}|${booking.scheduledTime}`;
    })
  );

  const now = new Date();
  const result = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    const dayOfWeek = date.getDay();
    const rawSlots = availabilityMap.get(dayOfWeek) || [];
    const dateStr = formatDateKey(date);

    const slots = rawSlots.map((time) => {
      const slotDate = new Date(date);
      const [hours, minutes] = time.split(':').map(Number);
      slotDate.setHours(hours, minutes, 0, 0);

      const slotKey = `${dateStr}|${time}`;
      let status = getSlotStatus(slotDate, now);
      if (status === 'available' && bookedSlotKeys.has(slotKey)) {
        status = 'booked';
      }

      return { time, status };
    });

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
  return buildNext7Days(availability, doctorId);
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
