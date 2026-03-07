import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { onboarding } from '../../api/admin';
import { 
  ArrowRight, 
  Image,
  Calendar,
  AlertCircle,
  Edit,
  Trash2,
  Monitor,
  Smartphone,
  Globe,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const OnboardingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: item, isLoading, error } = useQuery({
    queryKey: ['onboarding-details', id],
    queryFn: async () => {
      const response = await onboarding.getById(id);
      return response.data.data;
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

  if (error || !item) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">عنصر التعريف غير موجود</h3>
          <p className="text-gray-600 mb-4">لم يتم العثور على بيانات عنصر التعريف</p>
          <button
            onClick={() => navigate('/onboarding')}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <ArrowRight size={18} />
            العودة إلى قائمة عناصر التعريف
          </button>
        </div>
      </div>
    );
  }

  const platformConfig = {
    ALL: { icon: Globe, label: 'الكل', color: 'bg-blue-50 border-blue-200 text-blue-600' },
    MOBILE: { icon: Smartphone, label: 'موبايل', color: 'bg-green-50 border-green-200 text-green-600' },
    WEB: { icon: Monitor, label: 'ويب', color: 'bg-purple-50 border-purple-200 text-purple-600' },
  };
  const config = platformConfig[item.platform] || platformConfig.ALL;
  const PlatformIcon = config.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/onboarding')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowRight size={20} />
          <span>العودة</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              // Navigate to edit or open edit modal
              navigate('/onboarding');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Edit size={18} />
            تعديل
          </button>
        </div>
      </div>

      {/* Onboarding Header Card */}
      <div className="glass-card rounded-2xl p-8 bg-white border border-primary-200">
        <div className="flex items-start gap-6">
          {item.image ? (
            <div className="w-48 h-48 rounded-2xl border-2 border-primary-500 overflow-hidden shadow-2xl flex-shrink-0">
              <img 
                src={item.image} 
                alt={item.titleAr} 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-48 h-48 rounded-2xl bg-gray-100 border-2 border-primary-500 flex items-center justify-center shadow-2xl flex-shrink-0">
              <Image className="text-gray-400" size={64} />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl font-bold text-gray-900">{item.titleAr}</h1>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${
                item.isActive 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}>
                {item.isActive ? 'نشط' : 'معطل'}
              </span>
            </div>
            <p className="text-lg text-gray-600 mb-4">{item.title}</p>
            {(item.descriptionAr || item.description) && (
              <p className="text-gray-700 mb-6 leading-relaxed">
                {item.descriptionAr || item.description}
              </p>
            )}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-gray-600">
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${config.color}`}>
                  <PlatformIcon size={20} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{config.label}</p>
                  <p className="text-xs text-gray-500">المنصة</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-lg">{item.order}</span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">الترتيب</p>
                  <p className="text-xs text-gray-500">في القائمة</p>
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
            <span className="text-primary-600 font-bold text-2xl">{item.order}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">الترتيب</p>
          <p className="text-sm text-gray-500">في القائمة</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center mx-auto mb-3 ${config.color}`}>
            <PlatformIcon size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{config.label}</p>
          <p className="text-sm text-gray-500">المنصة</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center mx-auto mb-3 ${
            item.isActive 
              ? 'bg-green-50 border-green-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            {item.isActive ? (
              <CheckCircle className="text-green-600" size={28} />
            ) : (
              <XCircle className="text-gray-600" size={28} />
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {item.isActive ? 'نشط' : 'معطل'}
          </p>
          <p className="text-sm text-gray-500">الحالة</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-3">
            <FileText className="text-blue-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {item.image ? 'نعم' : 'لا'}
          </p>
          <p className="text-sm text-gray-500">يحتوي على صورة</p>
        </div>
      </div>

      {/* Content Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="text-primary-600" size={20} />
            معلومات المحتوى
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">العنوان (عربي)</span>
              <span className="text-sm font-semibold text-gray-900">{item.titleAr}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">العنوان (إنجليزي)</span>
              <span className="text-sm font-semibold text-gray-900">{item.title}</span>
            </div>
            {item.descriptionAr && (
              <div className="py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600 block mb-2">الوصف (عربي)</span>
                <p className="text-sm font-semibold text-gray-900">{item.descriptionAr}</p>
              </div>
            )}
            {item.description && (
              <div className="py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600 block mb-2">الوصف (إنجليزي)</span>
                <p className="text-sm font-semibold text-gray-900">{item.description}</p>
              </div>
            )}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">الحالة</span>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                item.isActive 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}>
                {item.isActive ? 'نشط' : 'معطل'}
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
              <span className="text-sm text-gray-600">معرف العنصر</span>
              <span className="text-sm font-semibold text-gray-900 font-mono text-xs">{item.id}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">الترتيب</span>
              <span className="text-sm font-semibold text-gray-900">{item.order}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">المنصة</span>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${config.color}`}>
                  <PlatformIcon size={16} />
                </div>
                <span className="text-sm font-semibold text-gray-900">{config.label}</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">تاريخ الإنشاء</span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(item.createdAt).toLocaleDateString('ar-EG', {
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
                {new Date(item.updatedAt).toLocaleDateString('ar-EG', {
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

      {/* Image Display */}
      {item.image && (
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Image className="text-primary-600" size={20} />
            الصورة
          </h3>
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <img 
              src={item.image} 
              alt={item.titleAr} 
              className="w-full max-w-2xl mx-auto rounded-xl shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingDetails;

