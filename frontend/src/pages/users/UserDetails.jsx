import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { users } from '../../api/admin';
import { 
  ArrowRight, 
  Mail, 
  Phone, 
  Calendar, 
  User,
  Edit,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  Clock,
  DollarSign,
  Star,
  UserCheck,
  UserX,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/common/DataTable';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['user-details', id],
    queryFn: async () => {
      const response = await users.getById(id);
      return response.data.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => users.approve(id),
    onSuccess: () => {
      toast.success('تم الموافقة على المستخدم');
      refetch();
    },
    onError: () => {
      toast.error('فشل الموافقة');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => users.reject(id, 'رفض من الأدمن'),
    onSuccess: () => {
      toast.success('تم رفض المستخدم');
      refetch();
    },
    onError: () => {
      toast.error('فشل الرفض');
    },
  });

  const activateMutation = useMutation({
    mutationFn: () => users.activate(id),
    onSuccess: () => {
      toast.success('تم تفعيل المستخدم');
      refetch();
    },
    onError: () => {
      toast.error('فشل التفعيل');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () => users.deactivate(id),
    onSuccess: () => {
      toast.success('تم تعطيل المستخدم');
      refetch();
    },
    onError: () => {
      toast.error('فشل التعطيل');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => users.delete(id),
    onSuccess: () => {
      toast.success('تم حذف المستخدم');
      navigate('/users');
    },
    onError: () => {
      toast.error('فشل حذف المستخدم');
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

  if (error || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">المستخدم غير موجود</h3>
          <p className="text-gray-600 mb-4">لم يتم العثور على بيانات المستخدم</p>
          <button
            onClick={() => navigate('/users')}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <ArrowRight size={18} />
            العودة إلى قائمة المستخدمين
          </button>
        </div>
      </div>
    );
  }

  const bookingColumns = [
    {
      header: 'الطبيب',
      accessor: 'doctor',
      render: (booking) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
            <span className="text-primary-600 text-sm font-bold">
              {booking.doctor?.name?.charAt(0) || 'D'}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{booking.doctor?.name || 'غير محدد'}</p>
            <p className="text-xs text-gray-500">{booking.doctor?.specialization || ''}</p>
          </div>
        </div>
      )
    },
    {
      header: 'نوع الجلسة',
      accessor: 'sessionType',
      render: (booking) => (
        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold border border-gray-200">
          {booking.sessionType === 'VIDEO' ? 'فيديو' : 
           booking.sessionType === 'AUDIO' ? 'صوتي' : 
           booking.sessionType === 'TEXT' ? 'نصي' : booking.sessionType}
        </span>
      )
    },
    {
      header: 'المدة',
      accessor: 'duration',
      render: (booking) => (
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-900">{booking.duration} دقيقة</span>
        </div>
      )
    },
    // {
    //   header: 'السعر',
    //   accessor: 'price',
    //   render: (booking) => (
    //     <div className="flex items-center gap-2">
    //       <DollarSign size={16} className="text-green-600" />
    //       <span className="text-sm font-bold text-gray-900">{booking.price} ج.م</span>
    //     </div>
    //   )
    // },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (booking) => {
        const statusConfig = {
          COMPLETED: { label: 'مكتملة', color: 'bg-green-100 text-green-700 border-green-200' },
          PENDING: { label: 'معلقة', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
          CANCELLED: { label: 'ملغاة', color: 'bg-red-100 text-red-700 border-red-200' },
          CONFIRMED: { label: 'مؤكدة', color: 'bg-blue-100 text-blue-700 border-blue-200' },
        };
        const config = statusConfig[booking.status] || { label: booking.status, color: 'bg-gray-100 text-gray-700 border-gray-200' };
        return (
          <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${config.color}`}>
            {config.label}
          </span>
        );
      }
    },
    {
      header: 'تاريخ الحجز',
      accessor: 'scheduledAt',
      render: (booking) => (
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : '-'}
            </p>
            {booking.scheduledAt && (
              <p className="text-xs text-gray-500">
                {new Date(booking.scheduledAt).toLocaleTimeString('ar-EG', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'التقييم',
      accessor: 'rating',
      render: (booking) => booking.rating ? (
        <div className="flex items-center gap-1">
          <Star className="text-yellow-500 fill-yellow-500" size={16} />
          <span className="text-sm font-bold text-gray-900">{booking.rating}</span>
        </div>
      ) : (
        <span className="text-sm text-gray-400">-</span>
      )
    },
  ];



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/users')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowRight size={20} />
          <span>العودة</span>
        </button>
        <div className="flex items-center gap-3">
          {!user.isApproved && (
            <>
              <button
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Check size={18} />
                موافقة
              </button>
              <button
                onClick={() => {
                  if (window.confirm('هل أنت متأكد من رفض هذا المستخدم؟')) {
                    rejectMutation.mutate();
                  }
                }}
                disabled={rejectMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <X size={18} />
                رفض
              </button>
            </>
          )}
          {user.isApproved && (
            <>
              {user.isActive ? (
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
            onClick={() => {
              // Navigate to edit or open edit modal
              navigate('/users');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Edit size={18} />
            تعديل
          </button>
          <button
            onClick={() => {
              if (window.confirm(`هل أنت متأكد من حذف المستخدم "${user.username}"؟`)) {
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

      {/* User Header Card */}
      <div className="glass-card rounded-2xl p-8 bg-white border border-primary-200">
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-2xl">
            <span className="text-white text-5xl font-bold">
              {user.username?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl font-bold text-gray-900">{user.username}</h1>
              {user.isActive && user.isApproved && (
                <span className="px-4 py-2 bg-green-100 text-green-700 border-2 border-green-200 rounded-full text-sm font-semibold">
                  نشط
                </span>
              )}
              {!user.isApproved && (
                <span className="px-4 py-2 bg-yellow-100 text-yellow-700 border-2 border-yellow-200 rounded-full text-sm font-semibold">
                  بانتظار الموافقة
                </span>
              )}
              {!user.isActive && user.isApproved && (
                <span className="px-4 py-2 bg-red-100 text-red-700 border-2 border-red-200 rounded-full text-sm font-semibold">
                  معطل
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Mail size={20} />
              <span className="text-lg">{user.email || 'غير متوفر'}</span>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={20} />
                <div>
                  <p className="text-lg font-semibold text-gray-900">{user._count?.bookings || 0}</p>
                  <p className="text-xs text-gray-500">حجز</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-3">
            <Calendar className="text-blue-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{user._count?.bookings || 0}</p>
          <p className="text-sm text-gray-500">إجمالي الحجوزات</p>
        </div>

      </div>

      {/* User Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="text-primary-600" size={20} />
            معلومات المستخدم
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">الاسم المستعار</span>
              <span className="text-sm font-semibold text-gray-900">{user.username}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">البريد الإلكتروني</span>
              <span className="text-sm font-semibold text-gray-900">{user.email || 'غير متوفر'}</span>
            </div>
            {user.phone && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">رقم الهاتف</span>
                <span className="text-sm font-semibold text-gray-900">{user.phone}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">الحالة</span>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                user.isActive && user.isApproved 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : !user.isApproved
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {user.isActive && user.isApproved ? 'نشط' : !user.isApproved ? 'بانتظار الموافقة' : 'معطل'}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="text-primary-600" size={20} />
            معلومات التاريخ والإعدادات
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">معرف المستخدم</span>
              <span className="text-sm font-semibold text-gray-900 font-mono text-xs">{user.id}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">تاريخ التسجيل</span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(user.createdAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">آخر تحديث</span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(user.updatedAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">الرسائل الخاصة</span>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                user.allowPrivateMsg 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}>
                {user.allowPrivateMsg ? 'مفعل' : 'معطل'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings */}
      {user.bookings && user.bookings.length > 0 && (
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar size={24} className="text-primary-600" />
            الحجوزات ({user.bookings.length})
          </h3>
          <DataTable
            data={user.bookings}
            columns={bookingColumns}
            searchable={true}
            filterable={true}
            exportable={true}
            pagination={true}
            pageSize={10}
            emptyMessage="لا توجد حجوزات"
            title="حجوزات المستخدم"
          />
        </div>
      )}


    </div>
  );
};

export default UserDetails;
