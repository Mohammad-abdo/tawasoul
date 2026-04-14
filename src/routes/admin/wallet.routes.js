import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import * as walletController from '../../controllers/admin/wallet.controller.js';

const router = express.Router();

router.get(
  '/withdrawal-requests',
  authenticateAdmin,
  query('status').optional().isIn(['PENDING', 'APPROVED', 'REJECTED']).withMessage('status must be PENDING, APPROVED, or REJECTED'),
  walletController.getWithdrawalRequests
);

router.patch(
  '/withdrawal-requests/:id/resolve',
  authenticateAdmin,
  param('id').isString().trim().notEmpty().withMessage('id is required'),
  body('status').isIn(['APPROVED', 'REJECTED']).withMessage('status must be APPROVED or REJECTED'),
  walletController.resolveWithdrawalRequest
);

export default router;
