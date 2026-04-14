import { logger } from '../../utils/logger.js';
import * as bookingsService from '../../services/user/bookings.service.js';

const handleError = (error, res, next, context) => {
  if (error.status) {
    return res.status(error.status).json({
      success: false,
      error: { code: error.code, message: error.message }
    });
  }
  logger.error(`${context} error:`, error);
  next(error);
};

export const getUserBookings = async (req, res, next) => {
  try {
    const data = await bookingsService.getUserBookings(req.user.id, req.query);
    res.json({ success: true, data });
  } catch (error) {
    handleError(error, res, next, 'Get bookings');
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const data = await bookingsService.createBooking(req.user.id, req.body);
    logger.info(`Booking created by user ${req.user.id}`);
    res.status(201).json({ success: true, data });
  } catch (error) {
    handleError(error, res, next, 'Create booking');
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const data = await bookingsService.getBookingById(req.user.id, req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    handleError(error, res, next, 'Get booking');
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const data = await bookingsService.cancelBooking(req.user.id, req.params.id, req.body.reason);
    logger.info(`Booking cancelled: ${req.params.id} by user ${req.user.id}`);
    res.json({ success: true, data });
  } catch (error) {
    handleError(error, res, next, 'Cancel booking');
  }
};

export const rescheduleBooking = async (req, res, next) => {
  try {
    const data = await bookingsService.rescheduleBooking(req.user.id, req.params.id, req.body);
    logger.info(`Booking rescheduled: ${req.params.id} by user ${req.user.id}`);
    res.json({ success: true, data });
  } catch (error) {
    handleError(error, res, next, 'Reschedule booking');
  }
};
