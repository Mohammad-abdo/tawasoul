import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticateAdmin } from '../../middleware/auth.middleware.js';
import {
  uploadAssessmentImageSingle,
  uploadAssessmentAudioSingle
} from '../../middleware/upload.middleware.js';
import * as assessmentsController from '../../controllers/admin/assessments.controller.js';

const router = express.Router();

const TEST_MODALITIES = ['AUDITORY', 'VISUAL'];
const TEST_TYPES = [
  'CARS',
  'ANALOGY',
  'VISUAL_MEMORY',
  'AUDITORY_MEMORY',
  'VERBAL_NONSENSE',
  'HELP',
  'IMAGE_SEQUENCE_ORDER',
  'VB_MAPP'
];
const HELP_DOMAINS = ['COGNITIVE', 'FINE_MOTOR', 'GROSS_MOTOR', 'SOCIAL'];
const VISUAL_MEMORY_TYPES = ['YES_NO', 'MCQ'];

const requiredIdParam = (name, label) =>
  param(name)
    .isString()
    .trim()
    .notEmpty()
    .withMessage(`${label} is required`);

const testBodyValidators = [
  body('title').isString().trim().notEmpty().withMessage('title is required'),
  body('titleAr').isString().trim().notEmpty().withMessage('titleAr is required'),
  body('type').isIn(TEST_MODALITIES).withMessage(`type must be one of: ${TEST_MODALITIES.join(', ')}`),
  body('testType').isIn(TEST_TYPES).withMessage(`testType must be one of: ${TEST_TYPES.join(', ')}`),
  body('description').optional({ nullable: true }).isString().withMessage('description must be a string')
];

const patchTestBodyValidators = [
  body('title').optional().isString().trim().notEmpty().withMessage('title must be a non-empty string'),
  body('titleAr').optional().isString().trim().notEmpty().withMessage('titleAr must be a non-empty string'),
  body('type').optional().isIn(TEST_MODALITIES).withMessage(`type must be one of: ${TEST_MODALITIES.join(', ')}`),
  body('testType').optional().isIn(TEST_TYPES).withMessage(`testType must be one of: ${TEST_TYPES.join(', ')}`),
  body('description').optional({ nullable: true }).isString().withMessage('description must be a string')
];

const carsQuestionValidators = [
  body('order').isInt({ min: 1 }).withMessage('order must be an integer greater than or equal to 1'),
  body('questionText').isObject().withMessage('questionText must be an object'),
  body('questionText.ar').isString().trim().notEmpty().withMessage('questionText.ar is required'),
  body('questionText.en').isString().trim().notEmpty().withMessage('questionText.en is required'),
  body('choices').isArray({ min: 4, max: 4 }).withMessage('choices must be an array of exactly 4 items'),
  body('choices.*.score').isInt({ min: 1, max: 4 }).withMessage('each choice score must be an integer between 1 and 4'),
  body('choices.*.ar').isString().trim().notEmpty().withMessage('each choice ar value is required'),
  body('choices.*.en').isString().trim().notEmpty().withMessage('each choice en value is required'),
  body('choices').custom((choices) => {
    const scores = choices.map((choice) => choice.score);
    if (new Set(scores).size !== scores.length) {
      throw new Error('choice scores must be unique within the array');
    }
    return true;
  })
];

const patchCarsQuestionValidators = [
  body('order').optional().isInt({ min: 1 }).withMessage('order must be an integer greater than or equal to 1'),
  body('questionText').optional().isObject().withMessage('questionText must be an object'),
  body('questionText.ar').optional().isString().trim().notEmpty().withMessage('questionText.ar must be a non-empty string'),
  body('questionText.en').optional().isString().trim().notEmpty().withMessage('questionText.en must be a non-empty string'),
  body('choices').optional().isArray({ min: 4, max: 4 }).withMessage('choices must be an array of exactly 4 items'),
  body('choices.*.score').optional().isInt({ min: 1, max: 4 }).withMessage('each choice score must be an integer between 1 and 4'),
  body('choices.*.ar').optional().isString().trim().notEmpty().withMessage('each choice ar value is required'),
  body('choices.*.en').optional().isString().trim().notEmpty().withMessage('each choice en value is required'),
  body().custom((value) => {
    if (value.order === undefined && value.questionText === undefined && value.choices === undefined) {
      throw new Error('At least one of order, questionText, or choices must be provided');
    }

    if (Array.isArray(value.choices)) {
      const scores = value.choices.map((choice) => choice.score);
      if (new Set(scores).size !== scores.length) {
        throw new Error('choice scores must be unique within the array');
      }
    }

    return true;
  })
];

const analogyQuestionValidators = [
  body('order').isInt({ min: 1 }).withMessage('order must be an integer greater than or equal to 1'),
  body('questionImageUrl').isString().trim().notEmpty().withMessage('questionImageUrl is required'),
  body('choices').isArray({ min: 2 }).withMessage('choices must be an array with at least 2 items'),
  body('choices.*.imagePath').isString().trim().notEmpty().withMessage('each choice.imagePath is required'),
  body('correctIndex').isInt({ min: 0 }).withMessage('correctIndex must be an integer greater than or equal to 0'),
  body('correctIndex').custom((correctIndex, { req }) => {
    if (!Array.isArray(req.body.choices) || correctIndex >= req.body.choices.length) {
      throw new Error('correctIndex must be within choices bounds');
    }
    return true;
  })
];

const patchAnalogyQuestionValidators = [
  body('order').optional().isInt({ min: 1 }).withMessage('order must be an integer greater than or equal to 1'),
  body('questionImageUrl').optional().isString().trim().notEmpty().withMessage('questionImageUrl must be a non-empty string'),
  body('choices').optional().isArray({ min: 2 }).withMessage('choices must be an array with at least 2 items'),
  body('choices.*.imagePath').optional().isString().trim().notEmpty().withMessage('each choice.imagePath is required'),
  body('correctIndex').optional().isInt({ min: 0 }).withMessage('correctIndex must be an integer greater than or equal to 0'),
  body().custom((value) => {
    if (value.order === undefined && value.questionImageUrl === undefined && value.choices === undefined && value.correctIndex === undefined) {
      throw new Error('At least one of order, questionImageUrl, choices, or correctIndex must be provided');
    }

    if (value.correctIndex !== undefined) {
      const choices = value.choices;
      if (Array.isArray(choices) && value.correctIndex >= choices.length) {
        throw new Error('correctIndex must be within choices bounds');
      }
    }

    return true;
  })
];

const visualMemoryBatchValidators = [
  body('order').isInt({ min: 1 }).withMessage('order must be an integer greater than or equal to 1'),
  body('imageUrl').isString().trim().notEmpty().withMessage('imageUrl is required'),
  body('displaySeconds').isInt({ min: 1 }).withMessage('displaySeconds must be an integer greater than or equal to 1'),
  body('questions').isArray({ min: 1 }).withMessage('questions must be a non-empty array'),
  body('questions').custom((questions) => {
    for (const question of questions) {
      if (!Number.isInteger(question.order) || question.order < 1) {
        throw new Error('each visual memory question order must be an integer greater than or equal to 1');
      }
      if (!question.questionText || typeof question.questionText !== 'object') {
        throw new Error('each visual memory question must include questionText');
      }
      if (typeof question.questionText.ar !== 'string' || !question.questionText.ar.trim()) {
        throw new Error('each visual memory question requires questionText.ar');
      }
      if (typeof question.questionText.en !== 'string' || !question.questionText.en.trim()) {
        throw new Error('each visual memory question requires questionText.en');
      }
      if (!VISUAL_MEMORY_TYPES.includes(question.questionType)) {
        throw new Error(`questionType must be one of: ${VISUAL_MEMORY_TYPES.join(', ')}`);
      }
      if (question.questionType === 'YES_NO') {
        if (typeof question.correctBool !== 'boolean') {
          throw new Error('YES_NO questions require correctBool as a boolean');
        }
      }
      if (question.questionType === 'MCQ') {
        if (!Array.isArray(question.choices) || question.choices.length === 0) {
          throw new Error('MCQ questions require a non-empty choices array');
        }
        if (question.choices.some((choice) => typeof choice?.text !== 'string' || !choice.text.trim())) {
          throw new Error('each MCQ choice must include a non-empty text field');
        }
        if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex >= question.choices.length) {
          throw new Error('MCQ questions require correctIndex within choices bounds');
        }
      }
    }
    return true;
  })
];

const patchVisualMemoryBatchValidators = [
  body('order').optional().isInt({ min: 1 }).withMessage('order must be an integer greater than or equal to 1'),
  body('imageUrl').optional().isString().trim().notEmpty().withMessage('imageUrl must be a non-empty string'),
  body('displaySeconds').optional().isInt({ min: 1 }).withMessage('displaySeconds must be an integer greater than or equal to 1'),
  body('questions').optional().isArray({ min: 1 }).withMessage('questions must be a non-empty array'),
  body().custom((value) => {
    if (value.order === undefined && value.imageUrl === undefined && value.displaySeconds === undefined && value.questions === undefined) {
      throw new Error('At least one of order, imageUrl, displaySeconds, or questions must be provided');
    }

    if (Array.isArray(value.questions)) {
      for (const question of value.questions) {
        if (!Number.isInteger(question.order) || question.order < 1) {
          throw new Error('each visual memory question order must be an integer greater than or equal to 1');
        }
        if (!question.questionText || typeof question.questionText !== 'object') {
          throw new Error('each visual memory question must include questionText');
        }
        if (typeof question.questionText.ar !== 'string' || !question.questionText.ar.trim()) {
          throw new Error('each visual memory question requires questionText.ar');
        }
        if (typeof question.questionText.en !== 'string' || !question.questionText.en.trim()) {
          throw new Error('each visual memory question requires questionText.en');
        }
        if (!VISUAL_MEMORY_TYPES.includes(question.questionType)) {
          throw new Error(`questionType must be one of: ${VISUAL_MEMORY_TYPES.join(', ')}`);
        }
        if (question.questionType === 'YES_NO' && typeof question.correctBool !== 'boolean') {
          throw new Error('YES_NO questions require correctBool as a boolean');
        }
        if (question.questionType === 'MCQ') {
          if (!Array.isArray(question.choices) || question.choices.length === 0) {
            throw new Error('MCQ questions require a non-empty choices array');
          }
          if (question.choices.some((choice) => typeof choice?.text !== 'string' || !choice.text.trim())) {
            throw new Error('each MCQ choice must include a non-empty text field');
          }
          if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex >= question.choices.length) {
            throw new Error('MCQ questions require correctIndex within choices bounds');
          }
        }
      }
    }

    return true;
  })
];

const auditoryMemoryValidators = [
  body('order').isInt({ min: 1 }).withMessage('order must be an integer greater than or equal to 1'),
  body('audioClipUrl').isString().trim().notEmpty().withMessage('audioClipUrl is required'),
  body('questionText').isObject().withMessage('questionText must be an object'),
  body('questionText.ar').isString().trim().notEmpty().withMessage('questionText.ar is required'),
  body('questionText.en').isString().trim().notEmpty().withMessage('questionText.en is required'),
  body('modelAnswer').isObject().withMessage('modelAnswer must be an object'),
  body('modelAnswer.items').isArray({ min: 1 }).withMessage('modelAnswer.items must be a non-empty array'),
  body('modelAnswer.items.*').isString().trim().notEmpty().withMessage('modelAnswer.items must contain non-empty strings'),
  body('modelAnswer.order').isBoolean().withMessage('modelAnswer.order must be a boolean')
];

const patchAuditoryMemoryValidators = [
  body('order').optional().isInt({ min: 1 }).withMessage('order must be an integer greater than or equal to 1'),
  body('audioClipUrl').optional().isString().trim().notEmpty().withMessage('audioClipUrl must be a non-empty string'),
  body('questionText').optional().isObject().withMessage('questionText must be an object'),
  body('questionText.ar').optional().isString().trim().notEmpty().withMessage('questionText.ar must be a non-empty string'),
  body('questionText.en').optional().isString().trim().notEmpty().withMessage('questionText.en must be a non-empty string'),
  body('modelAnswer').optional().isObject().withMessage('modelAnswer must be an object'),
  body('modelAnswer.items').optional().isArray({ min: 1 }).withMessage('modelAnswer.items must be a non-empty array'),
  body('modelAnswer.items.*').optional().isString().trim().notEmpty().withMessage('modelAnswer.items must contain non-empty strings'),
  body('modelAnswer.order').optional().isBoolean().withMessage('modelAnswer.order must be a boolean'),
  body().custom((value) => {
    if (value.order === undefined && value.audioClipUrl === undefined && value.questionText === undefined && value.modelAnswer === undefined) {
      throw new Error('At least one of order, audioClipUrl, questionText, or modelAnswer must be provided');
    }

    return true;
  })
];

const verbalNonsenseValidators = [
  body('order').isInt({ min: 1 }).withMessage('order must be an integer greater than or equal to 1'),
  body('sentenceAr').isString().trim().notEmpty().withMessage('sentenceAr is required'),
  body('sentenceEn').optional({ nullable: true }).isString().withMessage('sentenceEn must be a string')
];

const patchVerbalNonsenseValidators = [
  body('order').optional().isInt({ min: 1 }).withMessage('order must be an integer greater than or equal to 1'),
  body('sentenceAr').optional().isString().trim().notEmpty().withMessage('sentenceAr must be a non-empty string'),
  body('sentenceEn').optional({ nullable: true }).isString().withMessage('sentenceEn must be a string'),
  body().custom((value) => {
    if (value.order === undefined && value.sentenceAr === undefined && value.sentenceEn === undefined) {
      throw new Error('At least one of order, sentenceAr, or sentenceEn must be provided');
    }

    return true;
  })
];

const sequenceOrderValidators = [
  body('order').isInt({ min: 1 }).withMessage('order must be an integer greater than or equal to 1'),
  body('images').isArray({ min: 2 }).withMessage('images must be an array with at least 2 items'),
  body('images.*.assetPath').isString().trim().notEmpty().withMessage('each image.assetPath is required'),
  body('images.*.position').isInt({ min: 1 }).withMessage('each image.position must be an integer greater than or equal to 1'),
  body('images').custom((images) => {
    const positions = images.map((image) => image.position);

    if (new Set(positions).size !== positions.length) {
      throw new Error('image positions must be unique within the array');
    }

    const sorted = [...positions].sort((left, right) => left - right);
    for (let index = 0; index < sorted.length; index += 1) {
      if (sorted[index] !== index + 1) {
        throw new Error('image positions must be consecutive starting from 1');
      }
    }

    return true;
  })
];

const patchSequenceOrderValidators = [
  body('order').optional().isInt({ min: 1 }).withMessage('order must be an integer greater than or equal to 1'),
  body('images').optional().isArray({ min: 2 }).withMessage('images must be an array with at least 2 items'),
  body().custom((value) => {
    if (value.order === undefined && value.images === undefined) {
      throw new Error('At least one of order or images must be provided');
    }

    if (Array.isArray(value.images)) {
      if (value.images.some((image) => typeof image?.assetPath !== 'string' || !image.assetPath.trim())) {
        throw new Error('each image.assetPath is required');
      }

      if (value.images.some((image) => !Number.isInteger(image?.position) || image.position < 1)) {
        throw new Error('each image.position must be an integer greater than or equal to 1');
      }

      const positions = value.images.map((image) => image.position);

      if (new Set(positions).size !== positions.length) {
        throw new Error('image positions must be unique within the array');
      }

      const sorted = [...positions].sort((left, right) => left - right);
      for (let index = 0; index < sorted.length; index += 1) {
        if (sorted[index] !== index + 1) {
          throw new Error('image positions must be consecutive starting from 1');
        }
      }
    }

    return true;
  })
];

const helpSkillValidators = [
  body('domain').isIn(HELP_DOMAINS).withMessage(`domain must be one of: ${HELP_DOMAINS.join(', ')}`),
  body('skillNumber').isString().trim().notEmpty().withMessage('skillNumber is required'),
  body('description').isString().trim().notEmpty().withMessage('description is required'),
  body('ageRange').matches(/^\d+(?:\.\d+)?-\d+(?:\.\d+)?$/).withMessage('ageRange must match a pattern like 3.0-3.6')
];

const patchHelpSkillValidators = [
  body('domain').optional().isIn(HELP_DOMAINS).withMessage(`domain must be one of: ${HELP_DOMAINS.join(', ')}`),
  body('skillNumber').optional().isString().trim().notEmpty().withMessage('skillNumber must be a non-empty string'),
  body('description').optional().isString().trim().notEmpty().withMessage('description must be a non-empty string'),
  body('ageRange')
    .optional()
    .matches(/^\d+(?:\.\d+)?-\d+(?:\.\d+)?$/)
    .withMessage('ageRange must match a pattern like 3.0-3.6'),
  body().custom((value) => {
    if (
      value.domain === undefined &&
      value.skillNumber === undefined &&
      value.description === undefined &&
      value.ageRange === undefined
    ) {
      throw new Error('At least one of domain, skillNumber, description, or ageRange must be provided');
    }
    return true;
  })
];

const genericQuestionValidators = [
  body('orderIndex').isInt({ min: 0 }).withMessage('orderIndex must be an integer greater than or equal to 0'),
  body('audioAssetPath').optional().isString().withMessage('audioAssetPath must be a string'),
  body('imageAssetPath').optional().isString().withMessage('imageAssetPath must be a string'),
  body('choices').optional().isArray().withMessage('choices must be an array'),
  body('scoringGuide').isString().trim().notEmpty().withMessage('scoringGuide is required'),
  body('maxScore').isInt({ min: 1 }).withMessage('maxScore must be an integer greater than or equal to 1')
];

router.post(
  '/upload/image',
  authenticateAdmin,
  uploadAssessmentImageSingle,
  assessmentsController.uploadAssessmentImage
);
router.post(
  '/upload/audio',
  authenticateAdmin,
  uploadAssessmentAudioSingle,
  assessmentsController.uploadAssessmentAudio
);

router.get(
  '/tests',
  authenticateAdmin,
  query('testType').optional().isIn(TEST_TYPES).withMessage(`testType must be one of: ${TEST_TYPES.join(', ')}`),
  assessmentsController.getTests
);
router.post('/tests', authenticateAdmin, testBodyValidators, assessmentsController.createTest);
router.get('/tests/:testId', authenticateAdmin, requiredIdParam('testId', 'testId'), assessmentsController.getTestById);
router.patch('/tests/:testId', authenticateAdmin, requiredIdParam('testId', 'testId'), patchTestBodyValidators, assessmentsController.updateTest);
router.delete('/tests/:testId', authenticateAdmin, requiredIdParam('testId', 'testId'), assessmentsController.deleteTest);

router.post('/cars/:testId/questions', authenticateAdmin, requiredIdParam('testId', 'testId'), carsQuestionValidators, assessmentsController.createCarsQuestion);
router.patch('/cars/questions/:questionId', authenticateAdmin, requiredIdParam('questionId', 'questionId'), patchCarsQuestionValidators, assessmentsController.updateCarsQuestion);

router.post('/analogy/:testId/questions', authenticateAdmin, requiredIdParam('testId', 'testId'), analogyQuestionValidators, assessmentsController.createAnalogyQuestion);
router.patch('/analogy/questions/:questionId', authenticateAdmin, requiredIdParam('questionId', 'questionId'), patchAnalogyQuestionValidators, assessmentsController.updateAnalogyQuestion);

router.post('/visual-memory/:testId/batches', authenticateAdmin, requiredIdParam('testId', 'testId'), visualMemoryBatchValidators, assessmentsController.createVisualMemoryBatch);
router.patch('/visual-memory/batches/:batchId', authenticateAdmin, requiredIdParam('batchId', 'batchId'), patchVisualMemoryBatchValidators, assessmentsController.updateVisualMemoryBatch);
router.delete('/tests/:testId/batches/:batchId', authenticateAdmin, requiredIdParam('testId', 'testId'), requiredIdParam('batchId', 'batchId'), assessmentsController.deleteVisualMemoryBatch);

router.post('/auditory-memory/:testId/questions', authenticateAdmin, requiredIdParam('testId', 'testId'), auditoryMemoryValidators, assessmentsController.createAuditoryMemoryQuestion);
router.patch('/auditory-memory/questions/:questionId', authenticateAdmin, requiredIdParam('questionId', 'questionId'), patchAuditoryMemoryValidators, assessmentsController.updateAuditoryMemoryQuestion);
router.post('/verbal-nonsense/:testId/questions', authenticateAdmin, requiredIdParam('testId', 'testId'), verbalNonsenseValidators, assessmentsController.createVerbalNonsenseQuestion);
router.patch('/verbal-nonsense/questions/:questionId', authenticateAdmin, requiredIdParam('questionId', 'questionId'), patchVerbalNonsenseValidators, assessmentsController.updateVerbalNonsenseQuestion);
router.post('/image-sequence-order/:testId/questions', authenticateAdmin, requiredIdParam('testId', 'testId'), sequenceOrderValidators, assessmentsController.createImageSequenceOrderQuestion);
router.patch('/image-sequence-order/questions/:questionId', authenticateAdmin, requiredIdParam('questionId', 'questionId'), patchSequenceOrderValidators, assessmentsController.updateImageSequenceOrderQuestion);

router.get('/help/skills', authenticateAdmin, query('domain').optional().isIn(HELP_DOMAINS).withMessage(`domain must be one of: ${HELP_DOMAINS.join(', ')}`), assessmentsController.getHelpSkills);
router.post('/help/skills', authenticateAdmin, helpSkillValidators, assessmentsController.createHelpSkill);
router.patch(
  '/help/skills/:skillId',
  authenticateAdmin,
  requiredIdParam('skillId', 'skillId'),
  patchHelpSkillValidators,
  assessmentsController.updateHelpSkill
);
router.delete('/help/skills/:skillId', authenticateAdmin, requiredIdParam('skillId', 'skillId'), assessmentsController.deleteHelpSkill);

router.post('/generic/:testId/questions', authenticateAdmin, requiredIdParam('testId', 'testId'), genericQuestionValidators, assessmentsController.createGenericQuestion);
router.delete('/tests/:testId/questions/:questionId', authenticateAdmin, requiredIdParam('testId', 'testId'), requiredIdParam('questionId', 'questionId'), assessmentsController.deleteTestQuestion);

export default router;
