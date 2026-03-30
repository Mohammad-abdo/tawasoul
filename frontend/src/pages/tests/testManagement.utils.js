export const TEST_TYPE_LABELS = {
  CARS: 'CARS',
  ANALOGY: 'Analogy',
  VISUAL_MEMORY: 'Visual Memory',
  AUDITORY_MEMORY: 'Auditory Memory',
  VERBAL_NONSENSE: 'Verbal Nonsense',
  HELP: 'HELP',
  IMAGE_SEQUENCE_ORDER: 'Image Sequence Order',
  VB_MAPP: 'VB-MAPP',
};

export const MODALITY_LABELS = {
  AUDITORY: 'Auditory',
  VISUAL: 'Visual',
};

export const VISUAL_MEMORY_TYPE_LABELS = {
  YES_NO: 'Yes / No',
  MCQ: 'Multiple Choice',
};

export const MANAGED_TEST_TYPES = [
  'CARS',
  'ANALOGY',
  'VISUAL_MEMORY',
  'AUDITORY_MEMORY',
  'VERBAL_NONSENSE',
  'IMAGE_SEQUENCE_ORDER',
];

export const isManagedTestType = (testType) => MANAGED_TEST_TYPES.includes(testType);

export const getLocalizedText = (value, locale = 'ar') => {
  if (!value) return '-';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value[locale] || value.ar || value.en || Object.values(value).find(Boolean) || '-';
  }
  return String(value);
};

export const summarizeCarsChoices = (choices = []) =>
  choices
    .map((choice, index) => {
      const label = getLocalizedText(choice, 'ar');
      return `${index + 1}. ${label}`;
    })
    .join(' | ');

export const summarizeModelAnswer = (modelAnswer) => {
  if (!modelAnswer?.items?.length) return 'No model answer';
  return modelAnswer.items.join(', ');
};

export const sortByOrder = (items = []) =>
  [...items].sort((left, right) => {
    const leftOrder = left.order ?? left.orderIndex ?? 0;
    const rightOrder = right.order ?? right.orderIndex ?? 0;
    return leftOrder - rightOrder;
  });

export const createEmptyFormState = (testType, order = 1) => {
  switch (testType) {
    case 'CARS':
      return {
        order,
        questionText: { ar: '', en: '' },
        choices: Array.from({ length: 4 }, () => ({ ar: '', en: '' })),
      };
    case 'ANALOGY':
      return {
        order,
        questionImageUrl: '',
        choices: [{ imagePath: '' }, { imagePath: '' }],
        correctIndex: 0,
      };
    case 'VISUAL_MEMORY':
      return {
        order,
        imageUrl: '',
        displaySeconds: 3,
        questions: [
          {
            order: 1,
            questionText: { ar: '', en: '' },
            questionType: 'YES_NO',
            correctBool: true,
            choices: [{ text: '' }, { text: '' }],
            correctIndex: 0,
          },
        ],
      };
    case 'AUDITORY_MEMORY':
      return {
        order,
        audioClipUrl: '',
        questionText: { ar: '', en: '' },
        modelAnswer: {
          items: [''],
          order: false,
        },
      };
    case 'IMAGE_SEQUENCE_ORDER':
      return {
        order,
        images: [
          { assetPath: '', position: 1 },
          { assetPath: '', position: 2 },
        ],
      };
    case 'VERBAL_NONSENSE':
      return {
        order,
        sentenceAr: '',
        sentenceEn: '',
      };
    default:
      return { order };
  }
};

export const createFormStateFromQuestion = (testType, item) => {
  if (!item) {
    return createEmptyFormState(testType, 1);
  }

  switch (testType) {
    case 'CARS':
      return {
        order: item.order,
        questionText: {
          ar: item.questionText?.ar || '',
          en: item.questionText?.en || '',
        },
        choices: Array.isArray(item.choices) && item.choices.length
          ? item.choices.map((choice) => ({
              ar: choice?.ar || '',
              en: choice?.en || '',
            }))
          : Array.from({ length: 4 }, () => ({ ar: '', en: '' })),
      };
    case 'ANALOGY':
      return {
        order: item.order,
        questionImageUrl: item.questionImageUrl || '',
        choices: Array.isArray(item.choices) && item.choices.length
          ? item.choices.map((choice) => ({
              imagePath: choice?.imagePath || choice?.imageUrl || '',
            }))
          : [{ imagePath: '' }, { imagePath: '' }],
        correctIndex: item.correctIndex || 0,
      };
    case 'VISUAL_MEMORY':
      return {
        order: item.order,
        imageUrl: item.imageUrl || '',
        displaySeconds: item.displaySeconds || 3,
        questions: Array.isArray(item.questions) && item.questions.length
          ? item.questions.map((question, index) => ({
              order: question.order ?? index + 1,
              questionText: {
                ar: question.questionText?.ar || '',
                en: question.questionText?.en || '',
              },
              questionType: question.questionType || 'YES_NO',
              correctBool: question.correctBool ?? true,
              choices: Array.isArray(question.choices) && question.choices.length
                ? question.choices.map((choice) => ({
                    text: choice?.text || '',
                  }))
                : [{ text: '' }, { text: '' }],
              correctIndex: question.correctIndex || 0,
            }))
          : createEmptyFormState('VISUAL_MEMORY', item.order).questions,
      };
    case 'AUDITORY_MEMORY':
      return {
        order: item.order,
        audioClipUrl: item.audioClipUrl || '',
        questionText: {
          ar: item.questionText?.ar || '',
          en: item.questionText?.en || '',
        },
        modelAnswer: {
          items: item.modelAnswer?.items?.length ? item.modelAnswer.items : [''],
          order: Boolean(item.modelAnswer?.order),
        },
      };
    case 'IMAGE_SEQUENCE_ORDER':
      return {
        order: item.order,
        images: Array.isArray(item.images) && item.images.length
          ? item.images.map((image, index) => ({
              assetPath: image.assetPath || '',
              position: image.position ?? index + 1,
            }))
          : createEmptyFormState('IMAGE_SEQUENCE_ORDER', item.order).images,
      };
    case 'VERBAL_NONSENSE':
      return {
        order: item.order,
        sentenceAr: item.sentenceAr || '',
        sentenceEn: item.sentenceEn || '',
      };
    default:
      return createEmptyFormState(testType, item.order || 1);
  }
};

export const buildPayloadFromFormState = (testType, formState) => {
  switch (testType) {
    case 'CARS':
      return {
        order: Number(formState.order),
        questionText: {
          ar: formState.questionText.ar.trim(),
          en: formState.questionText.en.trim(),
        },
        choices: formState.choices.map((choice, index) => ({
          score: index + 1,
          ar: choice.ar.trim(),
          en: choice.en.trim(),
        })),
      };
    case 'ANALOGY':
      return {
        order: Number(formState.order),
        questionImageUrl: formState.questionImageUrl.trim(),
        choices: formState.choices.map((choice) => ({
          imagePath: choice.imagePath.trim(),
        })),
        correctIndex: Number(formState.correctIndex),
      };
    case 'VISUAL_MEMORY':
      return {
        order: Number(formState.order),
        imageUrl: formState.imageUrl.trim(),
        displaySeconds: Number(formState.displaySeconds),
        questions: formState.questions.map((question, index) => ({
          order: Number(question.order ?? index + 1),
          questionText: {
            ar: question.questionText.ar.trim(),
            en: question.questionText.en.trim(),
          },
          questionType: question.questionType,
          ...(question.questionType === 'YES_NO'
            ? { correctBool: Boolean(question.correctBool) }
            : {
                choices: question.choices.map((choice) => ({ text: choice.text.trim() })),
                correctIndex: Number(question.correctIndex),
              }),
        })),
      };
    case 'AUDITORY_MEMORY':
      return {
        order: Number(formState.order),
        audioClipUrl: formState.audioClipUrl.trim(),
        questionText: {
          ar: formState.questionText.ar.trim(),
          en: formState.questionText.en.trim(),
        },
        modelAnswer: {
          items: formState.modelAnswer.items.map((item) => item.trim()).filter(Boolean),
          order: Boolean(formState.modelAnswer.order),
        },
      };
    case 'IMAGE_SEQUENCE_ORDER':
      return {
        order: Number(formState.order),
        images: formState.images
          .map((image, index) => ({
            assetPath: image.assetPath.trim(),
            position: Number(image.position ?? index + 1),
          }))
          .sort((left, right) => left.position - right.position),
      };
    case 'VERBAL_NONSENSE':
      return {
        order: Number(formState.order),
        sentenceAr: formState.sentenceAr.trim(),
        sentenceEn: formState.sentenceEn.trim() || null,
      };
    default:
      return formState;
  }
};
