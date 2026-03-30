import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../../components/common/Modal';
import {
  buildPayloadFromFormState,
  createEmptyFormState,
  createFormStateFromQuestion,
  TEST_TYPE_LABELS,
  VISUAL_MEMORY_TYPE_LABELS,
} from './testManagement.utils';

const inputClassName = 'input';
const textAreaClassName = 'input min-h-[96px]';

const SectionTitle = ({ children, action = null }) => (
  <div className="flex items-center justify-between gap-3 border-b border-gray-200 pb-3">
    <h4 className="text-sm font-semibold text-gray-900">{children}</h4>
    {action}
  </div>
);

const TestQuestionModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  testType,
  item = null,
  nextOrder = 1,
}) => {
  const [formState, setFormState] = useState(createEmptyFormState(testType, nextOrder));

  useEffect(() => {
    if (!isOpen) return;

    setFormState(
      item
        ? createFormStateFromQuestion(testType, item)
        : createEmptyFormState(testType, nextOrder)
    );
  }, [isOpen, item, nextOrder, testType]);

  const setTopLevelField = (key, value) => {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const setNestedField = (group, key, value) => {
    setFormState((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [key]: value,
      },
    }));
  };

  const setArrayField = (key, index, updater) => {
    setFormState((current) => ({
      ...current,
      [key]: current[key].map((entry, entryIndex) => (
        entryIndex === index ? updater(entry) : entry
      )),
    }));
  };

  const addArrayItem = (key, itemFactory) => {
    setFormState((current) => ({
      ...current,
      [key]: [...current[key], itemFactory(current[key])],
    }));
  };

  const removeArrayItem = (key, index) => {
    setFormState((current) => ({
      ...current,
      [key]: current[key].filter((_, entryIndex) => entryIndex !== index),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(buildPayloadFromFormState(testType, formState));
  };

  const renderCarsForm = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label">Order</label>
          <input
            type="number"
            min="1"
            className={inputClassName}
            value={formState.order}
            onChange={(event) => setTopLevelField('order', event.target.value)}
            required
          />
        </div>
      </div>

      <SectionTitle>Question Text</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Arabic</label>
          <textarea
            className={textAreaClassName}
            value={formState.questionText.ar}
            onChange={(event) => setNestedField('questionText', 'ar', event.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">English</label>
          <textarea
            className={textAreaClassName}
            value={formState.questionText.en}
            onChange={(event) => setNestedField('questionText', 'en', event.target.value)}
            required
          />
        </div>
      </div>

      <SectionTitle>Choices</SectionTitle>
      <div className="space-y-3">
        {formState.choices.map((choice, index) => (
          <div key={`cars-choice-${index}`} className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-gray-200 p-4">
            <div>
              <label className="label">Arabic Choice {index + 1}</label>
              <input
                type="text"
                className={inputClassName}
                value={choice.ar}
                onChange={(event) => setArrayField('choices', index, (entry) => ({ ...entry, ar: event.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">English Choice {index + 1}</label>
              <input
                type="text"
                className={inputClassName}
                value={choice.en}
                onChange={(event) => setArrayField('choices', index, (entry) => ({ ...entry, en: event.target.value }))}
                required
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalogyForm = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Order</label>
          <input
            type="number"
            min="1"
            className={inputClassName}
            value={formState.order}
            onChange={(event) => setTopLevelField('order', event.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Correct Choice</label>
          <select
            className={inputClassName}
            value={formState.correctIndex}
            onChange={(event) => setTopLevelField('correctIndex', event.target.value)}
            required
          >
            {formState.choices.map((_, index) => (
              <option key={`analogy-correct-${index}`} value={index}>
                Choice {index + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Question Image URL</label>
        <input
          type="url"
          className={inputClassName}
          value={formState.questionImageUrl}
          onChange={(event) => setTopLevelField('questionImageUrl', event.target.value)}
          required
        />
      </div>

      <SectionTitle
        action={(
          <button
            type="button"
            onClick={() => addArrayItem('choices', () => ({ imagePath: '' }))}
            className="inline-flex items-center gap-2 rounded-lg border border-primary-200 px-3 py-2 text-xs font-semibold text-primary-700"
          >
            <Plus size={14} />
            Add Choice
          </button>
        )}
      >
        Choices
      </SectionTitle>
      <div className="space-y-3">
        {formState.choices.map((choice, index) => (
          <div key={`analogy-choice-${index}`} className="rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-900">Choice {index + 1}</p>
              {formState.choices.length > 2 && (
                <button
                  type="button"
                  onClick={() => setFormState((current) => {
                    const nextChoices = current.choices.filter((_, choiceIndex) => choiceIndex !== index);
                    return {
                      ...current,
                      choices: nextChoices,
                      correctIndex: Math.max(0, Math.min(Number(current.correctIndex), nextChoices.length - 1)),
                    };
                  })}
                  className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <div className="mt-3">
              <label className="label">Image URL</label>
              <input
                type="url"
                className={inputClassName}
                value={choice.imagePath}
                onChange={(event) => setArrayField('choices', index, (entry) => ({ ...entry, imagePath: event.target.value }))}
                required
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVisualMemoryQuestionEditor = (question, index) => (
    <div key={`visual-question-${index}`} className="rounded-2xl border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-900">Recall Question {index + 1}</p>
        {formState.questions.length > 1 && (
          <button
            type="button"
            onClick={() => removeArrayItem('questions', index)}
            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Order</label>
          <input
            type="number"
            min="1"
            className={inputClassName}
            value={question.order}
            onChange={(event) => setArrayField('questions', index, (entry) => ({ ...entry, order: event.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label">Question Type</label>
          <select
            className={inputClassName}
            value={question.questionType}
            onChange={(event) => setArrayField('questions', index, (entry) => ({
              ...entry,
              questionType: event.target.value,
            }))}
          >
            {Object.entries(VISUAL_MEMORY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Arabic Question</label>
          <textarea
            className={textAreaClassName}
            value={question.questionText.ar}
            onChange={(event) => setArrayField('questions', index, (entry) => ({
              ...entry,
              questionText: { ...entry.questionText, ar: event.target.value },
            }))}
            required
          />
        </div>
        <div>
          <label className="label">English Question</label>
          <textarea
            className={textAreaClassName}
            value={question.questionText.en}
            onChange={(event) => setArrayField('questions', index, (entry) => ({
              ...entry,
              questionText: { ...entry.questionText, en: event.target.value },
            }))}
            required
          />
        </div>
      </div>

      {question.questionType === 'YES_NO' ? (
        <div>
          <label className="label">Correct Answer</label>
          <select
            className={inputClassName}
            value={String(question.correctBool)}
            onChange={(event) => setArrayField('questions', index, (entry) => ({
              ...entry,
              correctBool: event.target.value === 'true',
            }))}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <label className="label mb-0">Choices</label>
            <button
              type="button"
              onClick={() => setArrayField('questions', index, (entry) => ({
                ...entry,
                choices: [...entry.choices, { text: '' }],
              }))}
              className="inline-flex items-center gap-2 rounded-lg border border-primary-200 px-3 py-2 text-xs font-semibold text-primary-700"
            >
              <Plus size={14} />
              Add Choice
            </button>
          </div>
          {question.choices.map((choice, choiceIndex) => (
            <div key={`visual-choice-${index}-${choiceIndex}`} className="flex items-center gap-3">
              <input
                type="text"
                className={inputClassName}
                value={choice.text}
                onChange={(event) => setArrayField('questions', index, (entry) => ({
                  ...entry,
                  choices: entry.choices.map((choiceEntry, mappedIndex) => (
                    mappedIndex === choiceIndex
                      ? { ...choiceEntry, text: event.target.value }
                      : choiceEntry
                  )),
                }))}
                required
              />
              {question.choices.length > 1 && (
                <button
                  type="button"
                  onClick={() => setArrayField('questions', index, (entry) => ({
                    ...entry,
                    choices: entry.choices.filter((_, mappedIndex) => mappedIndex !== choiceIndex),
                    correctIndex: Math.max(0, Math.min(entry.correctIndex, entry.choices.length - 2)),
                  }))}
                  className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <div>
            <label className="label">Correct Choice</label>
            <select
              className={inputClassName}
              value={question.correctIndex}
              onChange={(event) => setArrayField('questions', index, (entry) => ({
                ...entry,
                correctIndex: event.target.value,
              }))}
            >
              {question.choices.map((_, choiceIndex) => (
                <option key={`visual-correct-${index}-${choiceIndex}`} value={choiceIndex}>
                  Choice {choiceIndex + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );

  const renderVisualMemoryForm = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label">Batch Order</label>
          <input
            type="number"
            min="1"
            className={inputClassName}
            value={formState.order}
            onChange={(event) => setTopLevelField('order', event.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Display Seconds</label>
          <input
            type="number"
            min="1"
            className={inputClassName}
            value={formState.displaySeconds}
            onChange={(event) => setTopLevelField('displaySeconds', event.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="label">Batch Image URL</label>
        <input
          type="url"
          className={inputClassName}
          value={formState.imageUrl}
          onChange={(event) => setTopLevelField('imageUrl', event.target.value)}
          required
        />
      </div>

      <SectionTitle
        action={(
          <button
            type="button"
            onClick={() => addArrayItem('questions', (questions) => ({
              order: questions.length + 1,
              questionText: { ar: '', en: '' },
              questionType: 'YES_NO',
              correctBool: true,
              choices: [{ text: '' }, { text: '' }],
              correctIndex: 0,
            }))}
            className="inline-flex items-center gap-2 rounded-lg border border-primary-200 px-3 py-2 text-xs font-semibold text-primary-700"
          >
            <Plus size={14} />
            Add Recall Question
          </button>
        )}
      >
        Recall Questions
      </SectionTitle>
      <div className="space-y-4">
        {formState.questions.map(renderVisualMemoryQuestionEditor)}
      </div>
    </div>
  );

  const renderAuditoryMemoryForm = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Order</label>
          <input
            type="number"
            min="1"
            className={inputClassName}
            value={formState.order}
            onChange={(event) => setTopLevelField('order', event.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Audio Clip URL</label>
          <input
            type="url"
            className={inputClassName}
            value={formState.audioClipUrl}
            onChange={(event) => setTopLevelField('audioClipUrl', event.target.value)}
            required
          />
        </div>
      </div>

      <SectionTitle>Question Text</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Arabic</label>
          <textarea
            className={textAreaClassName}
            value={formState.questionText.ar}
            onChange={(event) => setNestedField('questionText', 'ar', event.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">English</label>
          <textarea
            className={textAreaClassName}
            value={formState.questionText.en}
            onChange={(event) => setNestedField('questionText', 'en', event.target.value)}
            required
          />
        </div>
      </div>

      <SectionTitle
        action={(
          <button
            type="button"
            onClick={() => setNestedField('modelAnswer', 'items', [...formState.modelAnswer.items, ''])}
            className="inline-flex items-center gap-2 rounded-lg border border-primary-200 px-3 py-2 text-xs font-semibold text-primary-700"
          >
            <Plus size={14} />
            Add Item
          </button>
        )}
      >
        Model Answer
      </SectionTitle>
      <div className="space-y-3">
        {formState.modelAnswer.items.map((itemValue, index) => (
          <div key={`model-answer-${index}`} className="flex items-center gap-3">
            <input
              type="text"
              className={inputClassName}
              value={itemValue}
              onChange={(event) => setNestedField(
                'modelAnswer',
                'items',
                formState.modelAnswer.items.map((entry, entryIndex) => (
                  entryIndex === index ? event.target.value : entry
                ))
              )}
              required
            />
            {formState.modelAnswer.items.length > 1 && (
              <button
                type="button"
                onClick={() => setNestedField(
                  'modelAnswer',
                  'items',
                  formState.modelAnswer.items.filter((_, entryIndex) => entryIndex !== index)
                )}
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
        <label className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={formState.modelAnswer.order}
            onChange={(event) => setNestedField('modelAnswer', 'order', event.target.checked)}
          />
          Order matters in the expected answer
        </label>
      </div>
    </div>
  );

  const renderSequenceOrderForm = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Order</label>
          <input
            type="number"
            min="1"
            className={inputClassName}
            value={formState.order}
            onChange={(event) => setTopLevelField('order', event.target.value)}
            required
          />
        </div>
      </div>

      <SectionTitle
        action={(
          <button
            type="button"
            onClick={() => addArrayItem('images', (images) => ({
              assetPath: '',
              position: images.length + 1,
            }))}
            className="inline-flex items-center gap-2 rounded-lg border border-primary-200 px-3 py-2 text-xs font-semibold text-primary-700"
          >
            <Plus size={14} />
            Add Image
          </button>
        )}
      >
        Sequence Images
      </SectionTitle>
      <div className="space-y-3">
        {formState.images.map((image, index) => (
          <div key={`sequence-image-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr_120px_auto] gap-4 rounded-2xl border border-gray-200 p-4">
            <div>
              <label className="label">Image URL</label>
              <input
                type="url"
                className={inputClassName}
                value={image.assetPath}
                onChange={(event) => setArrayField('images', index, (entry) => ({ ...entry, assetPath: event.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Position</label>
              <input
                type="number"
                min="1"
                className={inputClassName}
                value={image.position}
                onChange={(event) => setArrayField('images', index, (entry) => ({ ...entry, position: event.target.value }))}
                required
              />
            </div>
            <div className="flex items-end">
              {formState.images.length > 2 && (
                <button
                  type="button"
                  onClick={() => setFormState((current) => ({
                    ...current,
                    images: current.images
                      .filter((_, imageIndex) => imageIndex !== index)
                      .map((entry, entryIndex) => ({
                        ...entry,
                        position: entryIndex + 1,
                      })),
                  }))}
                  className="rounded-lg p-3 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVerbalNonsenseForm = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label">Order</label>
          <input
            type="number"
            min="1"
            className={inputClassName}
            value={formState.order}
            onChange={(event) => setTopLevelField('order', event.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="label">Arabic Sentence</label>
        <textarea
          className={textAreaClassName}
          value={formState.sentenceAr}
          onChange={(event) => setTopLevelField('sentenceAr', event.target.value)}
          required
        />
      </div>

      <div>
        <label className="label">English Sentence</label>
        <textarea
          className={textAreaClassName}
          value={formState.sentenceEn}
          onChange={(event) => setTopLevelField('sentenceEn', event.target.value)}
        />
      </div>
    </div>
  );

  const renderFormByType = () => {
    switch (testType) {
      case 'CARS':
        return renderCarsForm();
      case 'ANALOGY':
        return renderAnalogyForm();
      case 'VISUAL_MEMORY':
        return renderVisualMemoryForm();
      case 'AUDITORY_MEMORY':
        return renderAuditoryMemoryForm();
      case 'IMAGE_SEQUENCE_ORDER':
        return renderSequenceOrderForm();
      case 'VERBAL_NONSENSE':
        return renderVerbalNonsenseForm();
      default:
        return (
          <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-600">
            No editable form is configured for this test type.
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${item ? 'Edit' : 'Add'} ${TEST_TYPE_LABELS[testType] || 'Question'}`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {renderFormByType()}

        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-secondary sm:w-32">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary sm:w-40">
            {isSubmitting ? 'Saving...' : item ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TestQuestionModal;
