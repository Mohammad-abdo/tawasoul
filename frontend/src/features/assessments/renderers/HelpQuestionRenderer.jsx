import { BookOpenCheck, Hash, Layers3 } from 'lucide-react';
import { formatLocalizedText } from '../assessmentUiUtils';

const HelpQuestionRenderer = ({ question }) => {
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
    </div>
  );
};

export default HelpQuestionRenderer;

