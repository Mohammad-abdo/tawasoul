import { CheckCircle, XCircle, FileText, Volume2 } from 'lucide-react';

const VerbalNonsenseRenderer = ({ question, response, onResponseChange }) => {
  // استخراج القيم من الـ response لو موجودة
  const isCorrect = response?.isCorrect;
  const doctorNote = response?.doctorNote || '';

  const handleCorrectChange = (value) => {
    onResponseChange?.({
      ...response,
      isCorrect: value,
    });
  };

  const handleNoteChange = (e) => {
    onResponseChange?.({
      ...response,
      doctorNote: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      {/* عرض الجملة */}
      <div className="rounded-2xl border border-primary-100 bg-primary-50 p-8 text-center shadow-sm relative overflow-hidden">
        <div className="absolute top-4 right-4 flex items-center gap-2 text-sm font-bold text-primary-600 bg-white/60 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm">
          <Volume2 size={16} />
          الجملة المطلوبة
        </div>
        
        <div className="mt-6">
          <p className="text-3xl font-extrabold text-gray-900 leading-relaxed mb-3">
            {question?.sentenceAr}
          </p>
          {question?.sentenceEn && (
            <p className="text-lg text-gray-500 font-medium" dir="ltr">
              {question?.sentenceEn}
            </p>
          )}
        </div>
      </div>

      {/* أزرار التقييم (صح / خطأ) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <label className="text-sm font-bold text-gray-700 mb-4 block">تقييم نطق الطفل:</label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleCorrectChange(true)}
            className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-5 transition-all ${
              isCorrect === true
                ? 'border-green-500 bg-green-50 text-green-700 shadow-md ring-2 ring-green-200'
                : 'border-gray-200 bg-white text-gray-500 hover:border-green-300 hover:bg-green-50'
            }`}
          >
            <CheckCircle size={36} className={isCorrect === true ? 'text-green-600' : 'text-gray-400'} />
            <span className="font-bold text-lg">نطق صحيح</span>
          </button>

          <button
            type="button"
            onClick={() => handleCorrectChange(false)}
            className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-5 transition-all ${
              isCorrect === false
                ? 'border-red-500 bg-red-50 text-red-700 shadow-md ring-2 ring-red-200'
                : 'border-gray-200 bg-white text-gray-500 hover:border-red-300 hover:bg-red-50'
            }`}
          >
            <XCircle size={36} className={isCorrect === false ? 'text-red-600' : 'text-gray-400'} />
            <span className="font-bold text-lg">نطق خاطئ</span>
          </button>
        </div>
      </div>

      {/* ملاحظات الدكتور */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
          <FileText size={18} className="text-primary-600" />
          ملاحظات الطبيب على النطق (اختياري)
        </label>
        <textarea
          value={doctorNote}
          onChange={handleNoteChange}
          placeholder="اكتب ملاحظاتك على طريقة نطق الطفل للكلمات، الحروف التي يجد صعوبة فيها، إلخ..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 min-h-[120px] resize-none"
        />
      </div>
    </div>
  );
};

export default VerbalNonsenseRenderer;