import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { faqs } from '../../api/admin';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const FAQs = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['faqs', page],
    queryFn: async () => {
      const response = await faqs.getAll({ page, limit });
      return response.data.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: faqs.create,
    onSuccess: () => {
      toast.success('تم إنشاء السؤال بنجاح');
      setShowModal(false);
      setEditingItem(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل الإنشاء');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => faqs.update(id, data),
    onSuccess: () => {
      toast.success('تم التحديث بنجاح');
      setShowModal(false);
      setEditingItem(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل التحديث');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: faqs.delete,
    onSuccess: () => {
      toast.success('تم الحذف بنجاح');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل الحذف');
    },
  });

  const faqsList = data || [];

  const columns = [
    {
      header: 'الترتيب',
      accessor: 'order',
      sortable: true,
      render: (row) => (
        <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
          <span className="text-primary-600 font-bold">{row.order}</span>
        </div>
      )
    },
    {
      header: 'السؤال',
      accessor: 'question',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900 text-lg">{row.questionAr}</p>
          <p className="text-xs text-gray-500">{row.questionEn || ''}</p>
        </div>
      )
    },
    {
      header: 'الإجابة',
      accessor: 'answer',
      render: (row) => (
        <p className="text-sm text-gray-600 line-clamp-2 max-w-md">
          {row.answerAr || row.answerEn || 'لا توجد إجابة'}
        </p>
      )
    },
    {
      header: 'الفئة',
      accessor: 'category',
      render: (row) => (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
          {row.category || 'عام'}
        </span>
      )
    },
    {
      header: 'الحالة',
      accessor: 'isActive',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          row.isActive 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          {row.isActive ? 'نشط' : 'غير نشط'}
        </span>
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      questionAr: formData.get('questionAr'),
      questionEn: formData.get('questionEn') || undefined,
      answerAr: formData.get('answerAr'),
      answerEn: formData.get('answerEn') || undefined,
      category: formData.get('category') || undefined,
      order: parseInt(formData.get('order')) || 0,
      isActive: formData.get('isActive') === 'on',
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة الأسئلة الشائعة</h2>
          <p className="text-sm text-gray-500 mt-1">إدارة الأسئلة الشائعة المعروضة في التطبيق</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
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
          data={faqsList}
          columns={columns}
          isLoading={isLoading}
          searchable={true}
          searchPlaceholder="بحث في الأسئلة..."
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">السؤال (عربي) *</label>
              <input
                name="questionAr"
                type="text"
                defaultValue={editingItem?.questionAr}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">السؤال (إنجليزي)</label>
              <input
                name="questionEn"
                type="text"
                defaultValue={editingItem?.questionEn}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">الإجابة (عربي) *</label>
              <textarea
                name="answerAr"
                defaultValue={editingItem?.answerAr}
                className="input min-h-[100px]"
                required
              />
            </div>
            <div>
              <label className="label">الإجابة (إنجليزي)</label>
              <textarea
                name="answerEn"
                defaultValue={editingItem?.answerEn}
                className="input min-h-[100px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">الفئة</label>
              <input
                name="category"
                type="text"
                defaultValue={editingItem?.category}
                className="input"
                placeholder="مثال: عام، الدفع، الحجوزات"
              />
            </div>
            <div>
              <label className="label">الترتيب</label>
              <input
                name="order"
                type="number"
                defaultValue={editingItem?.order || 0}
                className="input"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="label">الحالة</label>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <input
                name="isActive"
                type="checkbox"
                defaultChecked={editingItem?.isActive !== false}
                className="w-5 h-5 text-primary-600 rounded"
              />
              <label className="font-semibold text-gray-900">تفعيل السؤال</label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingItem(null);
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

export default FAQs;


