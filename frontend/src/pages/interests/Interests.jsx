import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Tag, Plus, Edit, Trash2, Eye, Users, FileText, Calendar, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { interests } from '../../api/admin';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const Interests = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingInterest, setEditingInterest] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-interests', page],
    queryFn: async () => {
      const response = await interests.getAll({ page, limit });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: interests.create,
    onSuccess: () => {
      toast.success('تم إضافة الاهتمام بنجاح');
      setShowModal(false);
      setEditingInterest(null);
      refetch();
    },
    onError: () => {
      toast.error('فشل إضافة الاهتمام');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => interests.update(id, data),
    onSuccess: () => {
      toast.success('تم تحديث الاهتمام بنجاح');
      setShowModal(false);
      setEditingInterest(null);
      refetch();
    },
    onError: () => {
      toast.error('فشل تحديث الاهتمام');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: interests.delete,
    onSuccess: () => {
      toast.success('تم حذف الاهتمام');
      refetch();
    },
    onError: () => {
      toast.error('فشل حذف الاهتمام');
    },
  });

  const activateMutation = useMutation({
    mutationFn: interests.activate,
    onSuccess: () => {
      toast.success('تم تفعيل الاهتمام');
      refetch();
    },
    onError: () => {
      toast.error('فشل تفعيل الاهتمام');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: interests.deactivate,
    onSuccess: () => {
      toast.success('تم إلغاء تفعيل الاهتمام');
      refetch();
    },
    onError: () => {
      toast.error('فشل إلغاء تفعيل الاهتمام');
    },
  });

  const interestsList = data?.data?.interests || [];

  const columns = [
    {
      header: 'الاسم',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 border border-primary-200 flex items-center justify-center">
            {row.icon ? (
              <span className="text-2xl">{row.icon}</span>
            ) : (
              <Tag className="text-primary-600" size={24} />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{row.nameAr}</p>
            <p className="text-xs text-gray-500">{row.name}</p>
          </div>
        </div>
      )
    },
    {
      header: 'الوصف',
      accessor: 'description',
      render: (row) => (
        <p className="text-sm text-gray-600 line-clamp-2 max-w-md">
          {row.description || 'لا يوجد وصف'}
        </p>
      )
    },
    {
      header: 'عدد المستخدمين',
      accessor: 'usersCount',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
            <Users className="text-primary-600" size={18} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{row._count?.users || 0}</p>
            <p className="text-xs text-gray-500">مستخدم</p>
          </div>
        </div>
      )
    },
    {
      header: 'عدد المنشورات',
      accessor: 'postsCount',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
            <FileText className="text-blue-600" size={18} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{row._count?.posts || 0}</p>
            <p className="text-xs text-gray-500">منشور</p>
          </div>
        </div>
      )
    },
    {
      header: 'الحالة',
      accessor: 'isActive',
      render: (row) => (
        <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${
          row.isActive 
            ? 'bg-green-100 text-green-700 border-green-200' 
            : 'bg-gray-100 text-gray-700 border-gray-200'
        }`}>
          {row.isActive ? 'نشط' : 'معطل'}
        </span>
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
  ];

  const actions = [
    {
      label: 'عرض التفاصيل',
      icon: Eye,
      onClick: (row) => {
        navigate(`/interests/${row.id}`);
      },
      className: 'text-primary-600 hover:bg-primary-50',
      show: () => true,
    },
    {
      label: 'تعديل',
      icon: Edit,
      onClick: (row) => {
        setEditingInterest(row);
        setShowModal(true);
      },
      className: 'text-blue-600 hover:bg-blue-50',
      show: () => true,
    },
    {
      label: (row) => row.isActive ? 'إلغاء التفعيل' : 'تفعيل',
      icon: (row) => row.isActive ? XCircle : CheckCircle,
      onClick: (row) => {
        if (row.isActive) {
          deactivateMutation.mutate(row.id);
        } else {
          activateMutation.mutate(row.id);
        }
      },
      className: (row) => row.isActive 
        ? 'text-orange-600 hover:bg-orange-50' 
        : 'text-green-600 hover:bg-green-50',
      show: () => true,
    },
    {
      label: 'حذف',
      icon: Trash2,
      onClick: (row) => {
        if (window.confirm(`هل أنت متأكد من حذف الاهتمام "${row.nameAr}"؟`)) {
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
      nameAr: formData.get('nameAr'),
      description: formData.get('description') || undefined,
      icon: formData.get('icon') || undefined,
      isActive: formData.get('isActive') === 'on',
    };

    if (editingInterest) {
      updateMutation.mutate({ id: editingInterest.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الاهتمامات</h2>
          <p className="text-sm text-gray-500 mt-1">إدارة جميع الاهتمامات المتاحة للمستخدمين</p>
        </div>
        <button
          onClick={() => {
            setEditingInterest(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة اهتمام جديد
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
              <Tag className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{interestsList.length}</p>
              <p className="text-xs text-gray-500">إجمالي الاهتمامات</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {interestsList.filter(i => i.isActive).length}
              </p>
              <p className="text-xs text-gray-500">اهتمامات نشطة</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {interestsList.reduce((sum, interest) => sum + (interest._count?.users || 0), 0)}
              </p>
              <p className="text-xs text-gray-500">إجمالي المستخدمين</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center">
              <FileText className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {interestsList.reduce((sum, interest) => sum + (interest._count?.posts || 0), 0)}
              </p>
              <p className="text-xs text-gray-500">إجمالي المنشورات</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={interestsList}
        columns={columns}
        isLoading={isLoading}
        searchable={true}
        filterable={true}
        exportable={true}
        pagination={true}
        pageSize={limit}
        emptyMessage="لا توجد اهتمامات"
        title="قائمة الاهتمامات"
        actions={actions}
        filters={[
          {
            key: 'isActive',
            label: 'الحالة',
            type: 'boolean'
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
          setEditingInterest(null);
        }}
        title={editingInterest ? 'تعديل اهتمام' : 'إضافة اهتمام جديد'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">الاسم (عربي) *</label>
            <input
              name="nameAr"
              type="text"
              defaultValue={editingInterest?.nameAr}
              className="input"
              placeholder="مثال: الصحة النفسية"
              required
            />
          </div>
          <div>
            <label className="label">الاسم (إنجليزي) *</label>
            <input
              name="name"
              type="text"
              defaultValue={editingInterest?.name}
              className="input"
              placeholder="مثال: Mental Health"
              required
            />
          </div>
          <div>
            <label className="label">الوصف</label>
            <textarea
              name="description"
              defaultValue={editingInterest?.description}
              className="input min-h-[100px]"
              placeholder="وصف الاهتمام..."
            />
          </div>
          <div>
            <label className="label">الأيقونة (Emoji)</label>
            <input
              name="icon"
              type="text"
              defaultValue={editingInterest?.icon}
              className="input"
              placeholder="مثال: 🧠"
            />
            <p className="text-xs text-gray-500 mt-1">
              يمكنك استخدام أي emoji كأيقونة للاهتمام
            </p>
          </div>
          {editingInterest && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                defaultChecked={editingInterest.isActive}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                نشط
              </label>
            </div>
          )}
          <div className="flex gap-2 pt-4">
            <button 
              type="submit" 
              className="btn-primary flex-1"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingInterest ? 'تحديث' : 'إضافة'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingInterest(null);
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

export default Interests;
