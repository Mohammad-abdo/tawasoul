import express from 'express';
import { authenticateUser } from '../../middleware/auth.middleware.js';
import * as cartController from '../../controllers/user/cart.controller.js';

const router = express.Router();

router.get('/', authenticateUser, cartController.getCart);
router.post('/', authenticateUser, cartController.addToCart);
router.put('/:id', authenticateUser, cartController.updateCartItem);
router.delete('/:id', authenticateUser, cartController.removeFromCart);
router.delete('/', authenticateUser, cartController.clearCart);

export default router;
