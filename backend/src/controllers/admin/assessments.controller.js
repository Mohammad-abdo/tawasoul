import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import {
  countAssessmentQuestions,
  fetchAssessmentQuestions,
  getAdminQuestionEntityById,
  getQuestionModelForTestType,
  parseMaybeJson,
  serializeAssessmentQuestion
} from '../../utils/assessment.utils.js';

const formatTest = (test, questionCount, questions = undefined) => ({
  ...test,
  questionModel: getQuestionModelForTestType(test.testType),
  questionCount,
  ...(questions !== undefined ? { questions } : {})
});

const getUploadedAssetPaths = (req) => {
  const audioFile = req.files?.audio?.[0];
  const imageFile = req.files?.image?.[0];

  return {
    audioAssetPath: audioFile ? `assessments/audio/${audioFile.filename}` : undefined,
    imageAssetPath: imageFile ? `assessments/images/${imageFile.filename}` : undefined
  };
};

const validationError = (message) => {
  const error = new Error(message);
  error.name = 'AssessmentValidationError';
  return error;
};

const parseVisualMemoryQuestions = (rawQuestions) => {
  const questions = parseMaybeJson(rawQuestions, []);
  if (!Array.isArray(questions) || questions.length === 0) {
    throw validationError('Visual memory batches require a non-empty questions array');
  }

  return questions.map((question, index) => ({
    order: question.order != null ? Number.parseInt(question.order, 10) : index + 1,
    questionText: question.questionText,
    questionType: question.questionType,
    correctBool: question.correctBool ?? null,
    choices: question.choices ?? null,
    correctIndex: question.correctIndex ?? null
  }));
};

const createSpecializedQuestion = async ({ tx, req, test, testId, body }) => {
  const { audioAssetPath, imageAssetPath } = getUploadedAssetPaths(req);

  switch (test.testType) {
    case 'CARS':
      return tx.q_CARS.create({
        data: {
          testId,
          order: body.order != null ? Number.parseInt(body.order, 10) : 0,
          questionText: parseMaybeJson(body.questionText),
          choices: parseMaybeJson(body.choices, [])
        }
      });

    case 'ANALOGY':
      return tx.q_Analogy.create({
        data: {
          testId,
          order: body.order != null ? Number.parseInt(body.order, 10) : 0,
          questionImageUrl: body.questionImageUrl || imageAssetPath,
          choices: parseMaybeJson(body.choices, []),
          correctIndex: Number.parseInt(body.correctIndex, 10)
        }
      });

    case 'VISUAL_MEMORY':
      return tx.q_VisualMemory_Batch.create({
        data: {
          testId,
          order: body.order != null ? Number.parseInt(body.order, 10) : 0,
          imageUrl: body.imageUrl || imageAssetPath,
          displaySeconds: Number.parseInt(body.displaySeconds, 10),
          questions: {
            create: parseVisualMemoryQuestions(body.questions)
          }
        },
        include: {
          questions: {
            orderBy: [{ order: 'asc' }, { id: 'asc' }]
          }
        }
      });

    case 'AUDITORY_MEMORY':
      return tx.q_AuditoryMemory.create({
        data: {
          testId,
          order: body.order != null ? Number.parseInt(body.order, 10) : 0,
          audioClipUrl: body.audioClipUrl || audioAssetPath,
          questionText: parseMaybeJson(body.questionText),
          modelAnswer: parseMaybeJson(body.modelAnswer, [])
        }
      });

    case 'HELP':
      return tx.helpSkill.create({
        data: {
          domain: body.domain,
          skillNumber: body.skillNumber,
          description: body.description,
          ageRange: body.ageRange
        }
      });

    default:
      return tx.question.create({
        data: {
          testId,
          orderIndex: body.orderIndex != null ? Number.parseInt(body.orderIndex, 10) : 0,
          audioAssetPath: audioAssetPath || null,
          imageAssetPath: imageAssetPath || null,
          choices: parseMaybeJson(body.choices, null),
          scoringGuide: body.scoringGuide,
          maxScore: body.maxScore != null ? Number.parseInt(body.maxScore, 10) : null
        }
      });
  }
};

const updateSpecializedQuestion = async ({ tx, req, found, body }) => {
  const { audioAssetPath, imageAssetPath } = getUploadedAssetPaths(req);

  switch (found.testType) {
    case 'CARS':
      return tx.q_CARS.update({
        where: { id: found.entity.id },
        data: {
          ...(body.order !== undefined && { order: Number.parseInt(body.order, 10) }),
          ...(body.questionText !== undefined && { questionText: parseMaybeJson(body.questionText) }),
          ...(body.choices !== undefined && { choices: parseMaybeJson(body.choices, []) })
        }
      });

    case 'ANALOGY':
      return tx.q_Analogy.update({
        where: { id: found.entity.id },
        data: {
          ...(body.order !== undefined && { order: Number.parseInt(body.order, 10) }),
          ...((body.questionImageUrl !== undefined || imageAssetPath) && { questionImageUrl: body.questionImageUrl || imageAssetPath }),
          ...(body.choices !== undefined && { choices: parseMaybeJson(body.choices, []) }),
          ...(body.correctIndex !== undefined && { correctIndex: Number.parseInt(body.correctIndex, 10) })
        }
      });

    case 'VISUAL_MEMORY': {
      const updatedBatch = await tx.q_VisualMemory_Batch.update({
        where: { id: found.entity.id },
        data: {
          ...(body.order !== undefined && { order: Number.parseInt(body.order, 10) }),
          ...((body.imageUrl !== undefined || imageAssetPath) && { imageUrl: body.imageUrl || imageAssetPath }),
          ...(body.displaySeconds !== undefined && { displaySeconds: Number.parseInt(body.displaySeconds, 10) })
        }
      });

      if (body.questions !== undefined) {
        await tx.q_VisualMemory.deleteMany({ where: { batchId: found.entity.id } });
        const nestedQuestions = parseVisualMemoryQuestions(body.questions);
        for (const question of nestedQuestions) {
          await tx.q_VisualMemory.create({
            data: {
              batchId: found.entity.id,
              ...question
            }
          });
        }
      }

      return tx.q_VisualMemory_Batch.findUnique({
        where: { id: updatedBatch.id },
        include: {
          questions: {
            orderBy: [{ order: 'asc' }, { id: 'asc' }]
          }
        }
      });
    }

    case 'AUDITORY_MEMORY':
      return tx.q_AuditoryMemory.update({
        where: { id: found.entity.id },
        data: {
          ...(body.order !== undefined && { order: Number.parseInt(body.order, 10) }),
          ...((body.audioClipUrl !== undefined || audioAssetPath) && { audioClipUrl: body.audioClipUrl || audioAssetPath }),
          ...(body.questionText !== undefined && { questionText: parseMaybeJson(body.questionText) }),
          ...(body.modelAnswer !== undefined && { modelAnswer: parseMaybeJson(body.modelAnswer, []) })
        }
      });

    case 'HELP':
      return tx.helpSkill.update({
        where: { id: found.entity.id },
        data: {
          ...(body.domain !== undefined && { domain: body.domain }),
          ...(body.skillNumber !== undefined && { skillNumber: body.skillNumber }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.ageRange !== undefined && { ageRange: body.ageRange })
        }
      });

    default:
      return tx.question.update({
        where: { id: found.entity.id },
        data: {
          ...(audioAssetPath && { audioAssetPath }),
          ...(imageAssetPath && { imageAssetPath }),
          ...(body.scoringGuide !== undefined && { scoringGuide: body.scoringGuide }),
          ...(body.orderIndex !== undefined && { orderIndex: Number.parseInt(body.orderIndex, 10) }),
          ...(body.choices !== undefined && { choices: parseMaybeJson(body.choices, null) }),
          ...(body.maxScore !== undefined && { maxScore: body.maxScore ? Number.parseInt(body.maxScore, 10) : null })
        }
      });
  }
};

/**
 * Get All Tests
 */
export const getAllTests = async (req, res, next) => {
  try {
    const {
      testType,
      page = 1,
      limit = 20
    } = req.query;
    const skip = (Number.parseInt(page, 10) - 1) * Number.parseInt(limit, 10);
    const take = Number.parseInt(limit, 10);

    const where = {};
    if (testType) where.testType = testType;

    const [tests, total] = await Promise.all([
      prisma.test.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.test.count({ where })
    ]);

    const enrichedTests = await Promise.all(
      tests.map(async (test) => formatTest(test, await countAssessmentQuestions({ prisma, test })))
    );

    res.json({
      success: true,
      data: {
        tests: enrichedTests,
        pagination: {
          page: Number.parseInt(page, 10),
          limit: Number.parseInt(limit, 10),
          total,
          pages: Math.ceil(total / Number.parseInt(limit, 10))
        }
      }
    });
  } catch (error) {
    logger.error('Get all tests error:', error);
    next(error);
  }
};

/**
 * Get Test by ID
 */
export const getTestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const test = await prisma.test.findUnique({
      where: { id }
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
      fetchAssessmentQuestions({ prisma, test, req, includeCorrect: true })
    ]);

    res.json({
      success: true,
      data: formatTest(test, questionCount, questions)
    });
  } catch (error) {
    logger.error('Get test by ID error:', error);
    next(error);
  }
};

/**
 * Create Test
 */
export const createTest = async (req, res, next) => {
  try {
    const { title, titleAr, testType, description, type } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title is required'
        }
      });
    }

    const test = await prisma.test.create({
      data: {
        title,
        titleAr: titleAr || null,
        testType: testType || 'CARS',
        type: type || undefined,
        description
      }
    });

    logger.info(`Test created: ${test.id} by admin ${req.admin.id}`);

    res.status(201).json({
      success: true,
      data: formatTest(test, 0, [])
    });
  } catch (error) {
    logger.error('Create test error:', error);
    next(error);
  }
};

/**
 * Update Test
 */
export const updateTest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, titleAr, testType, description, type } = req.body;

    const test = await prisma.test.findUnique({
      where: { id }
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

    const updatedTest = await prisma.test.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(titleAr !== undefined && { titleAr }),
        ...(testType && { testType }),
        ...(type && { type }),
        ...(description !== undefined && { description })
      }
    });

    logger.info(`Test updated: ${id} by admin ${req.admin.id}`);

    res.json({
      success: true,
      data: formatTest(updatedTest, await countAssessmentQuestions({ prisma, test: updatedTest }))
    });
  } catch (error) {
    logger.error('Update test error:', error);
    next(error);
  }
};

/**
 * Delete Test
 */
export const deleteTest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const test = await prisma.test.findUnique({
      where: { id }
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

    await prisma.test.delete({
      where: { id }
    });

    logger.info(`Test deleted: ${id} by admin ${req.admin.id}`);

    res.json({
      success: true,
      message: 'Test deleted successfully'
    });
  } catch (error) {
    logger.error('Delete test error:', error);
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
      fetchAssessmentQuestions({ prisma, test, req, includeCorrect: true })
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

/**
 * Get Question by ID
 */
export const getQuestionById = async (req, res, next) => {
  try {
    const found = await getAdminQuestionEntityById({ prisma, id: req.params.id, req });

    if (!found) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'QUESTION_NOT_FOUND',
          message: 'Question not found'
        }
      });
    }

    res.json({
      success: true,
      data: found.serialized
    });
  } catch (error) {
    logger.error('Get question by ID error:', error);
    next(error);
  }
};

/**
 * Create Question
 */
export const createQuestion = async (req, res, next) => {
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

    const question = await prisma.$transaction((tx) =>
      createSpecializedQuestion({
        tx,
        req,
        test,
        testId,
        body: req.body
      })
    );

    logger.info(`Question created: ${question.id} for test ${testId} by admin ${req.admin.id}`);

    res.status(201).json({
      success: true,
      data: serializeAssessmentQuestion({
        req,
        testType: test.testType,
        question,
        includeCorrect: true
      })
    });
  } catch (error) {
    logger.error('Create question error:', error);

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

/**
 * Update Question
 */
export const updateQuestion = async (req, res, next) => {
  try {
    const found = await getAdminQuestionEntityById({ prisma, id: req.params.id, req });

    if (!found) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'QUESTION_NOT_FOUND',
          message: 'Question not found'
        }
      });
    }

    const updatedQuestion = await prisma.$transaction((tx) =>
      updateSpecializedQuestion({
        tx,
        req,
        found,
        body: req.body
      })
    );

    logger.info(`Question updated: ${req.params.id} by admin ${req.admin.id}`);

    res.json({
      success: true,
      data: serializeAssessmentQuestion({
        req,
        testType: found.testType === 'LEGACY' ? found.entity.test?.testType : found.testType,
        question: updatedQuestion,
        includeCorrect: true
      })
    });
  } catch (error) {
    logger.error('Update question error:', error);

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

/**
 * Delete Question
 */
export const deleteQuestion = async (req, res, next) => {
  try {
    const found = await getAdminQuestionEntityById({ prisma, id: req.params.id, req });

    if (!found) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'QUESTION_NOT_FOUND',
          message: 'Question not found'
        }
      });
    }

    await prisma.$transaction(async (tx) => {
      switch (found.testType) {
        case 'CARS':
          await tx.q_CARS.delete({ where: { id: found.entity.id } });
          break;
        case 'ANALOGY':
          await tx.q_Analogy.delete({ where: { id: found.entity.id } });
          break;
        case 'VISUAL_MEMORY':
          await tx.q_VisualMemory_Batch.delete({ where: { id: found.entity.id } });
          break;
        case 'AUDITORY_MEMORY':
          await tx.q_AuditoryMemory.delete({ where: { id: found.entity.id } });
          break;
        case 'HELP':
          await tx.helpSkill.delete({ where: { id: found.entity.id } });
          break;
        default:
          await tx.question.delete({ where: { id: found.entity.id } });
      }
    });

    logger.info(`Question deleted: ${req.params.id} by admin ${req.admin.id}`);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    logger.error('Delete question error:', error);
    next(error);
  }
};
