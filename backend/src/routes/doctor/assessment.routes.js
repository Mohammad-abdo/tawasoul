import express from 'express';
import { authenticateDoctor } from '../../middleware/auth.middleware.js';
import * as assessmentController from '../../controllers/user/assessment.controller.js';

const router = express.Router();

router.get('/tests', authenticateDoctor, assessmentController.getTests);
router.get('/tests/:testId/questions', authenticateDoctor, assessmentController.getTestQuestions);
router.post('/submit-result', authenticateDoctor, assessmentController.submitAssessmentResult);

export default router;
