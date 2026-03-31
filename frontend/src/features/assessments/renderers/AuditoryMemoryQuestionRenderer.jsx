import { Headphones, ListChecks, Type } from 'lucide-react';
import { formatLocalizedText, resolveMediaUrl } from '../assessmentUiUtils';

const parseRecalledItems = (value) =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const AuditoryMemoryQuestionRenderer = ({
  question,
  response,
  onPlayAudio,
  onResponseChange,
}) => {
  const audioUrl = resolveMediaUrl(question?.audioClipUrl);
  const recalledText =
    typeof response?.rawText === 'string'
      ? response.rawText
      : Array.isArray(response?.recalledItems)
        ? response.recalledItems.join('\n')
        : '';

  const handleTextChange = (event) => {
    const nextText = event.target.value;

    onResponseChange?.({
      rawText: nextText,
      recalledItems: parseRecalledItems(nextText),
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary-100 bg-primary-50 p-6 text-right">
        <p className="mb-3 text-xl font-bold text-gray-900">
          {formatLocalizedText(question?.questionText)}
        </p>
        <p className="text-sm text-primary-700">
          استمع إلى المقطع الصوتي ثم اكتب العناصر التي استرجعها الطفل. يمكنك كتابة
          عنصر في كل سطر أو فصل العناصر بفواصل.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        {audioUrl ? (
          <button
            type="button"
            onClick={() => onPlayAudio?.(audioUrl)}
            className="mx-auto flex items-center gap-3 rounded-2xl bg-primary-600 px-8 py-4 font-bold text-white transition-all hover:scale-105"
          >
            <Headphones size={24} />
            تشغيل المقطع الصوتي
          </button>
        ) : (
          <p className="text-gray-400">لا يوجد مقطع صوتي لهذا السؤال</p>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <label className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
          <Type size={16} className="text-primary-600" />
          العناصر التي استرجعها الطفل
        </label>
        <textarea
          value={recalledText}
          onChange={handleTextChange}
          onBlur={handleTextChange}
          placeholder="مثال: تفاحة&#10;قطة&#10;كرة"
          className="min-h-[140px] w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10"
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <ListChecks size={16} className="text-primary-600" />
          ملاحظات التنفيذ
        </div>
        <p className="text-sm leading-relaxed text-gray-600">
          سيتم احتساب الدرجة تلقائياً من العناصر المطابقة بعد الحفظ. إذا لم يسترجع
          الطفل أي عنصر، اترك الحقل فارغاً ثم انتقل للحفظ بعد مراجعة جميع الأسئلة.
        </p>
      </div>
    </div>
  );
};

export default AuditoryMemoryQuestionRenderer;
