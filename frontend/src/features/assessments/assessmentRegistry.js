import AuditoryMemoryQuestionRenderer from './renderers/AuditoryMemoryQuestionRenderer';
import AnalogyQuestionRenderer from './renderers/AnalogyQuestionRenderer';
import CarsQuestionRenderer from './renderers/CarsQuestionRenderer';
import GenericQuestionRenderer from './renderers/GenericQuestionRenderer';
import HelpQuestionRenderer from './renderers/HelpQuestionRenderer';
import SequenceOrderQuestionRenderer from './renderers/SequenceOrderQuestionRenderer';
import VisualMemoryQuestionRenderer from './renderers/VisualMemoryQuestionRenderer';
import VerbalNonsenseRenderer from './renderers/VerbalNonsenseRenderer'; // <-- تم الإضافة هنا

const GENERIC_TEST_TYPES = [
  'SOUND_DISCRIMINATION',
  'PRONUNCIATION_REPETITION',
  'SOUND_IMAGE_LINKING',
  'SEQUENCE_ORDER'
];

const assessmentRegistry = {
  CARS: {
    component: CarsQuestionRenderer,
    stepLabel: 'سؤال',
    supportsManualScoring: true,
    completionLabel: 'إنهاء وحفظ النتائج',
    scoreNotice: 'يرجى إدخال الدرجة لكل سؤال ثم حفظ النتائج في نهاية الاختبار.'
  },
  ANALOGY: {
    component: AnalogyQuestionRenderer,
    stepLabel: 'سؤال',
    supportsManualScoring: false,
    completionLabel: 'إنهاء المعاينة',
    scoreNotice: 'هذا الاختبار يعتمد على مطابقة الصورة الصحيحة ويتم احتساب نتيجته تلقائياً.'
  },
  VISUAL_MEMORY: {
    component: VisualMemoryQuestionRenderer,
    stepLabel: 'دفعة',
    supportsManualScoring: false,
    completionLabel: 'إنهاء المعاينة',
    scoreNotice: 'يعرض هذا الاختبار دفعات من الصور والأسئلة الفرعية، ويتم تقييمه تلقائياً من إجابات الطفل.'
  },
  AUDITORY_MEMORY: {
    component: AuditoryMemoryQuestionRenderer,
    stepLabel: 'سؤال',
    supportsManualScoring: false,
    completionLabel: 'إنهاء المعاينة',
    scoreNotice: 'يعتمد هذا الاختبار على العناصر التي يسترجعها الطفل بعد الاستماع للمقطع.'
  },
  IMAGE_SEQUENCE_ORDER: {
    component: SequenceOrderQuestionRenderer,
    stepLabel: 'سؤال',
    supportsManualScoring: false,
    completionLabel: 'إنهاء المعاينة',
    scoreNotice: 'يعتمد هذا الاختبار على ترتيب الصور بشكل صحيح ويتم احتساب النتيجة تلقائياً.'
  },
  HELP: {
    component: HelpQuestionRenderer,
    stepLabel: 'مهارة',
    supportsManualScoring: false,
    completionLabel: 'إنهاء المعاينة',
    scoreNotice: 'يتم تنفيذ HELP من خلال مسار تقييم المهارات المخصص للطبيب.'
  },
  // 👇 تم إضافة الـ VERBAL_NONSENSE هنا 👇
  VERBAL_NONSENSE: {
    component: VerbalNonsenseRenderer,
    stepLabel: 'جملة',
    supportsManualScoring: true, // عملناها true عشان زرار الحفظ يشتغل والدكتور يقدر يبعت التقييم
    completionLabel: 'حفظ التقييم',
    scoreNotice: 'استمع إلى نطق الطفل للجملة ثم حدد ما إذا كان النطق صحيحاً أم خاطئاً. يمكنك إضافة ملاحظات تفصيلية.'
  },
  default: {
    component: GenericQuestionRenderer,
    stepLabel: 'سؤال',
    supportsManualScoring: true,
    completionLabel: 'إنهاء وحفظ النتائج',
    scoreNotice: 'يمكن للطبيب إدخال الدرجة مباشرة لهذا النوع من الاختبارات.'
  }
};

for (const testType of GENERIC_TEST_TYPES) {
  assessmentRegistry[testType] = assessmentRegistry.default;
}

export const getAssessmentConfig = (testType) =>
  assessmentRegistry[testType] || assessmentRegistry.default;