import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import * as productsController from '../../controllers/admin/products.controller.js';

import { uploadMultipleImages } from '../../middleware/upload.middleware.js';

const router = express.Router();

router.get('/', authenticateAdmin, productsController.getAllProducts);
router.get('/categories', authenticateAdmin, productsController.getAllCategories);
router.get('/:id', authenticateAdmin, productsController.getProductById);
router.post('/', authenticateAdmin, uploadMultipleImages('images'), productsController.createProduct);
router.put('/:id', authenticateAdmin, uploadMultipleImages('images'), productsController.updateProduct);
router.delete('/:id', authenticateAdmin, productsController.deleteProduct);
router.put('/:id/activate', authenticateAdmin, productsController.activateProduct);
router.put('/:id/deactivate', authenticateAdmin, productsController.deactivateProduct);

export default router;
