import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import { uploadSingleImage } from '../../middleware/upload.middleware.js';
import * as homeServicesController from '../../controllers/admin/home-services.controller.js';

const router = express.Router();

router.get('/', authenticateAdmin, homeServicesController.getAllHomeServices);
router.get('/:id', authenticateAdmin, homeServicesController.getHomeServiceById);
router.post('/', authenticateAdmin, uploadSingleImage('image'), homeServicesController.createHomeService);
router.put('/:id', authenticateAdmin, uploadSingleImage('image'), homeServicesController.updateHomeService);
router.delete('/:id', authenticateAdmin, homeServicesController.deleteHomeService);

export default router;
