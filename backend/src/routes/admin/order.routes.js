import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import * as ordersController from '../../controllers/admin/orders.controller.js';

const router = express.Router();

router.get('/', authenticateAdmin, ordersController.getAllOrders);
router.get('/:id', authenticateAdmin, ordersController.getOrderById);
router.put('/:id/status', authenticateAdmin, ordersController.updateOrderStatus);
router.put('/:id/cancel', authenticateAdmin, ordersController.cancelOrder);

export default router;
