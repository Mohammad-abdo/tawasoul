import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { interests } from '../../api/admin';
import { 
  ArrowRight, 
  Tag, 
  Users,
  FileText,
  Calendar,
  AlertCircle,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const InterestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: interest, isLoading, error, refetch } = useQuery({
    queryKey: ['interest-details', id],
    queryFn: async () => {
      const response = await interests.getById(id);
      return response.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => interests.delete(id),
    onSuccess: () => {
      toast.success('تم حذف الاهتمام');
      navigate('/interests');
    },
    onError: () => {
      toast.error('فشل حذف الاهتمام');
    },
  });

  const activateMutation = useMutation({
    mutationFn: () => interests.activate(id),
    onSuccess: () => {
      toast.success('تم تفعيل الاهتمام');
      refetch();
    },
    onError: () => {
      toast.error('فشل تفعيل الاهتمام');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () => interests.deactivate(id),
    onSuccess: () => {
      toast.success('تم إلغاء تفعيل الاهتمام');
      refetch();
    },
    onError: () => {
      toast.error('فشل إلغاء تفعيل الاهتمام');
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

  if (error || !interest) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">الاهتمام غير موجود</h3>
          <p className="text-gray-600 mb-4">لم يتم العثور على بيانات الاهتمام</p>
          <button
            onClick={() => navigate('/interests')}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <ArrowRight size={18} />
            العودة إلى قائمة الاهتمامات
          </button>
        </div>
      </div>
    );
  }

  const usersCount = interest._count?.users || 0;
  const postsCount = interest._count?.posts || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/interests')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowRight size={20} />
          <span>العودة</span>
        </button>
        <div className="flex items-center gap-3">
          {interest.isActive ? (
            <button
              onClick={() => deactivateMutation.mutate()}
              disabled={deactivateMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              <XCircle size={18} />
              إلغاء التفعيل
            </button>
          ) : (
            <button
              onClick={() => activateMutation.mutate()}
              disabled={activateMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={18} />
              تفعيل
            </button>
          )}
          <button
            onClick={() => {
              // Navigate to edit or open edit modal
              navigate('/interests');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Edit size={18} />
            تعديل
          </button>
          <button
            onClick={() => {
              if (window.confirm(`هل أنت متأكد من حذف الاهتمام "${interest.nameAr}"؟`)) {
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

      {/* Interest Header Card */}
      <div className="glass-card rounded-2xl p-8 bg-white border border-primary-200">
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 rounded-2xl bg-gray-100 border-2 border-primary-500 flex items-center justify-center shadow-2xl">
            {interest.icon ? (
              <span className="text-6xl">{interest.icon}</span>
            ) : (
              <Tag className="text-primary-600" size={64} />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl font-bold text-gray-900">{interest.nameAr}</h1>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${
                interest.isActive 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}>
                {interest.isActive ? 'نشط' : 'معطل'}
              </span>
            </div>
            <p className="text-lg text-gray-600 mb-4">{interest.name}</p>
            {interest.description && (
              <p className="text-gray-700 mb-6">{interest.description}</p>
            )}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-gray-600">
                <Users size={20} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{usersCount}</p>
                  <p className="text-xs text-gray-500">مستخدم مهتم</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FileText size={20} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{postsCount}</p>
                  <p className="text-xs text-gray-500">منشور مرتبط</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp size={20} />
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {usersCount + postsCount > 0 ? Math.round((usersCount / (usersCount + postsCount)) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-500">نسبة الاستخدام</p>
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
            <Users className="text-primary-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{usersCount}</p>
          <p className="text-sm text-gray-500">المستخدمين المهتمين</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-3">
            <FileText className="text-blue-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{postsCount}</p>
          <p className="text-sm text-gray-500">المنشورات المرتبطة</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="text-green-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {usersCount + postsCount}
          </p>
          <p className="text-sm text-gray-500">إجمالي التفاعلات</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center mx-auto mb-3 ${
            interest.isActive 
              ? 'bg-green-50 border-green-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            {interest.isActive ? (
              <CheckCircle className="text-green-600" size={28} />
            ) : (
              <XCircle className="text-gray-600" size={28} />
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {interest.isActive ? 'نشط' : 'معطل'}
          </p>
          <p className="text-sm text-gray-500">الحالة</p>
        </div>
      </div>

      {/* Interest Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Tag className="text-primary-600" size={20} />
            معلومات الاهتمام
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">الاسم (عربي)</span>
              <span className="text-sm font-semibold text-gray-900">{interest.nameAr}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">الاسم (إنجليزي)</span>
              <span className="text-sm font-semibold text-gray-900">{interest.name}</span>
            </div>
            {interest.icon && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">الأيقونة</span>
                <span className="text-2xl">{interest.icon}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">الحالة</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                interest.isActive 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}>
                {interest.isActive ? 'نشط' : 'معطل'}
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
              <span className="text-sm text-gray-600">معرف الاهتمام</span>
              <span className="text-sm font-semibold text-gray-900 font-mono text-xs">{interest.id}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">تاريخ الإنشاء</span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(interest.createdAt).toLocaleDateString('ar-EG', {
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
                {new Date(interest.updatedAt).toLocaleDateString('ar-EG', {
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

      {/* Description */}
      {interest.description && (
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="text-primary-600" size={20} />
            الوصف
          </h3>
          <p className="text-gray-700 leading-relaxed">{interest.description}</p>
        </div>
      )}

      {/* Usage Statistics */}
      <div className="glass-card rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="text-primary-600" size={20} />
          إحصائيات الاستخدام
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-6 border border-primary-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary-100 border border-primary-300 flex items-center justify-center">
                  <Users className="text-primary-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">المستخدمين</p>
                  <p className="text-2xl font-bold text-gray-900">{usersCount}</p>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${usersCount > 0 ? Math.min((usersCount / 100) * 100, 100) : 0}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 border border-blue-300 flex items-center justify-center">
                  <FileText className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">المنشورات</p>
                  <p className="text-2xl font-bold text-gray-900">{postsCount}</p>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${postsCount > 0 ? Math.min((postsCount / 100) * 100, 100) : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestDetails;

