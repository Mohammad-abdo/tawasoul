import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowDown, ArrowUp, Edit, EyeOff, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { assessments } from '../../api/admin';
import TestQuestionModal from './TestQuestionModal';
import HelpTestSkillsPanel from './HelpTestSkillsPanel';
import {
  getLocalizedText,
  isManagedTestType,
  MODALITY_LABELS,
  sortByOrder,
  summarizeCarsChoices,
  summarizeModelAnswer,
  TEST_TYPE_LABELS,
  VISUAL_MEMORY_TYPE_LABELS,
} from './testManagement.utils';

const tableClassName = 'min-w-full divide-y divide-gray-200';
const thClassName = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500';
const tdClassName = 'px-4 py-4 align-top text-sm text-gray-800';

const ActionButtons = ({ onEdit, onDelete, onMoveUp, onMoveDown, disableUp, disableDown }) => (
  <div className="flex items-center justify-end gap-2">
    <button type="button" onClick={onMoveUp} disabled={disableUp} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40">
      <ArrowUp size={16} />
    </button>
    <button type="button" onClick={onMoveDown} disabled={disableDown} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40">
      <ArrowDown size={16} />
    </button>
    <button type="button" onClick={onEdit} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50">
      <Edit size={16} />
    </button>
    <button type="button" onClick={onDelete} className="rounded-lg p-2 text-red-600 hover:bg-red-50">
      <Trash2 size={16} />
    </button>
  </div>
);

const Thumbnail = ({ src, alt }) => {
  if (!src) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
        N/A
      </div>
    );
  }

  return <img src={src} alt={alt} className="h-16 w-16 rounded-xl object-cover border border-gray-200" />;
};

const DetailTable = ({ columns, rows, renderActions }) => (
  <div className="overflow-x-auto rounded-2xl border border-gray-200">
    <table className={tableClassName}>
      <thead className="bg-gray-50">
        <tr>
          {columns.map((column) => (
            <th key={column.key} className={thClassName}>
              {column.label}
            </th>
          ))}
          <th className={`${thClassName} text-right`}>Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {rows.map((row, index) => (
          <tr key={row.id}>
            {columns.map((column) => (
              <td key={`${row.id}-${column.key}`} className={tdClassName}>
                {column.render(row, index)}
              </td>
            ))}
            <td className={`${tdClassName} text-right`}>
              {renderActions(row, index)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const TestDetail = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-test-detail', testId],
    queryFn: async () => {
      const response = await assessments.getTestById(testId);
      return response.data.data;
    },
  });

  const orderedQuestions = useMemo(() => {
    const raw = data?.questions || [];
    if (data?.testType === 'HELP') {
      return [...raw].sort((a, b) => {
        const byDomain = (a.domain || '').localeCompare(b.domain || '');
        if (byDomain !== 0) return byDomain;
        return String(a.skillNumber || '').localeCompare(String(b.skillNumber || ''), undefined, { numeric: true });
      });
    }
    return sortByOrder(raw);
  }, [data?.questions, data?.testType]);
  const nextOrder = orderedQuestions.length > 0
    ? Math.max(...orderedQuestions.map((question) => question.order ?? question.orderIndex ?? 0)) + 1
    : 1;

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const isEditing = Boolean(editingItem);

      switch (data.testType) {
        case 'CARS':
          return isEditing
            ? assessments.updateCarsQuestion(editingItem.id, payload)
            : assessments.createCarsQuestion(data.id, payload);
        case 'ANALOGY':
          return isEditing
            ? assessments.updateAnalogyQuestion(editingItem.id, payload)
            : assessments.createAnalogyQuestion(data.id, payload);
        case 'VISUAL_MEMORY':
          return isEditing
            ? assessments.updateVisualMemoryBatch(editingItem.id, payload)
            : assessments.createVisualMemoryBatch(data.id, payload);
        case 'AUDITORY_MEMORY':
          return isEditing
            ? assessments.updateAuditoryMemoryQuestion(editingItem.id, payload)
            : assessments.createAuditoryMemoryQuestion(data.id, payload);
        case 'VERBAL_NONSENSE':
          return isEditing
            ? assessments.updateVerbalNonsenseQuestion(editingItem.id, payload)
            : assessments.createVerbalNonsenseQuestion(data.id, payload);
        case 'IMAGE_SEQUENCE_ORDER':
          return isEditing
            ? assessments.updateImageSequenceOrderQuestion(editingItem.id, payload)
            : assessments.createImageSequenceOrderQuestion(data.id, payload);
        default:
          throw new Error('Unsupported test type');
      }
    },
    onSuccess: () => {
      toast.success(editingItem ? 'Question updated successfully.' : 'Question created successfully.');
      setIsQuestionModalOpen(false);
      setEditingItem(null);
      queryClient.invalidateQueries({ queryKey: ['dashboard-test-detail', testId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-tests-list'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to save the question.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteTarget) return null;

      if (data.testType === 'VISUAL_MEMORY') {
        return assessments.deleteVisualMemoryBatch(data.id, deleteTarget.id);
      }

      return assessments.deleteTestQuestion(data.id, deleteTarget.id);
    },
    onSuccess: () => {
      toast.success(data.testType === 'VISUAL_MEMORY' ? 'Batch deleted successfully.' : 'Question deleted successfully.');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['dashboard-test-detail', testId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-tests-list'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to delete the item.');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ currentItem, direction }) => {
      const currentIndex = orderedQuestions.findIndex((entry) => entry.id === currentItem.id);
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const adjacentItem = orderedQuestions[targetIndex];

      if (!adjacentItem) {
        return null;
      }

      const maxOrder = Math.max(...orderedQuestions.map((entry) => entry.order ?? entry.orderIndex ?? 0), 0);
      const tempOrder = maxOrder + 1;
      const currentOrder = currentItem.order ?? currentItem.orderIndex;
      const adjacentOrder = adjacentItem.order ?? adjacentItem.orderIndex;

      const updateOrder = async (itemId, order) => {
        const payload = { order };

        switch (data.testType) {
          case 'CARS':
            return assessments.updateCarsQuestion(itemId, payload);
          case 'ANALOGY':
            return assessments.updateAnalogyQuestion(itemId, payload);
          case 'VISUAL_MEMORY':
            return assessments.updateVisualMemoryBatch(itemId, payload);
          case 'AUDITORY_MEMORY':
            return assessments.updateAuditoryMemoryQuestion(itemId, payload);
          case 'VERBAL_NONSENSE':
            return assessments.updateVerbalNonsenseQuestion(itemId, payload);
          case 'IMAGE_SEQUENCE_ORDER':
            return assessments.updateImageSequenceOrderQuestion(itemId, payload);
          default:
            throw new Error('Unsupported test type');
        }
      };

      await updateOrder(currentItem.id, tempOrder);
      await updateOrder(adjacentItem.id, currentOrder);
      await updateOrder(currentItem.id, adjacentOrder);
      return true;
    },
    onSuccess: () => {
      toast.success('Order updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['dashboard-test-detail', testId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-tests-list'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to reorder items.');
    },
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setIsQuestionModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setIsQuestionModalOpen(true);
  };

  const renderCommonActions = (item, index) => (
    <ActionButtons
      onEdit={() => openEditModal(item)}
      onDelete={() => setDeleteTarget(item)}
      onMoveUp={() => reorderMutation.mutate({ currentItem: item, direction: 'up' })}
      onMoveDown={() => reorderMutation.mutate({ currentItem: item, direction: 'down' })}
      disableUp={index === 0 || reorderMutation.isPending}
      disableDown={index === orderedQuestions.length - 1 || reorderMutation.isPending}
    />
  );

  const renderQuestions = () => {
    switch (data.testType) {
      case 'CARS':
        return (
          <DetailTable
            rows={orderedQuestions}
            columns={[
              { key: 'order', label: 'Order', render: (row) => row.order },
              { key: 'questionText', label: 'Arabic Question', render: (row) => getLocalizedText(row.questionText, 'ar') },
              { key: 'choices', label: 'Choices Summary', render: (row) => <div className="max-w-xl whitespace-normal text-sm text-gray-600">{summarizeCarsChoices(row.choices)}</div> },
            ]}
            renderActions={renderCommonActions}
          />
        );
      case 'ANALOGY':
        return (
          <DetailTable
            rows={orderedQuestions}
            columns={[
              { key: 'order', label: 'Order', render: (row) => row.order },
              { key: 'questionImageUrl', label: 'Question Image', render: (row) => <Thumbnail src={row.questionImageUrl} alt="Question" /> },
              { key: 'choicesCount', label: 'Choices', render: (row) => row.choices?.length || 0 },
              { key: 'correctIndex', label: 'Correct Choice', render: (row) => Number(row.correctIndex) + 1 },
            ]}
            renderActions={renderCommonActions}
          />
        );
      case 'VISUAL_MEMORY':
        return (
          <div className="space-y-4">
            {orderedQuestions.map((batch, index) => (
              <div key={batch.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-gray-200 bg-gray-50 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <Thumbnail src={batch.imageUrl} alt="Batch" />
                    <div>
                      <h4 className="text-base font-semibold text-gray-900">Batch {batch.order}</h4>
                      <p className="text-sm text-gray-600">Display: {batch.displaySeconds} seconds</p>
                      <p className="text-sm text-gray-600">Recall questions: {batch.questions?.length || 0}</p>
                    </div>
                  </div>
                  {renderCommonActions(batch, index)}
                </div>
                <div className="overflow-x-auto">
                  <table className={tableClassName}>
                    <thead className="bg-white">
                      <tr>
                        <th className={thClassName}>Order</th>
                        <th className={thClassName}>Arabic Question</th>
                        <th className={thClassName}>Type</th>
                        <th className={thClassName}>Answer Configuration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {(batch.questions || []).map((question) => (
                        <tr key={question.id}>
                          <td className={tdClassName}>{question.order}</td>
                          <td className={tdClassName}>{getLocalizedText(question.questionText, 'ar')}</td>
                          <td className={tdClassName}>{VISUAL_MEMORY_TYPE_LABELS[question.questionType] || question.questionType}</td>
                          <td className={tdClassName}>
                            {question.questionType === 'YES_NO'
                              ? `Correct: ${question.correctBool ? 'Yes' : 'No'}`
                              : `Choices: ${question.choices?.length || 0}, Correct: ${(question.correctIndex ?? 0) + 1}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        );
      case 'AUDITORY_MEMORY':
        return (
          <DetailTable
            rows={orderedQuestions}
            columns={[
              { key: 'order', label: 'Order', render: (row) => row.order },
              { key: 'audio', label: 'Audio Clip', render: (row) => <audio controls preload="none" src={row.audioClipUrl} className="max-w-xs" /> },
              { key: 'questionText', label: 'Arabic Question', render: (row) => getLocalizedText(row.questionText, 'ar') },
              { key: 'modelAnswer', label: 'Model Answer', render: (row) => <div className="max-w-xl whitespace-normal text-sm text-gray-600">{summarizeModelAnswer(row.modelAnswer)}</div> },
            ]}
            renderActions={renderCommonActions}
          />
        );
      case 'IMAGE_SEQUENCE_ORDER':
        return (
          <DetailTable
            rows={orderedQuestions}
            columns={[
              { key: 'order', label: 'Order', render: (row) => row.order },
              {
                key: 'images',
                label: 'Sequence',
                render: (row) => (
                  <div className="flex flex-wrap gap-2">
                    {(row.images || []).map((image) => (
                      <Thumbnail key={image.id || `${row.id}-${image.position}`} src={image.assetPath} alt={`Sequence ${image.position}`} />
                    ))}
                  </div>
                ),
              },
              { key: 'count', label: 'Images', render: (row) => row.images?.length || 0 },
            ]}
            renderActions={renderCommonActions}
          />
        );
      case 'VERBAL_NONSENSE':
        return (
          <DetailTable
            rows={orderedQuestions}
            columns={[
              { key: 'order', label: 'Order', render: (row) => row.order },
              { key: 'sentenceAr', label: 'Arabic Sentence', render: (row) => <div className="max-w-xl whitespace-normal">{row.sentenceAr}</div> },
              { key: 'sentenceEn', label: 'English Sentence', render: (row) => <div className="max-w-xl whitespace-normal text-gray-600">{row.sentenceEn || '-'}</div> },
            ]}
            renderActions={renderCommonActions}
          />
        );
      case 'VB_MAPP':
        return (
          <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-600">
            VB-MAPP is visible here for admin reference, but its sessions and scoring are managed through the dedicated VB-MAPP workflow.
          </div>
        );
      case 'HELP':
        return <HelpTestSkillsPanel testId={testId} skills={orderedQuestions} />;
      default:
        return (
          <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-600">
            This test type is visible here, but the standard question editor is only wired for CARS, Analogy, Visual Memory, Auditory Memory, Verbal Nonsense, and Image Sequence Order. HELP and VB-MAPP use separate workflows.
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card p-8 text-sm text-gray-600">
        Loading test details...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-card p-8 text-sm text-gray-600">
        Test not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard/tests')}
            className="rounded-xl border border-gray-200 bg-white p-3 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Test Detail</h2>
            <p className="mt-1 text-sm text-gray-500">
              Review metadata and manage the questions for this test.
            </p>
          </div>
        </div>
        {isManagedTestType(data.testType) && (
          <button type="button" onClick={openCreateModal} className="btn-primary inline-flex items-center gap-2">
            <Plus size={18} />
            Add Question
          </button>
        )}
      </div>

      <section className="glass-card p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Title (Arabic)</p>
            <p className="mt-2 text-base font-semibold text-gray-900">{data.titleAr || '-'}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Title (English)</p>
            <p className="mt-2 text-base font-semibold text-gray-900">{data.title || '-'}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Type</p>
            <p className="mt-2 text-base font-semibold text-gray-900">{TEST_TYPE_LABELS[data.testType] || data.testType}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Modality</p>
            <p className="mt-2 text-base font-semibold text-gray-900">{MODALITY_LABELS[data.type] || data.type}</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{data.description || 'No description provided.'}</p>
        </div>
      </section>

      <section className="glass-card p-6">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{data.testType === 'HELP' ? 'HELP skills' : 'Questions'}</h3>
            <p className="text-sm text-gray-500">
              {data.testType === 'HELP'
                ? `${data.questionCount} skill${data.questionCount === 1 ? '' : 's'} in the HELP catalog.`
                : `${data.questionCount} item${data.questionCount === 1 ? '' : 's'} in this test.`}
            </p>
          </div>
          {!orderedQuestions.length && (
            <div className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
              <EyeOff size={16} />
              No questions added yet.
            </div>
          )}
        </div>

        {renderQuestions()}
      </section>

      <TestQuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={(payload) => saveMutation.mutate(payload)}
        isSubmitting={saveMutation.isPending}
        testType={data.testType}
        item={editingItem}
        nextOrder={nextOrder}
      />

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={data.testType === 'VISUAL_MEMORY' ? 'Delete Batch' : 'Delete Question'}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            {data.testType === 'VISUAL_MEMORY'
              ? 'This will permanently remove the selected batch and all recall questions inside it.'
              : 'This will permanently remove the selected question.'}
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setDeleteTarget(null)} className="btn-secondary sm:w-28">
              Cancel
            </button>
            <button type="button" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 sm:w-32">
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TestDetail;
