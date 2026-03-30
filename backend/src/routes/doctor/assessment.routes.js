import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticateDoctor } from '../../middleware/auth.middleware.js';
import * as assessmentController from '../../controllers/doctor/assessment.controller.js';

const router = express.Router();

const HELP_SCORES = ['NOT_SUITABLE', 'NOT_PRESENT', 'INITIAL_ATTEMPTS', 'PARTIAL_LEVEL', 'SUCCESSFUL'];
const TEST_TYPES = ['CARS', 'ANALOGY', 'VISUAL_MEMORY', 'AUDITORY_MEMORY', 'VERBAL_NONSENSE', 'HELP', 'IMAGE_SEQUENCE_ORDER'];

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
  body('questionId').isString().trim().notEmpty().withMessage('questionId is required'),
  body('sessionId').isString().trim().notEmpty().withMessage('sessionId is required'),
  body('scoreGiven').isInt({ min: 0 }).withMessage('scoreGiven must be an integer greater than or equal to 0'),
  assessmentController.submitGenericAssessment
);

router.post(
  '/verbal-nonsense/submit',
  authenticateDoctor,
  body('childId').isString().trim().notEmpty().withMessage('childId is required'),
  body('testId').isString().trim().notEmpty().withMessage('testId is required'),
  body('sessionId').isString().trim().notEmpty().withMessage('sessionId is required'),
  body('answers').isArray({ min: 1 }).withMessage('answers must be a non-empty array'),
  body('answers.*.questionId').isString().trim().notEmpty().withMessage('each answer.questionId is required'),
  body('answers.*.isCorrect').isBoolean().withMessage('each answer.isCorrect must be a boolean'),
  body('answers.*.doctorNote').optional({ nullable: true }).isString().withMessage('each answer.doctorNote must be a string'),
  assessmentController.submitVerbalNonsenseAssessment
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
