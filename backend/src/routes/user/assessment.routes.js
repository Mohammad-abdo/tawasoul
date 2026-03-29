import express from 'express';
import { authenticateUser } from '../../middleware/auth.middleware.js';
import * as assessmentController from '../../controllers/user/assessment.controller.js';

const router = express.Router();

router.get('/tests', assessmentController.getTests);
router.get('/tests/:testId/questions', assessmentController.getTestQuestions);
router.post('/submit-result', authenticateUser, assessmentController.submitAssessmentResult);

export default router;
