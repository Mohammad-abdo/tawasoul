import { Clock3, Image as ImageIcon, ListChecks } from 'lucide-react';
import { formatLocalizedText, normalizeChoices, resolveMediaUrl } from '../assessmentUiUtils';

const updateSubQuestionResponse = (response, subQuestionId, value) => ({
  ...(response && typeof response === 'object' ? response : {}),
  [subQuestionId]: value,
});

const VisualMemoryQuestionRenderer = ({ question, response, onResponseChange }) => {
  const subQuestions = Array.isArray(question?.questions) ? question.questions : [];
  const imageUrl = resolveMediaUrl(question?.imageUrl);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 font-semibold text-primary-700">
            <Clock3 size={16} />
            مدة العرض: {question?.displaySeconds ?? '-'} ثانية
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700">
            <ListChecks size={16} />
            عدد الأسئلة: {subQuestions.length}
          </span>
        </div>

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Visual memory batch ${question?.order ?? ''}`}
            className="mx-auto h-72 w-full max-w-lg rounded-3xl object-cover shadow-lg"
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-400">
            لا توجد صورة للدفعة
          </div>
        )}
      </div>

      <div className="space-y-4">
        {subQuestions.map((subQuestion, index) => {
          const choices = normalizeChoices(subQuestion?.choices);
          const selectedValue = response?.[subQuestion.id];

          return (
            <div key={subQuestion.id || index} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-900">سؤال فرعي {index + 1}</p>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                  {subQuestion?.questionType === 'YES_NO' ? 'نعم / لا' : 'اختيار من متعدد'}
                </span>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-gray-700">
                {formatLocalizedText(subQuestion?.questionText)}
              </p>

              {subQuestion?.questionType === 'YES_NO' ? (
                <div className="grid grid-cols-2 gap-3">
                  {[true, false].map((value) => (
                    <button
                      key={String(value)}
                      type="button"
                      onClick={() =>
                        onResponseChange?.(updateSubQuestionResponse(response, subQuestion.id, value))
                      }
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                        selectedValue === value
                          ? 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-200'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-primary-300'
                      }`}
                    >
                      {value ? 'نعم' : 'لا'}
                    </button>
                  ))}
                </div>
              ) : choices.length > 0 ? (
                <div className="grid gap-2">
                  {choices.map((choice, choiceIndex) => (
                    <button
                      key={`${choice.text || choiceIndex}-${choiceIndex}`}
                      type="button"
                      onClick={() =>
                        onResponseChange?.(updateSubQuestionResponse(response, subQuestion.id, choiceIndex))
                      }
                      className={`rounded-xl border p-3 text-right text-sm transition-all ${
                        selectedValue === choiceIndex
                          ? 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-200'
                          : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-primary-300'
                      }`}
                    >
                      <span className="ml-2 font-semibold text-gray-500">{choiceIndex + 1}.</span>
                      {formatLocalizedText(choice)}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-500">
                  <ImageIcon size={16} />
                  هذا السؤال يستخدم إجابة مباشرة من نوع نعم/لا.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VisualMemoryQuestionRenderer;
