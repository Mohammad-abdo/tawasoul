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
import { buildHelpAssessmentSubmission, TEST_TYPES } from '../../utils/assessment.utils.js';
import { streamAssessmentSessionPdf } from '../../utils/assessment-pdf.utils.js';

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

const ASSESSMENT_SCORE_BANDS = {
  medium: 0.5,
  strong: 0.75
};

const formatAssessmentScore = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return String(value ?? '');
  }

  return Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(1);
};

const ensureExactAnswerCount = ({ answers, expectedCount, label }) => {
  if (!Array.isArray(answers) || answers.length !== expectedCount) {
    throw createHttpError(
      422,
      'INCOMPLETE_ASSESSMENT',
      `${label} requires exactly ${expectedCount} answers`
    );
  }
};

const getAssessmentOutcome = ({ test, totalScore, maxScore }) => {
  if (!maxScore || maxScore <= 0) {
    throw createHttpError(422, 'INVALID_MAX_SCORE', 'maxScore must be greater than zero');
  }

  const ratio = totalScore / maxScore;
  const title = test?.titleAr || test?.title || 'التقييم';
  const isStrong = ratio >= ASSESSMENT_SCORE_BANDS.strong;
  const isMedium = ratio >= ASSESSMENT_SCORE_BANDS.medium;

  let diagnosis = 'نتيجة غير مصنفة';
  let childStatus = 'OTHER';

  switch (test?.testType) {
    case TEST_TYPES.ANALOGY:
      if (isStrong) {
        diagnosis = 'أداء جيد في مهارات التناظر والتصنيف';
        childStatus = 'OTHER';
      } else if (isMedium) {
        diagnosis = 'صعوبات متوسطة في مهارات التناظر والتصنيف';
        childStatus = 'SKILLS_DEVELOPMENT';
      } else {
        diagnosis = 'صعوبات واضحة في مهارات التناظر والتصنيف';
        childStatus = 'LEARNING_DIFFICULTIES';
      }
      break;

    case TEST_TYPES.VISUAL_MEMORY:
      if (isStrong) {
        diagnosis = 'ذاكرة بصرية جيدة';
        childStatus = 'OTHER';
      } else if (isMedium) {
        diagnosis = 'ذاكرة بصرية متوسطة وتحتاج إلى تنمية';
        childStatus = 'SKILLS_DEVELOPMENT';
      } else {
        diagnosis = 'ضعف في الذاكرة البصرية';
        childStatus = 'LEARNING_DIFFICULTIES';
      }
      break;

    case TEST_TYPES.AUDITORY_MEMORY:
      if (isStrong) {
        diagnosis = 'ذاكرة سمعية جيدة';
        childStatus = 'OTHER';
      } else if (isMedium) {
        diagnosis = 'ذاكرة سمعية متوسطة وتحتاج إلى دعم';
        childStatus = 'SKILLS_DEVELOPMENT';
      } else {
        diagnosis = 'ضعف في الذاكرة السمعية';
        childStatus = 'SPEECH_DISORDER';
      }
      break;

    case TEST_TYPES.VERBAL_NONSENSE:
      if (isStrong) {
        diagnosis = 'أداء جيد في النطق والتمييز اللفظي';
        childStatus = 'OTHER';
      } else if (isMedium) {
        diagnosis = 'صعوبات متوسطة في النطق والتمييز اللفظي';
        childStatus = 'SPEECH_DISORDER';
      } else {
        diagnosis = 'صعوبات واضحة في النطق والتمييز اللفظي';
        childStatus = 'SPEECH_DISORDER';
      }
      break;

    case TEST_TYPES.IMAGE_SEQUENCE_ORDER:
      if (isStrong) {
        diagnosis = 'قدرة جيدة على ترتيب التسلسل البصري';
        childStatus = 'OTHER';
      } else if (isMedium) {
        diagnosis = 'قدرة متوسطة على ترتيب التسلسل البصري';
        childStatus = 'SKILLS_DEVELOPMENT';
      } else {
        diagnosis = 'ضعف في ترتيب التسلسل البصري';
        childStatus = 'LEARNING_DIFFICULTIES';
      }
      break;

    case TEST_TYPES.HELP:
      if (isStrong) {
        diagnosis = 'المهارات النمائية ضمن المستوى المتوقع';
        childStatus = 'OTHER';
      } else if (isMedium) {
        diagnosis = 'المهارات النمائية تحتاج إلى دعم وتدريب';
        childStatus = 'SKILLS_DEVELOPMENT';
      } else {
        diagnosis = 'يوجد تأخر نمائي يستدعي تنمية مهارات مكثفة';
        childStatus = 'SKILLS_DEVELOPMENT';
      }
      break;

    default:
      break;
  }

  return {
    diagnosis,
    childStatus,
    caseDescription: `تم إجراء ${title}. النتيجة: ${formatAssessmentScore(totalScore)}/${formatAssessmentScore(maxScore)} (${diagnosis}).`
  };
};

const updateChildAssessmentOutcome = async ({ tx, childId, outcome }) =>
  tx.child.update({
    where: { id: childId },
    data: {
      status: outcome.childStatus,
      caseDescription: outcome.caseDescription
    }
  });

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
        test: true
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

export const downloadAssessmentSessionPdf = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    await ensureDoctorCanAccessChild({
      prisma,
      doctorId: req.doctor.id,
      childId: req.params.childId
    });

    const [child, results] = await Promise.all([
      prisma.child.findUnique({
        where: { id: req.params.childId },
        select: { id: true, name: true, age: true, gender: true, status: true }
      }),
      fetchAssessmentSessionResults({
        prisma,
        childId: req.params.childId,
        sessionId: req.params.sessionId
      })
    ]);

    if (!child) {
      return res.status(404).json({
        success: false,
        error: { code: 'CHILD_NOT_FOUND', message: 'Child not found' }
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'ASSESSMENT_RESULT_NOT_FOUND', message: 'Assessment session not found' }
      });
    }

    await streamAssessmentSessionPdf({
      res,
      child,
      sessionId: req.params.sessionId,
      results: results.map(serializeAssessmentResultDetail),
      requestedBy: `doctor:${req.doctor.id}`
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Download doctor assessment session pdf error:', error);
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

    const normalizedAnswers = Array.isArray(answers)
      ? answers.map((answer) => ({
          questionId: answer.questionId,
          scoreGiven: Number.parseFloat(answer.scoreGiven)
        }))
      : [{
          questionId,
          scoreGiven: Number.parseFloat(scoreGiven)
        }];

    const questionIds = [...new Set(normalizedAnswers.map((answer) => answer.questionId))];
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } }
    });
    const questionById = new Map(questions.map((q) => [q.id, q]));

    if (questions.length !== questionIds.length) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'INVALID_QUESTION',
          message: 'Question does not belong to the provided test'
        }
      });
    }

    let totalScore = 0;
    let maxScore = 0;

    for (const answer of normalizedAnswers) {
      const question = questionById.get(answer.questionId);

      if (!question || question.testId !== test.id) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'INVALID_QUESTION',
            message: 'Question does not belong to the provided test'
          }
        });
      }

      if (question.maxScore !== null && answer.scoreGiven > question.maxScore) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'SCORE_OUT_OF_BOUNDS',
            message: 'scoreGiven must not exceed question.maxScore'
          }
        });
      }

      totalScore += answer.scoreGiven;
      maxScore += question.maxScore ?? 0;
    }

    const existing = await prisma.assessmentResult.findFirst({
      where: {
        childId,
        testId: test.id,
        sessionId
      }
    });

    const result = existing
      ? await prisma.assessmentResult.update({
          where: { id: existing.id },
          data: {
            testId: test.id,
            sessionId,
            totalScore,
            maxScore
          }
        })
      : await prisma.assessmentResult.create({
          data: {
            childId,
            testId: test.id,
            sessionId,
            totalScore,
            maxScore
          }
        });

    res.status(existing ? 200 : 201).json({
      success: true,
      data: {
        assessmentResultId: result.id,
        totalScore: result.totalScore,
        maxScore: result.maxScore,
        sessionId: result.sessionId,
        savedCount: normalizedAnswers.length
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
      childStatus = 'OTHER'; 
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
    const expectedQuestionCount = await prisma.q_VerbalNonsense.count({
      where: { testId: test.id }
    });

    ensureExactAnswerCount({
      answers,
      expectedCount: expectedQuestionCount,
      label: 'Verbal nonsense assessment'
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
      const outcome = getAssessmentOutcome({
        test,
        totalScore,
        maxScore
      });
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
              totalScore,
              maxScore
            }
          })
        : await tx.assessmentResult.create({
            data: {
              childId,
              testId: test.id,
              sessionId,
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

      await updateChildAssessmentOutcome({
        tx,
        childId,
        outcome
      });

      return {
        created: !existing,
        assessmentResultId: result.id,
        totalScore,
        maxScore,
        diagnosis: outcome.diagnosis,
        answers: answerRows
      };
    });

    res.status(data.created ? 201 : 200).json({
      success: true,
      data: {
        assessmentResultId: data.assessmentResultId,
        totalScore: data.totalScore,
        maxScore: data.maxScore,
        diagnosis: data.diagnosis,
        answers: data.answers
      }
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Submit doctor verbal nonsense assessment error:', error);
    next(error);
  }
};

export const submitHelpAssessment = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { childId, testId, sessionId, developmentalAge, answers } = req.body;

    await ensureDoctorCanAccessChild({
      prisma,
      doctorId: req.doctor.id,
      childId
    });

    const test = await ensureTestForType({
      prisma,
      testId,
      expectedType: 'HELP'
    });
    const expectedSkillCount = await prisma.helpSkill.count();

    ensureExactAnswerCount({
      answers,
      expectedCount: expectedSkillCount,
      label: 'HELP assessment'
    });

    const data = await prisma.$transaction(async (tx) => {
      const submission = await buildHelpAssessmentSubmission({
        prisma: tx,
        answers
      });
      const outcome = getAssessmentOutcome({
        test,
        totalScore: submission.totalScore,
        maxScore: submission.maxScore
      });

      const result = await tx.assessmentResult.create({
        data: {
          childId,
          testId: test.id,
          sessionId,
          totalScore: submission.totalScore,
          maxScore: submission.maxScore
        }
      });

      const helpAssessment = await tx.helpAssessment.create({
        data: {
          childId,
          doctorId: req.doctor.id,
          assessmentResultId: result.id,
          sessionId,
          developmentalAge
        }
      });

      await tx.helpEvaluation.createMany({
        data: submission.evaluations.map((evaluation) => ({
          assessmentId: helpAssessment.id,
          skillId: evaluation.skillId,
          score: evaluation.score,
          doctorNotes: evaluation.doctorNotes
        }))
      });

      await updateChildAssessmentOutcome({
        tx,
        childId,
        outcome
      });

      return {
        helpAssessmentId: helpAssessment.id,
        assessmentResultId: result.id,
        totalScore: submission.totalScore,
        maxScore: submission.maxScore,
        diagnosis: outcome.diagnosis
      };
    });

    res.status(201).json({
      success: true,
      data: {
        ...data,
        sessionId,
        message: 'تم حفظ تقييم HELP وتحديث حالة الطفل بنجاح'
      }
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Submit HELP assessment error:', error);
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
// دوال مساعدة ضيفها فوق مع باقي الدوال
const normalizeAuditoryModelItems = (modelAnswer) => {
  if (Array.isArray(modelAnswer?.items)) return modelAnswer.items;
  if (Array.isArray(modelAnswer)) return modelAnswer;
  return [];
};

const normalizeSequenceOrderSubmission = (submittedOrder) => {
  if (Array.isArray(submittedOrder)) return submittedOrder;
  return [];
};

// ==========================================
// باقي الـ Controllers الجديدة
// ==========================================

export const submitAnalogyAssessment = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { childId, testId, sessionId, answers } = req.body;

    // التعديل هنا: استخدام ensureDoctorCanAccessChild
    await ensureDoctorCanAccessChild({ prisma, doctorId: req.doctor.id, childId });
    const test = await ensureTestForType({ prisma, testId, expectedType: 'ANALOGY' });
    const expectedQuestionCount = await prisma.q_Analogy.count({
      where: { testId: test.id }
    });

    ensureExactAnswerCount({
      answers,
      expectedCount: expectedQuestionCount,
      label: 'Analogy assessment'
    });
    ensureUniqueAnswerQuestionIds(answers);

    const data = await prisma.$transaction(async (tx) => {
      const questions = await tx.q_Analogy.findMany({
        where: { id: { in: answers.map((answer) => answer.questionId) }, testId: test.id }
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

        if (!question) throw createHttpError(422, 'INVALID_QUESTION', `Question ${answer.questionId} does not belong to this test`);
        if (answer.chosenIndex < 0 || answer.chosenIndex >= choices.length) throw createHttpError(422, 'ANSWER_OUT_OF_BOUNDS', `chosenIndex is out of bounds`);

        const score = answer.chosenIndex === question.correctIndex ? 1 : 0;
        totalScore += score;
        answerRows.push({ questionId: question.id, chosenIndex: answer.chosenIndex, score });
      }

      const maxScore = answers.length;
      const outcome = getAssessmentOutcome({
        test,
        totalScore,
        maxScore
      });
      const result = await tx.assessmentResult.create({
        data: { childId, testId: test.id, sessionId, totalScore, maxScore }
      });

      await tx.q_Analogy_Answer.createMany({
        data: answerRows.map((answer) => ({
          resultId: result.id, questionId: answer.questionId, chosenIndex: answer.chosenIndex, score: answer.score
        }))
      });

      await updateChildAssessmentOutcome({
        tx,
        childId,
        outcome
      });

      return {
        assessmentResultId: result.id,
        totalScore,
        maxScore,
        diagnosis: outcome.diagnosis,
        answers: answerRows
      };
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Submit doctor analogy assessment error:', error);
    next(error);
  }
};

export const submitVisualMemoryAssessment = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { childId, testId, sessionId, answers } = req.body;

    await ensureDoctorCanAccessChild({ prisma, doctorId: req.doctor.id, childId });
    const test = await ensureTestForType({ prisma, testId, expectedType: 'VISUAL_MEMORY' });
    const expectedQuestionCount = await prisma.q_VisualMemory.count({
      where: {
        batch: {
          testId: test.id
        }
      }
    });

    ensureExactAnswerCount({
      answers,
      expectedCount: expectedQuestionCount,
      label: 'Visual memory assessment'
    });
    ensureUniqueAnswerQuestionIds(answers);

    const data = await prisma.$transaction(async (tx) => {
      const questions = await tx.q_VisualMemory.findMany({
        where: { id: { in: answers.map((answer) => answer.questionId) }, batch: { testId: test.id } }
      });

      if (questions.length !== answers.length) throw createHttpError(422, 'INVALID_QUESTION', 'One or more questions do not belong to this test');

      const questionMap = new Map(questions.map((question) => [question.id, question]));
      let totalScore = 0;
      const answerRows = [];

      for (const answer of answers) {
        const question = questionMap.get(answer.questionId);
        if (!question) throw createHttpError(422, 'INVALID_QUESTION', `Question ${answer.questionId} does not belong to this test`);

        let score = 0;
        let answerBool = null;
        let chosenIndex = null;

        if (question.questionType === 'YES_NO') {
          if (typeof answer.answerBool !== 'boolean') throw createHttpError(422, 'INVALID_ANSWER', `Requires answerBool`);
          answerBool = answer.answerBool;
          score = answerBool === question.correctBool ? 1 : 0;
        } else {
          const choices = Array.isArray(question.choices) ? question.choices : [];
          chosenIndex = answer.chosenIndex;
          if (!Number.isInteger(chosenIndex) || chosenIndex < 0 || chosenIndex >= choices.length) throw createHttpError(422, 'ANSWER_OUT_OF_BOUNDS', `chosenIndex out of bounds`);
          score = chosenIndex === question.correctIndex ? 1 : 0;
        }

        totalScore += score;
        answerRows.push({ questionId: question.id, answerBool, chosenIndex, score });
      }

      const maxScore = answers.length;
      const outcome = getAssessmentOutcome({
        test,
        totalScore,
        maxScore
      });
      const result = await tx.assessmentResult.create({
        data: { childId, testId: test.id, sessionId, totalScore, maxScore }
      });

      await tx.q_VisualMemory_Answer.createMany({
        data: answerRows.map((answer) => ({
          resultId: result.id, questionId: answer.questionId, answerBool: answer.answerBool, chosenIndex: answer.chosenIndex, score: answer.score
        }))
      });

      await updateChildAssessmentOutcome({
        tx,
        childId,
        outcome
      });

      return {
        assessmentResultId: result.id,
        totalScore,
        maxScore,
        diagnosis: outcome.diagnosis,
        answers: answerRows
      };
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Submit doctor visual memory assessment error:', error);
    next(error);
  }
};

export const submitAuditoryMemoryAssessment = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { childId, testId, sessionId, answers } = req.body;

    await ensureDoctorCanAccessChild({ prisma, doctorId: req.doctor.id, childId });
    const test = await ensureTestForType({ prisma, testId, expectedType: 'AUDITORY_MEMORY' });
    const expectedQuestionCount = await prisma.q_AuditoryMemory.count({
      where: { testId: test.id }
    });

    ensureExactAnswerCount({
      answers,
      expectedCount: expectedQuestionCount,
      label: 'Auditory memory assessment'
    });
    ensureUniqueAnswerQuestionIds(answers);

    const data = await prisma.$transaction(async (tx) => {
      const questions = await tx.q_AuditoryMemory.findMany({
        where: { id: { in: answers.map((answer) => answer.questionId) }, testId: test.id }
      });

      if (questions.length !== answers.length) throw createHttpError(422, 'INVALID_QUESTION', 'One or more questions do not belong to this test');

      const questionMap = new Map(questions.map((question) => [question.id, question]));
      let totalScore = 0;
      const answerRows = [];

      for (const answer of answers) {
        const question = questionMap.get(answer.questionId);
        if (!question) throw createHttpError(422, 'INVALID_QUESTION', `Question does not belong to test`);

        const modelItems = normalizeAuditoryModelItems(question.modelAnswer);
        const recalledItems = Array.isArray(answer.recalledItems) ? answer.recalledItems : [];
        const itemScores = modelItems.map((item) => ({
          item,
          recalled: recalledItems.includes(item),
          score: recalledItems.includes(item) ? 1 : 0
        }));
        const score = itemScores.reduce((sum, itemScore) => sum + itemScore.score, 0);

        totalScore += score;
        answerRows.push({ questionId: question.id, recalledItems, itemScores, score });
      }

      const maxScore = answerRows.reduce((sum, answer) => sum + answer.itemScores.length, 0);
      const outcome = getAssessmentOutcome({
        test,
        totalScore,
        maxScore
      });
      const result = await tx.assessmentResult.create({
        data: { childId, testId: test.id, sessionId, totalScore, maxScore }
      });

      await tx.q_AuditoryMemory_Answer.createMany({
        data: answerRows.map((answer) => ({
          resultId: result.id, questionId: answer.questionId, recalledItems: answer.recalledItems, itemScores: answer.itemScores, score: answer.score
        }))
      });

      await updateChildAssessmentOutcome({
        tx,
        childId,
        outcome
      });

      return {
        assessmentResultId: result.id,
        totalScore,
        maxScore,
        diagnosis: outcome.diagnosis,
        answers: answerRows
      };
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Submit doctor auditory memory assessment error:', error);
    next(error);
  }
};

export const submitImageSequenceOrderAssessment = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { childId, testId, sessionId, answers } = req.body;

    await ensureDoctorCanAccessChild({ prisma, doctorId: req.doctor.id, childId });
    const test = await ensureTestForType({ prisma, testId, expectedType: 'IMAGE_SEQUENCE_ORDER' });
    const expectedQuestionCount = await prisma.q_SequenceOrder.count({
      where: { testId: test.id }
    });

    ensureExactAnswerCount({
      answers,
      expectedCount: expectedQuestionCount,
      label: 'Image sequence order assessment'
    });
    ensureUniqueAnswerQuestionIds(answers);

    const data = await prisma.$transaction(async (tx) => {
      const questions = await tx.q_SequenceOrder.findMany({
        where: { id: { in: answers.map((answer) => answer.questionId) }, testId: test.id },
        include: { images: { orderBy: [{ position: 'asc' }, { id: 'asc' }] } }
      });

      if (questions.length !== answers.length) throw createHttpError(422, 'INVALID_QUESTION', 'Mismatch in questions');

      const questionMap = new Map(questions.map((q) => [q.id, q]));
      let totalScore = 0;
      const answerRows = [];

      for (const answer of answers) {
        const question = questionMap.get(answer.questionId);
        if (!question) throw createHttpError(422, 'INVALID_QUESTION', `Invalid question`);

        const images = Array.isArray(question.images) ? question.images : [];
        const submittedOrder = normalizeSequenceOrderSubmission(answer.submittedOrder);

        if (submittedOrder.length !== images.length) throw createHttpError(422, 'INVALID_ANSWER', `Requires one position per image`);

        const validImageIds = new Set(images.map((img) => img.id));
        const seenImageIds = new Set();
        const seenPositions = new Set();

        for (const item of submittedOrder) {
          if (!item || !item.imageId || item.submittedPosition < 1 || item.submittedPosition > images.length) throw createHttpError(422, 'INVALID_ANSWER', 'Invalid order data');
          if (!validImageIds.has(item.imageId)) throw createHttpError(422, 'INVALID_ANSWER', 'Invalid image ID');
          if (seenImageIds.has(item.imageId) || seenPositions.has(item.submittedPosition)) throw createHttpError(422, 'DUPLICATE_ANSWER', 'Duplicate submission');

          seenImageIds.add(item.imageId);
          seenPositions.add(item.submittedPosition);
        }

        const submittedMap = new Map(submittedOrder.map((item) => [item.imageId, item.submittedPosition]));
        const itemScores = images.map((image) => {
          const submittedPosition = submittedMap.get(image.id) ?? null;
          const score = submittedPosition === image.position ? 1 : 0;
          return { imageId: image.id, correctPosition: image.position, submittedPosition, score };
        });

        const score = itemScores.reduce((sum, item) => sum + item.score, 0);
        totalScore += score;
        answerRows.push({ questionId: question.id, submittedOrder, itemScores, score });
      }

      const maxScore = answerRows.reduce((sum, answer) => sum + answer.itemScores.length, 0);
      const outcome = getAssessmentOutcome({
        test,
        totalScore,
        maxScore
      });
      const result = await tx.assessmentResult.create({
        data: { childId, testId: test.id, sessionId, totalScore, maxScore }
      });

      await tx.q_SequenceOrder_Answer.createMany({
        data: answerRows.map((answer) => ({
          resultId: result.id, questionId: answer.questionId, submittedOrder: answer.submittedOrder, itemScores: answer.itemScores, score: answer.score
        }))
      });

      await updateChildAssessmentOutcome({
        tx,
        childId,
        outcome
      });

      return {
        assessmentResultId: result.id,
        totalScore,
        maxScore,
        diagnosis: outcome.diagnosis,
        answers: answerRows
      };
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Submit doctor image sequence order assessment error:', error);
    next(error);
  }
};
