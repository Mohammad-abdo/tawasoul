import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import {
  buildAssessmentRecommendation,
  buildAssessmentSubmission,
  buildHelpAssessmentSubmission,
  countAssessmentQuestions,
  fetchAssessmentQuestions,
  getQuestionModelForTestType
} from '../../utils/assessment.utils.js';

const formatTest = (test, questionCount) => ({
  ...test,
  questionModel: getQuestionModelForTestType(test.testType),
  questionCount
});

/**
 * Get Available Tests (filter by test category and/or testType)
 */
export const getTests = async (req, res, next) => {
  try {
    const { testType } = req.query;
    const where = {};
    if (testType) where.testType = testType;

    const tests = await prisma.test.findMany({
      where,
      orderBy: [{ testType: 'asc' }, { createdAt: 'desc' }]
    });

    const data = await Promise.all(
      tests.map(async (test) => formatTest(test, await countAssessmentQuestions({ prisma, test })))
    );

    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Get tests error:', error);
    next(error);
  }
};

/**
 * Get Test Questions
 */
export const getTestQuestions = async (req, res, next) => {
  try {
    const { testId } = req.params;

    const test = await prisma.test.findUnique({
      where: { id: testId }
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

    const [questionCount, questions] = await Promise.all([
      countAssessmentQuestions({ prisma, test }),
      fetchAssessmentQuestions({ prisma, test, req, includeCorrect: false })
    ]);

    res.json({
      success: true,
      data: {
        test: formatTest(test, questionCount),
        questionModel: getQuestionModelForTestType(test.testType),
        questions
      }
    });
  } catch (error) {
    logger.error('Get test questions error:', error);
    next(error);
  }
};

const submitLegacyAssessmentResult = async (req, res) => {
  const { childId, questionId, scoreGiven, sessionId } = req.body;

  const result = await prisma.assessmentResult.create({
    data: {
      childId,
      questionId,
      scoreGiven: Number.parseInt(scoreGiven, 10),
      totalScore: Number.parseInt(scoreGiven, 10),
      maxScore: null,
      sessionId
    },
    include: {
      question: {
        include: {
          test: true
        }
      }
    }
  });

  const test = result.question?.test;
  const recommendation = test
    ? buildAssessmentRecommendation({
        test,
        totalScore: result.scoreGiven ?? 0,
        maxScore: result.question?.maxScore ?? 10
      })
    : null;

  return res.status(201).json({
    success: true,
    data: {
      result,
      recommendation
    }
  });
};

const submitHelpAssessmentResult = async (req, res, test) => {
  const { childId, sessionId, answers, developmentalAge, doctorId: bodyDoctorId } = req.body;
  const doctorId = req.doctor?.id || bodyDoctorId;

  if (!developmentalAge || !doctorId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'HELP assessments require developmentalAge and doctorId'
      }
    });
  }

  const resolvedSessionId = sessionId || `help-${Date.now()}`;

  const data = await prisma.$transaction(async (tx) => {
    const createdResult = await tx.assessmentResult.create({
      data: {
        childId,
        testId: test.id,
        sessionId: resolvedSessionId,
        scoreGiven: 0,
        totalScore: 0,
        maxScore: 0
      }
    });

    const submission = await buildHelpAssessmentSubmission({
      prisma: tx,
      answers
    });

    const helpAssessment = await tx.helpAssessment.create({
      data: {
        childId,
        doctorId,
        assessmentResultId: createdResult.id,
        sessionId: resolvedSessionId,
        developmentalAge,
        evaluations: {
          create: submission.evaluations
        }
      },
      include: {
        evaluations: {
          include: {
            skill: true
          }
        }
      }
    });

    const result = await tx.assessmentResult.update({
      where: { id: createdResult.id },
      data: {
        scoreGiven: submission.totalScore,
        totalScore: submission.totalScore,
        maxScore: submission.maxScore
      },
      include: {
        test: true,
        helpAssessment: {
          include: {
            evaluations: {
              include: {
                skill: true
              }
            }
          }
        },
        qCarsAnswers: true,
        qAnalogyAnswers: true,
        qVisualMemoryAnswers: true,
        qAuditoryMemoryAnswers: true
      }
    });

    return {
      result,
      helpAssessment
    };
  });

  return res.status(201).json({
    success: true,
    data: {
      result: data.result,
      helpAssessment: data.helpAssessment,
      recommendation: null
    }
  });
};

/**
 * Submit Assessment Result
 */
export const submitAssessmentResult = async (req, res, next) => {
  try {
    if (req.body.questionId && req.body.scoreGiven !== undefined && !req.body.testId) {
      return submitLegacyAssessmentResult(req, res);
    }

    const { childId, testId, sessionId, answers } = req.body;

    if (!childId || !testId || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'childId, testId, and a non-empty answers array are required'
        }
      });
    }

    const test = await prisma.test.findUnique({
      where: { id: testId }
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

    if (test.testType === 'HELP') {
      return submitHelpAssessmentResult(req, res, test);
    }

    const result = await prisma.$transaction(async (tx) => {
      const createdResult = await tx.assessmentResult.create({
        data: {
          childId,
          testId,
          sessionId: sessionId || null,
          scoreGiven: 0,
          totalScore: 0,
          maxScore: 0
        }
      });

      const submission = await buildAssessmentSubmission({
        prisma: tx,
        test,
        answers,
        resultId: createdResult.id
      });

      await Promise.all(submission.operations);

      return tx.assessmentResult.update({
        where: { id: createdResult.id },
        data: {
          scoreGiven: submission.totalScore,
          totalScore: submission.totalScore,
          maxScore: submission.maxScore
        },
        include: {
          test: true,
          helpAssessment: {
            include: {
              evaluations: {
                include: {
                  skill: true
                }
              }
            }
          },
          qCarsAnswers: true,
          qAnalogyAnswers: true,
          qVisualMemoryAnswers: true,
          qAuditoryMemoryAnswers: true
        }
      });
    });

    const recommendation = buildAssessmentRecommendation({
      test,
      totalScore: result.totalScore ?? 0,
      maxScore: result.maxScore ?? 0
    });

    res.status(201).json({
      success: true,
      data: {
        result,
        recommendation
      }
    });
  } catch (error) {
    logger.error('Submit assessment result error:', error);

    if (error.name === 'AssessmentValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message
        }
      });
    }

    next(error);
  }
};
