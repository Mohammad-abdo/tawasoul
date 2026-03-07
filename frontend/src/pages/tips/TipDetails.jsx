import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { tips } from '../../api/admin';
import { 
  ArrowRight, 
  Lightbulb, 
  User,
  Calendar,
  Heart,
  Star,
  Check,
  AlertCircle,
  Edit,
  Trash2,
  Stethoscope,
  TrendingUp,
  FileText,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const TipDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: tip, isLoading, error, refetch } = useQuery({
    queryKey: ['tip-details', id],
    queryFn: async () => {
      const response = await tips.getById(id);
      return response.data.data;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: () => tips.verify(id),
    onSuccess: () => {
      toast.success('تم تحديث حالة التوثيق');
      refetch();
    },
    onError: () => {
      toast.error('فشل التحديث');
    },
  });

  const featureMutation = useMutation({
    mutationFn: (isFeatured) => tips.feature(id, { isFeatured }),
    onSuccess: () => {
      toast.success('تم تحديث حالة التمييز');
      refetch();
    },
    onError: () => {
      toast.error('فشل التحديث');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => tips.delete(id),
    onSuccess: () => {
      toast.success('تم حذف النصيحة');
      navigate('/tips');
    },
    onError: () => {
      toast.error('فشل حذف النصيحة');
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

  if (error || !tip) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">النصيحة غير موجودة</h3>
          <p className="text-gray-600 mb-4">لم يتم العثور على بيانات النصيحة</p>
          <button
            onClick={() => navigate('/tips')}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <ArrowRight size={18} />
            العودة إلى قائمة النصائح
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/tips')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowRight size={20} />
          <span>العودة</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => verifyMutation.mutate()}
            disabled={verifyMutation.isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors disabled:opacity-50 ${
              tip.isVerified 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <Check size={18} />
            {tip.isVerified ? 'موثق' : 'توثيق'}
          </button>
          <button
            onClick={() => featureMutation.mutate(!tip.isFeatured)}
            disabled={featureMutation.isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors disabled:opacity-50 ${
              tip.isFeatured 
                ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <Star size={18} />
            {tip.isFeatured ? 'مميز' : 'تمييز'}
          </button>
          <button
            onClick={() => {
              if (window.confirm('هل أنت متأكد من حذف هذه النصيحة؟')) {
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

      {/* Tip Header Card */}
      <div className="glass-card rounded-2xl p-8 bg-white border border-primary-200">
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 rounded-2xl bg-yellow-50 border-2 border-yellow-500 flex items-center justify-center shadow-2xl">
            <Lightbulb className="text-yellow-600" size={64} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">النصيحة</h1>
              {tip.isVerified && (
                <span className="px-4 py-2 bg-green-100 text-green-700 border-2 border-green-200 rounded-full text-sm font-semibold">
                  موثّق
                </span>
              )}
              {tip.isFeatured && (
                <span className="px-4 py-2 bg-yellow-100 text-yellow-700 border-2 border-yellow-200 rounded-full text-sm font-semibold">
                  مميز
                </span>
              )}
            </div>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">{tip.content}</p>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-gray-600">
                <Heart className="text-red-600 fill-red-600" size={20} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{tip.likes || 0}</p>
                  <p className="text-xs text-gray-500">إعجاب</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={20} />
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(tip.createdAt).toLocaleDateString('ar-EG', {
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

      {/* Doctor Information */}
      {tip.doctor && (
        <div className="glass-card rounded-2xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Stethoscope size={24} className="text-primary-600" />
            معلومات الطبيب
          </h3>
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-xl bg-primary-50 border-2 border-primary-500 flex items-center justify-center">
              <User className="text-primary-600" size={40} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h4 className="text-2xl font-bold text-gray-900">{tip.doctor.name}</h4>
                {tip.doctor.isVerified && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold">
                    موثق
                  </span>
                )}
              </div>
              {tip.doctor.specialization && (
                <p className="text-gray-600 mb-2">{tip.doctor.specialization}</p>
              )}
              {tip.doctor.email && (
                <p className="text-sm text-gray-500">{tip.doctor.email}</p>
              )}
              <div className="mt-4 flex items-center gap-4">
                {tip.doctor.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-500 fill-yellow-500" size={18} />
                    <span className="text-sm font-semibold text-gray-900">
                      {tip.doctor.rating.toFixed(1)}
                    </span>
                  </div>
                )}
                {tip.doctor.totalSessions && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText size={16} />
                    <span className="text-sm">{tip.doctor.totalSessions} جلسة</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate(`/doctors/${tip.doctor.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              <Eye size={18} />
              عرض الملف الشخصي
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-3">
            <Heart className="text-red-600 fill-red-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{tip.likes || 0}</p>
          <p className="text-sm text-gray-500">الإعجابات</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center mx-auto mb-3 ${
            tip.isVerified 
              ? 'bg-green-50 border-green-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <Check className={tip.isVerified ? 'text-green-600' : 'text-gray-600'} size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {tip.isVerified ? 'نعم' : 'لا'}
          </p>
          <p className="text-sm text-gray-500">موثق</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center mx-auto mb-3 ${
            tip.isFeatured 
              ? 'bg-yellow-50 border-yellow-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <Star className={tip.isFeatured ? 'text-yellow-600 fill-yellow-600' : 'text-gray-600'} size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {tip.isFeatured ? 'نعم' : 'لا'}
          </p>
          <p className="text-sm text-gray-500">مميز</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="text-primary-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {tip.likes > 0 ? 'عالية' : tip.likes === 0 ? 'منخفضة' : 'متوسطة'}
          </p>
          <p className="text-sm text-gray-500">الشعبية</p>
        </div>
      </div>

      {/* Tip Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="text-primary-600" size={20} />
            معلومات النصيحة
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">معرف النصيحة</span>
              <span className="text-sm font-semibold text-gray-900 font-mono text-xs">{tip.id}</span>
            </div>
            {tip.postId && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">معرف المنشور</span>
                <span className="text-sm font-semibold text-gray-900 font-mono text-xs">{tip.postId}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">الحالة</span>
              <div className="flex items-center gap-2">
                {tip.isVerified && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 border border-green-200 rounded text-xs font-semibold">
                    موثق
                  </span>
                )}
                {tip.isFeatured && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded text-xs font-semibold">
                    مميز
                  </span>
                )}
                {!tip.isVerified && !tip.isFeatured && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded text-xs font-semibold">
                    عادي
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">الإعجابات</span>
              <span className="text-sm font-semibold text-gray-900">{tip.likes || 0}</span>
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
              <span className="text-sm text-gray-600">تاريخ الإنشاء</span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(tip.createdAt).toLocaleDateString('ar-EG', {
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
                {new Date(tip.updatedAt).toLocaleDateString('ar-EG', {
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

      {/* Content Display */}
      <div className="glass-card rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Lightbulb className="text-primary-600" size={20} />
          محتوى النصيحة
        </h3>
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <p className="text-gray-800 leading-relaxed text-lg">{tip.content}</p>
        </div>
      </div>
    </div>
  );
};

export default TipDetails;

