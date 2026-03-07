import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Shield, UserCheck, UserX, Mail, Calendar, Edit, Trash2, Key, AlertCircle, Eye, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { admins } from '../../api/admin';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { useAuthStore } from '../../store/authStore';

const Admins = () => {
  const navigate = useNavigate();
  const { admin } = useAuthStore();
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const limit = 20;

  // Check if user is SUPER_ADMIN
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admins', page],
    queryFn: async () => {
      const response = await admins.getAll({ page, limit });
      return response.data;
    },
    enabled: isSuperAdmin, // Only fetch if SUPER_ADMIN
  });

  const createMutation = useMutation({
    mutationFn: admins.create,
    onSuccess: () => {
      toast.success('تم إضافة الأدمن بنجاح');
      setShowModal(false);
      setEditingAdmin(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل إضافة الأدمن');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => admins.update(id, data),
    onSuccess: () => {
      toast.success('تم تحديث الأدمن بنجاح');
      setShowModal(false);
      setEditingAdmin(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل تحديث الأدمن');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: admins.delete,
    onSuccess: () => {
      toast.success('تم حذف الأدمن بنجاح');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل حذف الأدمن');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ id, data }) => admins.changePassword(id, data),
    onSuccess: () => {
      toast.success('تم تغيير كلمة المرور بنجاح');
      setShowPasswordModal(false);
      setEditingAdmin(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل تغيير كلمة المرور');
    },
  });

  const activateMutation = useMutation({
    mutationFn: admins.activate,
    onSuccess: () => {
      toast.success('تم تفعيل الأدمن');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل التفعيل');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: admins.deactivate,
    onSuccess: () => {
      toast.success('تم تعطيل الأدمن');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل التعطيل');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      password: formData.get('password') || undefined,
    };

    if (editingAdmin) {
      updateMutation.mutate({ id: editingAdmin.id, data });
    } else {
      if (!data.password) {
        toast.error('كلمة المرور مطلوبة للأدمن الجديد');
        return;
      }
      createMutation.mutate(data);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      newPassword: formData.get('newPassword'),
      confirmPassword: formData.get('confirmPassword'),
    };

    if (data.newPassword !== data.confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }

    if (data.newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    changePasswordMutation.mutate({ id: editingAdmin.id, data: { newPassword: data.newPassword } });
  };

  const handleDelete = (adminToDelete) => {
    if (adminToDelete.id === admin?.id) {
      toast.error('لا يمكنك حذف حسابك الخاص');
      return;
    }
    if (window.confirm('هل أنت متأكد من حذف هذا الأدمن؟')) {
      deleteMutation.mutate(adminToDelete.id);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">غير مصرح</h3>
          <p className="text-gray-600">يجب أن تكون SUPER_ADMIN للوصول إلى هذه الصفحة</p>
        </div>
      </div>
    );
  }

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

  const adminsList = data?.data?.admins || [];
  const total = data?.data?.pagination?.total || adminsList.length;
  const activeCount = adminsList.filter(a => a.isActive).length;
  const inactiveCount = adminsList.filter(a => !a.isActive).length;
  const superAdminCount = adminsList.filter(a => a.role === 'SUPER_ADMIN').length;

  const getRoleBadge = (role) => {
    const badges = {
      SUPER_ADMIN: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', label: 'مدير عام' },
      ADMIN: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'أدمن' },
      MODERATOR: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: 'مشرف' },
      SUPPORT: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', label: 'دعم' },
    };
    const badge = badges[role] || badges.ADMIN;
    return (
      <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
        {badge.label}
      </span>
    );
  };

  const columns = [
    {
      header: 'الاسم',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
            <span className="text-white text-lg font-bold">
              {row.name?.charAt(0) || 'A'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{row.name}</p>
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
          <span className="text-sm font-medium text-gray-900">{row.email}</span>
        </div>
      )
    },
    {
      header: 'الدور',
      accessor: 'role',
      render: (row) => getRoleBadge(row.role)
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
        navigate(`/admins/${row.id}`);
      },
      className: 'text-primary-600 hover:bg-primary-50',
      show: () => true,
    },
    {
      label: 'تعديل',
      icon: Edit,
      onClick: (row) => {
        setEditingAdmin(row);
        setShowModal(true);
      },
      className: 'text-blue-600 hover:bg-blue-50',
      show: () => true,
    },
    {
      label: 'تغيير كلمة المرور',
      icon: Key,
      onClick: (row) => {
        setEditingAdmin(row);
        setShowPasswordModal(true);
      },
      className: 'text-yellow-600 hover:bg-yellow-50',
      show: () => true,
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
      show: () => true,
    },
    {
      label: 'حذف',
      icon: Trash2,
      onClick: (row) => handleDelete(row),
      className: 'text-red-600 hover:bg-red-50',
      show: () => true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة الأدمن</h2>
          <p className="text-sm text-gray-500 mt-1">إدارة حسابات الأدمن في النظام</p>
        </div>
        <button
          onClick={() => {
            setEditingAdmin(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة أدمن
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
              <Shield className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-xs text-gray-500">إجمالي الأدمن</p>
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
              <p className="text-xs text-gray-500">أدمن نشط</p>
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
              <p className="text-xs text-gray-500">أدمن معطل</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center">
              <Shield className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{superAdminCount}</p>
              <p className="text-xs text-gray-500">مدير عام</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={adminsList}
        columns={columns}
        isLoading={isLoading}
        searchable={true}
        filterable={true}
        exportable={true}
        pagination={true}
        pageSize={limit}
        emptyMessage="لا يوجد أدمن"
        title="قائمة الأدمن"
        actions={actions}
        filters={[
          {
            key: 'role',
            label: 'الدور',
            type: 'select',
            options: [
              { value: 'SUPER_ADMIN', label: 'مدير عام' },
              { value: 'ADMIN', label: 'أدمن' },
              { value: 'MODERATOR', label: 'مشرف' },
              { value: 'SUPPORT', label: 'دعم' }
            ]
          },
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
          setEditingAdmin(null);
        }}
        title={editingAdmin ? 'تعديل الأدمن' : 'إضافة أدمن جديد'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">الاسم *</label>
            <input
              type="text"
              name="name"
              defaultValue={editingAdmin?.name || ''}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">البريد الإلكتروني *</label>
            <input
              type="email"
              name="email"
              defaultValue={editingAdmin?.email || ''}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">الدور *</label>
            <select
              name="role"
              defaultValue={editingAdmin?.role || 'ADMIN'}
              className="input"
              required
            >
              <option value="ADMIN">أدمن</option>
              <option value="MODERATOR">مشرف</option>
              <option value="SUPPORT">دعم</option>
              {admin?.role === 'SUPER_ADMIN' && (
                <option value="SUPER_ADMIN">مدير عام</option>
              )}
            </select>
          </div>

          {!editingAdmin && (
            <div>
              <label className="label">كلمة المرور *</label>
              <input
                type="password"
                name="password"
                className="input"
                required={!editingAdmin}
                minLength={6}
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="btn-primary flex-1"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'جاري الحفظ...'
                : editingAdmin
                ? 'تحديث'
                : 'إضافة'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingAdmin(null);
              }}
              className="btn-secondary"
            >
              إلغاء
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setEditingAdmin(null);
        }}
        title="تغيير كلمة المرور"
        size="md"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="label">كلمة المرور الجديدة *</label>
            <input
              type="password"
              name="newPassword"
              className="input"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="label">تأكيد كلمة المرور *</label>
            <input
              type="password"
              name="confirmPassword"
              className="input"
              required
              minLength={6}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="btn-primary flex-1"
            >
              {changePasswordMutation.isPending ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPasswordModal(false);
                setEditingAdmin(null);
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

export default Admins;
