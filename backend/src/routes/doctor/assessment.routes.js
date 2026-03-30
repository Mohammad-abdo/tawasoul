import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticateDoctor } from '../../middleware/auth.middleware.js';
import * as assessmentController from '../../controllers/doctor/assessment.controller.js';

const router = express.Router();

const HELP_SCORES = ['NOT_SUITABLE', 'NOT_PRESENT', 'INITIAL_ATTEMPTS', 'PARTIAL_LEVEL', 'SUCCESSFUL'];
const TEST_TYPES = ['CARS', 'ANALOGY', 'VISUAL_MEMORY', 'AUDITORY_MEMORY', 'HELP', 'IMAGE_SEQUENCE_ORDER'];

const requiredParam = (name, label) =>
  param(name)
    .isString()
    .trim()
    .notEmpty()
    .withMessage(`${label} is required`);

router.get(
  '/tests',
  authenticateDoctor,
  query('testType').optional().isIn(TEST_TYPES).withMessage(`testType must be one of: ${TEST_TYPES.join(', ')}`),
  assessmentController.getTests
);
router.get(
  '/tests/:testId',
  authenticateDoctor,
  requiredParam('testId', 'testId'),
  assessmentController.getTestById
);
router.get(
  '/tests/:testId/questions',
  authenticateDoctor,
  requiredParam('testId', 'testId'),
  assessmentController.getTestQuestions
);

router.get(
  '/children/:childId/results',
  authenticateDoctor,
  requiredParam('childId', 'childId'),
  assessmentController.getAssessmentResultsByChild
);

router.get(
  '/children/:childId/results/:sessionId',
  authenticateDoctor,
  requiredParam('childId', 'childId'),
  requiredParam('sessionId', 'sessionId'),
  assessmentController.getAssessmentSessionDetail
);

router.post(
  '/generic/submit',
  authenticateDoctor,
  body('childId').isString().trim().notEmpty().withMessage('childId is required'),
  body('testId').isString().trim().notEmpty().withMessage('testId is required'),
  body('sessionId').isString().trim().notEmpty().withMessage('sessionId is required'),
  body('answers').isArray({ min: 1 }).withMessage('answers must be a non-empty array'),
  body('answers.*.questionId').isString().trim().notEmpty(),
  body('answers.*.scoreGiven').isFloat({ min: 0 }).withMessage('scoreGiven must be a number'),
  assessmentController.submitGenericAssessment
);

// ضيف ده في assessment.routes.js
router.post(
  '/cars/submit',
  authenticateDoctor,
  body('childId').isString().trim().notEmpty().withMessage('childId is required'),
  body('testId').isString().trim().notEmpty().withMessage('testId is required'),
  body('sessionId').isString().trim().notEmpty().withMessage('sessionId is required'),
  // كارز لازم يكون 15 سؤال بالظبط
  body('answers').isArray({ min: 15, max: 15 }).withMessage('اختبار كارز يتطلب 15 إجابة بالضبط'),
  body('answers.*.questionId').isString().trim().notEmpty(),
  // درجات كارز بتكون من 1 لـ 4 (وممكن أنصاص)
  body('answers.*.scoreGiven').isFloat({ min: 1, max: 4 }).withMessage('الدرجة يجب أن تكون بين 1 و 4'),
  assessmentController.submitCarsAssessment
);

router.post(
  '/help/start',
  authenticateDoctor,
  body('childId').isString().trim().notEmpty().withMessage('childId is required'),
  body('sessionId').isString().trim().notEmpty().withMessage('sessionId is required'),
  body('developmentalAge').isString().trim().notEmpty().withMessage('developmentalAge is required'),
  assessmentController.startHelpAssessment
);

router.post(
  '/help/:helpAssessmentId/evaluate',
  authenticateDoctor,
  requiredParam('helpAssessmentId', 'helpAssessmentId'),
  body('skillId').isString().trim().notEmpty().withMessage('skillId is required'),
  body('score').isIn(HELP_SCORES).withMessage(`score must be one of: ${HELP_SCORES.join(', ')}`),
  body('doctorNotes').optional({ nullable: true }).isString().withMessage('doctorNotes must be a string'),
  assessmentController.evaluateHelpAssessment
);

router.get(
  '/help/:helpAssessmentId',
  authenticateDoctor,
  requiredParam('helpAssessmentId', 'helpAssessmentId'),
  assessmentController.getHelpAssessment
);

router.patch(
  '/help/:helpAssessmentId',
  authenticateDoctor,
  requiredParam('helpAssessmentId', 'helpAssessmentId'),
  body('developmentalAge').isString().trim().notEmpty().withMessage('developmentalAge is required'),
  assessmentController.updateHelpAssessment
);

export default router;
