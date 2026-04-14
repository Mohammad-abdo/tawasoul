import express from 'express';
import { authenticateUser } from '../../middleware/auth.middleware.js';
import * as productsController from '../../controllers/user/products.controller.js';

const router = express.Router();

router.get('/', productsController.getProducts);
router.get('/:id', productsController.getProductById);
router.post('/:id/reviews', authenticateUser, productsController.addProductReview);

export default router;
