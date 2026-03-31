import AuditoryMemoryQuestionRenderer from './renderers/AuditoryMemoryQuestionRenderer';
import AnalogyQuestionRenderer from './renderers/AnalogyQuestionRenderer';
import CarsQuestionRenderer from './renderers/CarsQuestionRenderer';
import GenericQuestionRenderer from './renderers/GenericQuestionRenderer';
import HelpQuestionRenderer from './renderers/HelpQuestionRenderer';
import SequenceOrderQuestionRenderer from './renderers/SequenceOrderQuestionRenderer';
import VisualMemoryQuestionRenderer from './renderers/VisualMemoryQuestionRenderer';
import VerbalNonsenseRenderer from './renderers/VerbalNonsenseRenderer';

const GENERIC_TEST_TYPES = [
  'SOUND_DISCRIMINATION',
  'PRONUNCIATION_REPETITION',
  'SOUND_IMAGE_LINKING',
  'SEQUENCE_ORDER',
];

const assessmentRegistry = {
  CARS: {
    component: CarsQuestionRenderer,
    stepLabel: 'سؤال',
    supportsManualScoring: true,
    completionLabel: 'إنهاء وحفظ النتائج',
    scoreNotice: 'يرجى إدخال الدرجة لكل سؤال ثم حفظ النتائج في نهاية الاختبار.',
  },
  ANALOGY: {
    component: AnalogyQuestionRenderer,
    stepLabel: 'سؤال',
    supportsManualScoring: false,
    completionLabel: 'إنهاء وحفظ النتيجة',
    scoreNotice: 'اختر الصورة المطابقة لكل سؤال، وسيتم احتساب النتيجة تلقائياً عند الحفظ.',
  },
  VISUAL_MEMORY: {
    component: VisualMemoryQuestionRenderer,
    stepLabel: 'دفعة',
    supportsManualScoring: false,
    completionLabel: 'إنهاء وحفظ النتيجة',
    scoreNotice: 'أجب عن جميع الأسئلة الفرعية داخل كل دفعة ليتم احتساب النتيجة تلقائياً عند الحفظ.',
  },
  AUDITORY_MEMORY: {
    component: AuditoryMemoryQuestionRenderer,
    stepLabel: 'سؤال',
    supportsManualScoring: false,
    completionLabel: 'إنهاء وحفظ النتيجة',
    scoreNotice: 'شغّل المقطع الصوتي وسجل العناصر التي استرجعها الطفل، وسيتم حساب الدرجة تلقائياً بعد الحفظ.',
  },
  IMAGE_SEQUENCE_ORDER: {
    component: SequenceOrderQuestionRenderer,
    stepLabel: 'سؤال',
    supportsManualScoring: false,
    completionLabel: 'إنهاء وحفظ النتيجة',
    scoreNotice: 'رتّب الصور كاملة في كل سؤال قبل الحفظ ليتم احتساب النتيجة تلقائياً.',
  },
  HELP: {
    component: HelpQuestionRenderer,
    stepLabel: 'مهارة',
    supportsManualScoring: false,
    completionLabel: 'إنهاء وحفظ النتيجة',
    scoreNotice: 'قيّم كل مهارة، أدخل العمر النمائي، ثم احفظ التقييم بالكامل لاحتساب النتيجة النهائية.',
  },
  VERBAL_NONSENSE: {
    component: VerbalNonsenseRenderer,
    stepLabel: 'جملة',
    supportsManualScoring: true,
    completionLabel: 'حفظ التقييم',
    scoreNotice: 'استمع إلى نطق الطفل للجملة ثم حدد ما إذا كان النطق صحيحاً أم خاطئاً مع إمكانية إضافة ملاحظات تفصيلية.',
  },
  default: {
    component: GenericQuestionRenderer,
    stepLabel: 'سؤال',
    supportsManualScoring: true,
    completionLabel: 'إنهاء وحفظ النتائج',
    scoreNotice: 'يمكن للطبيب إدخال الدرجة مباشرة لهذا النوع من الاختبارات.',
  },
};

for (const testType of GENERIC_TEST_TYPES) {
  assessmentRegistry[testType] = assessmentRegistry.default;
}

export const getAssessmentConfig = (testType) =>
  assessmentRegistry[testType] || assessmentRegistry.default;
