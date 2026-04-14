import express from 'express';
import { authenticateUser } from '../../middleware/auth.middleware.js';
import * as maharaActivitiesController from '../../controllers/user/mahara-activities.controller.js';

const router = express.Router();

router.get('/current', authenticateUser, maharaActivitiesController.getCurrentActivity);
router.post('/submit', authenticateUser, maharaActivitiesController.submitActivityInteraction);

export default router;
