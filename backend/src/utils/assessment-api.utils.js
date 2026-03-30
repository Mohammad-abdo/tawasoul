import { countAssessmentQuestions, fetchAssessmentQuestions, getQuestionModelForTestType } from './assessment.utils.js';
import { createHttpError } from './httpError.js';

export const GENERIC_TEST_TYPES = [
  'SOUND_DISCRIMINATION',
  'PRONUNCIATION_REPETITION',
  'SOUND_IMAGE_LINKING',
  'SEQUENCE_ORDER'
];

export const HELP_SCORE_VALUES = {
  NOT_SUITABLE: 0,
  NOT_PRESENT: 1,
  INITIAL_ATTEMPTS: 2,
  PARTIAL_LEVEL: 3,
  SUCCESSFUL: 4
};

const resolveResultTestType = (result) => result.test?.testType || result.question?.test?.testType || null;

export const buildTestSummary = ({ test, questionCount }) => ({
  id: test.id,
  title: test.title,
  titleAr: test.titleAr,
  testType: test.testType,
  type: test.type,
  description: test.description,
  ...(questionCount !== undefined ? { questionCount } : {})
});

export const buildTestDetail = async ({ prisma, req, test, includeCorrect = false }) => {
  const [questionCount, questions] = await Promise.all([
    countAssessmentQuestions({ prisma, test }),
    fetchAssessmentQuestions({ prisma, test, req, includeCorrect })
  ]);

  return {
    ...test,
    questionModel: getQuestionModelForTestType(test.testType),
    questionCount,
    questions
  };
};

export const getQuestionCountForTest = ({ prisma, test }) =>
  countAssessmentQuestions({ prisma, test });

export const ensureUserOwnsChild = async ({ prisma, userId, childId }) => {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { id: true, userId: true }
  });

  if (!child || child.userId !== userId) {
    throw createHttpError(403, 'FORBIDDEN', 'You do not have access to this child');
  }

  return child;
};

export const ensureDoctorCanAccessChild = async ({ prisma, doctorId, childId }) => {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { id: true }
  });

  if (!child) {
    throw createHttpError(404, 'CHILD_NOT_FOUND', 'Child not found');
  }

  const access = await prisma.booking.findFirst({
    where: { doctorId, childId },
    select: { id: true }
  });

  if (!access) {
    throw createHttpError(403, 'FORBIDDEN', 'You do not have access to this child');
  }

  return child;
};

export const ensureChildExists = async ({ prisma, childId }) => {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { id: true }
  });

  if (!child) {
    throw createHttpError(404, 'CHILD_NOT_FOUND', 'Child not found');
  }

  return child;
};

export const ensureTestForType = async ({ prisma, testId, expectedType, allowedTypes }) => {
  const test = await prisma.test.findUnique({
    where: { id: testId }
  });

  if (!test) {
    throw createHttpError(404, 'TEST_NOT_FOUND', 'Test not found');
  }

  if (expectedType && test.testType !== expectedType) {
    throw createHttpError(422, 'INVALID_TEST_TYPE', `Test must be of type ${expectedType}`);
  }

  if (allowedTypes && !allowedTypes.includes(test.testType)) {
    throw createHttpError(422, 'INVALID_TEST_TYPE', `Test must be one of: ${allowedTypes.join(', ')}`);
  }

  return test;
};

export const getHelpTestOrThrow = async ({ prisma }) => {
  const helpTest = await prisma.test.findFirst({
    where: { testType: 'HELP' },
    orderBy: { createdAt: 'asc' }
  });

  if (!helpTest) {
    throw createHttpError(404, 'HELP_TEST_NOT_FOUND', 'HELP test not found');
  }

  return helpTest;
};

export const ensureUniqueAnswerQuestionIds = (answers) => {
  const seen = new Set();

  for (const answer of answers) {
    if (seen.has(answer.questionId)) {
      throw createHttpError(422, 'DUPLICATE_ANSWER', `Duplicate answer for question ${answer.questionId}`);
    }
    seen.add(answer.questionId);
  }
};

export const calculateHelpEvaluationTotals = (evaluations) => {
  const totalScore = evaluations.reduce((sum, evaluation) => sum + (HELP_SCORE_VALUES[evaluation.score] ?? 0), 0);

  return {
    totalScore,
    maxScore: evaluations.length * HELP_SCORE_VALUES.SUCCESSFUL
  };
};

export const serializeAssessmentResultSummary = (result) => ({
  id: result.id,
  testId: result.testId,
  testType: resolveResultTestType(result),
  totalScore: result.totalScore,
  maxScore: result.maxScore,
  scoreGiven: result.scoreGiven,
  sessionId: result.sessionId,
  timestamp: result.timestamp
});

export const groupAssessmentResultSummaries = (results) => {
  const groups = new Map();

  for (const result of results) {
    const summary = serializeAssessmentResultSummary(result);
    const testType = summary.testType || 'UNKNOWN';

    if (!groups.has(testType)) {
      groups.set(testType, []);
    }

    groups.get(testType).push(summary);
  }

  return Array.from(groups.entries()).map(([testType, groupedResults]) => ({
    testType,
    results: groupedResults
  }));
};

export const fetchAssessmentSessionResults = ({ prisma, childId, sessionId }) =>
  prisma.assessmentResult.findMany({
    where: { childId, sessionId },
    include: {
      test: true,
      question: {
        include: {
          test: true
        }
      },
      helpAssessment: {
        include: {
          evaluations: {
            include: {
              skill: true
            }
          }
        }
      },
      qCarsAnswers: {
        include: {
          question: true
        }
      },
      qAnalogyAnswers: {
        include: {
          question: true
        }
      },
      qVisualMemoryAnswers: {
        include: {
          question: {
            include: {
              batch: true
            }
          }
        }
      },
      qAuditoryMemoryAnswers: {
        include: {
          question: true
        }
      },
      qVerbalNonsenseAnswers: {
        include: {
          question: true
        }
      },
      qSequenceOrderAnswers: {
        include: {
          question: {
            include: {
              images: {
                orderBy: [{ position: 'asc' }, { id: 'asc' }]
              }
            }
          }
        }
      }
    },
    orderBy: [{ timestamp: 'asc' }, { id: 'asc' }]
  });

export const serializeAssessmentResultDetail = (result) => {
  const testType = resolveResultTestType(result);

  return {
    id: result.id,
    childId: result.childId,
    testId: result.testId,
    testType,
    totalScore: result.totalScore,
    maxScore: result.maxScore,
    scoreGiven: result.scoreGiven,
    sessionId: result.sessionId,
    timestamp: result.timestamp,
    test: result.test,
    question: GENERIC_TEST_TYPES.includes(testType) ? result.question : null,
    helpAssessment: testType === 'HELP' ? result.helpAssessment : null,
    qCarsAnswers: testType === 'CARS' ? result.qCarsAnswers : [],
    qAnalogyAnswers: testType === 'ANALOGY' ? result.qAnalogyAnswers : [],
    qVisualMemoryAnswers: testType === 'VISUAL_MEMORY' ? result.qVisualMemoryAnswers : [],
    qAuditoryMemoryAnswers: testType === 'AUDITORY_MEMORY' ? result.qAuditoryMemoryAnswers : [],
    qVerbalNonsenseAnswers: testType === 'VERBAL_NONSENSE' ? result.qVerbalNonsenseAnswers : [],
    qSequenceOrderAnswers: testType === 'IMAGE_SEQUENCE_ORDER' ? result.qSequenceOrderAnswers : []
  };
};
