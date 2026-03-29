import express from 'express';
import { authenticateDoctor } from '../../middleware/auth.middleware.js';
import * as availabilityController from '../../controllers/doctor/availability.controller.js';

const router = express.Router();

router.get('/', authenticateDoctor, availabilityController.getAvailability);
router.put('/', authenticateDoctor, availabilityController.updateAvailability);

export default router;
