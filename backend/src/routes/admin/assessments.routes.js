import express from 'express';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import { uploadAssessmentFiles } from '../../middleware/upload.middleware.js';
import * as assessmentCategoriesController from '../../controllers/admin/assessment-categories.controller.js';
import * as assessmentsController from '../../controllers/admin/assessments.controller.js';

const router = express.Router();

router.get('/categories', authenticateAdmin, assessmentCategoriesController.getAllCategories);
router.get('/categories/:id', authenticateAdmin, assessmentCategoriesController.getCategoryById);
router.post('/categories', authenticateAdmin, assessmentCategoriesController.createCategory);
router.put('/categories/:id', authenticateAdmin, assessmentCategoriesController.updateCategory);
router.delete('/categories/:id', authenticateAdmin, assessmentCategoriesController.deleteCategory);

router.get('/tests', authenticateAdmin, assessmentsController.getAllTests);
router.get('/tests/:id', authenticateAdmin, assessmentsController.getTestById);
router.post('/tests', authenticateAdmin, assessmentsController.createTest);
router.put('/tests/:id', authenticateAdmin, assessmentsController.updateTest);
router.delete('/tests/:id', authenticateAdmin, assessmentsController.deleteTest);

router.get('/tests/:testId/questions', authenticateAdmin, assessmentsController.getTestQuestions);
router.get('/questions/:id', authenticateAdmin, assessmentsController.getQuestionById);
router.post('/tests/:testId/questions', authenticateAdmin, uploadAssessmentFiles(), assessmentsController.createQuestion);
router.put('/questions/:id', authenticateAdmin, uploadAssessmentFiles(), assessmentsController.updateQuestion);
router.delete('/questions/:id', authenticateAdmin, assessmentsController.deleteQuestion);

export default router;
