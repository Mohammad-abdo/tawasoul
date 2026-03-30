import { Headphones, ListChecks } from 'lucide-react';
import { formatLocalizedText, resolveMediaUrl } from '../assessmentUiUtils';

const AuditoryMemoryQuestionRenderer = ({ question, onPlayAudio }) => {
  const audioUrl = resolveMediaUrl(question?.audioClipUrl);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary-100 bg-primary-50 p-6 text-right">
        <p className="mb-3 text-xl font-bold text-gray-900">{formatLocalizedText(question?.questionText)}</p>
        <p className="text-sm text-primary-700">
          استمع إلى المقطع الصوتي ثم تابع استرجاع العناصر مع الطفل.
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

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <ListChecks size={16} className="text-primary-600" />
          ملاحظات التنفيذ
        </div>
        <p className="text-sm leading-relaxed text-gray-600">
          يقوم التقييم هنا على العناصر التي يسترجعها الطفل بعد سماع المقطع، ويتم احتساب النتيجة تلقائياً حسب العناصر الصحيحة.
        </p>
      </div>
    </div>
  );
};

export default AuditoryMemoryQuestionRenderer;

