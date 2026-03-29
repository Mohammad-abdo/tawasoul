import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import * as bulkController from '../../controllers/admin/bulk.controller.js';

const router = express.Router();

router.post('/users/approve', authenticateAdmin, bulkController.bulkApproveUsers);
router.post('/users/reject', authenticateAdmin, bulkController.bulkRejectUsers);
router.post('/users/activate', authenticateAdmin, bulkController.bulkApproveUsers);
router.post('/users/deactivate', authenticateAdmin, bulkController.bulkRejectUsers);
router.post('/doctors/approve', authenticateAdmin, bulkController.bulkApproveDoctors);
router.post('/doctors/reject', authenticateAdmin, bulkController.bulkRejectDoctors);
router.post('/bookings/cancel', authenticateAdmin, bulkController.bulkCancelBookings);
router.post('/orders/update-status', authenticateAdmin, bulkController.bulkUpdateOrderStatus);

export default router;
