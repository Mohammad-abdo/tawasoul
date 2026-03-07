import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get Available Tests (filter by category and/or testType)
 */
export const getTests = async (req, res, next) => {
  try {
    const { category, testType } = req.query;
    const where = {};
    if (category) where.category = category;
    if (testType) where.testType = testType;

    const tests = await prisma.test.findMany({
      where,
      include: {
        _count: {
          select: { questions: true }
        }
      },
      orderBy: [{ category: 'asc' }, { testType: 'asc' }, { createdAt: 'desc' }]
    });

    res.json({
      success: true,
      data: tests
    });
  } catch (error) {
    logger.error('Get tests error:', error);
    next(error);
  }
};

/**
 * Get Test Questions (ordered by orderIndex)
 */
export const getTestQuestions = async (req, res, next) => {
  try {
    const { testId } = req.params;

    const questions = await prisma.question.findMany({
      where: { testId },
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }]
    });

    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    logger.error('Get test questions error:', error);
    next(error);
  }
};

/**
 * Submit Assessment Result
 */
export const submitAssessmentResult = async (req, res, next) => {
  try {
    const { childId, questionId, scoreGiven, sessionId } = req.body;

    // Save result
    const result = await prisma.assessmentResult.create({
      data: {
        childId,
        questionId,
        scoreGiven: parseInt(scoreGiven),
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

    // Check if this was the last question of the test to trigger recommendation
    const testId = result.question.testId;
    const totalQuestions = await prisma.question.count({ where: { testId } });
    const submittedResults = await prisma.assessmentResult.count({
      where: {
        childId,
        question: { testId },
        sessionId // Assuming sessionId marks a single run
      }
    });

    let recommendation = null;

    if (submittedResults >= totalQuestions) {
      // Calculate average score
      const aggregate = await prisma.assessmentResult.aggregate({
        where: {
          childId,
          question: { testId },
          sessionId
        },
        _avg: {
          scoreGiven: true
        }
      });

      const avgScore = aggregate._avg.scoreGiven;
      const testCategory = result.question.test.category;
      const testType = result.question.test.testType;

      // Logic: If score < 7 (out of 10), recommend specialists
      if (avgScore < 7) {
        if (testCategory === 'AUDITORY') {
          recommendation = {
            type: 'SPEECH_THERAPY',
            message: 'ننصح بمتابعة أخصائي تخاطب بناءً على نتائج التقييم السمعي.',
            specialtyAr: 'تخاطب',
            testType
          };
        } else if (testCategory === 'VISUAL') {
          recommendation = {
            type: 'SKILLS_DEVELOPMENT',
            message: 'ننصح بمتابعة أخصائي تنمية مهارات بناءً على نتائج التقييم البصري.',
            specialtyAr: 'تنمية مهارات',
            testType
          };
        }
      }
    }

    res.json({
      success: true,
      data: {
        result,
        recommendation
      }
    });
  } catch (error) {
    logger.error('Submit assessment result error:', error);
    next(error);
  }
};
