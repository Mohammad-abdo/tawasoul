import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import { uploadSingleImage } from '../../middleware/upload.middleware.js';
import * as homeSlidersController from '../../controllers/admin/home-sliders.controller.js';

const router = express.Router();

router.get('/', authenticateAdmin, homeSlidersController.getAllHomeSliders);
router.get('/:id', authenticateAdmin, homeSlidersController.getHomeSliderById);
router.post('/', authenticateAdmin, uploadSingleImage('image'), homeSlidersController.createHomeSlider);
router.put('/:id', authenticateAdmin, uploadSingleImage('image'), homeSlidersController.updateHomeSlider);
router.delete('/:id', authenticateAdmin, homeSlidersController.deleteHomeSlider);
router.post('/reorder', authenticateAdmin, homeSlidersController.reorderHomeSliders);

export default router;
