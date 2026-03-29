import * as bookingsRepo from '../../repositories/user/bookings.repository.js';
import { ONE_HOUR_SESSION_DURATION, formatDateKey } from '../../utils/availability.js';
import { getAvailableSlots } from './doctors.service.js';

const parseScheduledDate = (scheduledAt, scheduledMonth, scheduledDay, scheduledTime) => {
  if (scheduledAt) {
    const d = new Date(scheduledAt);
    return {
      scheduledDate: d,
      month: d.getMonth() + 1,
      day: d.getDate(),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  }

  const match = scheduledTime.match(/(\d+):(\d+)\s*(AM|PM)/i)?.slice(1);
  if (!match || match.length < 3) {
    const err = new Error('Time must be in format: HH:MM AM/PM');
    err.code = 'INVALID_TIME_FORMAT';
    err.status = 400;
    throw err;
  }

  const [hours, minutes, period] = match;
  let hour24 = parseInt(hours);
  if (period.toUpperCase() === 'PM' && hour24 !== 12) hour24 += 12;
  if (period.toUpperCase() === 'AM' && hour24 === 12) hour24 = 0;

  const d = new Date(new Date().getFullYear(), parseInt(scheduledMonth) - 1, parseInt(scheduledDay), hour24, parseInt(minutes));
  return { scheduledDate: d, month: parseInt(scheduledMonth), day: parseInt(scheduledDay), time: scheduledTime };
};

const getEffectiveSessionPrice = (sessionPrices) => {
  if (!Array.isArray(sessionPrices) || sessionPrices.length === 0) {
    return null;
  }

  return sessionPrices.find((item) => item.duration === ONE_HOUR_SESSION_DURATION) || sessionPrices[0];
};

export const getUserBookings = async (userId, { status, page = 1, limit = 20 }) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);
  const where = { userId };
  if (status) where.status = status;

  const [bookings, total] = await Promise.all([
    bookingsRepo.findMany({ where, skip, take }),
    bookingsRepo.count(where)
  ]);

  const formattedBookings = bookings.map(b => ({
    id: b.id,
    doctor: b.doctor,
    sessionType: b.sessionType,
    duration: b.duration,
    price: b.price,
    status: b.status,
    scheduledAt: b.scheduledAt,
    completedAt: b.completedAt,
    cancelledAt: b.cancelledAt,
    cancellationReason: b.cancellationReason,
    rating: b.rating,
    review: b.review,
    payment: b.payment,
    createdAt: b.createdAt
  }));

  return {
    bookings: formattedBookings,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
  };
};

export const createBooking = async (userId, body) => {
  const { doctorId, childId, sessionType, duration, scheduledAt, scheduledMonth, scheduledDay, scheduledTime, notes } = body;
  const parsedDuration = parseInt(duration);

  if (!doctorId || !sessionType || !duration) {
    const err = new Error('Doctor ID, session type, and duration are required');
    err.code = 'VALIDATION_ERROR'; err.status = 400; throw err;
  }

  if (!scheduledAt && (!scheduledMonth || !scheduledDay || !scheduledTime)) {
    const err = new Error('Either scheduledAt or month/day/time must be provided');
    err.code = 'VALIDATION_ERROR'; err.status = 400; throw err;
  }

  if (!['VIDEO', 'AUDIO', 'TEXT'].includes(sessionType)) {
    const err = new Error('Invalid session type. Must be VIDEO, AUDIO, or TEXT');
    err.code = 'VALIDATION_ERROR'; err.status = 400; throw err;
  }

  if (parsedDuration !== ONE_HOUR_SESSION_DURATION) {
    const err = new Error('Invalid duration. Only 60-minute sessions are allowed');
    err.code = 'VALIDATION_ERROR'; err.status = 400; throw err;
  }

  const doctor = await bookingsRepo.findDoctorWithPrices(doctorId);
  if (!doctor) {
    const err = new Error('Doctor not found'); err.code = 'DOCTOR_NOT_FOUND'; err.status = 404; throw err;
  }

  if (!doctor.isActive || !doctor.isApproved) {
    const err = new Error('Doctor is not available for bookings'); err.code = 'DOCTOR_UNAVAILABLE'; err.status = 403; throw err;
  }

  const sessionPrice = getEffectiveSessionPrice(doctor.sessionPrices);
  if (!sessionPrice) {
    const err = new Error('Doctor does not have a 60-minute session price configured'); err.code = 'INVALID_DURATION'; err.status = 400; throw err;
  }

  const { scheduledDate, month, day, time } = parseScheduledDate(scheduledAt, scheduledMonth, scheduledDay, scheduledTime);

  if (scheduledDate < new Date()) {
    const err = new Error('Scheduled time must be in the future'); err.code = 'INVALID_TIME'; err.status = 400; throw err;
  }

  if (month < 1 || month > 12) {
    const err = new Error('Month must be between 1 and 12'); err.code = 'INVALID_MONTH'; err.status = 400; throw err;
  }

  if (day < 1 || day > 31) {
    const err = new Error('Day must be between 1 and 31'); err.code = 'INVALID_DAY'; err.status = 400; throw err;
  }

  const availableSlots = await getAvailableSlots(doctorId, formatDateKey(scheduledDate));
  const isSelectedSlotAvailable = availableSlots.slots.some((slot) => slot.time === scheduledDate.toTimeString().slice(0, 5));
  if (!isSelectedSlotAvailable) {
    const err = new Error('Selected slot is not available'); err.code = 'SLOT_UNAVAILABLE'; err.status = 400; throw err;
  }

  if (childId) {
    const child = await bookingsRepo.findChild(childId);
    if (!child || child.userId !== userId) {
      const err = new Error('Child profile not found'); err.code = 'CHILD_NOT_FOUND'; err.status = 404; throw err;
    }
  }

  const booking = await bookingsRepo.createBooking({
    userId, doctorId, childId: childId || null, sessionType,
    duration: ONE_HOUR_SESSION_DURATION, price: sessionPrice.price,
    scheduledAt: scheduledDate, scheduledMonth: month, scheduledDay: day,
    scheduledTime: time, notes: notes || null, status: 'PENDING'
  });

  return {
    id: booking.id, doctor: booking.doctor, sessionType: booking.sessionType,
    duration: booking.duration, price: booking.price, status: booking.status,
    scheduledAt: booking.scheduledAt, createdAt: booking.createdAt
  };
};

export const getBookingById = async (userId, id) => {
  const booking = await bookingsRepo.findById(id);

  if (!booking) {
    const err = new Error('Booking not found'); err.code = 'BOOKING_NOT_FOUND'; err.status = 404; throw err;
  }

  if (booking.userId !== userId) {
    const err = new Error('You can only view your own bookings'); err.code = 'FORBIDDEN'; err.status = 403; throw err;
  }

  return {
    id: booking.id, doctor: booking.doctor, sessionType: booking.sessionType,
    duration: booking.duration, price: booking.price, status: booking.status,
    scheduledAt: booking.scheduledAt, completedAt: booking.completedAt,
    cancelledAt: booking.cancelledAt, cancellationReason: booking.cancellationReason,
    rating: booking.rating, review: booking.review, payment: booking.payment,
    createdAt: booking.createdAt, updatedAt: booking.updatedAt
  };
};

export const cancelBooking = async (userId, id, reason) => {
  const booking = await bookingsRepo.findByIdSimple(id);

  if (!booking) {
    const err = new Error('Booking not found'); err.code = 'BOOKING_NOT_FOUND'; err.status = 404; throw err;
  }
  if (booking.userId !== userId) {
    const err = new Error('You can only cancel your own bookings'); err.code = 'FORBIDDEN'; err.status = 403; throw err;
  }
  if (booking.status === 'CANCELLED') {
    const err = new Error('Booking is already cancelled'); err.code = 'ALREADY_CANCELLED'; err.status = 400; throw err;
  }
  if (booking.status === 'COMPLETED') {
    const err = new Error('Cannot cancel a completed booking'); err.code = 'CANNOT_CANCEL'; err.status = 400; throw err;
  }

  const cancelled = await bookingsRepo.cancelBooking(id, reason);
  return { id: cancelled.id, status: cancelled.status, cancelledAt: cancelled.cancelledAt, message: 'Booking cancelled successfully' };
};

export const rescheduleBooking = async (userId, id, body) => {
  const { scheduledAt, scheduledMonth, scheduledDay, scheduledTime } = body;
  const booking = await bookingsRepo.findByIdSimple(id);

  if (!booking) {
    const err = new Error('Booking not found'); err.code = 'BOOKING_NOT_FOUND'; err.status = 404; throw err;
  }
  if (booking.userId !== userId) {
    const err = new Error('You can only reschedule your own bookings'); err.code = 'FORBIDDEN'; err.status = 403; throw err;
  }
  if (booking.status === 'CANCELLED') {
    const err = new Error('Cannot reschedule a cancelled booking'); err.code = 'CANNOT_RESCHEDULE'; err.status = 400; throw err;
  }
  if (booking.status === 'COMPLETED') {
    const err = new Error('Cannot reschedule a completed booking'); err.code = 'CANNOT_RESCHEDULE'; err.status = 400; throw err;
  }

  if (!scheduledAt && (!scheduledMonth || !scheduledDay || !scheduledTime)) {
    const err = new Error('Either scheduledAt or month/day/time must be provided');
    err.code = 'VALIDATION_ERROR'; err.status = 400; throw err;
  }

  const { scheduledDate, month, day, time } = parseScheduledDate(scheduledAt, scheduledMonth, scheduledDay, scheduledTime);

  if (scheduledDate < new Date()) {
    const err = new Error('Scheduled time must be in the future'); err.code = 'INVALID_TIME'; err.status = 400; throw err;
  }

  const availableSlots = await getAvailableSlots(booking.doctorId, formatDateKey(scheduledDate), { excludeBookingId: id });
  const isSelectedSlotAvailable = availableSlots.slots.some((slot) => slot.time === scheduledDate.toTimeString().slice(0, 5));
  if (!isSelectedSlotAvailable) {
    const err = new Error('Selected slot is not available'); err.code = 'SLOT_UNAVAILABLE'; err.status = 400; throw err;
  }

  const updated = await bookingsRepo.rescheduleBooking(id, {
    scheduledAt: scheduledDate, scheduledMonth: month, scheduledDay: day, scheduledTime: time, status: 'PENDING'
  });

  return {
    id: updated.id, doctor: updated.doctor, child: updated.child,
    sessionType: updated.sessionType, duration: updated.duration, price: updated.price,
    status: updated.status, scheduledAt: updated.scheduledAt,
    scheduledMonth: updated.scheduledMonth, scheduledDay: updated.scheduledDay, scheduledTime: updated.scheduledTime,
    message: 'Booking rescheduled successfully'
  };
};
