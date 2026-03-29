import express from 'express';
import { authenticateDoctor } from '../../middleware/auth.middleware.js';
import * as withdrawalsController from '../../controllers/doctor/withdrawals.controller.js';

const router = express.Router();

router.get('/', authenticateDoctor, withdrawalsController.getDoctorWithdrawals);
router.post('/', authenticateDoctor, withdrawalsController.requestWithdrawal);

export default router;
