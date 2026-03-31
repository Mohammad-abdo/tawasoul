import { validationResult } from 'express-validator';
import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import {
  buildTestDetail,
  getQuestionCountForTest,
  buildTestSummary,
  ensureTestForType,
  GENERIC_TEST_TYPES
} from '../../utils/assessment-api.utils.js';
import { createHttpError } from '../../utils/httpError.js';
import { parseMaybeJson, serializeAssessmentQuestion } from '../../utils/assessment.utils.js';

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

const ensureOrderAvailable = async (delegate, where, message, excludeId = null) => {
  const existing = await delegate.findFirst({
    where,
    select: { id: true }
  });

  if (existing && existing.id !== excludeId) {
    throw createHttpError(409, 'ORDER_CONFLICT', message);
  }
};

const findScopedRecordOrThrow = async (delegate, where, code = 'QUESTION_NOT_FOUND', message = 'Question not found') => {
  const record = await delegate.findFirst({
    where
  });

  if (!record) {
    throw createHttpError(404, code, message);
  }

  return record;
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
      orderBy: { createdAt: 'desc' }
    });

    const data = await Promise.all(
      tests.map(async (test) => buildTestSummary({
        test,
        questionCount: await getQuestionCountForTest({ prisma, test })
      }))
    );

    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Get admin tests error:', error);
    next(error);
  }
};

export const createTest = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { title, titleAr, type, testType, description } = req.body;

    const test = await prisma.test.create({
      data: {
        title,
        titleAr,
        type,
        testType,
        description: description || null
      }
    });

    logger.info(`Assessment test created: ${test.id} by admin ${req.admin.id}`);

    res.status(201).json({
      success: true,
      data: buildTestSummary({ test, questionCount: 0 })
    });
  } catch (error) {
    logger.error('Create admin test error:', error);
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
      includeCorrect: true
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Get admin test detail error:', error);
    next(error);
  }
};

export const updateTest = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const existing = await prisma.test.findUnique({
      where: { id: req.params.testId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEST_NOT_FOUND',
          message: 'Test not found'
        }
      });
    }

    const updated = await prisma.test.update({
      where: { id: req.params.testId },
      data: {
        ...(req.body.title !== undefined && { title: req.body.title }),
        ...(req.body.titleAr !== undefined && { titleAr: req.body.titleAr }),
        ...(req.body.type !== undefined && { type: req.body.type }),
        ...(req.body.testType !== undefined && { testType: req.body.testType }),
        ...(req.body.description !== undefined && { description: req.body.description || null })
      }
    });

    logger.info(`Assessment test updated: ${updated.id} by admin ${req.admin.id}`);

    res.json({
      success: true,
      data: buildTestSummary({
        test: updated,
        questionCount: await getQuestionCountForTest({ prisma, test: updated })
      })
    });
  } catch (error) {
    logger.error('Update admin test error:', error);
    next(error);
  }
};

export const deleteTest = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const existing = await prisma.test.findUnique({
      where: { id: req.params.testId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEST_NOT_FOUND',
          message: 'Test not found'
        }
      });
    }

    await prisma.test.delete({
      where: { id: req.params.testId }
    });

    logger.info(`Assessment test deleted: ${req.params.testId} by admin ${req.admin.id}`);

    res.json({
      success: true,
      message: 'Test deleted successfully'
    });
  } catch (error) {
    logger.error('Delete admin test error:', error);
    next(error);
  }
};

export const createCarsQuestion = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    await ensureTestForType({
      prisma,
      testId: req.params.testId,
      expectedType: 'CARS'
    });

    await ensureOrderAvailable(
      prisma.q_CARS,
      { testId: req.params.testId, order: req.body.order },
      'A CARS question with this order already exists in this test'
    );

    const question = await prisma.q_CARS.create({
      data: {
        testId: req.params.testId,
        order: req.body.order,
        questionText: parseMaybeJson(req.body.questionText),
        choices: parseMaybeJson(req.body.choices, [])
      }
    });

    res.status(201).json({
      success: true,
      data: serializeAssessmentQuestion({
        req,
        testType: 'CARS',
        question,
        includeCorrect: true
      })
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Create CARS question error:', error);
    next(error);
  }
};

export const updateCarsQuestion = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const existing = await prisma.q_CARS.findUnique({
      where: { id: req.params.questionId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'QUESTION_NOT_FOUND',
          message: 'Question not found'
        }
      });
    }

    if (req.body.order !== undefined && req.body.order !== existing.order) {
      await ensureOrderAvailable(
        prisma.q_CARS,
        { testId: existing.testId, order: req.body.order },
        'A CARS question with this order already exists in this test',
        existing.id
      );
    }

    const updated = await prisma.q_CARS.update({
      where: { id: existing.id },
      data: {
        ...(req.body.order !== undefined && { order: req.body.order }),
        ...(req.body.questionText !== undefined && { questionText: parseMaybeJson(req.body.questionText) }),
        ...(req.body.choices !== undefined && { choices: parseMaybeJson(req.body.choices, []) })
      }
    });

    res.json({
      success: true,
      data: serializeAssessmentQuestion({
        req,
        testType: 'CARS',
        question: updated,
        includeCorrect: true
      })
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Update CARS question error:', error);
    next(error);
  }
};

export const deleteTestQuestion = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const test = await prisma.test.findUnique({
      where: { id: req.params.testId },
      select: { id: true, testType: true }
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

    switch (test.testType) {
      case 'CARS':
        await findScopedRecordOrThrow(prisma.q_CARS, {
          id: req.params.questionId,
          testId: test.id
        });
        await prisma.q_CARS.delete({
          where: { id: req.params.questionId }
        });
        break;
      case 'ANALOGY':
        await findScopedRecordOrThrow(prisma.q_Analogy, {
          id: req.params.questionId,
          testId: test.id
        });
        await prisma.q_Analogy.delete({
          where: { id: req.params.questionId }
        });
        break;
      case 'AUDITORY_MEMORY':
        await findScopedRecordOrThrow(prisma.q_AuditoryMemory, {
          id: req.params.questionId,
          testId: test.id
        });
        await prisma.q_AuditoryMemory.delete({
          where: { id: req.params.questionId }
        });
        break;
      case 'VERBAL_NONSENSE':
        await findScopedRecordOrThrow(prisma.q_VerbalNonsense, {
          id: req.params.questionId,
          testId: test.id
        });
        await prisma.q_VerbalNonsense.delete({
          where: { id: req.params.questionId }
        });
        break;
      case 'IMAGE_SEQUENCE_ORDER':
        await findScopedRecordOrThrow(prisma.q_SequenceOrder, {
          id: req.params.questionId,
          testId: test.id
        });
        await prisma.q_SequenceOrder.delete({
          where: { id: req.params.questionId }
        });
        break;
      case 'SOUND_DISCRIMINATION':
      case 'PRONUNCIATION_REPETITION':
      case 'SOUND_IMAGE_LINKING':
      case 'SEQUENCE_ORDER':
        await findScopedRecordOrThrow(prisma.question, {
          id: req.params.questionId,
          testId: test.id
        });
        await prisma.question.delete({
          where: { id: req.params.questionId }
        });
        break;
      case 'VISUAL_MEMORY':
        return res.status(422).json({
          success: false,
          error: {
            code: 'INVALID_TEST_TYPE',
            message: 'Visual memory content must be deleted using the batch delete endpoint'
          }
        });
      case 'HELP':
        return res.status(422).json({
          success: false,
          error: {
            code: 'INVALID_TEST_TYPE',
            message: 'HELP tests do not support question deletion'
          }
        });
      default:
        return res.status(422).json({
          success: false,
          error: {
            code: 'INVALID_TEST_TYPE',
            message: 'This test type does not support question deletion'
          }
        });
    }

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Delete assessment question error:', error);
    next(error);
  }
};

export const createAnalogyQuestion = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    await ensureTestForType({
      prisma,
      testId: req.params.testId,
      expectedType: 'ANALOGY'
    });

    await ensureOrderAvailable(
      prisma.q_Analogy,
      { testId: req.params.testId, order: req.body.order },
      'An analogy question with this order already exists in this test'
    );

    const question = await prisma.q_Analogy.create({
      data: {
        testId: req.params.testId,
        order: req.body.order,
        questionImageUrl: req.body.questionImageUrl,
        choices: parseMaybeJson(req.body.choices, []),
        correctIndex: req.body.correctIndex
      }
    });

    res.status(201).json({
      success: true,
      data: serializeAssessmentQuestion({
        req,
        testType: 'ANALOGY',
        question,
        includeCorrect: true
      })
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Create analogy question error:', error);
    next(error);
  }
};

export const updateAnalogyQuestion = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const existing = await prisma.q_Analogy.findUnique({
      where: { id: req.params.questionId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'QUESTION_NOT_FOUND',
          message: 'Question not found'
        }
      });
    }

    if (req.body.order !== undefined && req.body.order !== existing.order) {
      await ensureOrderAvailable(
        prisma.q_Analogy,
        { testId: existing.testId, order: req.body.order },
        'An analogy question with this order already exists in this test',
        existing.id
      );
    }

    const nextChoices = req.body.choices === undefined ? existing.choices : parseMaybeJson(req.body.choices, []);
    const nextCorrectIndex = req.body.correctIndex ?? existing.correctIndex;

    if (nextCorrectIndex >= nextChoices.length) {
      throw createHttpError(422, 'VALIDATION_ERROR', 'correctIndex must be within choices bounds');
    }

    const updated = await prisma.q_Analogy.update({
      where: { id: existing.id },
      data: {
        ...(req.body.order !== undefined && { order: req.body.order }),
        ...(req.body.questionImageUrl !== undefined && { questionImageUrl: req.body.questionImageUrl }),
        ...(req.body.choices !== undefined && { choices: nextChoices }),
        ...(req.body.correctIndex !== undefined && { correctIndex: req.body.correctIndex })
      }
    });

    res.json({
      success: true,
      data: serializeAssessmentQuestion({
        req,
        testType: 'ANALOGY',
        question: updated,
        includeCorrect: true
      })
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Update analogy question error:', error);
    next(error);
  }
};

export const createVisualMemoryBatch = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    await ensureTestForType({
      prisma,
      testId: req.params.testId,
      expectedType: 'VISUAL_MEMORY'
    });

    await ensureOrderAvailable(
      prisma.q_VisualMemory_Batch,
      { testId: req.params.testId, order: req.body.order },
      'A visual memory batch with this order already exists in this test'
    );

    const questions = parseMaybeJson(req.body.questions, []);

    const batch = await prisma.$transaction((tx) =>
      tx.q_VisualMemory_Batch.create({
        data: {
          testId: req.params.testId,
          order: req.body.order,
          imageUrl: req.body.imageUrl,
          displaySeconds: req.body.displaySeconds,
          questions: {
            create: questions.map((question) => ({
              order: question.order,
              questionText: question.questionText,
              questionType: question.questionType,
              correctBool: question.correctBool ?? null,
              choices: question.choices ?? null,
              correctIndex: question.correctIndex ?? null
            }))
          }
        },
        include: {
          questions: {
            orderBy: [{ order: 'asc' }, { id: 'asc' }]
          }
        }
      })
    );

    res.status(201).json({
      success: true,
      data: serializeAssessmentQuestion({
        req,
        testType: 'VISUAL_MEMORY',
        question: batch,
        includeCorrect: true
      })
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Create visual memory batch error:', error);
    next(error);
  }
};

export const updateVisualMemoryBatch = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const existing = await prisma.q_VisualMemory_Batch.findUnique({
      where: { id: req.params.batchId },
      include: {
        questions: {
          orderBy: [{ order: 'asc' }, { id: 'asc' }]
        }
      }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BATCH_NOT_FOUND',
          message: 'Batch not found'
        }
      });
    }

    if (req.body.order !== undefined && req.body.order !== existing.order) {
      await ensureOrderAvailable(
        prisma.q_VisualMemory_Batch,
        { testId: existing.testId, order: req.body.order },
        'A visual memory batch with this order already exists in this test',
        existing.id
      );
    }

    const questions = req.body.questions === undefined ? undefined : parseMaybeJson(req.body.questions, []);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.q_VisualMemory_Batch.update({
        where: { id: existing.id },
        data: {
          ...(req.body.order !== undefined && { order: req.body.order }),
          ...(req.body.imageUrl !== undefined && { imageUrl: req.body.imageUrl }),
          ...(req.body.displaySeconds !== undefined && { displaySeconds: req.body.displaySeconds })
        }
      });

      if (questions !== undefined) {
        await tx.q_VisualMemory.deleteMany({
          where: { batchId: existing.id }
        });

        if (questions.length > 0) {
          await tx.q_VisualMemory.createMany({
            data: questions.map((question) => ({
              batchId: existing.id,
              order: question.order,
              questionText: question.questionText,
              questionType: question.questionType,
              correctBool: question.correctBool ?? null,
              choices: question.choices ?? null,
              correctIndex: question.correctIndex ?? null
            }))
          });
        }
      }

      return tx.q_VisualMemory_Batch.findUnique({
        where: { id: existing.id },
        include: {
          questions: {
            orderBy: [{ order: 'asc' }, { id: 'asc' }]
          }
        }
      });
    });

    res.json({
      success: true,
      data: serializeAssessmentQuestion({
        req,
        testType: 'VISUAL_MEMORY',
        question: updated,
        includeCorrect: true
      })
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Update visual memory batch error:', error);
    next(error);
  }
};

export const deleteVisualMemoryBatch = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    await ensureTestForType({
      prisma,
      testId: req.params.testId,
      expectedType: 'VISUAL_MEMORY'
    });

    await findScopedRecordOrThrow(
      prisma.q_VisualMemory_Batch,
      { id: req.params.batchId, testId: req.params.testId },
      'BATCH_NOT_FOUND',
      'Batch not found'
    );
    await prisma.q_VisualMemory_Batch.delete({
      where: { id: req.params.batchId }
    });

    res.json({
      success: true,
      message: 'Batch deleted successfully'
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Delete visual memory batch error:', error);
    next(error);
  }
};

export const createAuditoryMemoryQuestion = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    await ensureTestForType({
      prisma,
      testId: req.params.testId,
      expectedType: 'AUDITORY_MEMORY'
    });

    await ensureOrderAvailable(
      prisma.q_AuditoryMemory,
      { testId: req.params.testId, order: req.body.order },
      'An auditory memory question with this order already exists in this test'
    );

    const question = await prisma.q_AuditoryMemory.create({
      data: {
        testId: req.params.testId,
        order: req.body.order,
        audioClipUrl: req.body.audioClipUrl,
        questionText: parseMaybeJson(req.body.questionText),
        modelAnswer: parseMaybeJson(req.body.modelAnswer)
      }
    });

    res.status(201).json({
      success: true,
      data: serializeAssessmentQuestion({
        req,
        testType: 'AUDITORY_MEMORY',
        question,
        includeCorrect: true
      })
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Create auditory memory question error:', error);
    next(error);
  }
};

export const updateAuditoryMemoryQuestion = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const existing = await prisma.q_AuditoryMemory.findUnique({
      where: { id: req.params.questionId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'QUESTION_NOT_FOUND',
          message: 'Question not found'
        }
      });
    }

    if (req.body.order !== undefined && req.body.order !== existing.order) {
      await ensureOrderAvailable(
        prisma.q_AuditoryMemory,
        { testId: existing.testId, order: req.body.order },
        'An auditory memory question with this order already exists in this test',
        existing.id
      );
    }

    const updated = await prisma.q_AuditoryMemory.update({
      where: { id: existing.id },
      data: {
        ...(req.body.order !== undefined && { order: req.body.order }),
        ...(req.body.audioClipUrl !== undefined && { audioClipUrl: req.body.audioClipUrl }),
        ...(req.body.questionText !== undefined && { questionText: parseMaybeJson(req.body.questionText) }),
        ...(req.body.modelAnswer !== undefined && { modelAnswer: parseMaybeJson(req.body.modelAnswer) })
      }
    });

    res.json({
      success: true,
      data: serializeAssessmentQuestion({
        req,
        testType: 'AUDITORY_MEMORY',
        question: updated,
        includeCorrect: true
      })
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Update auditory memory question error:', error);
    next(error);
  }
};

export const createVerbalNonsenseQuestion = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    await ensureTestForType({
      prisma,
      testId: req.params.testId,
      expectedType: 'VERBAL_NONSENSE'
    });

    await ensureOrderAvailable(
      prisma.q_VerbalNonsense,
      { testId: req.params.testId, order: req.body.order },
      'A verbal nonsense question with this order already exists in this test'
    );

    const question = await prisma.q_VerbalNonsense.create({
      data: {
        testId: req.params.testId,
        order: req.body.order,
        sentenceAr: req.body.sentenceAr,
        sentenceEn: req.body.sentenceEn || null
      }
    });

    res.status(201).json({
      success: true,
      data: serializeAssessmentQuestion({
        req,
        testType: 'VERBAL_NONSENSE',
        question,
        includeCorrect: true
      })
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Create verbal nonsense question error:', error);
    next(error);
  }
};

export const updateVerbalNonsenseQuestion = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const existing = await prisma.q_VerbalNonsense.findUnique({
      where: { id: req.params.questionId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'QUESTION_NOT_FOUND',
          message: 'Question not found'
        }
      });
    }

    if (req.body.order !== undefined && req.body.order !== existing.order) {
      await ensureOrderAvailable(
        prisma.q_VerbalNonsense,
        { testId: existing.testId, order: req.body.order },
        'A verbal nonsense question with this order already exists in this test',
        existing.id
      );
    }

    const updated = await prisma.q_VerbalNonsense.update({
      where: { id: existing.id },
      data: {
        ...(req.body.order !== undefined && { order: req.body.order }),
        ...(req.body.sentenceAr !== undefined && { sentenceAr: req.body.sentenceAr }),
        ...(req.body.sentenceEn !== undefined && { sentenceEn: req.body.sentenceEn || null })
      }
    });

    res.json({
      success: true,
      data: serializeAssessmentQuestion({
        req,
        testType: 'VERBAL_NONSENSE',
        question: updated,
        includeCorrect: true
      })
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Update verbal nonsense question error:', error);
    next(error);
  }
};

export const createImageSequenceOrderQuestion = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    await ensureTestForType({
      prisma,
      testId: req.params.testId,
      expectedType: 'IMAGE_SEQUENCE_ORDER'
    });

    await ensureOrderAvailable(
      prisma.q_SequenceOrder,
      { testId: req.params.testId, order: req.body.order },
      'An image sequence order question with this order already exists in this test'
    );

    const images = parseMaybeJson(req.body.images, []);

    const question = await prisma.q_SequenceOrder.create({
      data: {
        testId: req.params.testId,
        order: req.body.order,
        images: {
          create: images.map((image) => ({
            assetPath: image.assetPath,
            position: image.position
          }))
        }
      },
      include: {
        images: {
          orderBy: [{ position: 'asc' }, { id: 'asc' }]
        }
      }
    });

    res.status(201).json({
      success: true,
      data: serializeAssessmentQuestion({
        req,
        testType: 'IMAGE_SEQUENCE_ORDER',
        question,
        includeCorrect: true
      })
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Create image sequence order question error:', error);
    next(error);
  }
};

export const updateImageSequenceOrderQuestion = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const existing = await prisma.q_SequenceOrder.findUnique({
      where: { id: req.params.questionId },
      include: {
        test: true,
        images: {
          orderBy: [{ position: 'asc' }, { id: 'asc' }]
        }
      }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'QUESTION_NOT_FOUND',
          message: 'Question not found'
        }
      });
    }

    if (existing.test.testType !== 'IMAGE_SEQUENCE_ORDER') {
      return res.status(422).json({
        success: false,
        error: {
          code: 'INVALID_TEST_TYPE',
          message: 'Question does not belong to an IMAGE_SEQUENCE_ORDER test'
        }
      });
    }

    if (req.body.order !== undefined && req.body.order !== existing.order) {
      await ensureOrderAvailable(
        prisma.q_SequenceOrder,
        { testId: existing.testId, order: req.body.order },
        'An image sequence order question with this order already exists in this test',
        existing.id
      );
    }

    const images = req.body.images === undefined ? undefined : parseMaybeJson(req.body.images, []);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.q_SequenceOrder.update({
        where: { id: existing.id },
        data: {
          ...(req.body.order !== undefined && { order: req.body.order })
        }
      });

      if (images !== undefined) {
        await tx.q_SequenceOrder_Image.deleteMany({
          where: { questionId: existing.id }
        });

        if (images.length > 0) {
          await tx.q_SequenceOrder_Image.createMany({
            data: images.map((image) => ({
              questionId: existing.id,
              assetPath: image.assetPath,
              position: image.position
            }))
          });
        }
      }

      return tx.q_SequenceOrder.findUnique({
        where: { id: existing.id },
        include: {
          images: {
            orderBy: [{ position: 'asc' }, { id: 'asc' }]
          }
        }
      });
    });

    res.json({
      success: true,
      data: serializeAssessmentQuestion({
        req,
        testType: 'IMAGE_SEQUENCE_ORDER',
        question: updated,
        includeCorrect: true
      })
    });
  } catch (error) {
    if (handleKnownError(res, error)) return;
    logger.error('Update image sequence order question error:', error);
    next(error);
  }
};

export const getHelpSkills = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const where = {};
    if (req.query.domain) {
      where.domain = req.query.domain;
    }

    const skills = await prisma.helpSkill.findMany({
      where,
      orderBy: [{ domain: 'asc' }, { skillNumber: 'asc' }, { id: 'asc' }]
    });

    res.json({
      success: true,
      data: skills
    });
  } catch (error) {
    logger.error('Get HELP skills error:', error);
    next(error);
  }
};

export const createHelpSkill = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const skill = await prisma.helpSkill.create({
      data: {
        domain: req.body.domain,
        skillNumber: req.body.skillNumber,
        description: req.body.description,
        ageRange: req.body.ageRange
      }
    });

    res.status(201).json({
      success: true,
      data: skill
    });
  } catch (error) {
    logger.error('Create HELP skill error:', error);
    next(error);
  }
};

export const updateHelpSkill = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const existing = await prisma.helpSkill.findUnique({
      where: { id: req.params.skillId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HELP_SKILL_NOT_FOUND',
          message: 'Help skill not found'
        }
      });
    }

    const updated = await prisma.helpSkill.update({
      where: { id: existing.id },
      data: {
        ...(req.body.domain !== undefined && { domain: req.body.domain }),
        ...(req.body.skillNumber !== undefined && { skillNumber: req.body.skillNumber }),
        ...(req.body.description !== undefined && { description: req.body.description }),
        ...(req.body.ageRange !== undefined && { ageRange: req.body.ageRange })
      }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    logger.error('Update HELP skill error:', error);
    next(error);
  }
};

export const deleteHelpSkill = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const skill = await prisma.helpSkill.findUnique({
      where: { id: req.params.skillId },
      include: {
        _count: {
          select: {
            evaluations: true
          }
        }
      }
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

    if (skill._count.evaluations > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'HELP_SKILL_IN_USE',
          message: 'Cannot delete a help skill that has linked evaluations'
        }
      });
    }

    await prisma.helpSkill.delete({
      where: { id: req.params.skillId }
    });

    res.json({
      success: true,
      message: 'Help skill deleted successfully'
    });
  } catch (error) {
    logger.error('Delete HELP skill error:', error);
    next(error);
  }
};

export const uploadAssessmentImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No image file uploaded'
        }
      });
    }
    const relativePath = `assessments/images/${req.file.filename}`;
    res.json({
      success: true,
      data: { path: relativePath }
    });
  } catch (error) {
    logger.error('Upload assessment image error:', error);
    next(error);
  }
};

export const uploadAssessmentAudio = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No audio file uploaded'
        }
      });
    }
    const relativePath = `assessments/audio/${req.file.filename}`;
    res.json({
      success: true,
      data: { path: relativePath }
    });
  } catch (error) {
    logger.error('Upload assessment audio error:', error);
    next(error);
  }
};

export const createGenericQuestion = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const test = await ensureTestForType({
      prisma,
      testId: req.params.testId,
      allowedTypes: GENERIC_TEST_TYPES
    });

    await ensureOrderAvailable(
      prisma.question,
      { testId: req.params.testId, orderIndex: req.body.orderIndex },
      'A generic question with this orderIndex already exists in this test'
    );

    const question = await prisma.question.create({
      data: {
        testId: req.params.testId,
        orderIndex: req.body.orderIndex,
        audioAssetPath: req.body.audioAssetPath || null,
        imageAssetPath: req.body.imageAssetPath || null,
        choices: req.body.choices === undefined ? null : parseMaybeJson(req.body.choices, null),
        scoringGuide: req.body.scoringGuide,
        maxScore: req.body.maxScore
      }
    });

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
    if (handleKnownError(res, error)) return;
    logger.error('Create generic assessment question error:', error);
    next(error);
  }
};
