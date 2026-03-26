import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import * as paymentsController from '../../controllers/admin/payments.controller.js';
import * as withdrawalsController from '../../controllers/admin/withdrawals.controller.js';

const router = express.Router();

router.get('/payments', authenticateAdmin, paymentsController.getAllPayments);
router.put('/payments/:id/status', authenticateAdmin, paymentsController.updatePaymentStatus);

router.get('/withdrawals', authenticateAdmin, withdrawalsController.getAllWithdrawals);
router.get('/withdrawals/:id', authenticateAdmin, withdrawalsController.getWithdrawalById);
router.put('/withdrawals/:id/approve', authenticateAdmin, withdrawalsController.approveWithdrawal);
router.put('/withdrawals/:id/reject', authenticateAdmin, withdrawalsController.rejectWithdrawal);

export default router;
