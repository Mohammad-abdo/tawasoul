import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Hash, Plus, Edit, Trash2, TrendingUp, Eye, FileText, Calendar, User, MessageSquare, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { tags } from '../../api/admin';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const Tags = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-tags', page],
    queryFn: async () => {
      const response = await tags.getAll({ page, limit });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: tags.create,
    onSuccess: () => {
      toast.success('تم إضافة التاج بنجاح');
      setShowModal(false);
      setEditingTag(null);
      refetch();
    },
    onError: () => {
      toast.error('فشل إضافة التاج');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => tags.update(id, data),
    onSuccess: () => {
      toast.success('تم تحديث التاج بنجاح');
      setShowModal(false);
      setEditingTag(null);
      refetch();
    },
    onError: () => {
      toast.error('فشل تحديث التاج');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tags.delete,
    onSuccess: () => {
      toast.success('تم حذف التاج');
      refetch();
    },
    onError: () => {
      toast.error('فشل حذف التاج');
    },
  });

  const tagsList = data?.data?.tags || [];

  const columns = [
    {
      header: 'اسم التاج',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 border border-primary-200 flex items-center justify-center">
            <Hash className="text-primary-600" size={24} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{row.name}</p>
            <p className="text-xs text-gray-500">ID: {row.id.substring(0, 8)}...</p>
          </div>
        </div>
      )
    },
    {
      header: 'عدد الاستخدامات',
      accessor: 'usageCount',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
            <TrendingUp className="text-primary-600" size={18} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{row.usageCount || 0}</p>
            <p className="text-xs text-gray-500">منشور</p>
          </div>
        </div>
      )
    },
    {
      header: 'تاريخ الإنشاء',
      accessor: 'createdAt',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {new Date(row.createdAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(row.createdAt).toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'الشعبية',
      accessor: 'popularity',
      render: (row) => {
        const count = row.usageCount || 0;
        const popularity = count > 50 ? 'عالية' : count > 20 ? 'متوسطة' : count > 0 ? 'منخفضة' : 'غير مستخدم';
        const color = count > 50 ? 'bg-green-100 text-green-700 border-green-200' : 
                     count > 20 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                     count > 0 ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                     'bg-gray-100 text-gray-700 border-gray-200';
        return (
          <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${color}`}>
            {popularity}
          </span>
        );
      }
    },
  ];

  const actions = [
    {
      label: 'عرض التفاصيل',
      icon: Eye,
      onClick: (row) => {
        navigate(`/tags/${row.id}`);
      },
      className: 'text-primary-600 hover:bg-primary-50',
      show: () => true,
    },
    {
      label: 'تعديل',
      icon: Edit,
      onClick: (row) => {
        setEditingTag(row);
        setShowModal(true);
      },
      className: 'text-blue-600 hover:bg-blue-50',
      show: () => true,
    },
    {
      label: 'حذف',
      icon: Trash2,
      onClick: (row) => {
        if (window.confirm(`هل أنت متأكد من حذف التاج "${row.name}"؟`)) {
          deleteMutation.mutate(row.id);
        }
      },
      className: 'text-red-600 hover:bg-red-50',
      show: () => true,
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
    };

    if (editingTag) {
      updateMutation.mutate({ id: editingTag.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">التاجات</h2>
          <p className="text-sm text-gray-500 mt-1">إدارة جميع التاجات المستخدمة في المنشورات</p>
        </div>
        <button
          onClick={() => {
            setEditingTag(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة تاج جديد
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
              <Hash className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{tagsList.length}</p>
              <p className="text-xs text-gray-500">إجمالي التاجات</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {tagsList.filter(t => (t.usageCount || 0) > 50).length}
              </p>
              <p className="text-xs text-gray-500">تاجات شائعة</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {tagsList.reduce((sum, tag) => sum + (tag.usageCount || 0), 0)}
              </p>
              <p className="text-xs text-gray-500">إجمالي الاستخدامات</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-center">
              <Hash className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {tagsList.filter(t => (t.usageCount || 0) === 0).length}
              </p>
              <p className="text-xs text-gray-500">تاجات غير مستخدمة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={tagsList}
        columns={columns}
        isLoading={isLoading}
        searchable={true}
        filterable={true}
        exportable={true}
        pagination={true}
        pageSize={limit}
        emptyMessage="لا توجد تاجات"
        title="قائمة التاجات"
        actions={actions}
        filters={[
          {
            key: 'usageCount',
            label: 'عدد الاستخدامات',
            type: 'numberRange'
          },
          {
            key: 'createdAt',
            label: 'تاريخ الإنشاء',
            type: 'dateRange'
          }
        ]}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTag(null);
        }}
        title={editingTag ? 'تعديل تاج' : 'إضافة تاج جديد'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">اسم التاج</label>
            <input
              name="name"
              type="text"
              defaultValue={editingTag?.name}
              className="input"
              placeholder="مثال: #صحة_نفسية"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              سيتم إضافة علامة # تلقائياً عند الحفظ
            </p>
          </div>
          <div className="flex gap-2 pt-4">
            <button 
              type="submit" 
              className="btn-primary flex-1"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingTag ? 'تحديث' : 'إضافة'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingTag(null);
              }}
              className="btn-secondary"
            >
              إلغاء
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tags;
