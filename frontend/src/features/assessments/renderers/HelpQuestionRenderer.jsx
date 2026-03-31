import { BookOpenCheck, FileText, Hash, Layers3 } from 'lucide-react';
import { formatLocalizedText } from '../assessmentUiUtils';

const HELP_SCORE_OPTIONS = [
  {
    value: 'NOT_SUITABLE',
    label: 'غير مناسب',
    description: 'المهارة غير مناسبة للعمر أو للحالة الحالية.',
  },
  {
    value: 'NOT_PRESENT',
    label: 'غير موجود',
    description: 'الطفل لا يظهر المهارة حالياً.',
  },
  {
    value: 'INITIAL_ATTEMPTS',
    label: 'محاولات أولية',
    description: 'الطفل يبدأ المحاولة لكنه لا ينجزها باستقرار.',
  },
  {
    value: 'PARTIAL_LEVEL',
    label: 'مستوى جزئي',
    description: 'الطفل ينجز جزءاً من المهارة ويحتاج دعماً.',
  },
  {
    value: 'SUCCESSFUL',
    label: 'ناجح',
    description: 'الطفل ينجز المهارة بنجاح.',
  },
];

const HelpQuestionRenderer = ({ question, response, onResponseChange }) => {
  const handleScoreChange = (score) => {
    onResponseChange?.({
      ...response,
      score,
    });
  };

  const handleNotesChange = (event) => {
    onResponseChange?.({
      ...response,
      doctorNotes: event.target.value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary-100 bg-primary-50 p-6 text-right">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-primary-700">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm">
            <Layers3 size={16} />
            {formatLocalizedText(question?.domain)}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm">
            <Hash size={16} />
            {formatLocalizedText(question?.skillNumber)}
          </span>
        </div>
        <p className="text-lg font-bold text-gray-900">{formatLocalizedText(question?.description)}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <BookOpenCheck size={16} className="text-primary-600" />
          الفئة العمرية
        </div>
        <p className="text-sm text-gray-600">{formatLocalizedText(question?.ageRange) || 'غير محددة'}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm font-bold text-gray-700">تقييم المهارة</p>
        <div className="grid gap-3">
          {HELP_SCORE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleScoreChange(option.value)}
              className={`rounded-2xl border p-4 text-right transition-all ${
                response?.score === option.value
                  ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                  : 'border-gray-200 bg-gray-50 hover:border-primary-300 hover:bg-primary-50/50'
              }`}
            >
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="font-bold text-gray-900">{option.label}</span>
                {response?.score === option.value ? (
                  <span className="rounded-full bg-primary-600 px-3 py-1 text-xs font-bold text-white">
                    تم الاختيار
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-gray-600">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <label className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
          <FileText size={16} className="text-primary-600" />
          ملاحظات الطبيب
        </label>
        <textarea
          value={response?.doctorNotes || ''}
          onChange={handleNotesChange}
          placeholder="اكتب ملاحظاتك حول أداء الطفل في هذه المهارة"
          className="min-h-[120px] w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10"
        />
      </div>
    </div>
  );
};

export default HelpQuestionRenderer;
