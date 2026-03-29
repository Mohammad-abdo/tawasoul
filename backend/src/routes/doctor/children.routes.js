import express from 'express';
import { authenticateDoctor } from '../../middleware/auth.middleware.js';
import * as childrenController from '../../controllers/doctor/children.controller.js';

const router = express.Router();

router.get('/', authenticateDoctor, childrenController.getMyChildren);
router.get('/:childId', authenticateDoctor, childrenController.getChildDetails);

export default router;
