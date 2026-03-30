import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { bookings } from '../../api/admin';
import { doctorBookings, doctorChildren, doctorAssessments } from '../../api/doctor';
import { agoraApi } from '../../api/agora';
import { useAuthStore } from '../../store/authStore';
import AgoraSessionOverlay from '../../features/agora/AgoraSessionOverlay';
import { 
  ArrowRight, 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  Stethoscope, 
  Video, 
  Phone, 
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Edit,
  Star,
  FileText,
  Activity,
  Plus,
  ClipboardList
} from 'lucide-react';
import toast from 'react-hot-toast';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const [isAgoraOpen, setIsAgoraOpen] = useState(false);

  const { data: booking, isLoading, error, refetch } = useQuery({
    queryKey: ['booking-details', id],
    queryFn: async () => {
      if (role === 'doctor') {
        const response = await doctorBookings.getById(id);
        return response.data.data;
      }
      const response = await bookings.getById(id);
      return response.data.data;
    },
  });

  const { data: childAssessmentResults } = useQuery({
    queryKey: ['child-assessments', booking?.childId],
    queryFn: async () => {
      if (!booking?.childId || role !== 'doctor') return null;
      const response = await doctorChildren.getById(booking.childId);
      return response.data.data.assessmentResults;
    },
    enabled: !!booking?.childId && role === 'doctor',
  });

  const [assessmentNote, setAssessmentNote] = useState('');
  const [assessmentScore, setAssessmentScore] = useState(10);

  const canStartSession = role === 'doctor' && booking?.status === 'CONFIRMED';

  const fetchAgoraToken = async () => {
    const response = await agoraApi.getToken(booking.id);
    return response.data.data;
  };

  const completeMutation = useMutation({
    mutationFn: ({ id, notes, rating }) => {
      // In a real app, you'd have a specific endpoint for this
      return apiClient.put(`/doctor/bookings/${id}/complete`, { notes, rating });
    },
    onSuccess: () => {
      toast.success('تم إنهاء الجلسة بنجاح');
      refetch();
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => bookings.updateStatus(id, { status }),
    onSuccess: () => {
      toast.success('تم تحديث حالة الحجز');
      refetch();
    },
    onError: () => {
      toast.error('فشل تحديث حالة الحجز');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => {
      if (role === 'doctor') {
        return doctorBookings.cancel(id, reason);
      }
      return bookings.cancel(id, { reason });
    },
    onSuccess: () => {
      toast.success('تم إلغاء الحجز');
      refetch();
    },
    onError: () => {
      toast.error('فشل إلغاء الحجز');
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (id) => doctorBookings.confirm(id),
    onSuccess: () => {
      toast.success('تم تأكيد الحجز بنجاح');
      refetch();
    },
    onError: () => {
      toast.error('فشل تأكيد الحجز');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: bookings.delete,
    onSuccess: () => {
      toast.success('تم حذف الحجز');
      navigate('/bookings');
    },
    onError: () => {
      toast.error('فشل حذف الحجز');
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

  if (error || !booking) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">الحجز غير موجود</h3>
          <p className="text-gray-600 mb-4">لم يتم العثور على بيانات الحجز</p>
          <button
            onClick={() => navigate('/bookings')}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <ArrowRight size={18} />
            العودة إلى قائمة الحجوزات
          </button>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status) => {
    const configs = {
      COMPLETED: { label: 'مكتملة', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
      CONFIRMED: { label: 'مؤكدة', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle },
      PENDING: { label: 'بانتظار', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: AlertCircle },
      CANCELLED: { label: 'ملغاة', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
    };
    return configs[status] || configs.PENDING;
  };

  const getSessionTypeIcon = (type) => {
    const icons = {
      VIDEO: Video,
      AUDIO: Phone,
      TEXT: MessageSquare,
    };
    return icons[type] || MessageSquare;
  };

  const getSessionTypeLabel = (type) => {
    const labels = {
      VIDEO: 'فيديو',
      AUDIO: 'صوتي',
      TEXT: 'نصي',
    };
    return labels[type] || type;
  };

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;
  const SessionTypeIcon = getSessionTypeIcon(booking.sessionType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/bookings')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowRight size={20} />
          <span>العودة</span>
        </button>
        <div className="flex items-center gap-3">
          {canStartSession && (
            <button
              onClick={() => {
                setIsAgoraOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
            >
              <Video size={18} />
              بدء الجلسة
            </button>
          )}
          {role === 'doctor' && booking.status === 'PENDING' && (
            <button
              onClick={() => {
                if (window.confirm('هل أنت متأكد من تأكيد هذا الحجز؟')) {
                  confirmMutation.mutate(booking.id);
                }
              }}
              disabled={confirmMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={18} />
              تأكيد
            </button>
          )}
          {role !== 'doctor' && booking.status === 'PENDING' && (
            <button
              onClick={() => {
                if (window.confirm('هل أنت متأكد من تأكيد هذا الحجز؟')) {
                  updateStatusMutation.mutate({ id: booking.id, status: 'CONFIRMED' });
                }
              }}
              disabled={updateStatusMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={18} />
              تأكيد
            </button>
          )}
          {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
            <button
              onClick={() => {
                const reason = window.prompt('يرجى إدخال سبب الإلغاء:');
                if (reason) {
                  cancelMutation.mutate({ id: booking.id, reason });
                }
              }}
              disabled={cancelMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <XCircle size={18} />
              إلغاء
            </button>
          )}
          {role !== 'doctor' && (
            <button
              onClick={() => {
                if (window.confirm(`هل أنت متأكد من حذف الحجز #${booking.id.substring(0, 8)}؟`)) {
                  deleteMutation.mutate(booking.id);
                }
              }}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <Trash2 size={18} />
              حذف
            </button>
          )}
        </div>
      </div>

      {/* Booking Header Card */}
      <div className="glass-card rounded-2xl p-8 bg-white border border-primary-200">
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-2xl">
            <Calendar className="text-white" size={48} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl font-bold text-gray-900">حجز #{booking.id.substring(0, 8)}</h1>
              <span className={`px-4 py-2 rounded-lg text-sm font-semibold border flex items-center gap-2 ${statusConfig.color}`}>
                <StatusIcon size={16} />
                {statusConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-gray-600">
                <SessionTypeIcon size={20} />
                <div>
                  <p className="text-lg font-semibold text-gray-900">{getSessionTypeLabel(booking.sessionType)}</p>
                  <p className="text-xs text-gray-500">نوع الجلسة</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={20} />
                <div>
                  <p className="text-lg font-semibold text-gray-900">{booking.duration} دقيقة</p>
                  <p className="text-xs text-gray-500">المدة</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign size={20} className="text-green-600" />
                <div>
                  <p className="text-lg font-semibold text-gray-900">{booking.price} ج.م</p>
                  <p className="text-xs text-gray-500">السعر</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Doctor Information */}
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Stethoscope className="text-primary-600" size={20} />
            معلومات الطبيب
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
                <span className="text-green-600 text-lg font-bold">
                  {booking.doctor?.name?.charAt(0) || 'D'}
                </span>
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">{booking.doctor?.name || '-'}</p>
                <p className="text-sm text-gray-500">{booking.doctor?.specialization || ''}</p>
              </div>
            </div>
            {booking.doctor?.email && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">البريد الإلكتروني</span>
                <span className="text-sm font-semibold text-gray-900">{booking.doctor.email}</span>
              </div>
            )}
            {booking.doctor?.phone && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">رقم الهاتف</span>
                <span className="text-sm font-semibold text-gray-900">{booking.doctor.phone}</span>
              </div>
            )}
            {booking.doctor?.rating && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">التقييم</span>
                <div className="flex items-center gap-1">
                  <Star className="text-yellow-500 fill-yellow-500" size={16} />
                  <span className="text-sm font-semibold text-gray-900">{booking.doctor.rating.toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Information */}
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="text-primary-600" size={20} />
            معلومات المستخدم
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                <span className="text-blue-600 text-lg font-bold">
                  {booking.user?.username?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">{booking.user?.username || 'مجهول'}</p>
                <p className="text-sm text-gray-500">مستخدم</p>
              </div>
            </div>
            {booking.user?.email && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">البريد الإلكتروني</span>
                <span className="text-sm font-semibold text-gray-900">{booking.user.email}</span>
              </div>
            )}
            {booking.user?.phone && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">رقم الهاتف</span>
                <span className="text-sm font-semibold text-gray-900">{booking.user.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="text-primary-600" size={20} />
            تفاصيل الحجز
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">معرف الحجز</span>
              <span className="text-sm font-semibold text-gray-900 font-mono">{booking.id}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">تاريخ ووقت الحجز</span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(booking.scheduledAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">نوع الجلسة</span>
              <div className="flex items-center gap-2">
                <SessionTypeIcon size={16} className="text-primary-600" />
                <span className="text-sm font-semibold text-gray-900">{getSessionTypeLabel(booking.sessionType)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">المدة</span>
              <span className="text-sm font-semibold text-gray-900">{booking.duration} دقيقة</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">السعر</span>
              <span className="text-lg font-bold text-green-600">{booking.price} ج.م</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="text-primary-600" size={20} />
            معلومات إضافية
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">الحالة</span>
              <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border flex items-center gap-1 ${statusConfig.color}`}>
                <StatusIcon size={14} />
                {statusConfig.label}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">تاريخ الإنشاء</span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(booking.createdAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            {booking.updatedAt && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">آخر تحديث</span>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date(booking.updatedAt).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
            {booking.notes && (
              <div className="py-2">
                <span className="text-sm text-gray-600 block mb-2">ملاحظات</span>
                <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">{booking.notes}</p>
              </div>
            )}
            {booking.cancellationReason && (
              <div className="py-2">
                <span className="text-sm text-gray-600 block mb-2">سبب الإلغاء</span>
                <p className="text-sm text-red-900 bg-red-50 rounded-lg p-3">{booking.cancellationReason}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Section */}
      {booking.rating && (
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="text-yellow-500 fill-yellow-500" size={20} />
            التقييم
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Star className="text-yellow-500 fill-yellow-500" size={32} />
              <span className="text-3xl font-bold text-gray-900">{booking.rating}</span>
            </div>
            {booking.review && (
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">التعليق</p>
                <p className="text-base text-gray-900 bg-gray-50 rounded-lg p-3">{booking.review}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Doctor Assessment Section */}
      {role === 'doctor' && (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6 border border-primary-200 bg-primary-50/30">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="text-primary-600" size={20} />
              {booking.status === 'COMPLETED' ? 'ملاحظات الجلسة' : 'إضافة ملاحظات الجلسة'}
            </h3>
            {booking.status === 'CONFIRMED' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">ملاحظات ونتائج التقييم</label>
                  <textarea
                    value={assessmentNote}
                    onChange={(e) => setAssessmentNote(e.target.value)}
                    className="w-full rounded-xl border-gray-200 focus:ring-primary-500 p-4 min-h-[120px]"
                    placeholder="اكتب تفاصيل ما تم ملاحظته خلال الجلسة..."
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">الدرجة:</span>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          onClick={() => setAssessmentScore(num)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            assessmentScore === num 
                              ? 'bg-primary-600 text-white shadow-md scale-110' 
                              : 'bg-white text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('هل تريد إنهاء الجلسة وحفظ هذه النتائج؟')) {
                        completeMutation.mutate({ id: booking.id, notes: assessmentNote, rating: assessmentScore });
                      }
                    }}
                    disabled={completeMutation.isPending}
                    className="btn-primary flex items-center gap-2"
                  >
                    <CheckCircle size={18} />
                    إنهاء الجلسة وحفظ
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-xl border border-primary-100">
                  <p className="text-sm text-gray-800 leading-relaxed">{booking.notes || 'لا توجد ملاحظات مسجلة'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">الدرجة الممنوحة:</span>
                  <span className="text-lg font-bold text-primary-600">{booking.rating || '-'}/10</span>
                </div>
              </div>
            )}
          </div>

          <div className="glass-card rounded-2xl p-6 border border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ClipboardList className="text-primary-600" size={20} />
                سجل اختبارات الطفل
              </h3>
              <button 
                onClick={() => navigate('/scales')}
                className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> إجراء اختبار جديد
              </button>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {childAssessmentResults?.length > 0 ? (
                childAssessmentResults.map((res) => (
                  <div key={res.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${res.question?.test?.category === 'AUDITORY' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                        <Activity size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{res.question?.test?.title}</p>
                        <p className="text-[10px] text-gray-500">{new Date(res.timestamp).toLocaleDateString('ar-EG')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-primary-600">{res.scoreGiven}/10</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-xs text-gray-500">لا توجد اختبارات سابقة للطفل</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AgoraSessionOverlay
        isOpen={isAgoraOpen}
        booking={booking}
        fetchToken={fetchAgoraToken}
        allowScreenShare={role === 'doctor'}
        onClose={() => setIsAgoraOpen(false)}
      />
    </div>
  );
};

export default BookingDetails;

