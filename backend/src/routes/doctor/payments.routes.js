import express from 'express';
import { authenticateDoctor } from '../../middleware/auth.middleware.js';
import * as paymentsController from '../../controllers/doctor/payments.controller.js';

const router = express.Router();

router.get('/payments', authenticateDoctor, paymentsController.getDoctorPayments);
router.get('/earnings', authenticateDoctor, paymentsController.getDoctorEarnings);

export default router;
