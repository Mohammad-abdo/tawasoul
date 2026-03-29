import { validationResult } from 'express-validator';
import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import {
  buildTestSummary,
  calculateHelpEvaluationTotals,
  ensureDoctorCanAccessChild,
  ensureTestForType,
  fetchAssessmentSessionResults,
  GENERIC_TEST_TYPES,
  getHelpTestOrThrow,
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

const getHelpAssessmentOrThrow = async (helpAssessmentId) => {
  const helpAssessment = await prisma.helpAssessment.findUnique({
    where: { id: helpAssessmentId },
    include: {
      assessmentResult: {
        include: {
          test: true
        }
      },
      evaluations: {
        include: {
          skill: true
        }
      }
    }
  });

  if (!helpAssessment) {
    throw createHttpError(404, 'HELP_ASSESSMENT_NOT_FOUND', 'Help assessment not found');
  }

  return helpAssessment;
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
    if (handleKnownError(res, error)) return;
    logger.error('Get doctor assessment tests error:', error);
    next(error);
  }
};

export const getAssessmentResultsByChild = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    await ensureDoctorCanAccessChild({
      prisma,
      doctorId: req.doctor.id,
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
    logger.error('Get doctor assessment results error:', error);
    next(error);
  }
};

export const getAssessmentSessionDetail = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    await ensureDoctorCanAccessChild({
      prisma,
      doctorId: req.doctor.id,
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
    logger.error('Get doctor assessment session detail error:', error);
    next(error);
  }
};

export const submitGenericAssessment = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { childId, testId, questionId, sessionId, scoreGiven } = req.body;

    await ensureDoctorCanAccessChild({
      prisma,
      doctorId: req.doctor.id,
      childId
    });

    const test = await ensureTestForType({
      prisma,
      testId,
      allowedTypes: GENERIC_TEST_TYPES
    });

    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question || question.testId !== test.id) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'INVALID_QUESTION',
          message: 'Question does not belong to the provided test'
        }
      });
    }

    if (question.maxScore !== null && scoreGiven > question.maxScore) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'SCORE_OUT_OF_BOUNDS',
          message: 'scoreGiven must not exceed question.maxScore'
        }
      });
    }

    const existing = await prisma.assessmentResult.findFirst({
      where: {
        childId,
        questionId,
        sessionId
      }
    });

    const result = existing
      ? await prisma.assessmentResult.update({
          where: { id: existing.id },
          data: {
            testId: test.id,
            questionId,
            sessionId,
            scoreGiven,
            totalScore: scoreGiven,
            maxScore: question.maxScore ?? null
          }
        })
      : await prisma.assessmentResult.create({
          data: {
            childId,
            testId: test.id,
            questionId,
            sessionId,
            scoreGiven,
            totalScore: scoreGiven,
            maxScore: question.maxScore ?? null
          }
        });

    res.status(existing ? 200 : 201).json({
      success: true,
      data: {
        assessmentResultId: result.id,
        scoreGiven: result.scoreGiven,
        maxScore: result.maxScore,
        sessionId: result.sessionId
      }
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Submit doctor generic assessment error:', error);
    next(error);
  }
};

export const startHelpAssessment = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { childId, sessionId, developmentalAge } = req.body;

    await ensureDoctorCanAccessChild({
      prisma,
      doctorId: req.doctor.id,
      childId
    });

    const existing = await prisma.helpAssessment.findFirst({
      where: { sessionId },
      select: { id: true }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'SESSION_CONFLICT',
          message: 'A HELP assessment with this sessionId already exists'
        }
      });
    }

    const helpTest = await getHelpTestOrThrow({ prisma });

    const helpAssessment = await prisma.$transaction(async (tx) => {
      const result = await tx.assessmentResult.create({
        data: {
          childId,
          testId: helpTest.id,
          sessionId,
          scoreGiven: 0,
          totalScore: 0,
          maxScore: 0
        }
      });

      return tx.helpAssessment.create({
        data: {
          childId,
          doctorId: req.doctor.id,
          assessmentResultId: result.id,
          sessionId,
          developmentalAge
        }
      });
    });

    res.status(201).json({
      success: true,
      data: {
        helpAssessmentId: helpAssessment.id,
        childId: helpAssessment.childId,
        doctorId: helpAssessment.doctorId,
        sessionId: helpAssessment.sessionId,
        developmentalAge: helpAssessment.developmentalAge,
        createdAt: helpAssessment.createdAt
      }
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Start HELP assessment error:', error);
    next(error);
  }
};

export const evaluateHelpAssessment = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const helpAssessment = await getHelpAssessmentOrThrow(req.params.helpAssessmentId);

    if (helpAssessment.doctorId !== req.doctor.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this HELP assessment'
        }
      });
    }

    const skill = await prisma.helpSkill.findUnique({
      where: { id: req.body.skillId }
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HELP_SKILL_NOT_FOUND',
          message: 'Help skill not found'
        }
      });
    }

    const evaluation = await prisma.$transaction(async (tx) => {
      const upserted = await tx.helpEvaluation.upsert({
        where: {
          assessmentId_skillId: {
            assessmentId: helpAssessment.id,
            skillId: req.body.skillId
          }
        },
        update: {
          score: req.body.score,
          doctorNotes: req.body.doctorNotes || null
        },
        create: {
          assessmentId: helpAssessment.id,
          skillId: req.body.skillId,
          score: req.body.score,
          doctorNotes: req.body.doctorNotes || null
        },
        include: {
          skill: true
        }
      });

      const allEvaluations = await tx.helpEvaluation.findMany({
        where: { assessmentId: helpAssessment.id }
      });

      const totals = calculateHelpEvaluationTotals(allEvaluations);

      if (helpAssessment.assessmentResultId) {
        await tx.assessmentResult.update({
          where: { id: helpAssessment.assessmentResultId },
          data: {
            scoreGiven: totals.totalScore,
            totalScore: totals.totalScore,
            maxScore: totals.maxScore
          }
        });
      }

      return upserted;
    });

    res.json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Evaluate HELP assessment error:', error);
    next(error);
  }
};

export const getHelpAssessment = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const helpAssessment = await getHelpAssessmentOrThrow(req.params.helpAssessmentId);

    if (helpAssessment.doctorId !== req.doctor.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this HELP assessment'
        }
      });
    }

    res.json({
      success: true,
      data: helpAssessment
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Get HELP assessment error:', error);
    next(error);
  }
};

export const updateHelpAssessment = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const helpAssessment = await getHelpAssessmentOrThrow(req.params.helpAssessmentId);

    if (helpAssessment.doctorId !== req.doctor.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this HELP assessment'
        }
      });
    }

    const updated = await prisma.helpAssessment.update({
      where: { id: helpAssessment.id },
      data: {
        developmentalAge: req.body.developmentalAge
      },
      include: {
        assessmentResult: {
          include: {
            test: true
          }
        },
        evaluations: {
          include: {
            skill: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Update HELP assessment error:', error);
    next(error);
  }
};
