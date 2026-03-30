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
// هنعرف المتغير ده فوق جنب الروتس لو مش موجود
const submitBaseValidators = [
  body('childId').isString().trim().notEmpty().withMessage('childId is required'),
  body('testId').isString().trim().notEmpty().withMessage('testId is required'),
  body('sessionId').isString().trim().notEmpty().withMessage('sessionId is required'),
  body('answers').isArray({ min: 1 }).withMessage('answers must be a non-empty array'),
  body('answers.*.questionId').isString().trim().notEmpty().withMessage('each answer.questionId is required')
];

// ==========================================
// ضيف الراوتس دي
// ==========================================

router.post(
  '/analogy/submit',
  authenticateDoctor,
  submitBaseValidators,
  body('answers.*.chosenIndex').isInt({ min: 0 }).withMessage('each answer.chosenIndex must be an integer greater than or equal to 0'),
  assessmentController.submitAnalogyAssessment
);

router.post(
  '/visual-memory/submit',
  authenticateDoctor,
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
  authenticateDoctor,
  submitBaseValidators,
  body('answers.*.recalledItems').isArray().withMessage('each answer.recalledItems must be an array'),
  body('answers.*.recalledItems.*').optional().isString().withMessage('each recalled item must be a string'),
  assessmentController.submitAuditoryMemoryAssessment
);

router.post(
  '/image-sequence-order/submit',
  authenticateDoctor,
  submitBaseValidators,
  body('answers.*.submittedOrder').isArray({ min: 1 }).withMessage('each answer.submittedOrder must be a non-empty array'),
  body('answers.*.submittedOrder.*.imageId').isString().trim().notEmpty().withMessage('each submittedOrder.imageId is required'),
  body('answers.*.submittedOrder.*.submittedPosition').isInt({ min: 1 }).withMessage('each submittedOrder.submittedPosition must be an integer greater than or equal to 1'),
  assessmentController.submitImageSequenceOrderAssessment
);

export default router;
