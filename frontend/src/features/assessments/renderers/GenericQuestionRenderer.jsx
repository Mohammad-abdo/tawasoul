import { AlertCircle, Image as ImageIcon, Volume2 } from 'lucide-react';
import { formatLocalizedText, normalizeChoices, resolveMediaUrl } from '../assessmentUiUtils';

const GenericQuestionRenderer = ({ question, onPlayAudio }) => {
  const audioUrl = resolveMediaUrl(question?.audioAssetPath);
  const imageUrl = resolveMediaUrl(question?.imageAssetPath);
  const choices = normalizeChoices(question?.choices);

  return (
    <div className="space-y-6">
      {(audioUrl || imageUrl) ? (
        <div className="rounded-[2rem] border-2 border-dashed border-gray-200 bg-gray-50 p-8">
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-6">
            {audioUrl ? (
              <button
                type="button"
                onClick={() => onPlayAudio?.(audioUrl)}
                className="flex items-center gap-3 rounded-2xl bg-primary-600 px-8 py-4 font-bold text-white transition-all hover:scale-105"
              >
                <Volume2 size={24} />
                تشغيل الصوت
              </button>
            ) : null}

            {imageUrl ? (
              <div className="overflow-hidden rounded-3xl border-4 border-white shadow-xl">
                <img
                  src={imageUrl}
                  alt={formatLocalizedText(question?.scoringGuide) || 'Question asset'}
                  className="h-64 w-64 object-cover"
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-400">
          <AlertCircle size={42} className="mx-auto mb-4" />
          <p>لا توجد وسائط لهذا السؤال</p>
        </div>
      )}

      {choices.length > 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <ImageIcon size={16} />
            الخيارات المتاحة
          </div>
          <div className="grid gap-3">
            {choices.map((choice, index) => (
              <div key={`${choice.imagePath || choice.text || index}`} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                {choice.imagePath ? (
                  <img
                    src={resolveMediaUrl(choice.imagePath)}
                    alt={`Choice ${index + 1}`}
                    className="mb-3 h-24 w-full rounded-lg object-cover"
                  />
                ) : null}
                <p className="text-sm text-gray-700">{formatLocalizedText(choice.text || choice.label || `الخيار ${index + 1}`)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-primary-100 bg-primary-50 p-6 text-right">
        <h4 className="mb-2 text-sm font-bold text-primary-800">دليل التقييم</h4>
        <p className="text-sm leading-relaxed text-primary-700">
          {formatLocalizedText(question?.scoringGuide) || 'قم بتقييم استجابة الطفل بناءً على الملاحظة المباشرة.'}
        </p>
      </div>
    </div>
  );
};

export default GenericQuestionRenderer;

