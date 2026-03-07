import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { getFileUrl } from '../../middleware/upload.middleware.js';

/**
 * Get All Tests
 */
export const getAllTests = async (req, res, next) => {
  try {
    const { categoryId, category, testType, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (category) where.category = { name: category }; // Legacy support if needed, or filter by relation
    if (testType) where.testType = testType;

    const [tests, total] = await Promise.all([
      prisma.test.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true, // Include the relation
          _count: {
            select: { questions: true }
          }
        }
      }),
      prisma.test.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        tests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
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
      where: { id },
      include: {
        category: true, // Include the relation
        questions: {
          orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }]
        },
        _count: {
          select: { questions: true }
        }
      }
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

    res.json({
      success: true,
      data: test
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
    const { title, titleAr, categoryId, testType, description } = req.body;

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
        categoryId: categoryId || null, // Link to dynamic category
        testType: testType || 'SOUND_DISCRIMINATION',
        description
      }
    });

    logger.info(`Test created: ${test.id} by admin ${req.admin.id}`);

    res.status(201).json({
      success: true,
      data: test
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
    const { title, titleAr, categoryId, testType, description } = req.body;

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
        ...(categoryId !== undefined && { categoryId }), // Link to dynamic category
        ...(testType && { testType }),
        ...(description !== undefined && { description })
      }
    });

    logger.info(`Test updated: ${id} by admin ${req.admin.id}`);

    res.json({
      success: true,
      data: updatedTest
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

    const questions = await prisma.question.findMany({
      where: { testId },
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }]
    });

    // Format audio/image paths
    const formattedQuestions = questions.map(q => ({
      ...q,
      audioAssetPath: q.audioAssetPath ? getFileUrl(req, q.audioAssetPath, 'assessments/audio') : null,
      imageAssetPath: q.imageAssetPath ? getFileUrl(req, q.imageAssetPath, 'assessments/images') : null
    }));

    res.json({
      success: true,
      data: formattedQuestions
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
    const { id } = req.params;

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        test: true
      }
    });

    if (!question) {
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
      data: {
        ...question,
        audioAssetPath: question.audioAssetPath ? getFileUrl(req, question.audioAssetPath, 'assessments/audio') : null,
        imageAssetPath: question.imageAssetPath ? getFileUrl(req, question.imageAssetPath, 'assessments/images') : null
      }
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
    const { scoringGuide, orderIndex, choices, maxScore } = req.body;

    // Check if test exists
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

    // Get file paths from uploaded files
    const audioFile = req.files?.audio?.[0];
    const imageFile = req.files?.image?.[0];

    const audioAssetPath = audioFile ? `assessments/audio/${audioFile.filename}` : null;
    const imageAssetPath = imageFile ? `assessments/images/${imageFile.filename}` : null;

    if (!audioAssetPath && !imageAssetPath) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'At least one media file (audio or image) is required'
        }
      });
    }

    const choicesParsed = typeof choices === 'string' ? (choices ? JSON.parse(choices) : null) : choices;

    const question = await prisma.question.create({
      data: {
        testId,
        orderIndex: orderIndex != null ? parseInt(orderIndex, 10) : 0,
        audioAssetPath,
        imageAssetPath,
        choices: choicesParsed,
        scoringGuide,
        maxScore: maxScore != null ? parseInt(maxScore, 10) : null
      }
    });

    logger.info(`Question created: ${question.id} for test ${testId} by admin ${req.admin.id}`);

    res.status(201).json({
      success: true,
      data: {
        ...question,
        audioAssetPath: question.audioAssetPath ? getFileUrl(req, question.audioAssetPath, 'assessments/audio') : null,
        imageAssetPath: question.imageAssetPath ? getFileUrl(req, question.imageAssetPath, 'assessments/images') : null
      }
    });
  } catch (error) {
    logger.error('Create question error:', error);
    next(error);
  }
};

/**
 * Update Question
 */
export const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { scoringGuide, orderIndex, choices, maxScore } = req.body;

    const question = await prisma.question.findUnique({
      where: { id }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'QUESTION_NOT_FOUND',
          message: 'Question not found'
        }
      });
    }

    // Get file paths from uploaded files (if any)
    const audioFile = req.files?.audio?.[0];
    const imageFile = req.files?.image?.[0];

    const audioAssetPath = audioFile ? `assessments/audio/${audioFile.filename}` : undefined;
    const imageAssetPath = imageFile ? `assessments/images/${imageFile.filename}` : undefined;

    const choicesParsed = choices !== undefined
      ? (typeof choices === 'string' ? (choices ? JSON.parse(choices) : null) : choices)
      : undefined;

    const updateData = {};
    if (audioAssetPath) updateData.audioAssetPath = audioAssetPath;
    if (imageAssetPath) updateData.imageAssetPath = imageAssetPath;
    if (scoringGuide !== undefined) updateData.scoringGuide = scoringGuide;
    if (orderIndex !== undefined) updateData.orderIndex = parseInt(orderIndex, 10);
    if (choicesParsed !== undefined) updateData.choices = choicesParsed;
    if (maxScore !== undefined) updateData.maxScore = maxScore ? parseInt(maxScore, 10) : null;

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: updateData
    });

    logger.info(`Question updated: ${id} by admin ${req.admin.id}`);

    res.json({
      success: true,
      data: {
        ...updatedQuestion,
        audioAssetPath: updatedQuestion.audioAssetPath ? getFileUrl(req, updatedQuestion.audioAssetPath, 'assessments/audio') : null,
        imageAssetPath: updatedQuestion.imageAssetPath ? getFileUrl(req, updatedQuestion.imageAssetPath, 'assessments/images') : null
      }
    });
  } catch (error) {
    logger.error('Update question error:', error);
    next(error);
  }
};

/**
 * Delete Question
 */
export const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const question = await prisma.question.findUnique({
      where: { id }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'QUESTION_NOT_FOUND',
          message: 'Question not found'
        }
      });
    }

    await prisma.question.delete({
      where: { id }
    });

    logger.info(`Question deleted: ${id} by admin ${req.admin.id}`);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    logger.error('Delete question error:', error);
    next(error);
  }
};
