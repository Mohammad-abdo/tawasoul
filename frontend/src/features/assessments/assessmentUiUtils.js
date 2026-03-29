export const formatLocalizedText = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object') {
    return value.ar || value.en || Object.values(value).find(Boolean) || '';
  }

  return String(value);
};

export const normalizeChoices = (choices) => (Array.isArray(choices) ? choices : []);

export const resolveMediaUrl = (assetPath) => {
  if (!assetPath) {
    return null;
  }

  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath;
  }

  return `http://localhost:3000/${String(assetPath).replace(/^\/+/, '')}`;
};

export const getManualScoreOptions = (question, fallbackMax = 10) => {
  const rawMax = Number.isInteger(question?.maxScore) ? question.maxScore : fallbackMax;
  const maxScore = Math.max(rawMax, 0);

  return Array.from({ length: maxScore + 1 }, (_, index) => index);
};

export const getTestDisplayTitle = (test) => test?.titleAr || test?.title || 'Assessment';

export const getTestDisplayDescription = (test) => test?.description || '';

export const getModalityLabel = (type) => {
  if (type === 'AUDITORY') return 'سمعي';
  if (type === 'VISUAL') return 'بصري';
  return type || 'غير محدد';
};

