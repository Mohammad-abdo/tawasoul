import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import * as bookingsController from '../../controllers/admin/bookings.controller.js';

const router = express.Router();

router.get('/', authenticateAdmin, bookingsController.getAllBookings);
router.get('/:id', authenticateAdmin, bookingsController.getBookingById);
router.put('/:id/status', authenticateAdmin, bookingsController.updateBookingStatus);
router.put('/:id/cancel', authenticateAdmin, bookingsController.cancelBooking);

export default router;
