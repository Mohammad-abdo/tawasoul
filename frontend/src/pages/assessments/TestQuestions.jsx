import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Edit, Trash2, ArrowRight, Volume2, Image as ImageIcon, Play, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { assessments } from '../../api/admin';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const TestQuestions = () => {
  const { id: testId } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [choices, setChoices] = useState([]);

  const { data: testData } = useQuery({
    queryKey: ['assessment-test', testId],
    queryFn: async () => {
      const response = await assessments.getTestById(testId);
      return response.data.data;
    },
  });

  const { data: questions, isLoading, refetch } = useQuery({
    queryKey: ['test-questions', testId],
    queryFn: async () => {
      const response = await assessments.getTestQuestions(testId);
      return response.data.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (formData) => assessments.createQuestion(testId, formData),
    onSuccess: () => {
      toast.success('تم إضافة السؤال بنجاح');
      setShowModal(false);
      setEditingItem(null);
      setAudioPreview(null);
      setImagePreview(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل الإضافة');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => assessments.updateQuestion(id, formData),
    onSuccess: () => {
      toast.success('تم التحديث بنجاح');
      setShowModal(false);
      setEditingItem(null);
      setAudioPreview(null);
      setImagePreview(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل التحديث');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: assessments.deleteQuestion,
    onSuccess: () => {
      toast.success('تم الحذف بنجاح');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل الحذف');
    },
  });

  const columns = [
    {
      header: '#',
      accessor: 'index',
      render: (row, index) => (
        <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
          <span className="text-primary-600 font-bold">{index + 1}</span>
        </div>
      )
    },
    {
      header: 'الوسائط',
      accessor: 'media',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.audioAssetPath && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
              <Volume2 size={18} className="text-blue-600" />
              <span className="text-xs text-blue-700 font-semibold">صوت</span>
            </div>
          )}
          {row.imageAssetPath && (
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
              <ImageIcon size={18} className="text-purple-600" />
              <span className="text-xs text-purple-700 font-semibold">صورة</span>
            </div>
          )}
          {!row.audioAssetPath && !row.imageAssetPath && (
            <span className="text-xs text-gray-400">لا توجد وسائط</span>
          )}
        </div>
      )
    },
    {
      header: 'دليل التقييم',
      accessor: 'scoringGuide',
      render: (row) => (
        <p className="text-sm text-gray-600 line-clamp-2 max-w-md">
          {row.scoringGuide || 'لا يوجد دليل تقييم'}
        </p>
      )
    },
    {
      header: 'الإجراءات',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingItem(row);
              setAudioPreview(row.audioAssetPath);
              setImagePreview(row.imageAssetPath);
              setChoices(row.choices || []);
              setShowModal(true);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => {
              if (window.confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
                deleteMutation.mutate(row.id);
              }
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'audio') {
      setAudioPreview(URL.createObjectURL(file));
    } else if (type === 'image') {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Add files if selected
    const audioFile = e.target.audio?.files[0];
    const imageFile = e.target.image?.files[0];
    
    if (audioFile) formData.append('audio', audioFile);
    if (imageFile) formData.append('image', imageFile);
    
    // Add scoring guide
    formData.append('scoringGuide', formData.get('scoringGuide') || '');
    formData.append('choices', JSON.stringify(choices));

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const playAudio = (url) => {
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/assessments')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowRight size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {testData?.title || 'إدارة الأسئلة'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {testData?.category === 'AUDITORY' ? 'اختبار سمعي' : 'اختبار بصري'} - إدارة أسئلة الاختبار
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setAudioPreview(null);
            setImagePreview(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة سؤال جديد
        </button>
      </div>

      <div className="glass-card">
        <DataTable
          data={questions || []}
          columns={columns}
          isLoading={isLoading}
          searchable={false}
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
          setAudioPreview(null);
          setImagePreview(null);
          setChoices([]);
        }}
        title={editingItem ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Audio Upload */}
            <div>
              <label className="label">
                ملف الصوت {testData?.category === 'AUDITORY' && '*'}
              </label>
              <input
                name="audio"
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileChange(e, 'audio')}
                className="input"
                required={testData?.category === 'AUDITORY' && !editingItem?.audioAssetPath}
              />
              {audioPreview && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg flex items-center gap-3">
                  <Volume2 className="text-blue-600" size={20} />
                  <span className="text-sm text-blue-700 font-semibold flex-1">تم اختيار ملف صوتي</span>
                  <button
                    type="button"
                    onClick={() => playAudio(audioPreview)}
                    className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Play size={16} />
                  </button>
                </div>
              )}
              {editingItem?.audioAssetPath && !audioPreview && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                  <Volume2 className="text-gray-600" size={20} />
                  <span className="text-sm text-gray-700 flex-1">الملف الحالي موجود</span>
                  <button
                    type="button"
                    onClick={() => playAudio(editingItem.audioAssetPath)}
                    className="p-1.5 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    <Play size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="label">
                ملف الصورة {testData?.category === 'VISUAL' && '*'}
              </label>
              <input
                name="image"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'image')}
                className="input"
                required={testData?.category === 'VISUAL' && !editingItem?.imageAssetPath}
              />
              {imagePreview && (
                <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              {editingItem?.imageAssetPath && !imagePreview && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={editingItem.imageAssetPath}
                    alt="Current"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="label">دليل التقييم</label>
            <textarea
              name="scoringGuide"
              defaultValue={editingItem?.scoringGuide}
              className="input min-h-[100px]"
              placeholder="مثال: قم بتقييم استجابة الطفل من 0-10 بناءً على..."
            />
            <p className="text-xs text-gray-500 mt-1">
              هذا الدليل سيظهر للأطباء عند تقييم استجابة الطفل
            </p>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">الاختيارات (اختياري)</label>
              <button
                type="button"
                onClick={() => setChoices([...choices, { text: '', isCorrect: false }])}
                className="text-primary-600 hover:text-primary-700 text-sm font-semibold flex items-center gap-1"
              >
                <Plus size={16} />
                إضافة اختيار
              </button>
            </div>
            <div className="space-y-2">
              {choices.map((choice, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={choice.text}
                    onChange={(e) => {
                      const newChoices = [...choices];
                      newChoices[index].text = e.target.value;
                      setChoices(newChoices);
                    }}
                    placeholder={`الاختيار ${index + 1}`}
                    className="input flex-1"
                  />
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={choice.isCorrect}
                      onChange={(e) => {
                        const newChoices = [...choices];
                        newChoices[index].isCorrect = e.target.checked;
                        setChoices(newChoices);
                      }}
                      className="rounded text-primary-600"
                    />
                    صحيح
                  </label>
                  <button
                    type="button"
                    onClick={() => setChoices(choices.filter((_, i) => i !== index))}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {choices.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">لا توجد اختيارات مضافة لهذا السؤال</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingItem(null);
                setAudioPreview(null);
                setImagePreview(null);
              }}
              className="btn-secondary flex-1"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TestQuestions;
