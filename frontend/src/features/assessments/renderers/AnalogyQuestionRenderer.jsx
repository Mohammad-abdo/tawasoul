import { Image as ImageIcon } from 'lucide-react';
import { normalizeChoices, resolveMediaUrl } from '../assessmentUiUtils';

const AnalogyQuestionRenderer = ({ question, response, onResponseChange }) => {
  const choices = normalizeChoices(question?.choices);
  const questionImageUrl = resolveMediaUrl(question?.questionImageUrl);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-600">
          <ImageIcon size={16} className="text-primary-600" />
          صورة السؤال
        </div>
        {questionImageUrl ? (
          <img
            src={questionImageUrl}
            alt={`Analogy question ${question?.order ?? ''}`}
            className="mx-auto h-72 w-full max-w-md rounded-3xl object-cover shadow-lg"
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-400">
            لا توجد صورة للسؤال
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {choices.map((choice, index) => (
          <button
            key={`${choice.imagePath || index}-${index}`}
            type="button"
            onClick={() => onResponseChange?.(index)}
            className={`rounded-2xl border p-4 text-right shadow-sm transition-all ${
              response === index
                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50/40'
            }`}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-600">الخيار {index + 1}</p>
              {response === index ? (
                <span className="rounded-full bg-primary-600 px-3 py-1 text-xs font-bold text-white">
                  تم الاختيار
                </span>
              ) : null}
            </div>
            {choice.imagePath ? (
              <img
                src={resolveMediaUrl(choice.imagePath)}
                alt={`Choice ${index + 1}`}
                className="h-40 w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-400">
                لا توجد صورة
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AnalogyQuestionRenderer;
