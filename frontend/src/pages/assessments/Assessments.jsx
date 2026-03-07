import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, FileQuestion, Volume2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { assessments } from '../../api/admin';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const Assessments = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const limit = 20;

  const { data: categoriesData } = useQuery({
    queryKey: ['assessment-categories-list'],
    queryFn: async () => {
      const response = await assessments.getCategories({ limit: 100 });
      return response.data.data.categories;
    },
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['assessments-tests', page, categoryFilter],
    queryFn: async () => {
      const params = { page, limit };
      if (categoryFilter) params.categoryId = categoryFilter; // Changed from category to categoryId
      const response = await assessments.getAllTests(params);
      return response.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: assessments.createTest,
    onSuccess: () => {
      toast.success('تم إنشاء الاختبار بنجاح');
      setShowModal(false);
      setEditingItem(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل الإنشاء');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => assessments.updateTest(id, data),
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
    mutationFn: assessments.deleteTest,
    onSuccess: () => {
      toast.success('تم الحذف بنجاح');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل الحذف');
    },
  });

  const testsList = data?.tests || [];
  const pagination = data?.pagination;

  const columns = [
    {
      header: 'العنوان',
      accessor: 'title',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <FileQuestion className="text-primary-600" size={24} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{row.title}</p>
            <p className="text-xs text-gray-500 line-clamp-1">
              {row.description || 'لا يوجد وصف'}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'الفئة',
      accessor: 'categoryId',
      render: (row) => (
        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold flex items-center gap-2 w-fit">
           {row.category?.nameAr || row.category?.name || 'غير محدد'}
        </span>
      )
    },
    {
      header: 'نوع الاختبار',
      accessor: 'testType',
      render: (row) => (
        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {row.testType === 'SOUND_DISCRIMINATION' ? 'تمييز الأصوات' :
           row.testType === 'PRONUNCIATION_REPETITION' ? 'النطق والتكرار' :
           row.testType === 'SOUND_IMAGE_LINKING' ? 'ربط الصوت بالصورة' :
           row.testType === 'SEQUENCE_ORDER' ? 'التسلسل والترتيب' : row.testType}
        </span>
      )
    },
    {
      header: 'عدد الأسئلة',
      accessor: 'questionsCount',
      render: (row) => (
        <div className="text-center">
          <span className="text-lg font-bold text-gray-900">
            {row._count?.questions || 0}
          </span>
          <p className="text-xs text-gray-500">سؤال</p>
        </div>
      )
    },
    {
      header: 'تاريخ الإنشاء',
      accessor: 'createdAt',
      render: (row) => (
        <p className="text-sm text-gray-600">
          {new Date(row.createdAt).toLocaleDateString('ar-SA')}
        </p>
      )
    },
    {
      header: 'الإجراءات',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/assessments/${row.id}/questions`)}
            className="px-3 py-1.5 text-sm bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors font-semibold"
          >
            إدارة الأسئلة
          </button>
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
              if (window.confirm('هل أنت متأكد من حذف هذا الاختبار؟ سيتم حذف جميع الأسئلة المرتبطة به.')) {
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
      title: formData.get('title'),
      categoryId: formData.get('categoryId'),
      testType: formData.get('testType'),
      description: formData.get('description') || undefined,
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
          <h2 className="text-2xl font-bold text-gray-900">إدارة الاختبارات</h2>
          <p className="text-sm text-gray-500 mt-1">إدارة الاختبارات الصوتية والبصرية للأطفال</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة اختبار جديد
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-gray-700">تصفية حسب الفئة:</label>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="input w-auto"
          >
            <option value="">كل الفئات</option>
            {categoriesData?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nameAr}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card">
        <DataTable
          data={testsList}
          columns={columns}
          isLoading={isLoading}
          searchable={true}
          searchPlaceholder="بحث في الاختبارات..."
          pagination={pagination}
          onPageChange={setPage}
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'تعديل الاختبار' : 'إضافة اختبار جديد'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">عنوان الاختبار *</label>
            <input
              name="title"
              type="text"
              defaultValue={editingItem?.title}
              className="input"
              placeholder="مثال: اختبار التمييز السمعي"
              required
            />
          </div>

          <div>
            <label className="label">الفئة *</label>
            <select
              name="categoryId"
              defaultValue={editingItem?.categoryId}
              className="input"
              required
            >
              <option value="">اختر الفئة</option>
              {categoriesData?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameAr}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="label">نوع الاختبار الفرعي *</label>
            <select
              name="testType"
              defaultValue={editingItem?.testType || 'SOUND_DISCRIMINATION'}
              className="input"
              required
            >
              <option value="SOUND_DISCRIMINATION">تمييز الأصوات</option>
              <option value="PRONUNCIATION_REPETITION">النطق والتكرار</option>
              <option value="SOUND_IMAGE_LINKING">ربط الصوت بالصورة</option>
              <option value="SEQUENCE_ORDER">التسلسل والترتيب</option>
            </select>
          </div>

          <div>
            <label className="label">الوصف</label>
            <textarea
              name="description"
              defaultValue={editingItem?.description}
              className="input min-h-[100px]"
              placeholder="وصف مختصر للاختبار..."
            />
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

export default Assessments;
