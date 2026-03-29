import { validationResult } from 'express-validator';
import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import {
  buildTestDetail,
  buildTestSummary,
  ensureTestForType,
  ensureUniqueAnswerQuestionIds,
  ensureUserOwnsChild,
  fetchAssessmentSessionResults,
  groupAssessmentResultSummaries,
  serializeAssessmentResultDetail
} from '../../utils/assessment-api.utils.js';
import { createHttpError } from '../../utils/httpError.js';

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return false;
  }

  res.status(400).json({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: errors.array()[0].msg
    }
  });

  return true;
};

const handleKnownError = (res, error) => {
  if (!error.status) {
    return false;
  }

  res.status(error.status).json({
    success: false,
    error: {
      code: error.code,
      message: error.message
    }
  });

  return true;
};

const normalizeAuditoryModelItems = (modelAnswer) => {
  if (Array.isArray(modelAnswer?.items)) {
    return modelAnswer.items;
  }

  if (Array.isArray(modelAnswer)) {
    return modelAnswer;
  }

  return [];
};

const normalizeSequenceOrderSubmission = (submittedOrder) => {
  if (Array.isArray(submittedOrder)) {
    return submittedOrder;
  }

  return [];
};

export const getTests = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const where = {};
    if (req.query.testType) {
      where.testType = req.query.testType;
    }

    const tests = await prisma.test.findMany({
      where,
      orderBy: [{ testType: 'asc' }, { createdAt: 'desc' }]
    });

    res.json({
      success: true,
      data: tests.map((test) => buildTestSummary({ test }))
    });
  } catch (error) {
    logger.error('Get user assessment tests error:', error);
    next(error);
  }
};

export const getTestById = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const test = await prisma.test.findUnique({
      where: { id: req.params.testId }
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEST_NOT_FOUND',
          message: 'Test not found'
        }
      });
    }

    const data = await buildTestDetail({
      prisma,
      req,
      test,
      includeCorrect: false
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Get user assessment test detail error:', error);
    next(error);
  }
};

export const submitCarsAssessment = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { childId, testId, sessionId, answers } = req.body;

    await ensureUserOwnsChild({ prisma, userId: req.user.id, childId });
    const test = await ensureTestForType({ prisma, testId, expectedType: 'CARS' });
    ensureUniqueAnswerQuestionIds(answers);

    const data = await prisma.$transaction(async (tx) => {
      const questions = await tx.q_CARS.findMany({
        where: {
          id: { in: answers.map((answer) => answer.questionId) },
          testId: test.id
        }
      });

      if (questions.length !== answers.length) {
        throw createHttpError(422, 'INVALID_QUESTION', 'One or more questions do not belong to this test');
      }

      const questionMap = new Map(questions.map((question) => [question.id, question]));
      let totalScore = 0;
      const answerRows = [];

      for (const answer of answers) {
        const question = questionMap.get(answer.questionId);
        const choices = Array.isArray(question?.choices) ? question.choices : [];

        if (!question) {
          throw createHttpError(422, 'INVALID_QUESTION', `Question ${answer.questionId} does not belong to this test`);
        }

        if (answer.chosenIndex < 0 || answer.chosenIndex >= choices.length) {
          throw createHttpError(422, 'ANSWER_OUT_OF_BOUNDS', `chosenIndex is out of bounds for question ${answer.questionId}`);
        }

        const score = Number.parseInt(choices[answer.chosenIndex]?.score, 10);
        if (!Number.isInteger(score)) {
          throw createHttpError(422, 'INVALID_QUESTION_DATA', `Question ${answer.questionId} is missing a valid score definition`);
        }

        totalScore += score;
        answerRows.push({
          questionId: question.id,
          chosenIndex: answer.chosenIndex,
          score
        });
      }

      const maxScore = answers.length * 4;
      const result = await tx.assessmentResult.create({
        data: {
          childId,
          testId: test.id,
          sessionId,
          totalScore,
          maxScore,
          scoreGiven: totalScore
        }
      });

      await tx.q_CARS_Answer.createMany({
        data: answerRows.map((answer) => ({
          resultId: result.id,
          questionId: answer.questionId,
          chosenIndex: answer.chosenIndex,
          score: answer.score
        }))
      });

      return {
        assessmentResultId: result.id,
        totalScore,
        maxScore,
        answers: answerRows
      };
    });

    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Submit CARS assessment error:', error);
    next(error);
  }
};

export const submitAnalogyAssessment = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { childId, testId, sessionId, answers } = req.body;

    await ensureUserOwnsChild({ prisma, userId: req.user.id, childId });
    const test = await ensureTestForType({ prisma, testId, expectedType: 'ANALOGY' });
    ensureUniqueAnswerQuestionIds(answers);

    const data = await prisma.$transaction(async (tx) => {
      const questions = await tx.q_Analogy.findMany({
        where: {
          id: { in: answers.map((answer) => answer.questionId) },
          testId: test.id
        }
      });

      if (questions.length !== answers.length) {
        throw createHttpError(422, 'INVALID_QUESTION', 'One or more questions do not belong to this test');
      }

      const questionMap = new Map(questions.map((question) => [question.id, question]));
      let totalScore = 0;
      const answerRows = [];

      for (const answer of answers) {
        const question = questionMap.get(answer.questionId);
        const choices = Array.isArray(question?.choices) ? question.choices : [];

        if (!question) {
          throw createHttpError(422, 'INVALID_QUESTION', `Question ${answer.questionId} does not belong to this test`);
        }

        if (answer.chosenIndex < 0 || answer.chosenIndex >= choices.length) {
          throw createHttpError(422, 'ANSWER_OUT_OF_BOUNDS', `chosenIndex is out of bounds for question ${answer.questionId}`);
        }

        const score = answer.chosenIndex === question.correctIndex ? 1 : 0;
        totalScore += score;
        answerRows.push({
          questionId: question.id,
          chosenIndex: answer.chosenIndex,
          score
        });
      }

      const maxScore = answers.length;
      const result = await tx.assessmentResult.create({
        data: {
          childId,
          testId: test.id,
          sessionId,
          totalScore,
          maxScore,
          scoreGiven: totalScore
        }
      });

      await tx.q_Analogy_Answer.createMany({
        data: answerRows.map((answer) => ({
          resultId: result.id,
          questionId: answer.questionId,
          chosenIndex: answer.chosenIndex,
          score: answer.score
        }))
      });

      return {
        assessmentResultId: result.id,
        totalScore,
        maxScore,
        answers: answerRows
      };
    });

    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Submit analogy assessment error:', error);
    next(error);
  }
};

export const submitVisualMemoryAssessment = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { childId, testId, sessionId, answers } = req.body;

    await ensureUserOwnsChild({ prisma, userId: req.user.id, childId });
    const test = await ensureTestForType({ prisma, testId, expectedType: 'VISUAL_MEMORY' });
    ensureUniqueAnswerQuestionIds(answers);

    const data = await prisma.$transaction(async (tx) => {
      const questions = await tx.q_VisualMemory.findMany({
        where: {
          id: { in: answers.map((answer) => answer.questionId) },
          batch: { testId: test.id }
        }
      });

      if (questions.length !== answers.length) {
        throw createHttpError(422, 'INVALID_QUESTION', 'One or more questions do not belong to this test');
      }

      const questionMap = new Map(questions.map((question) => [question.id, question]));
      let totalScore = 0;
      const answerRows = [];

      for (const answer of answers) {
        const question = questionMap.get(answer.questionId);

        if (!question) {
          throw createHttpError(422, 'INVALID_QUESTION', `Question ${answer.questionId} does not belong to this test`);
        }

        let score = 0;
        let answerBool = null;
        let chosenIndex = null;

        if (question.questionType === 'YES_NO') {
          if (typeof answer.answerBool !== 'boolean') {
            throw createHttpError(422, 'INVALID_ANSWER', `Question ${answer.questionId} requires answerBool`);
          }
          answerBool = answer.answerBool;
          score = answerBool === question.correctBool ? 1 : 0;
        } else {
          const choices = Array.isArray(question.choices) ? question.choices : [];
          chosenIndex = answer.chosenIndex;

          if (!Number.isInteger(chosenIndex) || chosenIndex < 0 || chosenIndex >= choices.length) {
            throw createHttpError(422, 'ANSWER_OUT_OF_BOUNDS', `chosenIndex is out of bounds for question ${answer.questionId}`);
          }

          score = chosenIndex === question.correctIndex ? 1 : 0;
        }

        totalScore += score;
        answerRows.push({
          questionId: question.id,
          answerBool,
          chosenIndex,
          score
        });
      }

      const maxScore = answers.length;
      const result = await tx.assessmentResult.create({
        data: {
          childId,
          testId: test.id,
          sessionId,
          totalScore,
          maxScore,
          scoreGiven: totalScore
        }
      });

      await tx.q_VisualMemory_Answer.createMany({
        data: answerRows.map((answer) => ({
          resultId: result.id,
          questionId: answer.questionId,
          answerBool: answer.answerBool,
          chosenIndex: answer.chosenIndex,
          score: answer.score
        }))
      });

      return {
        assessmentResultId: result.id,
        totalScore,
        maxScore,
        answers: answerRows
      };
    });

    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Submit visual memory assessment error:', error);
    next(error);
  }
};

export const submitAuditoryMemoryAssessment = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { childId, testId, sessionId, answers } = req.body;

    await ensureUserOwnsChild({ prisma, userId: req.user.id, childId });
    const test = await ensureTestForType({ prisma, testId, expectedType: 'AUDITORY_MEMORY' });
    ensureUniqueAnswerQuestionIds(answers);

    const data = await prisma.$transaction(async (tx) => {
      const questions = await tx.q_AuditoryMemory.findMany({
        where: {
          id: { in: answers.map((answer) => answer.questionId) },
          testId: test.id
        }
      });

      if (questions.length !== answers.length) {
        throw createHttpError(422, 'INVALID_QUESTION', 'One or more questions do not belong to this test');
      }

      const questionMap = new Map(questions.map((question) => [question.id, question]));
      let totalScore = 0;
      const answerRows = [];

      for (const answer of answers) {
        const question = questionMap.get(answer.questionId);

        if (!question) {
          throw createHttpError(422, 'INVALID_QUESTION', `Question ${answer.questionId} does not belong to this test`);
        }

        const modelItems = normalizeAuditoryModelItems(question.modelAnswer);
        const recalledItems = Array.isArray(answer.recalledItems) ? answer.recalledItems : [];
        const itemScores = modelItems.map((item) => ({
          item,
          recalled: recalledItems.includes(item),
          score: recalledItems.includes(item) ? 1 : 0
        }));
        const score = itemScores.reduce((sum, itemScore) => sum + itemScore.score, 0);

        totalScore += score;
        answerRows.push({
          questionId: question.id,
          recalledItems,
          itemScores,
          score
        });
      }

      const maxScore = answerRows.reduce((sum, answer) => sum + answer.itemScores.length, 0);
      const result = await tx.assessmentResult.create({
        data: {
          childId,
          testId: test.id,
          sessionId,
          totalScore,
          maxScore,
          scoreGiven: totalScore
        }
      });

      await tx.q_AuditoryMemory_Answer.createMany({
        data: answerRows.map((answer) => ({
          resultId: result.id,
          questionId: answer.questionId,
          recalledItems: answer.recalledItems,
          itemScores: answer.itemScores,
          score: answer.score
        }))
      });

      return {
        assessmentResultId: result.id,
        totalScore,
        maxScore,
        answers: answerRows
      };
    });

    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Submit auditory memory assessment error:', error);
    next(error);
  }
};

export const submitImageSequenceOrderAssessment = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { childId, testId, sessionId, answers } = req.body;

    await ensureUserOwnsChild({ prisma, userId: req.user.id, childId });
    const test = await ensureTestForType({ prisma, testId, expectedType: 'IMAGE_SEQUENCE_ORDER' });
    ensureUniqueAnswerQuestionIds(answers);

    const data = await prisma.$transaction(async (tx) => {
      const questions = await tx.q_SequenceOrder.findMany({
        where: {
          id: { in: answers.map((answer) => answer.questionId) },
          testId: test.id
        },
        include: {
          images: {
            orderBy: [{ position: 'asc' }, { id: 'asc' }]
          }
        }
      });

      if (questions.length !== answers.length) {
        throw createHttpError(422, 'INVALID_QUESTION', 'One or more questions do not belong to this test');
      }

      const questionMap = new Map(questions.map((question) => [question.id, question]));
      let totalScore = 0;
      const answerRows = [];

      for (const answer of answers) {
        const question = questionMap.get(answer.questionId);

        if (!question) {
          throw createHttpError(422, 'INVALID_QUESTION', `Question ${answer.questionId} does not belong to this test`);
        }

        const images = Array.isArray(question.images) ? question.images : [];
        const submittedOrder = normalizeSequenceOrderSubmission(answer.submittedOrder);

        if (submittedOrder.length !== images.length) {
          throw createHttpError(422, 'INVALID_ANSWER', `Question ${answer.questionId} requires one submitted position for each image`);
        }

        const validImageIds = new Set(images.map((image) => image.id));
        const seenImageIds = new Set();
        const seenPositions = new Set();

        for (const item of submittedOrder) {
          if (!item || typeof item !== 'object' || typeof item.imageId !== 'string' || !item.imageId.trim()) {
            throw createHttpError(422, 'INVALID_ANSWER', `Question ${answer.questionId} requires submittedOrder items with imageId`);
          }

          if (!Number.isInteger(item.submittedPosition) || item.submittedPosition < 1 || item.submittedPosition > images.length) {
            throw createHttpError(422, 'ANSWER_OUT_OF_BOUNDS', `submittedPosition is out of bounds for question ${answer.questionId}`);
          }

          if (!validImageIds.has(item.imageId)) {
            throw createHttpError(422, 'INVALID_ANSWER', `Question ${answer.questionId} contains an image that does not belong to this question`);
          }

          if (seenImageIds.has(item.imageId)) {
            throw createHttpError(422, 'DUPLICATE_ANSWER', `Question ${answer.questionId} contains duplicate image submissions`);
          }

          if (seenPositions.has(item.submittedPosition)) {
            throw createHttpError(422, 'DUPLICATE_ANSWER', `Question ${answer.questionId} contains duplicate submitted positions`);
          }

          seenImageIds.add(item.imageId);
          seenPositions.add(item.submittedPosition);
        }

        const submittedMap = new Map(submittedOrder.map((item) => [item.imageId, item.submittedPosition]));
        const itemScores = images.map((image) => {
          const submittedPosition = submittedMap.get(image.id) ?? null;
          const score = submittedPosition === image.position ? 1 : 0;

          return {
            imageId: image.id,
            correctPosition: image.position,
            submittedPosition,
            score
          };
        });

        const score = itemScores.reduce((sum, item) => sum + item.score, 0);
        totalScore += score;
        answerRows.push({
          questionId: question.id,
          submittedOrder,
          itemScores,
          score
        });
      }

      const maxScore = answerRows.reduce((sum, answer) => sum + answer.itemScores.length, 0);
      const result = await tx.assessmentResult.create({
        data: {
          childId,
          testId: test.id,
          sessionId,
          totalScore,
          maxScore,
          scoreGiven: totalScore
        }
      });

      await tx.q_SequenceOrder_Answer.createMany({
        data: answerRows.map((answer) => ({
          resultId: result.id,
          questionId: answer.questionId,
          submittedOrder: answer.submittedOrder,
          itemScores: answer.itemScores,
          score: answer.score
        }))
      });

      return {
        assessmentResultId: result.id,
        totalScore,
        maxScore,
        answers: answerRows
      };
    });

    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Submit image sequence order assessment error:', error);
    next(error);
  }
};

export const getAssessmentResultsByChild = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    await ensureUserOwnsChild({
      prisma,
      userId: req.user.id,
      childId: req.params.childId
    });

    const results = await prisma.assessmentResult.findMany({
      where: { childId: req.params.childId },
      include: {
        test: true,
        question: {
          include: {
            test: true
          }
        }
      },
      orderBy: [{ timestamp: 'desc' }, { id: 'desc' }]
    });

    res.json({
      success: true,
      data: groupAssessmentResultSummaries(results)
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Get user assessment results error:', error);
    next(error);
  }
};

export const getAssessmentSessionDetail = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    await ensureUserOwnsChild({
      prisma,
      userId: req.user.id,
      childId: req.params.childId
    });

    const results = await fetchAssessmentSessionResults({
      prisma,
      childId: req.params.childId,
      sessionId: req.params.sessionId
    });

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ASSESSMENT_RESULT_NOT_FOUND',
          message: 'Assessment session not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        childId: req.params.childId,
        sessionId: req.params.sessionId,
        results: results.map(serializeAssessmentResultDetail)
      }
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Get user assessment session detail error:', error);
    next(error);
  }
};
