import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, X, UserCheck, UserX, Mail, Calendar, Edit, Eye, Trash2, Users as UsersIcon, TrendingUp, FileText, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { users } from '../../api/admin';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const Users = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const limit = 20;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', page],
    queryFn: async () => {
      const response = await users.getAll({ page, limit });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: users.create,
    onSuccess: () => {
      toast.success('تم إضافة المستخدم بنجاح');
      setShowModal(false);
      setEditingUser(null);
      refetch();
    },
    onError: () => {
      toast.error('فشل إضافة المستخدم');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => users.update(id, data),
    onSuccess: () => {
      toast.success('تم تحديث المستخدم بنجاح');
      setShowModal(false);
      setEditingUser(null);
      refetch();
    },
    onError: () => {
      toast.error('فشل تحديث المستخدم');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: users.delete,
    onSuccess: () => {
      toast.success('تم حذف المستخدم بنجاح');
      refetch();
    },
    onError: () => {
      toast.error('فشل حذف المستخدم');
    },
  });

  const approveMutation = useMutation({
    mutationFn: users.approve,
    onSuccess: () => {
      toast.success('تم الموافقة على المستخدم');
      refetch();
    },
    onError: () => {
      toast.error('فشل الموافقة');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => users.reject(id, 'رفض من الأدمن'),
    onSuccess: () => {
      toast.success('تم رفض المستخدم');
      refetch();
    },
    onError: () => {
      toast.error('فشل الرفض');
    },
  });

  const activateMutation = useMutation({
    mutationFn: users.activate,
    onSuccess: () => {
      toast.success('تم تفعيل المستخدم');
      refetch();
    },
    onError: () => {
      toast.error('فشل التفعيل');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: users.deactivate,
    onSuccess: () => {
      toast.success('تم تعطيل المستخدم');
      refetch();
    },
    onError: () => {
      toast.error('فشل التعطيل');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password') || undefined,
      isActive: formData.get('isActive') === 'on',
      isApproved: formData.get('isApproved') === 'on',
    };

    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data });
    } else {
      if (!data.password) {
        toast.error('كلمة المرور مطلوبة للمستخدمين الجدد');
        return;
      }
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <div className="text-gray-700 font-medium">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <p className="text-red-600 mb-4">خطأ في تحميل البيانات</p>
          <p className="text-gray-500 text-sm mb-4">{error.message}</p>
          <button onClick={() => refetch()} className="btn-primary">
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const usersList = data?.data?.users || [];
  const total = data?.data?.pagination?.total || usersList.length;
  const activeCount = usersList.filter(u => u.isActive && u.isApproved).length;
  const pendingCount = usersList.filter(u => !u.isApproved).length;
  const inactiveCount = usersList.filter(u => !u.isActive && u.isApproved).length;

  const columns = [
    {
      header: 'المستخدم',
      accessor: 'username',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
            <span className="text-white text-lg font-bold">
              {row.username?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{row.username}</p>
            <p className="text-xs text-gray-500">ID: {row.id.substring(0, 8)}...</p>
          </div>
        </div>
      )
    },
    {
      header: 'البريد الإلكتروني',
      accessor: 'email',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
            <Mail className="text-primary-600" size={18} />
          </div>
          <span className="text-sm font-medium text-gray-900">{row.email || '-'}</span>
        </div>
      )
    },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (row) => {
        let status, color;
        if (row.isActive && row.isApproved) {
          status = 'نشط';
          color = 'bg-green-100 text-green-700 border-green-200';
        } else if (row.isApproved && !row.isActive) {
          status = 'معطل';
          color = 'bg-yellow-100 text-yellow-700 border-yellow-200';
        } else {
          status = 'بانتظار الموافقة';
          color = 'bg-red-100 text-red-700 border-red-200';
        }
        return (
          <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${color}`}>
            {status}
          </span>
        );
      }
    },
    {
      header: 'تاريخ التسجيل',
      accessor: 'createdAt',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {row.createdAt ? new Date(row.createdAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : '-'}
            </p>
            <p className="text-xs text-gray-500">
              {row.createdAt ? new Date(row.createdAt).toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit'
              }) : ''}
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
        navigate(`/users/${row.id}`);
      },
      className: 'text-primary-600 hover:bg-primary-50',
      show: () => true,
    },
    {
      label: 'تعديل',
      icon: Edit,
      onClick: (row) => {
        setEditingUser(row);
        setShowModal(true);
      },
      className: 'text-blue-600 hover:bg-blue-50',
      show: () => true,
    },
    {
      label: 'موافقة',
      icon: Check,
      onClick: (row) => approveMutation.mutate(row.id),
      className: 'text-green-600 hover:bg-green-50',
      show: (row) => !row.isApproved,
    },
    {
      label: 'رفض',
      icon: X,
      onClick: (row) => {
        if (window.confirm('هل أنت متأكد من رفض هذا المستخدم؟')) {
          rejectMutation.mutate(row.id);
        }
      },
      className: 'text-red-600 hover:bg-red-50',
      show: (row) => !row.isApproved,
    },
    {
      label: (row) => row.isActive ? 'تعطيل' : 'تفعيل',
      icon: (row) => row.isActive ? UserX : UserCheck,
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
      show: (row) => row.isApproved,
    },
    {
      label: 'حذف',
      icon: Trash2,
      onClick: (row) => {
        if (window.confirm(`هل أنت متأكد من حذف المستخدم "${row.username}"؟`)) {
          deleteMutation.mutate(row.id);
        }
      },
      className: 'text-red-600 hover:bg-red-50',
      show: () => true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">المستخدمين</h2>
          <p className="text-sm text-gray-500 mt-1">إدارة جميع المستخدمين في النظام</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة مستخدم
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
              <UsersIcon className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-xs text-gray-500">إجمالي المستخدمين</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
              <UserCheck className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
              <p className="text-xs text-gray-500">مستخدمين نشطين</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-center">
              <AlertCircle className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-xs text-gray-500">بانتظار الموافقة</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
              <UserX className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inactiveCount}</p>
              <p className="text-xs text-gray-500">مستخدمين معطلين</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={usersList}
        columns={columns}
        isLoading={isLoading}
        searchable={true}
        filterable={true}
        exportable={true}
        pagination={true}
        pageSize={limit}
        emptyMessage="لا يوجد مستخدمين"
        title="قائمة المستخدمين"
        actions={actions}
        filters={[
          {
            key: 'isApproved',
            label: 'الموافقة',
            type: 'boolean'
          },
          {
            key: 'isActive',
            label: 'النشاط',
            type: 'boolean'
          },
          {
            key: 'createdAt',
            label: 'تاريخ التسجيل',
            type: 'dateRange'
          }
        ]}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">الاسم المستعار *</label>
            <input
              name="username"
              type="text"
              defaultValue={editingUser?.username}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">البريد الإلكتروني *</label>
            <input
              name="email"
              type="email"
              defaultValue={editingUser?.email}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">
              كلمة المرور {editingUser && '(اتركه فارغاً للحفاظ على الكلمة الحالية)'} *
            </label>
            <input
              name="password"
              type="password"
              className="input"
              required={!editingUser}
              minLength={6}
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                name="isActive"
                type="checkbox"
                defaultChecked={editingUser?.isActive ?? true}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">نشط</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                name="isApproved"
                type="checkbox"
                defaultChecked={editingUser?.isApproved ?? true}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">موافق عليه</span>
            </label>
          </div>
          <div className="flex gap-2 pt-4">
            <button 
              type="submit" 
              className="btn-primary flex-1"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingUser ? 'تحديث' : 'إضافة'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingUser(null);
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

export default Users;
