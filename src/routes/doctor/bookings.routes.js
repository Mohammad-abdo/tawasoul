import express from 'express';
import { authenticateDoctor } from '../../middleware/auth.middleware.js';
import * as bookingsController from '../../controllers/doctor/bookings.controller.js';

const router = express.Router();

router.get('/', authenticateDoctor, bookingsController.getDoctorBookings);
router.get('/:id', authenticateDoctor, bookingsController.getBookingById);
router.put('/:id/confirm', authenticateDoctor, bookingsController.confirmBooking);
router.put('/:id/cancel', authenticateDoctor, bookingsController.cancelBooking);
router.put('/:id/complete', authenticateDoctor, bookingsController.completeBooking);

export default router;
