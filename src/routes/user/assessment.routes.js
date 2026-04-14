import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticateUser } from '../../middleware/auth.middleware.js';
import * as assessmentController from '../../controllers/user/assessment.controller.js';

const router = express.Router();

const TEST_TYPES = [
  'CARS',
  'ANALOGY',
  'VISUAL_MEMORY',
  'AUDITORY_MEMORY',
  'VERBAL_NONSENSE',
  'HELP',
  'IMAGE_SEQUENCE_ORDER'
];

const requiredParam = (name, label) =>
  param(name)
    .isString()
    .trim()
    .notEmpty()
    .withMessage(`${label} is required`);

const submitBaseValidators = [
  body('childId').isString().trim().notEmpty().withMessage('childId is required'),
  body('testId').isString().trim().notEmpty().withMessage('testId is required'),
  body('sessionId').isString().trim().notEmpty().withMessage('sessionId is required'),
  body('answers').isArray({ min: 1 }).withMessage('answers must be a non-empty array'),
  body('answers.*.questionId').isString().trim().notEmpty().withMessage('each answer.questionId is required')
];

router.get(
  '/tests',
  query('testType').optional().isIn(TEST_TYPES).withMessage(`testType must be one of: ${TEST_TYPES.join(', ')}`),
  assessmentController.getTests
);
router.get('/tests/:testId', requiredParam('testId', 'testId'), assessmentController.getTestById);

router.post(
  '/cars/submit',
  authenticateUser,
  submitBaseValidators,
  body('answers.*.chosenIndex').isInt({ min: 0 }).withMessage('each answer.chosenIndex must be an integer greater than or equal to 0'),
  assessmentController.submitCarsAssessment
);

router.post(
  '/analogy/submit',
  authenticateUser,
  submitBaseValidators,
  body('answers.*.chosenIndex').isInt({ min: 0 }).withMessage('each answer.chosenIndex must be an integer greater than or equal to 0'),
  assessmentController.submitAnalogyAssessment
);

router.post(
  '/visual-memory/submit',
  authenticateUser,
  submitBaseValidators,
  body('answers').custom((answers) => {
    for (const answer of answers) {
      if (answer.answerBool === undefined && answer.chosenIndex === undefined) {
        throw new Error('each visual memory answer must include either answerBool or chosenIndex');
      }
    }
    return true;
  }),
  body('answers.*.chosenIndex').optional().isInt({ min: 0 }).withMessage('each answer.chosenIndex must be an integer greater than or equal to 0'),
  body('answers.*.answerBool').optional().isBoolean().withMessage('each answer.answerBool must be a boolean'),
  assessmentController.submitVisualMemoryAssessment
);

router.post(
  '/auditory-memory/submit',
  authenticateUser,
  submitBaseValidators,
  body('answers.*.recalledItems').isArray().withMessage('each answer.recalledItems must be an array'),
  body('answers.*.recalledItems.*').optional().isString().withMessage('each recalled item must be a string'),
  assessmentController.submitAuditoryMemoryAssessment
);

router.post(
  '/image-sequence-order/submit',
  authenticateUser,
  submitBaseValidators,
  body('answers.*.submittedOrder').isArray({ min: 1 }).withMessage('each answer.submittedOrder must be a non-empty array'),
  body('answers.*.submittedOrder.*.imageId').isString().trim().notEmpty().withMessage('each submittedOrder.imageId is required'),
  body('answers.*.submittedOrder.*.submittedPosition').isInt({ min: 1 }).withMessage('each submittedOrder.submittedPosition must be an integer greater than or equal to 1'),
  assessmentController.submitImageSequenceOrderAssessment
);

router.get('/results/:childId', authenticateUser, requiredParam('childId', 'childId'), assessmentController.getAssessmentResultsByChild);
router.get(
  '/results/:childId/:sessionId',
  authenticateUser,
  requiredParam('childId', 'childId'),
  requiredParam('sessionId', 'sessionId'),
  assessmentController.getAssessmentSessionDetail
);

router.get(
  '/results/:childId/:sessionId/pdf',
  authenticateUser,
  requiredParam('childId', 'childId'),
  requiredParam('sessionId', 'sessionId'),
  assessmentController.downloadAssessmentSessionPdf
);

export default router;
