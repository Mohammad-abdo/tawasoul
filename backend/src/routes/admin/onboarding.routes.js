import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import { uploadSingleImage } from '../../middleware/upload.middleware.js';
import * as onboardingController from '../../controllers/admin/onboarding.controller.js';

const router = express.Router();

router.get('/', authenticateAdmin, onboardingController.getAllOnboarding);
router.get('/:id', authenticateAdmin, onboardingController.getOnboardingById);
router.post('/', authenticateAdmin, uploadSingleImage('image'), onboardingController.createOnboarding);
router.put('/:id', authenticateAdmin, uploadSingleImage('image'), onboardingController.updateOnboarding);
router.delete('/:id', authenticateAdmin, onboardingController.deleteOnboarding);
router.post('/reorder', authenticateAdmin, onboardingController.reorderOnboarding);

export default router;
