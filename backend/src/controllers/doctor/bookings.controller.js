import { logger } from '../../utils/logger.js';
import * as bookingsService from '../../services/doctor/bookings.service.js';

const handleServiceError = (res, error) => {
  if (!error.status) {
    return false;
  }

  res.status(error.status).json({
    success: false,
    error: {
      code: error.code,
      message: error.message
    }
  });
  return true;
};

export const getDoctorBookings = async (req, res, next) => {
  try {
    const data = await bookingsService.getDoctorBookings(req.doctor.id, req.query);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Get doctor bookings error:', error);
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const data = await bookingsService.getBookingById(req.doctor.id, req.params.id);
    logger.info(`Sending booking details for ${req.params.id}. VideoLink: ${data.videoLink}`);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Get booking error:', error);
    next(error);
  }
};

export const confirmBooking = async (req, res, next) => {
  try {
    const data = await bookingsService.confirmBooking(req.doctor.id, req.params.id);
    logger.info(`Booking confirmed: ${req.params.id} by doctor ${req.doctor.id}`);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Confirm booking error:', error);
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const data = await bookingsService.cancelBooking(req.doctor.id, req.params.id, req.body);
    logger.info(`Booking cancelled: ${req.params.id} by doctor ${req.doctor.id}`);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Cancel booking error:', error);
    next(error);
  }
};

export const completeBooking = async (req, res, next) => {
  try {
    const data = await bookingsService.completeBooking(req.doctor.id, req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }
    logger.error('Complete booking error:', error);
    next(error);
  }
};
