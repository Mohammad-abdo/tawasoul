import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticateDoctor } from '../../middleware/auth.middleware.js';
import * as assessmentController from '../../controllers/doctor/assessment.controller.js';
import * as vbmappController from '../../controllers/doctor/vbmapp.controller.js';

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

router.get(
  '/children/:childId/results/:sessionId/pdf',
  authenticateDoctor,
  requiredParam('childId', 'childId'),
  requiredParam('sessionId', 'sessionId'),
  assessmentController.downloadAssessmentSessionPdf
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
  '/help/submit',
  authenticateDoctor,
  body('childId').isString().trim().notEmpty().withMessage('childId is required'),
  body('testId').isString().trim().notEmpty().withMessage('testId is required'),
  body('sessionId').isString().trim().notEmpty().withMessage('sessionId is required'),
  body('developmentalAge').isString().trim().notEmpty().withMessage('developmentalAge is required'),
  body('answers').isArray({ min: 1 }).withMessage('answers must be a non-empty array'),
  body('answers.*.skillId').isString().trim().notEmpty().withMessage('each answer.skillId is required'),
  body('answers.*.score').isIn(HELP_SCORES).withMessage(`each answer.score must be one of: ${HELP_SCORES.join(', ')}`),
  body('answers.*.doctorNotes').optional({ nullable: true }).isString().withMessage('each answer.doctorNotes must be a string'),
  assessmentController.submitHelpAssessment
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

// ==========================================
// VB-MAPP Routes
// ==========================================

router.get(
  '/vbmapp/reports/monthly',
  authenticateDoctor,
  query('childId').isString().trim().notEmpty(),
  query('month').isInt({ min: 1, max: 12 }),
  query('year').isInt({ min: 1900 }),
  vbmappController.getMonthlyReport
);

router.get(
  '/vbmapp/skill-areas',
  authenticateDoctor,
  vbmappController.getVbMappSkillAreas
);

router.get(
  '/vbmapp/barriers',
  authenticateDoctor,
  vbmappController.getVbMappBarriers
);

router.get(
  '/vbmapp/transition-criteria',
  authenticateDoctor,
  vbmappController.getVbMappTransitionCriteria
);

router.get(
  '/vbmapp/eesa-groups',
  authenticateDoctor,
  vbmappController.getVbMappEesaGroups
);

router.post(
  '/vbmapp/sessions',
  authenticateDoctor,
  body('childId').isString().trim().notEmpty().withMessage('childId is required'),
  body('sessionNumber').isIn(['FIRST', 'SECOND', 'THIRD', 'FOURTH']).withMessage('sessionNumber must be FIRST, SECOND, THIRD, or FOURTH'),
  body('assessmentDate').isISO8601().withMessage('assessmentDate is required'),
  body('bookingId').optional().isString(),
  body('colorCode').optional().isString(),
  body('notes').optional().isString(),
  vbmappController.createVbMappSession
);

router.get(
  '/vbmapp/sessions/:sessionId',
  authenticateDoctor,
  param('sessionId').isString().trim().notEmpty(),
  vbmappController.getVbMappSession
);

router.get(
  '/vbmapp/children/:childId/sessions',
  authenticateDoctor,
  param('childId').isString().trim().notEmpty(),
  vbmappController.getChildVbMappSessions
);

router.patch(
  '/vbmapp/sessions/:sessionId',
  authenticateDoctor,
  param('sessionId').isString().trim().notEmpty(),
  body('assessmentDate').optional().isISO8601(),
  body('colorCode').optional().isString(),
  body('notes').optional().isString(),
  vbmappController.updateVbMappSession
);

router.post(
  '/vbmapp/sessions/:sessionId/milestones',
  authenticateDoctor,
  param('sessionId').isString().trim().notEmpty(),
  body('scores').isArray({ min: 1 }).withMessage('scores is required'),
  body('scores.*.milestoneId').isInt().withMessage('milestoneId is required'),
  body('scores.*.score').isIn(['ACHIEVED', 'PARTIAL', 'NOT_ACHIEVED', 'NOT_TESTED']).withMessage('score must be ACHIEVED, PARTIAL, NOT_ACHIEVED, or NOT_TESTED'),
  body('scores.*.notes').optional().isString(),
  vbmappController.submitMilestoneScores
);

router.post(
  '/vbmapp/sessions/:sessionId/task-steps',
  authenticateDoctor,
  param('sessionId').isString().trim().notEmpty(),
  body('scores').isArray({ min: 1 }).withMessage('scores is required'),
  body('scores.*.stepId').isInt().withMessage('stepId is required'),
  body('scores.*.isAchieved').isBoolean().withMessage('isAchieved is required'),
  body('scores.*.notes').optional().isString(),
  vbmappController.submitTaskStepScores
);

router.post(
  '/vbmapp/sessions/:sessionId/barriers',
  authenticateDoctor,
  param('sessionId').isString().trim().notEmpty(),
  body('scores').isArray({ min: 1 }).withMessage('scores is required'),
  body('scores.*.barrierId').isInt().withMessage('barrierId is required'),
  body('scores.*.score').isIn(['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR']).withMessage('score must be ZERO, ONE, TWO, THREE, or FOUR'),
  vbmappController.submitBarrierScores
);

router.post(
  '/vbmapp/sessions/:sessionId/transitions',
  authenticateDoctor,
  param('sessionId').isString().trim().notEmpty(),
  body('scores').isArray({ min: 1 }).withMessage('scores is required'),
  body('scores.*.criteriaId').isInt().withMessage('criteriaId is required'),
  body('scores.*.score').isIn(['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE']).withMessage('score must be ONE, TWO, THREE, FOUR, or FIVE'),
  vbmappController.submitTransitionScores
);

router.post(
  '/vbmapp/sessions/:sessionId/eesa',
  authenticateDoctor,
  param('sessionId').isString().trim().notEmpty(),
  body('scores').isArray({ min: 1 }).withMessage('scores is required'),
  body('scores.*.itemId').isInt().withMessage('itemId is required'),
  body('scores.*.score').isIn(['ACHIEVED', 'PARTIAL', 'NOT_ACHIEVED', 'NOT_TESTED']).withMessage('score must be ACHIEVED, PARTIAL, NOT_ACHIEVED, or NOT_TESTED'),
  vbmappController.submitEesaScores
);

router.post(
  '/vbmapp/sessions/:sessionId/iep-goals',
  authenticateDoctor,
  param('sessionId').isString().trim().notEmpty(),
  body('milestoneId').optional().isInt(),
  body('targetDate').isISO8601().withMessage('targetDate is required'),
  body('description').isString().trim().notEmpty(),
  vbmappController.createIepGoal
);

router.patch(
  '/vbmapp/iep-goals/:goalId',
  authenticateDoctor,
  param('goalId').isString().trim().notEmpty(),
  body('status').optional().isIn(['ACTIVE', 'ACHIEVED', 'DISCONTINUED']),
  body('achievedDate').optional().isISO8601(),
  body('notes').optional().isString(),
  vbmappController.updateIepGoal
);

router.get(
  '/vbmapp/children/:childId/summary',
  authenticateDoctor,
  param('childId').isString().trim().notEmpty(),
  vbmappController.getVbMappSummary
);

export default router;
