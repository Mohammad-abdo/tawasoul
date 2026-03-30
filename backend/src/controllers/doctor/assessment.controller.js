import { validationResult } from 'express-validator';
import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import {
  buildTestDetail,
  buildTestSummary,
  calculateHelpEvaluationTotals,
  ensureDoctorCanAccessChild,
  ensureTestForType,
  ensureUniqueAnswerQuestionIds,
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
    if (handleKnownError(res, error)) return;
    logger.error('Get doctor assessment test detail error:', error);
    next(error);
  }
};

export const getTestQuestions = async (req, res, next) => {
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
      data: data.questions
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Get doctor assessment test questions error:', error);
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

    const { childId, testId, questionId, sessionId, scoreGiven, answers } = req.body;

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

    // Bulk payload (frontend sends answers[])
    if (Array.isArray(answers)) {
      const normalizedAnswers = answers.map((answer) => ({
        questionId: answer.questionId,
        scoreGiven: Number.parseFloat(answer.scoreGiven)
      }));

      const questionIds = [...new Set(normalizedAnswers.map((answer) => answer.questionId))];
      const questions = await prisma.question.findMany({
        where: { id: { in: questionIds } }
      });
      const questionById = new Map(questions.map((q) => [q.id, q]));

      for (const answer of normalizedAnswers) {
        const q = questionById.get(answer.questionId);
        if (!q || q.testId !== test.id) {
          return res.status(422).json({
            success: false,
            error: {
              code: 'INVALID_QUESTION',
              message: 'Question does not belong to the provided test'
            }
          });
        }
        if (q.maxScore !== null && answer.scoreGiven > q.maxScore) {
          return res.status(422).json({
            success: false,
            error: {
              code: 'SCORE_OUT_OF_BOUNDS',
              message: 'scoreGiven must not exceed question.maxScore'
            }
          });
        }
      }

      const results = await prisma.$transaction(async (tx) => {
        const createdOrUpdated = [];

        for (const answer of normalizedAnswers) {
          const q = questionById.get(answer.questionId);
          const existing = await tx.assessmentResult.findFirst({
            where: {
              childId,
              questionId: answer.questionId,
              sessionId
            }
          });

          const saved = existing
            ? await tx.assessmentResult.update({
                where: { id: existing.id },
                data: {
                  testId: test.id,
                  questionId: answer.questionId,
                  sessionId,
                  scoreGiven: answer.scoreGiven,
                  totalScore: answer.scoreGiven,
                  maxScore: q?.maxScore ?? null
                }
              })
            : await tx.assessmentResult.create({
                data: {
                  childId,
                  testId: test.id,
                  questionId: answer.questionId,
                  sessionId,
                  scoreGiven: answer.scoreGiven,
                  totalScore: answer.scoreGiven,
                  maxScore: q?.maxScore ?? null
                }
              });

          createdOrUpdated.push(saved);
        }

        return createdOrUpdated;
      });

      res.status(201).json({
        success: true,
        data: {
          sessionId,
          savedCount: results.length
        }
      });
      return;
    }

    // Backward compatible single-answer payload
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
export const submitCarsAssessment = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { childId, testId, sessionId, answers } = req.body;

    // 1. التأكد من صلاحية الدكتور
    await ensureDoctorCanAccessChild({
      prisma,
      doctorId: req.doctor.id,
      childId
    });

    const test = await ensureTestForType({
      prisma,
      testId,
      expectedType: 'CARS'
    });

    // Ensure the CARS test is correctly configured (15 questions)
    const carsQuestionCount = await prisma.q_CARS.count({
      where: { testId: test.id }
    });

    if (carsQuestionCount !== 15) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'CARS_TEST_INVALID',
          message: `CARS test must have 15 questions, found ${carsQuestionCount}`
        }
      });
    }

    // 2. حساب المجموع الكلي للاختبار
    const totalScore = answers.reduce((sum, answer) => sum + parseFloat(answer.scoreGiven), 0);

    // 3. تحديد فئة التوحد بناءً على مقياس كارز [cite: 16]
    let carsDiagnosis = '';
    let childStatus = undefined;

    if (totalScore >= 15 && totalScore < 30) {
      carsDiagnosis = 'ليس توحد (طبيعي)';
      childStatus = 'NORMAL'; 
    } else if (totalScore >= 30 && totalScore <= 36.5) {
      carsDiagnosis = 'توحد بسيط إلى متوسط';
      childStatus = 'AUTISM'; 
    } else if (totalScore >= 37 && totalScore <= 60) {
      carsDiagnosis = 'توحد شديد';
      childStatus = 'AUTISM';
    }

    // 4. تنفيذ الحفظ والتحديث في Transaction عشان نضمن إن مفيش حاجة تقع في النص
    await prisma.$transaction(async (tx) => {
      // 1) إنشاء AssessmentResult واحدة للاختبار كله
      const result = await tx.assessmentResult.create({
        data: {
          childId,
          testId: test.id,
          sessionId,
          scoreGiven: totalScore,
          totalScore,
          maxScore: answers.length * 4
        }
      });

      // 2) حفظ اختيارات كارز في q_CARS_Answer
      const questions = await tx.q_CARS.findMany({
        where: {
          testId: test.id,
          id: { in: answers.map((a) => a.questionId) }
        },
        select: { id: true, choices: true }
      });

      if (questions.length !== answers.length) {
        throw createHttpError(422, 'INVALID_QUESTION', 'One or more CARS questions do not belong to this test');
      }

      const questionById = new Map(questions.map((q) => [q.id, q]));

      const answerRows = answers.map((answer) => {
        const q = questionById.get(answer.questionId);
        if (!q) {
          throw createHttpError(422, 'INVALID_QUESTION', 'One or more CARS questions do not belong to this test');
        }

        const choices = Array.isArray(q.choices) ? q.choices : [];
        const chosenIndex = choices.findIndex((c) => Number.parseFloat(c?.score) === Number.parseFloat(answer.scoreGiven));

        if (chosenIndex < 0) {
          throw createHttpError(422, 'INVALID_ANSWER', 'Chosen score does not match any option for CARS question');
        }

        return {
          resultId: result.id,
          questionId: answer.questionId,
          chosenIndex,
          score: Number.parseFloat(answer.scoreGiven)
        };
      });

      await tx.q_CARS_Answer.createMany({
        data: answerRows
      });

      // 3) تحديث حالة الطفل وإضافة النتيجة للملاحظات
      await tx.child.update({
        where: { id: childId },
        data: {
          status: childStatus,
          caseDescription: `تم إجراء مقياس كارز. المجموع: ${totalScore} (${carsDiagnosis}).`
        }
      });
    });

    res.status(201).json({
      success: true,
      data: {
        sessionId,
        totalScore,
        diagnosis: carsDiagnosis,
        message: 'تم حفظ تقييم كارز وتحديث حالة الطفل بنجاح'
      }
    });

  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Submit CARS assessment error:', error);
    next(error);
  }
};

export const submitVerbalNonsenseAssessment = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { childId, testId, sessionId, answers } = req.body;

    await ensureDoctorCanAccessChild({
      prisma,
      doctorId: req.doctor.id,
      childId
    });

    const test = await ensureTestForType({
      prisma,
      testId,
      expectedType: 'VERBAL_NONSENSE'
    });

    ensureUniqueAnswerQuestionIds(answers);

    const data = await prisma.$transaction(async (tx) => {
      const questions = await tx.q_VerbalNonsense.findMany({
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

        if (typeof answer.isCorrect !== 'boolean') {
          throw createHttpError(422, 'INVALID_ANSWER', `Question ${answer.questionId} requires isCorrect as a boolean`);
        }

        const score = answer.isCorrect ? 1 : 0;
        totalScore += score;

        answerRows.push({
          questionId: question.id,
          isCorrect: answer.isCorrect,
          doctorNote: answer.doctorNote || null
        });
      }

      const maxScore = answerRows.length;
      const existing = await tx.assessmentResult.findFirst({
        where: {
          childId,
          testId: test.id,
          sessionId
        },
        select: { id: true }
      });

      const result = existing
        ? await tx.assessmentResult.update({
            where: { id: existing.id },
            data: {
              scoreGiven: totalScore,
              totalScore,
              maxScore
            }
          })
        : await tx.assessmentResult.create({
            data: {
              childId,
              testId: test.id,
              sessionId,
              scoreGiven: totalScore,
              totalScore,
              maxScore
            }
          });

      if (existing) {
        await tx.q_VerbalNonsense_Answer.deleteMany({
          where: { resultId: existing.id }
        });
      }

      await tx.q_VerbalNonsense_Answer.createMany({
        data: answerRows.map((answer) => ({
          resultId: result.id,
          questionId: answer.questionId,
          isCorrect: answer.isCorrect,
          doctorNote: answer.doctorNote
        }))
      });

      return {
        created: !existing,
        assessmentResultId: result.id,
        totalScore,
        maxScore,
        answers: answerRows
      };
    });

    res.status(data.created ? 201 : 200).json({
      success: true,
      data: {
        assessmentResultId: data.assessmentResultId,
        totalScore: data.totalScore,
        maxScore: data.maxScore,
        answers: data.answers
      }
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Submit doctor verbal nonsense assessment error:', error);
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
