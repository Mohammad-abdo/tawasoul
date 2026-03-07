import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { mahara } from '../../api/admin';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const MaharaSkillGroups = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const limit = 20;

  const { data: categoriesData } = useQuery({
    queryKey: ['mahara-categories-list'],
    queryFn: async () => {
      const response = await mahara.getCategories({ limit: 100 });
      return response.data.data;
    },
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['mahara-skill-groups', page, categoryFilter],
    queryFn: async () => {
      const params = { page, limit };
      if (categoryFilter) params.categoryId = categoryFilter;
      const response = await mahara.getSkillGroups(params);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: mahara.createSkillGroup,
    onSuccess: () => {
      toast.success('تم إنشاء مجموعة المهارات بنجاح');
      setShowModal(false);
      refetch();
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'فشل الإنشاء'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => mahara.updateSkillGroup(id, data),
    onSuccess: () => {
      toast.success('تم التحديث بنجاح');
      setShowModal(false);
      refetch();
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'فشل التحديث'),
  });

  const deleteMutation = useMutation({
    mutationFn: mahara.deleteSkillGroup,
    onSuccess: () => {
      toast.success('تم الحذف بنجاح');
      refetch();
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'فشل الحذف'),
  });

  const skillGroups = data?.data || [];

  const columns = [
    {
      header: 'اسم المجموعة',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Target size={20} />
          </div>
          <span className="font-semibold text-gray-900">{row.name}</span>
        </div>
      )
    },
    {
      header: 'الفئة',
      accessor: 'category',
      render: (row) => row.category?.name || '-'
    },
    {
      header: 'تاريخ الإنشاء',
      accessor: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString('ar-EG')
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
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => {
              if (window.confirm('هل أنت متأكد من حذف هذه المجموعة؟')) {
                deleteMutation.mutate(row.id);
              }
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
    const payload = {
      name: formData.get('name'),
      categoryId: formData.get('categoryId')
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">مجموعات مهارة</h2>
          <p className="text-sm text-gray-500 mt-1">إدارة مجموعات المهارات تحت الفئات</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة مجموعة جديدة
        </button>
      </div>

      <div className="glass-card p-4 flex gap-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input w-64"
        >
          <option value="">كل الفئات</option>
          {categoriesData?.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="glass-card">
        <DataTable
          data={skillGroups}
          columns={columns}
          isLoading={isLoading}
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'تعديل المجموعة' : 'إضافة مجموعة جديدة'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">اسم المجموعة *</label>
            <input
              name="name"
              type="text"
              defaultValue={editingItem?.name}
              className="input"
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
              {categoriesData?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">إلغاء</button>
            <button type="submit" className="btn-primary flex-1">حفظ</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaharaSkillGroups;
