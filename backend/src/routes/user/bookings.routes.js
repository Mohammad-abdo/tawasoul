import express from 'express';
import { authenticateUser } from '../../middleware/auth.middleware.js';
import * as bookingsController from '../../controllers/user/bookings.controller.js';

const router = express.Router();

router.get('/', authenticateUser, bookingsController.getUserBookings);
router.post('/', authenticateUser, bookingsController.createBooking);
router.get('/:id', authenticateUser, bookingsController.getBookingById);
router.put('/:id/cancel', authenticateUser, bookingsController.cancelBooking);
router.put('/:id/reschedule', authenticateUser, bookingsController.rescheduleBooking);

export default router;
