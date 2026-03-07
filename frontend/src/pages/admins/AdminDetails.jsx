import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { admins } from '../../api/admin';
import { 
  ArrowRight, 
  Shield,
  Calendar,
  AlertCircle,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Key,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import Modal from '../../components/common/Modal';
import { useState } from 'react';

const AdminDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin: currentAdmin } = useAuthStore();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: adminData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-details', id],
    queryFn: async () => {
      const response = await admins.getById(id);
      return response.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => admins.update(id, data),
    onSuccess: () => {
      toast.success('تم تحديث الأدمن بنجاح');
      setShowEditModal(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل تحديث الأدمن');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ id, data }) => admins.changePassword(id, data),
    onSuccess: () => {
      toast.success('تم تغيير كلمة المرور بنجاح');
      setShowPasswordModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل تغيير كلمة المرور');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => admins.delete(id),
    onSuccess: () => {
      toast.success('تم حذف الأدمن');
      navigate('/admins');
    },
    onError: () => {
      toast.error('فشل حذف الأدمن');
    },
  });

  const activateMutation = useMutation({
    mutationFn: () => admins.activate(id),
    onSuccess: () => {
      toast.success('تم تفعيل الأدمن');
      refetch();
    },
    onError: () => {
      toast.error('فشل التفعيل');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () => admins.deactivate(id),
    onSuccess: () => {
      toast.success('تم تعطيل الأدمن');
      refetch();
    },
    onError: () => {
      toast.error('فشل التعطيل');
    },
  });

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

  if (error || !adminData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">الأدمن غير موجود</h3>
          <p className="text-gray-600 mb-4">لم يتم العثور على بيانات الأدمن</p>
          <button
            onClick={() => navigate('/admins')}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <ArrowRight size={18} />
            العودة إلى قائمة الأدمن
          </button>
        </div>
      </div>
    );
  }

  const getRoleBadge = (role) => {
    const badges = {
      SUPER_ADMIN: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', label: 'مدير عام' },
      ADMIN: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'أدمن' },
      MODERATOR: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: 'مشرف' },
      SUPPORT: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', label: 'دعم' },
    };
    const badge = badges[role] || badges.ADMIN;
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${badge.bg} ${badge.text} ${badge.border}`}>
        {badge.label}
      </span>
    );
  };

  const handleEdit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
    };
    updateMutation.mutate({ id, data });
  };

  const handlePasswordChange = (e) => {
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

    changePasswordMutation.mutate({ id, data: { newPassword: data.newPassword } });
  };

  const isCurrentUser = adminData.id === currentAdmin?.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admins')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowRight size={20} />
          <span>العودة</span>
        </button>
        <div className="flex items-center gap-3">
          {!isCurrentUser && (
            <>
              {adminData.isActive ? (
                <button
                  onClick={() => deactivateMutation.mutate()}
                  disabled={deactivateMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  <UserX size={18} />
                  تعطيل
                </button>
              ) : (
                <button
                  onClick={() => activateMutation.mutate()}
                  disabled={activateMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <UserCheck size={18} />
                  تفعيل
                </button>
              )}
            </>
          )}
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Edit size={18} />
            تعديل
          </button>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors"
          >
            <Key size={18} />
            تغيير كلمة المرور
          </button>
          {!isCurrentUser && (
            <button
              onClick={() => {
                if (window.confirm('هل أنت متأكد من حذف هذا الأدمن؟')) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Trash2 size={18} />
              حذف
            </button>
          )}
        </div>
      </div>

      {/* Admin Header Card */}
      <div className="glass-card rounded-2xl p-8 bg-white border border-primary-200">
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-2xl">
            <span className="text-white text-5xl font-bold">
              {adminData.name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl font-bold text-gray-900">{adminData.name}</h1>
              {getRoleBadge(adminData.role)}
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${
                adminData.isActive 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}>
                {adminData.isActive ? 'نشط' : 'معطل'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Mail size={20} />
              <span className="text-lg">{adminData.email}</span>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={20} />
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(adminData.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-gray-500">تاريخ الإنشاء</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center mx-auto mb-3">
            <Shield className="text-primary-600" size={28} />
          </div>
          <div className="mb-1">
            {getRoleBadge(adminData.role)}
          </div>
          <p className="text-sm text-gray-500">الدور</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center mx-auto mb-3 ${
            adminData.isActive 
              ? 'bg-green-50 border-green-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            {adminData.isActive ? (
              <CheckCircle className="text-green-600" size={28} />
            ) : (
              <XCircle className="text-gray-600" size={28} />
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {adminData.isActive ? 'نشط' : 'معطل'}
          </p>
          <p className="text-sm text-gray-500">الحالة</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-3">
            <Calendar className="text-blue-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {new Date(adminData.createdAt).toLocaleDateString('ar-EG', {
              day: 'numeric',
              month: 'short'
            })}
          </p>
          <p className="text-sm text-gray-500">تاريخ الإنشاء</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center mx-auto mb-3">
            <FileText className="text-purple-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1 font-mono text-xs">
            {adminData.id.substring(0, 8)}...
          </p>
          <p className="text-sm text-gray-500">معرف الأدمن</p>
        </div>
      </div>

      {/* Admin Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="text-primary-600" size={20} />
            معلومات الأدمن
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">الاسم</span>
              <span className="text-sm font-semibold text-gray-900">{adminData.name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">البريد الإلكتروني</span>
              <span className="text-sm font-semibold text-gray-900">{adminData.email}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">الدور</span>
              {getRoleBadge(adminData.role)}
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">الحالة</span>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                adminData.isActive 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}>
                {adminData.isActive ? 'نشط' : 'معطل'}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="text-primary-600" size={20} />
            معلومات التاريخ
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">معرف الأدمن</span>
              <span className="text-sm font-semibold text-gray-900 font-mono text-xs">{adminData.id}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">تاريخ الإنشاء</span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(adminData.createdAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">آخر تحديث</span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(adminData.updatedAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="تعديل الأدمن"
        size="md"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="label">الاسم *</label>
            <input
              type="text"
              name="name"
              defaultValue={adminData.name}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">البريد الإلكتروني *</label>
            <input
              type="email"
              name="email"
              defaultValue={adminData.email}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">الدور *</label>
            <select
              name="role"
              defaultValue={adminData.role}
              className="input"
              required
            >
              <option value="ADMIN">أدمن</option>
              <option value="MODERATOR">مشرف</option>
              <option value="SUPPORT">دعم</option>
              {currentAdmin?.role === 'SUPER_ADMIN' && (
                <option value="SUPER_ADMIN">مدير عام</option>
              )}
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="btn-primary flex-1"
            >
              {updateMutation.isPending ? 'جاري التحديث...' : 'تحديث'}
            </button>
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
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
        onClose={() => setShowPasswordModal(false)}
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
              onClick={() => setShowPasswordModal(false)}
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

export default AdminDetails;

