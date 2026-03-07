import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { doctors } from '../../api/admin';
import { 
  ArrowRight, 
  Shield, 
  Mail, 
  Phone, 
  Star, 
  Calendar, 
  DollarSign, 
  FileText, 
  GraduationCap, 
  Briefcase, 
  Award, 
  Clock,
  Edit,
  Check,
  X,
  AlertCircle,
  User,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { useState } from 'react';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const { data: doctor, isLoading, error, refetch } = useQuery({
    queryKey: ['doctor-details', id],
    queryFn: async () => {
      const response = await doctors.getById(id);
      return response.data.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => doctors.approve(id),
    onSuccess: () => {
      toast.success('تم الموافقة على الطبيب');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل الموافقة');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reason) => doctors.reject(id, { reason }),
    onSuccess: () => {
      toast.success('تم رفض الطبيب');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل الرفض');
    },
  });

  const verifyMutation = useMutation({
    mutationFn: () => doctors.verify(id),
    onSuccess: () => {
      toast.success('تم توثيق الطبيب');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل التوثيق');
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

  if (error || !doctor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">الطبيب غير موجود</h3>
          <p className="text-gray-600 mb-4">لم يتم العثور على بيانات الطبيب</p>
          <button
            onClick={() => navigate('/doctors')}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <ArrowRight size={18} />
            العودة إلى قائمة الأطباء
          </button>
        </div>
      </div>
    );
  }

  // Parse availability time slots
  const parseTimeSlots = (timeSlots) => {
    try {
      return typeof timeSlots === 'string' ? JSON.parse(timeSlots) : timeSlots;
    } catch {
      return [];
    }
  };

  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/doctors')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowRight size={20} />
          <span>العودة</span>
        </button>
        <div className="flex items-center gap-3">

          {!doctor.isVerified && doctor.isApproved && (
            <button
              onClick={() => {
                if (window.confirm('هل أنت متأكد من توثيق هذا الطبيب؟')) {
                  verifyMutation.mutate();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Shield size={18} />
              توثيق
            </button>
          )}
          <button
            onClick={() => {
              setEditingDoctor(doctor);
              setShowEditModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Edit size={18} />
            تعديل
          </button>
        </div>
      </div>

      {/* Doctor Header Card */}
      <div className="glass-card rounded-2xl p-8 bg-white border border-primary-200">
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-2xl">
            <span className="text-white text-5xl font-bold">
              {doctor.name?.charAt(0) || 'D'}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold text-gray-900">{doctor.name}</h1>
              {doctor.isVerified && (
                <span className="px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Shield size={16} />
                  موثّق
                </span>
              )}
              {doctor.isFeatured && (
                <span className="px-4 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                  مميز
                </span>
              )}

            </div>
            <p className="text-xl text-gray-600 mb-4">{doctor.specialization}</p>
            {doctor.bio && (
              <p className="text-gray-700 leading-relaxed mb-4">{doctor.bio}</p>
            )}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Star className="text-yellow-500 fill-yellow-500" size={24} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{doctor.rating?.toFixed(1) || '0.0'}</p>
                  <p className="text-xs text-gray-500">({doctor.totalRatings || 0} تقييم)</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={20} />
                <div>
                  <p className="text-lg font-semibold text-gray-900">{doctor.totalSessions || 0}</p>
                  <p className="text-xs text-gray-500">جلسة</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp size={20} />
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {doctor.isActive ? 'نشط' : 'معطل'}
                  </p>
                  <p className="text-xs text-gray-500">الحالة</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
              <Mail className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">البريد الإلكتروني</p>
              <p className="text-base font-semibold text-gray-900">{doctor.email}</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
              <Phone className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">رقم الهاتف</p>
              <p className="text-base font-semibold text-gray-900">{doctor.phone || 'غير متوفر'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Specialties */}
      {doctor.specialties && doctor.specialties.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Award size={24} className="text-primary-600" />
            التخصصات
          </h3>
          <div className="flex flex-wrap gap-3">
            {doctor.specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-5 py-2.5 bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 rounded-xl text-sm font-semibold border border-primary-200"
              >
                {specialty.specialty || specialty}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Session Prices */}
      {doctor.sessionPrices && doctor.sessionPrices.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <DollarSign size={24} className="text-primary-600" />
            أسعار الجلسات
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {doctor.sessionPrices.map((price, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 text-center hover:shadow-lg transition-shadow">
                <p className="text-sm text-gray-500 mb-2">مدة الجلسة</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{price.duration} دقيقة</p>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-3xl font-bold text-primary-600">{price.price} ج.م</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience & Education Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Experience */}
        {doctor.experiences && doctor.experiences.length > 0 && (
          <div className="glass-card rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Briefcase size={24} className="text-primary-600" />
              الخبرات
            </h3>
            <div className="space-y-4">
              {doctor.experiences.map((exp, index) => (
                <div key={index} className="border-l-4 border-primary-500 pl-5 py-3 bg-gray-50 rounded-r-xl">
                  <p className="font-bold text-gray-900 text-lg mb-1">{exp.title}</p>
                  <p className="text-gray-600 mb-2">{exp.workplace}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(exp.startDate).toLocaleDateString('ar-EG')} -{' '}
                    {exp.endDate ? new Date(exp.endDate).toLocaleDateString('ar-EG') : 'حتى الآن'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {doctor.education && doctor.education.length > 0 && (
          <div className="glass-card rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <GraduationCap size={24} className="text-primary-600" />
              التعليم
            </h3>
            <div className="space-y-4">
              {doctor.education.map((edu, index) => (
                <div key={index} className="border-l-4 border-primary-500 pl-5 py-3 bg-gray-50 rounded-r-xl">
                  <p className="font-bold text-gray-900 text-lg mb-1">{edu.degree}</p>
                  <p className="text-gray-600 mb-2">{edu.institution}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(edu.startDate).toLocaleDateString('ar-EG')} -{' '}
                    {edu.endDate ? new Date(edu.endDate).toLocaleDateString('ar-EG') : 'حتى الآن'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Certificates */}
      {doctor.certificates && doctor.certificates.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Award size={24} className="text-primary-600" />
            الشهادات
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctor.certificates.map((cert, index) => (
              <div key={index} className="border-l-4 border-primary-500 pl-5 py-4 bg-gray-50 rounded-r-xl">
                <p className="font-bold text-gray-900 text-lg mb-1">{cert.title}</p>
                <p className="text-gray-600 mb-2">{cert.issuer}</p>
                <p className="text-sm text-gray-500 mb-3">
                  {new Date(cert.startDate).toLocaleDateString('ar-EG')} -{' '}
                  {cert.endDate ? new Date(cert.endDate).toLocaleDateString('ar-EG') : 'غير محدد'}
                </p>
                {cert.certificateLink && (
                  <a
                    href={cert.certificateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center gap-1"
                  >
                    عرض الشهادة
                    <ArrowRight size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      {doctor.availability && doctor.availability.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock size={24} className="text-primary-600" />
            أوقات التوفر
          </h3>
          <div className="grid grid-cols-7 gap-3">
            {days.map((day, index) => {
              const dayAvailability = doctor.availability.find(av => av.dayOfWeek === index);
              const timeSlots = dayAvailability ? parseTimeSlots(dayAvailability.timeSlots) : [];
              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl text-center transition-all duration-300 ${
                    dayAvailability && dayAvailability.isActive
                      ? 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 shadow-md'
                      : 'bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  <p className="text-sm font-bold text-gray-700 mb-2">{day}</p>
                  {dayAvailability && dayAvailability.isActive ? (
                    <div>
                      {Array.isArray(timeSlots) && timeSlots.length > 0 ? (
                        <div className="space-y-1">
                          <p className="text-xs text-green-700 font-semibold">{timeSlots.length} فترة</p>
                          <div className="text-xs text-green-600">
                            {timeSlots.slice(0, 2).map((slot, i) => (
                              <div key={i}>{slot}</div>
                            ))}
                            {timeSlots.length > 2 && <div>+{timeSlots.length - 2}</div>}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-green-700 font-semibold">متاح</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">غير متاح</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}



      {/* Bookings Per Day */}
      {doctor.bookingsByDay && Object.keys(doctor.bookingsByDay).length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar size={24} className="text-primary-600" />
            الحجوزات حسب اليوم
          </h3>
          <div className="space-y-4">
            {Object.entries(doctor.bookingsByDay)
              .sort(([a], [b]) => new Date(b) - new Date(a))
              .slice(0, 7)
              .map(([date, bookings]) => (
                <div key={date} className="border-l-4 border-primary-500 pl-5 py-4 bg-gray-50 rounded-r-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        {new Date(date).toLocaleDateString('ar-EG', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {bookings.length} حجز
                      </p>
                    </div>
                    <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-semibold">
                      {bookings.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {bookings.slice(0, 6).map((booking) => (
                      <div key={booking.id} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">
                            {booking.user?.username || 'مستخدم'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {booking.status === 'COMPLETED' ? 'مكتمل' :
                             booking.status === 'PENDING' ? 'معلق' : 'ملغي'}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {booking.scheduledAt 
                            ? new Date(booking.scheduledAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
                            : '-'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {booking.price} ج.م - {booking.duration} دقيقة
                        </p>
                      </div>
                    ))}
                    {bookings.length > 6 && (
                      <div className="bg-gray-100 rounded-lg p-3 border border-gray-200 flex items-center justify-center">
                        <span className="text-sm text-gray-600">
                          +{bookings.length - 6} حجز إضافي
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}





      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-3">
            <Calendar className="text-blue-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{doctor._count?.bookings || 0}</p>
          <p className="text-sm text-gray-500">إجمالي الحجوزات</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-3">
            <FileText className="text-green-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{doctor._count?.tips || 0}</p>
          <p className="text-sm text-gray-500">النصائح</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center mx-auto mb-3">
            <FileText className="text-purple-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{doctor._count?.articles || 0}</p>
          <p className="text-sm text-gray-500">المقالات</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-3">
            <Star className="text-amber-600 fill-amber-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{doctor.rating?.toFixed(1) || '0.0'}</p>
          <p className="text-sm text-gray-500">التقييم</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;

