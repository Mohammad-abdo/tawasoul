import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '../../api/admin';
import { 
  ArrowRight, 
  Bell,
  Calendar,
  AlertCircle,
  Trash2,
  Check,
  User,
  Stethoscope,
  FileText,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notification, isLoading, error, refetch } = useQuery({
    queryKey: ['notification-details', id],
    queryFn: async () => {
      // Since there's no getById endpoint, we'll fetch all and find the one
      const response = await notifications.getAll({ page: 1, limit: 1000 });
      const found = response.data.data.notifications.find(n => n.id === id);
      if (!found) {
        throw new Error('Notification not found');
      }
      return found;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: () => notifications.markAsRead(id),
    onSuccess: () => {
      toast.success('تم تحديد الإشعار كمقروء');
      refetch();
      queryClient.invalidateQueries(['admin-notifications']);
      queryClient.invalidateQueries(['notification-details']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => notifications.delete(id),
    onSuccess: () => {
      toast.success('تم حذف الإشعار');
      navigate('/notifications');
    },
    onError: () => {
      toast.error('فشل حذف الإشعار');
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

  if (error || !notification) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">الإشعار غير موجود</h3>
          <p className="text-gray-600 mb-4">لم يتم العثور على بيانات الإشعار</p>
          <button
            onClick={() => navigate('/notifications')}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <ArrowRight size={18} />
            العودة إلى قائمة الإشعارات
          </button>
        </div>
      </div>
    );
  }

  const getTypeConfig = (type) => {
    const configs = {
      BOOKING: { label: 'حجز', color: 'bg-blue-50 border-blue-200 text-blue-600', icon: Calendar },
      PAYMENT: { label: 'دفع', color: 'bg-green-50 border-green-200 text-green-600', icon: TrendingUp },
      SUPPORT: { label: 'دعم', color: 'bg-yellow-50 border-yellow-200 text-yellow-600', icon: AlertCircle },
      SYSTEM: { label: 'نظام', color: 'bg-purple-50 border-purple-200 text-purple-600', icon: Bell },
      DOCTOR: { label: 'طبيب', color: 'bg-cyan-50 border-cyan-200 text-cyan-600', icon: Stethoscope },
    };
    return configs[type] || { label: type || 'عام', color: 'bg-gray-50 border-gray-200 text-gray-600', icon: FileText };
  };

  const typeConfig = getTypeConfig(notification.type);
  const TypeIcon = typeConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/notifications')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowRight size={20} />
          <span>العودة</span>
        </button>
        <div className="flex items-center gap-3">
          {!notification.isRead && (
            <button
              onClick={() => markAsReadMutation.mutate()}
              disabled={markAsReadMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <Check size={18} />
              تحديد كمقروء
            </button>
          )}
          <button
            onClick={() => {
              if (window.confirm('هل أنت متأكد من حذف هذا الإشعار؟')) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <Trash2 size={18} />
            حذف
          </button>
        </div>
      </div>

      {/* Notification Header Card */}
      <div className="glass-card rounded-2xl p-8 bg-white border border-primary-200">
        <div className="flex items-start gap-6">
          <div className={`w-32 h-32 rounded-2xl border-2 flex items-center justify-center shadow-2xl ${typeConfig.color}`}>
            <TypeIcon size={64} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold text-gray-900">الإشعار</h1>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${
                notification.isRead 
                  ? 'bg-gray-100 text-gray-700 border-gray-200' 
                  : 'bg-primary-100 text-primary-700 border-primary-200'
              }`}>
                {notification.isRead ? 'مقروء' : 'غير مقروء'}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${typeConfig.color}`}>
                {typeConfig.label}
              </span>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              {notification.message || notification.title || 'لا توجد رسالة'}
            </p>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={20} />
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(notification.createdAt).toLocaleDateString('ar-EG', {
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
          <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center mx-auto mb-3 ${typeConfig.color}`}>
            <TypeIcon size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{typeConfig.label}</p>
          <p className="text-sm text-gray-500">نوع الإشعار</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center mx-auto mb-3 ${
            notification.isRead 
              ? 'bg-gray-50 border-gray-200' 
              : 'bg-primary-50 border-primary-200'
          }`}>
            {notification.isRead ? (
              <Eye className="text-gray-600" size={28} />
            ) : (
              <EyeOff className="text-primary-600" size={28} />
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {notification.isRead ? 'مقروء' : 'غير مقروء'}
          </p>
          <p className="text-sm text-gray-500">الحالة</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-3">
            <Calendar className="text-blue-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {new Date(notification.createdAt).toLocaleDateString('ar-EG', {
              day: 'numeric',
              month: 'short'
            })}
          </p>
          <p className="text-sm text-gray-500">التاريخ</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center mx-auto mb-3">
            <FileText className="text-purple-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {notification.data ? 'نعم' : 'لا'}
          </p>
          <p className="text-sm text-gray-500">يحتوي على بيانات</p>
        </div>
      </div>

      {/* Notification Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="text-primary-600" size={20} />
            معلومات الإشعار
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">معرف الإشعار</span>
              <span className="text-sm font-semibold text-gray-900 font-mono text-xs">{notification.id}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">النوع</span>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${typeConfig.color}`}>
                  <TypeIcon size={16} />
                </div>
                <span className="text-sm font-semibold text-gray-900">{typeConfig.label}</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">العنوان</span>
              <span className="text-sm font-semibold text-gray-900">{notification.title || 'لا يوجد'}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">الحالة</span>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                notification.isRead 
                  ? 'bg-gray-100 text-gray-700 border border-gray-200' 
                  : 'bg-primary-100 text-primary-700 border border-primary-200'
              }`}>
                {notification.isRead ? 'مقروء' : 'غير مقروء'}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="text-primary-600" size={20} />
            معلومات التاريخ والمستخدم
          </h3>
          <div className="space-y-3">
            {notification.user && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">المستخدم</span>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-primary-600" />
                  <span className="text-sm font-semibold text-gray-900">
                    {notification.user.username || notification.user.email}
                  </span>
                </div>
              </div>
            )}
            {notification.doctor && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">الطبيب</span>
                <div className="flex items-center gap-2">
                  <Stethoscope size={16} className="text-green-600" />
                  <span className="text-sm font-semibold text-gray-900">
                    {notification.doctor.name || notification.doctor.email}
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">تاريخ الإنشاء</span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(notification.createdAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            {notification.readAt && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">تاريخ القراءة</span>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date(notification.readAt).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Display */}
      <div className="glass-card rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="text-primary-600" size={20} />
          الرسالة
        </h3>
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <p className="text-gray-800 leading-relaxed text-lg">
            {notification.message || notification.title || 'لا توجد رسالة'}
          </p>
        </div>
      </div>

      {/* Data Display */}
      {notification.data && (
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="text-primary-600" size={20} />
            البيانات الإضافية
          </h3>
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <pre className="text-sm text-gray-800 overflow-x-auto">
              {JSON.stringify(notification.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDetails;

