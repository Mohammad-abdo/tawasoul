import { CheckCircle2 } from 'lucide-react';
import { formatLocalizedText, normalizeChoices } from '../assessmentUiUtils';

const CarsQuestionRenderer = ({ question, selectedChoiceIndex, onSelectChoice }) => {
  const choices = normalizeChoices(question?.choices);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary-100 bg-primary-50 p-6 text-right">
        <h3 className="mb-3 text-xl font-bold text-gray-900">
          {formatLocalizedText(question?.questionText)}
        </h3>
        <p className="text-sm text-primary-700">
          اختر أحد بدائل CARS لتسجيل الاستجابة الحالية للطفل.
        </p>
      </div>

      <div className="grid gap-4">
        {choices.map((choice, index) => (
          <button
            key={`${choice.score || index}-${index}`}
            type="button"
            onClick={() => onSelectChoice?.(index)}
            className={`rounded-2xl border p-5 text-right shadow-sm transition-all ${
              selectedChoiceIndex === index
                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50/40'
            }`}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                <CheckCircle2
                  size={16}
                  className={selectedChoiceIndex === index ? 'text-primary-700' : 'text-primary-600'}
                />
                الخيار {index + 1}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  selectedChoiceIndex === index
                    ? 'bg-primary-600 text-white'
                    : 'bg-primary-100 text-primary-700'
                }`}
              >
                الدرجة: {choice.score}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-700">{formatLocalizedText(choice)}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CarsQuestionRenderer;
