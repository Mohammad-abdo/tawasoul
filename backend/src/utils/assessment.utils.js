const TEST_TYPES = {
  CARS: 'CARS',
  ANALOGY: 'ANALOGY',
  VISUAL_MEMORY: 'VISUAL_MEMORY',
  AUDITORY_MEMORY: 'AUDITORY_MEMORY',
  VERBAL_NONSENSE: 'VERBAL_NONSENSE',
  IMAGE_SEQUENCE_ORDER: 'IMAGE_SEQUENCE_ORDER',
  HELP: 'HELP'
};

const HELP_SCORE_VALUES = {
  NOT_SUITABLE: 0,
  NOT_PRESENT: 1,
  INITIAL_ATTEMPTS: 2,
  PARTIAL_LEVEL: 3,
  SUCCESSFUL: 4
};

const createAssessmentValidationError = (message) => {
  const error = new Error(message);
  error.name = 'AssessmentValidationError';
  return error;
};

const baseUrlFromReq = (req) => process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

export const toPublicAssetUrl = (req, assetPath) => {
  if (!assetPath) return null;
  if (/^https?:\/\//i.test(assetPath)) return assetPath;

  const normalized = String(assetPath).replace(/^\/+/, '').replace(/^uploads\/+/i, '');
  return `${baseUrlFromReq(req)}/uploads/${normalized}`;
};

const normalizeChoices = (req, choices) => {
  if (!Array.isArray(choices)) return choices ?? null;

  return choices.map((choice) => {
    if (!choice || typeof choice !== 'object') {
      return choice;
    }

    return {
      ...choice,
      imageUrl: choice.imageUrl ? toPublicAssetUrl(req, choice.imageUrl) : choice.imageUrl ?? null,
      imagePath: choice.imagePath ? toPublicAssetUrl(req, choice.imagePath) : choice.imagePath ?? null,
      audioUrl: choice.audioUrl ? toPublicAssetUrl(req, choice.audioUrl) : choice.audioUrl ?? null,
      audioPath: choice.audioPath ? toPublicAssetUrl(req, choice.audioPath) : choice.audioPath ?? null
    };
  });
};

export const getQuestionModelForTestType = (testType) => {
  switch (testType) {
    case TEST_TYPES.CARS:
      return 'Q_CARS';
    case TEST_TYPES.ANALOGY:
      return 'Q_Analogy';
    case TEST_TYPES.VISUAL_MEMORY:
      return 'Q_VisualMemory_Batch';
    case TEST_TYPES.AUDITORY_MEMORY:
      return 'Q_AuditoryMemory';
    case TEST_TYPES.VERBAL_NONSENSE:
      return 'Q_VerbalNonsense';
    case TEST_TYPES.IMAGE_SEQUENCE_ORDER:
      return 'Q_SequenceOrder';
    case TEST_TYPES.HELP:
      return 'HelpSkill';
    default:
      return 'Question';
  }
};

export const isSpecializedAssessmentTest = (testType) => Object.values(TEST_TYPES).includes(testType);

export const parseMaybeJson = (value, fallback = null) => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return fallback;
  if (typeof value !== 'string') return value;
  return JSON.parse(value);
};

export const serializeAssessmentQuestion = ({ req, testType, question, includeCorrect = false }) => {
  switch (testType) {
    case TEST_TYPES.CARS:
      return {
        id: question.id,
        testId: question.testId,
        order: question.order,
        questionText: question.questionText,
        choices: normalizeChoices(req, question.choices)
      };

    case TEST_TYPES.ANALOGY:
      return {
        id: question.id,
        testId: question.testId,
        order: question.order,
        questionImageUrl: toPublicAssetUrl(req, question.questionImageUrl),
        choices: normalizeChoices(req, question.choices),
        ...(includeCorrect ? { correctIndex: question.correctIndex } : {})
      };

    case TEST_TYPES.VISUAL_MEMORY:
      return {
        id: question.id,
        testId: question.testId,
        order: question.order,
        imageUrl: toPublicAssetUrl(req, question.imageUrl),
        displaySeconds: question.displaySeconds,
        questions: Array.isArray(question.questions)
          ? question.questions.map((subQuestion) => ({
              id: subQuestion.id,
              batchId: subQuestion.batchId,
              order: subQuestion.order,
              questionText: subQuestion.questionText,
              questionType: subQuestion.questionType,
              choices: normalizeChoices(req, subQuestion.choices),
              ...(includeCorrect
                ? {
                    correctBool: subQuestion.correctBool,
                    correctIndex: subQuestion.correctIndex
                  }
                : {})
            }))
          : []
      };

    case TEST_TYPES.AUDITORY_MEMORY:
      return {
        id: question.id,
        testId: question.testId,
        order: question.order,
        audioClipUrl: toPublicAssetUrl(req, question.audioClipUrl),
        questionText: question.questionText,
        ...(includeCorrect ? { modelAnswer: question.modelAnswer } : {})
      };

    case TEST_TYPES.VERBAL_NONSENSE:
      return {
        id: question.id,
        testId: question.testId,
        order: question.order,
        sentenceAr: question.sentenceAr,
        sentenceEn: question.sentenceEn
      };

    case TEST_TYPES.IMAGE_SEQUENCE_ORDER:
      return {
        id: question.id,
        testId: question.testId,
        order: question.order,
        images: Array.isArray(question.images)
          ? question.images
              .slice()
              .sort((left, right) => left.position - right.position || left.id.localeCompare(right.id))
              .map((image) => ({
                id: image.id,
                questionId: image.questionId,
                assetPath: toPublicAssetUrl(req, image.assetPath),
                position: image.position
              }))
          : []
      };

    case TEST_TYPES.HELP:
      return {
        id: question.id,
        domain: question.domain,
        skillNumber: question.skillNumber,
        description: question.description,
        ageRange: question.ageRange
      };

    default:
      return {
        ...question,
        audioAssetPath: toPublicAssetUrl(req, question.audioAssetPath),
        imageAssetPath: toPublicAssetUrl(req, question.imageAssetPath),
        choices: normalizeChoices(req, question.choices)
      };
  }
};

export const fetchAssessmentQuestions = async ({ prisma, test, req, includeCorrect = false }) => {
  switch (test.testType) {
    case TEST_TYPES.CARS: {
      const questions = await prisma.q_CARS.findMany({
        where: { testId: test.id },
        orderBy: [{ order: 'asc' }, { id: 'asc' }]
      });

      return questions.map((question) => serializeAssessmentQuestion({ req, testType: test.testType, question, includeCorrect }));
    }

    case TEST_TYPES.ANALOGY: {
      const questions = await prisma.q_Analogy.findMany({
        where: { testId: test.id },
        orderBy: [{ order: 'asc' }, { id: 'asc' }]
      });

      return questions.map((question) => serializeAssessmentQuestion({ req, testType: test.testType, question, includeCorrect }));
    }

    case TEST_TYPES.VISUAL_MEMORY: {
      const batches = await prisma.q_VisualMemory_Batch.findMany({
        where: { testId: test.id },
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
        include: {
          questions: {
            orderBy: [{ order: 'asc' }, { id: 'asc' }]
          }
        }
      });

      return batches.map((batch) =>
        serializeAssessmentQuestion({
          req,
          testType: test.testType,
          question: batch,
          includeCorrect
        })
      );
    }

    case TEST_TYPES.AUDITORY_MEMORY: {
      const questions = await prisma.q_AuditoryMemory.findMany({
        where: { testId: test.id },
        orderBy: [{ order: 'asc' }, { id: 'asc' }]
      });

      return questions.map((question) => serializeAssessmentQuestion({ req, testType: test.testType, question, includeCorrect }));
    }

    case TEST_TYPES.VERBAL_NONSENSE: {
      const questions = await prisma.q_VerbalNonsense.findMany({
        where: { testId: test.id },
        orderBy: [{ order: 'asc' }, { id: 'asc' }]
      });

      return questions.map((question) => serializeAssessmentQuestion({ req, testType: test.testType, question, includeCorrect }));
    }

    case TEST_TYPES.IMAGE_SEQUENCE_ORDER: {
      const questions = await prisma.q_SequenceOrder.findMany({
        where: { testId: test.id },
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
        include: {
          images: {
            orderBy: [{ position: 'asc' }, { id: 'asc' }]
          }
        }
      });

      return questions.map((question) => serializeAssessmentQuestion({ req, testType: test.testType, question, includeCorrect }));
    }

    case TEST_TYPES.HELP: {
      const skills = await prisma.helpSkill.findMany({
        orderBy: [{ domain: 'asc' }, { skillNumber: 'asc' }, { id: 'asc' }]
      });

      return skills.map((question) => serializeAssessmentQuestion({ req, testType: test.testType, question, includeCorrect }));
    }

    default: {
      const questions = await prisma.question.findMany({
        where: { testId: test.id },
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }]
      });

      return questions.map((question) => serializeAssessmentQuestion({ req, testType: test.testType, question, includeCorrect }));
    }
  }
};

export const countAssessmentQuestions = async ({ prisma, test }) => {
  switch (test.testType) {
    case TEST_TYPES.CARS:
      return prisma.q_CARS.count({ where: { testId: test.id } });
    case TEST_TYPES.ANALOGY:
      return prisma.q_Analogy.count({ where: { testId: test.id } });
    case TEST_TYPES.VISUAL_MEMORY: {
      const batches = await prisma.q_VisualMemory_Batch.findMany({
        where: { testId: test.id },
        select: {
          _count: {
            select: { questions: true }
          }
        }
      });

      return batches.reduce((total, batch) => total + batch._count.questions, 0);
    }
    case TEST_TYPES.AUDITORY_MEMORY:
      return prisma.q_AuditoryMemory.count({ where: { testId: test.id } });
    case TEST_TYPES.VERBAL_NONSENSE:
      return prisma.q_VerbalNonsense.count({ where: { testId: test.id } });
    case TEST_TYPES.IMAGE_SEQUENCE_ORDER:
      return prisma.q_SequenceOrder.count({ where: { testId: test.id } });
    case TEST_TYPES.HELP:
      return prisma.helpSkill.count();
    default:
      return prisma.question.count({ where: { testId: test.id } });
  }
};

const normalizeComparableString = (value) => String(value ?? '').trim().toLowerCase();

export const buildHelpAssessmentSubmission = async ({ prisma, answers }) => {
  if (!Array.isArray(answers) || answers.length === 0) {
    throw createAssessmentValidationError('At least one HELP evaluation is required');
  }

  const skills = await prisma.helpSkill.findMany();
  const skillMap = new Map(skills.map((skill) => [skill.id, skill]));
  const seenSkillIds = new Set();
  const evaluations = [];
  let totalScore = 0;

  for (const answer of answers) {
    const skill = skillMap.get(answer.skillId);
    if (!skill) {
      throw createAssessmentValidationError(`Skill ${answer.skillId} does not exist`);
    }

    if (seenSkillIds.has(answer.skillId)) {
      throw createAssessmentValidationError(`Duplicate evaluation for skill ${answer.skillId}`);
    }
    seenSkillIds.add(answer.skillId);

    const score = String(answer.score ?? '');
    if (!Object.prototype.hasOwnProperty.call(HELP_SCORE_VALUES, score)) {
      throw createAssessmentValidationError(`Skill ${answer.skillId} requires a valid HELP score`);
    }

    totalScore += HELP_SCORE_VALUES[score];
    evaluations.push({
      skillId: skill.id,
      score,
      doctorNotes: answer.doctorNotes ?? null
    });
  }

  return {
    totalScore,
    maxScore: evaluations.length * HELP_SCORE_VALUES.SUCCESSFUL,
    evaluations
  };
};

export const buildAssessmentSubmission = async ({ prisma, test, answers, resultId }) => {
  if (!Array.isArray(answers) || answers.length === 0) {
    throw createAssessmentValidationError('At least one answer is required');
  }

  const seenQuestionIds = new Set();
  let totalScore = 0;
  let maxScore = 0;
  const operations = [];

  const ensureUniqueQuestionId = (questionId) => {
    if (seenQuestionIds.has(questionId)) {
      throw createAssessmentValidationError(`Duplicate answer for question ${questionId}`);
    }
    seenQuestionIds.add(questionId);
  };

  switch (test.testType) {
    case TEST_TYPES.CARS: {
      const questions = await prisma.q_CARS.findMany({ where: { testId: test.id } });
      const questionMap = new Map(questions.map((question) => [question.id, question]));

      for (const answer of answers) {
        const question = questionMap.get(answer.questionId);
        if (!question) throw createAssessmentValidationError(`Question ${answer.questionId} does not belong to this test`);
        ensureUniqueQuestionId(answer.questionId);

        const chosenIndex = Number.parseInt(answer.chosenIndex, 10);
        if (!Number.isInteger(chosenIndex) || chosenIndex < 0 || chosenIndex > 3) {
          throw createAssessmentValidationError(`Question ${answer.questionId} requires chosenIndex between 0 and 3`);
        }

        const score = chosenIndex + 1;
        totalScore += score;
        maxScore += 4;

        operations.push(
          prisma.q_CARS_Answer.create({
            data: {
              resultId,
              questionId: question.id,
              chosenIndex,
              score
            }
          })
        );
      }
      break;
    }

    case TEST_TYPES.ANALOGY: {
      const questions = await prisma.q_Analogy.findMany({ where: { testId: test.id } });
      const questionMap = new Map(questions.map((question) => [question.id, question]));

      for (const answer of answers) {
        const question = questionMap.get(answer.questionId);
        if (!question) throw createAssessmentValidationError(`Question ${answer.questionId} does not belong to this test`);
        ensureUniqueQuestionId(answer.questionId);

        const chosenIndex = Number.parseInt(answer.chosenIndex, 10);
        if (!Number.isInteger(chosenIndex) || chosenIndex < 0 || chosenIndex > 3) {
          throw createAssessmentValidationError(`Question ${answer.questionId} requires chosenIndex between 0 and 3`);
        }

        const score = chosenIndex === question.correctIndex ? 1 : 0;
        totalScore += score;
        maxScore += 1;

        operations.push(
          prisma.q_Analogy_Answer.create({
            data: {
              resultId,
              questionId: question.id,
              chosenIndex,
              score
            }
          })
        );
      }
      break;
    }

    case TEST_TYPES.VISUAL_MEMORY: {
      const questions = await prisma.q_VisualMemory.findMany({
        where: { batch: { testId: test.id } },
        include: { batch: true }
      });
      const questionMap = new Map(questions.map((question) => [question.id, question]));

      for (const answer of answers) {
        const question = questionMap.get(answer.questionId);
        if (!question) throw createAssessmentValidationError(`Question ${answer.questionId} does not belong to this test`);
        ensureUniqueQuestionId(answer.questionId);

        let score = 0;
        let answerBool = null;
        let chosenIndex = null;

        if (question.questionType === 'YES_NO') {
          if (typeof answer.answerBool !== 'boolean') {
            throw createAssessmentValidationError(`Question ${answer.questionId} requires answerBool`);
          }
          answerBool = answer.answerBool;
          score = answerBool === question.correctBool ? 1 : 0;
        } else {
          chosenIndex = Number.parseInt(answer.chosenIndex, 10);
          if (!Number.isInteger(chosenIndex) || chosenIndex < 0) {
            throw createAssessmentValidationError(`Question ${answer.questionId} requires a valid chosenIndex`);
          }
          score = chosenIndex === question.correctIndex ? 1 : 0;
        }

        totalScore += score;
        maxScore += 1;

        operations.push(
          prisma.q_VisualMemory_Answer.create({
            data: {
              resultId,
              questionId: question.id,
              answerBool,
              chosenIndex,
              score
            }
          })
        );
      }
      break;
    }

    case TEST_TYPES.AUDITORY_MEMORY: {
      const questions = await prisma.q_AuditoryMemory.findMany({ where: { testId: test.id } });
      const questionMap = new Map(questions.map((question) => [question.id, question]));

      for (const answer of answers) {
        const question = questionMap.get(answer.questionId);
        if (!question) throw createAssessmentValidationError(`Question ${answer.questionId} does not belong to this test`);
        ensureUniqueQuestionId(answer.questionId);

        const recalledItems = Array.isArray(answer.recalledItems) ? answer.recalledItems : parseMaybeJson(answer.recalledItems, []);
        const modelAnswer = Array.isArray(question.modelAnswer) ? question.modelAnswer : [];
        if (!Array.isArray(recalledItems)) {
          throw createAssessmentValidationError(`Question ${answer.questionId} requires recalledItems as an array`);
        }

        const itemScores = modelAnswer.map((expected, index) => {
          return normalizeComparableString(recalledItems[index]) === normalizeComparableString(expected);
        });
        const score = itemScores.filter(Boolean).length;

        totalScore += score;
        maxScore += modelAnswer.length;

        operations.push(
          prisma.q_AuditoryMemory_Answer.create({
            data: {
              resultId,
              questionId: question.id,
              recalledItems,
              itemScores,
              score
            }
          })
        );
      }
      break;
    }

    case TEST_TYPES.VERBAL_NONSENSE: {
      const questions = await prisma.q_VerbalNonsense.findMany({ where: { testId: test.id } });
      const questionMap = new Map(questions.map((question) => [question.id, question]));

      for (const answer of answers) {
        const question = questionMap.get(answer.questionId);
        if (!question) {
          throw createAssessmentValidationError(`Question ${answer.questionId} does not belong to this test`);
        }
        ensureUniqueQuestionId(answer.questionId);

        if (typeof answer.isCorrect !== 'boolean') {
          throw createAssessmentValidationError(`Question ${answer.questionId} requires isCorrect as a boolean`);
        }

        const score = answer.isCorrect ? 1 : 0;
        totalScore += score;
        maxScore += 1;

        operations.push(
          prisma.q_VerbalNonsense_Answer.create({
            data: {
              resultId,
              questionId: question.id,
              isCorrect: answer.isCorrect,
              doctorNote: answer.doctorNote ?? null
            }
          })
        );
      }
      break;
    }

    case TEST_TYPES.IMAGE_SEQUENCE_ORDER: {
      const questions = await prisma.q_SequenceOrder.findMany({
        where: { testId: test.id },
        include: {
          images: {
            orderBy: [{ position: 'asc' }, { id: 'asc' }]
          }
        }
      });
      const questionMap = new Map(questions.map((question) => [question.id, question]));

      for (const answer of answers) {
        const question = questionMap.get(answer.questionId);
        if (!question) {
          throw createAssessmentValidationError(`Question ${answer.questionId} does not belong to this test`);
        }
        ensureUniqueQuestionId(answer.questionId);

        const submittedOrder = Array.isArray(answer.submittedOrder) ? answer.submittedOrder : parseMaybeJson(answer.submittedOrder, []);
        if (!Array.isArray(submittedOrder) || submittedOrder.length === 0) {
          throw createAssessmentValidationError(`Question ${answer.questionId} requires submittedOrder as a non-empty array`);
        }

        const images = Array.isArray(question.images) ? question.images : [];
        const imageIds = new Set(images.map((image) => image.id));
        const submittedImageIds = new Set();
        const submittedPositions = new Set();

        for (const item of submittedOrder) {
          if (!item || typeof item !== 'object') {
            throw createAssessmentValidationError(`Question ${answer.questionId} submittedOrder items must be objects`);
          }

          if (!imageIds.has(item.imageId)) {
            throw createAssessmentValidationError(`Question ${answer.questionId} includes an unknown imageId`);
          }

          if (!Number.isInteger(item.submittedPosition) || item.submittedPosition < 1 || item.submittedPosition > images.length) {
            throw createAssessmentValidationError(`Question ${answer.questionId} submittedPosition values must be between 1 and ${images.length}`);
          }

          if (submittedImageIds.has(item.imageId)) {
            throw createAssessmentValidationError(`Question ${answer.questionId} contains duplicate imageId submissions`);
          }

          if (submittedPositions.has(item.submittedPosition)) {
            throw createAssessmentValidationError(`Question ${answer.questionId} contains duplicate submitted positions`);
          }

          submittedImageIds.add(item.imageId);
          submittedPositions.add(item.submittedPosition);
        }

        if (submittedOrder.length !== images.length) {
          throw createAssessmentValidationError(`Question ${answer.questionId} requires submitted positions for every image`);
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
        maxScore += images.length;

        operations.push(
          prisma.q_SequenceOrder_Answer.create({
            data: {
              resultId,
              questionId: question.id,
              submittedOrder,
              itemScores,
              score
            }
          })
        );
      }
      break;
    }

    case TEST_TYPES.HELP:
      throw createAssessmentValidationError('HELP submissions must be handled through the dedicated HELP assessment flow');

    default:
      throw createAssessmentValidationError(`Unsupported test type: ${test.testType}`);
  }

  return {
    totalScore,
    maxScore,
    operations
  };
};

export const buildAssessmentRecommendation = ({ test, totalScore, maxScore }) => {
  if (!maxScore) return null;

  const ratio = totalScore / maxScore;
  if (ratio >= 0.7) {
    return null;
  }

  if (test.type === 'AUDITORY') {
    return {
      type: 'SPEECH_THERAPY',
      message: 'ننصح بمتابعة أخصائي تخاطب بناءً على نتائج التقييم السمعي.',
      specialtyAr: 'تخاطب',
      testType: test.testType
    };
  }

  return {
    type: 'SKILLS_DEVELOPMENT',
    message: 'ننصح بمتابعة أخصائي تنمية مهارات بناءً على نتائج التقييم البصري.',
    specialtyAr: 'تنمية مهارات',
    testType: test.testType
  };
};

export const getAdminQuestionEntityById = async ({ prisma, id, req }) => {
  const candidates = [
    {
      delegate: prisma.q_CARS,
      testType: TEST_TYPES.CARS
    },
    {
      delegate: prisma.q_Analogy,
      testType: TEST_TYPES.ANALOGY
    },
    {
      delegate: prisma.q_VisualMemory_Batch,
      testType: TEST_TYPES.VISUAL_MEMORY,
      include: { questions: { orderBy: [{ order: 'asc' }, { id: 'asc' }] } }
    },
    {
      delegate: prisma.q_AuditoryMemory,
      testType: TEST_TYPES.AUDITORY_MEMORY
    },
    {
      delegate: prisma.q_VerbalNonsense,
      testType: TEST_TYPES.VERBAL_NONSENSE
    },
    {
      delegate: prisma.q_SequenceOrder,
      testType: TEST_TYPES.IMAGE_SEQUENCE_ORDER,
      include: { images: { orderBy: [{ position: 'asc' }, { id: 'asc' }] } }
    },
    {
      delegate: prisma.helpSkill,
      testType: TEST_TYPES.HELP
    },
    {
      delegate: prisma.question,
      testType: 'LEGACY',
      include: { test: true }
    }
  ];

  for (const candidate of candidates) {
    const entity = await candidate.delegate.findUnique({
      where: { id },
      ...(candidate.include ? { include: candidate.include } : {})
    });

    if (entity) {
      return {
        entity,
        testType: candidate.testType,
        serialized: serializeAssessmentQuestion({
          req,
          testType: candidate.testType === 'LEGACY' ? entity.test?.testType : candidate.testType,
          question: entity,
          includeCorrect: true
        })
      };
    }
  }

  return null;
};

export { TEST_TYPES };
