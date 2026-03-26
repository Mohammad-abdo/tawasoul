import * as bookingsRepo from '../../repositories/doctor/bookings.repository.js';
import { createHttpError } from '../../utils/httpError.js';

const formatBookingSummary = (booking) => ({
  id: booking.id,
  user: booking.user,
  childId: booking.childId,
  sessionType: booking.sessionType,
  duration: booking.duration,
  price: booking.price,
  status: booking.status,
  scheduledAt: booking.scheduledAt,
  completedAt: booking.completedAt,
  cancelledAt: booking.cancelledAt,
  cancellationReason: booking.cancellationReason,
  videoLink: booking.videoLink,
  rating: booking.rating,
  review: booking.review,
  payment: booking.payment,
  createdAt: booking.createdAt
});

export const getDoctorBookings = async (doctorId, { status, page = 1, limit = 20 }) => {
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  const skip = (parsedPage - 1) * parsedLimit;
  const where = { doctorId };
  if (status) where.status = status;

  const [bookings, total] = await Promise.all([
    bookingsRepo.findManyByDoctor({ where, skip, take: parsedLimit }),
    bookingsRepo.count(where)
  ]);

  return {
    bookings: bookings.map(formatBookingSummary),
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      pages: Math.ceil(total / parsedLimit)
    }
  };
};

export const getBookingById = async (doctorId, id) => {
  const booking = await bookingsRepo.findDetailedById(id);
  if (!booking) {
    throw createHttpError(404, 'BOOKING_NOT_FOUND', 'Booking not found');
  }
  if (booking.doctorId !== doctorId) {
    throw createHttpError(403, 'FORBIDDEN', 'You can only view your own bookings');
  }

  return {
    id: booking.id,
    user: booking.user,
    doctor: booking.doctor,
    childId: booking.childId,
    sessionType: booking.sessionType,
    duration: booking.duration,
    price: booking.price,
    status: booking.status,
    scheduledAt: booking.scheduledAt,
    completedAt: booking.completedAt,
    cancelledAt: booking.cancelledAt,
    cancellationReason: booking.cancellationReason,
    videoLink: booking.videoLink,
    rating: booking.rating,
    review: booking.review,
    payment: booking.payment,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt
  };
};

export const confirmBooking = async (doctorId, id) => {
  const booking = await bookingsRepo.findById(id);
  if (!booking) {
    throw createHttpError(404, 'BOOKING_NOT_FOUND', 'Booking not found');
  }
  if (booking.doctorId !== doctorId) {
    throw createHttpError(403, 'FORBIDDEN', 'You can only confirm your own bookings');
  }
  if (booking.status !== 'PENDING') {
    throw createHttpError(400, 'INVALID_STATUS', 'Only pending bookings can be confirmed');
  }

  const confirmedBooking = await bookingsRepo.updateBooking(id, { status: 'CONFIRMED' });
  await bookingsRepo.createNotification({
    userId: booking.userId,
    type: 'BOOKING_CONFIRMED',
    title: 'تم تأكيد الحجز',
    message: 'تم تأكيد حجزك مع الطبيب'
  });

  return {
    id: confirmedBooking.id,
    status: confirmedBooking.status,
    message: 'Booking confirmed successfully'
  };
};

export const cancelBooking = async (doctorId, id, { reason }) => {
  const booking = await bookingsRepo.findById(id);
  if (!booking) {
    throw createHttpError(404, 'BOOKING_NOT_FOUND', 'Booking not found');
  }
  if (booking.doctorId !== doctorId) {
    throw createHttpError(403, 'FORBIDDEN', 'You can only cancel your own bookings');
  }
  if (booking.status === 'CANCELLED') {
    throw createHttpError(400, 'ALREADY_CANCELLED', 'Booking is already cancelled');
  }
  if (booking.status === 'COMPLETED') {
    throw createHttpError(400, 'CANNOT_CANCEL', 'Cannot cancel a completed booking');
  }

  const cancelledBooking = await bookingsRepo.updateBooking(id, {
    status: 'CANCELLED',
    cancelledAt: new Date(),
    cancellationReason: reason || 'Cancelled by doctor'
  });

  await bookingsRepo.createNotification({
    userId: booking.userId,
    type: 'BOOKING_CANCELLED',
    title: 'تم إلغاء الحجز',
    message: 'تم إلغاء حجزك من قبل الطبيب'
  });

  return {
    id: cancelledBooking.id,
    status: cancelledBooking.status,
    cancelledAt: cancelledBooking.cancelledAt,
    message: 'Booking cancelled successfully'
  };
};

export const completeBooking = async (doctorId, id, { notes, rating }) => {
  const booking = await bookingsRepo.findById(id);
  if (!booking || booking.doctorId !== doctorId) {
    throw createHttpError(404, 'BOOKING_NOT_FOUND', 'Booking not found');
  }

  return bookingsRepo.updateBooking(id, {
    status: 'COMPLETED',
    completedAt: new Date(),
    notes,
    rating: rating ? parseInt(rating) : undefined
  });
};
