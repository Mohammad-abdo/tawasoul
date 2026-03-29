import { ArrowDown01, Image as ImageIcon } from 'lucide-react';
import { resolveMediaUrl } from '../assessmentUiUtils';

const buildNextSequence = (currentSequence, imageId) => {
  const normalizedSequence = Array.isArray(currentSequence) ? currentSequence : [];

  if (normalizedSequence.includes(imageId)) {
    return normalizedSequence.filter((currentImageId) => currentImageId !== imageId);
  }

  return [...normalizedSequence, imageId];
};

const SequenceOrderQuestionRenderer = ({ question, response, onResponseChange }) => {
  const images = Array.isArray(question?.images) ? question.images : [];
  const selectedSequence = Array.isArray(response) ? response : [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary-100 bg-primary-50 p-6 text-right">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary-700">
          <ArrowDown01 size={16} />
          ترتيب الصور
        </div>
        <p className="text-sm leading-relaxed text-primary-700">
          اضغط على الصور بالترتيب الذي تتوقعه. سيظهر رقم يوضح ترتيب اختيارك الحالي.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {images.map((image) => {
          const selectedPosition = selectedSequence.indexOf(image.id);

          return (
            <button
              key={image.id}
              type="button"
              onClick={() => onResponseChange?.(buildNextSequence(selectedSequence, image.id))}
              className={`overflow-hidden rounded-3xl border bg-white text-right shadow-sm transition-all ${
                selectedPosition >= 0
                  ? 'border-primary-500 ring-2 ring-primary-200'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <ImageIcon size={16} className="text-primary-600" />
                  الصورة
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700">
                    الموضع الصحيح {image.position}
                  </span>
                  {selectedPosition >= 0 ? (
                    <span className="rounded-full bg-primary-600 px-3 py-1 text-xs font-bold text-white">
                      اختيارك {selectedPosition + 1}
                    </span>
                  ) : null}
                </div>
              </div>
              <img
                src={resolveMediaUrl(image.assetPath)}
                alt={`Sequence item ${image.position}`}
                className="h-56 w-full object-cover"
              />
            </button>
          );
        })}
      </div>

      {selectedSequence.length > 0 ? (
        <button
          type="button"
          onClick={() => onResponseChange?.([])}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 transition-colors hover:border-primary-300 hover:text-primary-700"
        >
          مسح الترتيب الحالي
        </button>
      ) : null}
    </div>
  );
};

export default SequenceOrderQuestionRenderer;
