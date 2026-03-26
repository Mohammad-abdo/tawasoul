import express from 'express';
import { authenticateUser } from '../../middleware/auth.middleware.js';
import * as ordersController from '../../controllers/user/orders.controller.js';

const router = express.Router();

router.get('/', authenticateUser, ordersController.getUserOrders);
router.get('/:id', authenticateUser, ordersController.getOrderById);
router.post('/', authenticateUser, ordersController.createOrder);
router.put('/:id/cancel', authenticateUser, ordersController.cancelOrder);

export default router;
