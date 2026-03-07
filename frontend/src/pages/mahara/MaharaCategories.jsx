import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { mahara } from '../../api/admin';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const MaharaCategories = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['mahara-categories', page],
    queryFn: async () => {
      const response = await mahara.getCategories({ page, limit });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: mahara.createCategory,
    onSuccess: () => {
      toast.success('تم إنشاء الفئة بنجاح');
      setShowModal(false);
      refetch();
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'فشل الإنشاء'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => mahara.updateCategory(id, data),
    onSuccess: () => {
      toast.success('تم التحديث بنجاح');
      setShowModal(false);
      refetch();
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'فشل التحديث'),
  });

  const deleteMutation = useMutation({
    mutationFn: mahara.deleteCategory,
    onSuccess: () => {
      toast.success('تم الحذف بنجاح');
      refetch();
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'فشل الحذف'),
  });

  const categories = data?.data || [];

  const columns = [
    {
      header: 'اسم الفئة',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
            <Layers size={20} />
          </div>
          <span className="font-semibold text-gray-900">{row.name}</span>
        </div>
      )
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
              if (window.confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
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
    const payload = { name: formData.get('name') };

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
          <h2 className="text-2xl font-bold text-gray-900">فئات مهارة</h2>
          <p className="text-sm text-gray-500 mt-1">إدارة فئات الأنشطة التعليمية</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة فئة جديدة
        </button>
      </div>

      <div className="glass-card">
        <DataTable
          data={categories}
          columns={columns}
          isLoading={isLoading}
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">اسم الفئة *</label>
            <input
              name="name"
              type="text"
              defaultValue={editingItem?.name}
              className="input"
              required
            />
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

export default MaharaCategories;
