import express from 'express';
import { body } from 'express-validator';
import { authenticateDoctor } from '../../middleware/auth.middleware.js';
import * as walletController from '../../controllers/doctor/wallet.controller.js';

const router = express.Router();

router.get('/', authenticateDoctor, walletController.getDoctorWallet);

router.post(
  '/withdraw',
  authenticateDoctor,
  body('amount').isFloat({ gt: 0 }).withMessage('amount must be greater than zero'),
  walletController.requestWithdrawal
);

export default router;
