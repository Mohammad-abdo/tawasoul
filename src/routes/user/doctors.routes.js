import express from 'express';
import { authenticateUser } from '../../middleware/auth.middleware.js';
import * as doctorsController from '../../controllers/user/doctors.controller.js';

const router = express.Router();

router.get('/', authenticateUser, doctorsController.getAllDoctors);
router.get('/:id/available-slots', authenticateUser, doctorsController.getDoctorAvailableSlots);
router.get('/:id', authenticateUser, doctorsController.getDoctorById);

export default router;
