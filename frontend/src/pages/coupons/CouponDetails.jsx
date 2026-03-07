import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { coupons } from '../../api/admin';
import { 
  ArrowRight, 
  Ticket, 
  Calendar,
  Percent,
  DollarSign,
  AlertCircle,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  Users,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const CouponDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: coupon, isLoading, error, refetch } = useQuery({
    queryKey: ['coupon-details', id],
    queryFn: async () => {
      const response = await coupons.getById(id);
      return response.data.data;
    },
  });

  const { data: usageData } = useQuery({
    queryKey: ['coupon-usage', id],
    queryFn: async () => {
      const response = await coupons.getUsage(id);
      return response.data.data;
    },
    enabled: !!coupon,
  });

  const deleteMutation = useMutation({
    mutationFn: () => coupons.delete(id),
    onSuccess: () => {
      toast.success('تم حذف الكوبون');
      navigate('/coupons');
    },
    onError: () => {
      toast.error('فشل حذف الكوبون');
    },
  });

  const activateMutation = useMutation({
    mutationFn: () => coupons.activate(id),
    onSuccess: () => {
      toast.success('تم تفعيل الكوبون');
      refetch();
    },
    onError: () => {
      toast.error('فشل تفعيل الكوبون');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () => coupons.deactivate(id),
    onSuccess: () => {
      toast.success('تم إلغاء تفعيل الكوبون');
      refetch();
    },
    onError: () => {
      toast.error('فشل إلغاء تفعيل الكوبون');
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

  if (error || !coupon) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">الكوبون غير موجود</h3>
          <p className="text-gray-600 mb-4">لم يتم العثور على بيانات الكوبون</p>
          <button
            onClick={() => navigate('/coupons')}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <ArrowRight size={18} />
            العودة إلى قائمة الكوبونات
          </button>
        </div>
      </div>
    );
  }

  const isExpired = new Date(coupon.validUntil) < new Date();
  const isActive = coupon.isActive && !isExpired;
  const usedCount = coupon.usedCount || 0;
  const usageLimit = coupon.usageLimit || null;
  const usagePercentage = usageLimit ? (usedCount / usageLimit) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/coupons')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowRight size={20} />
          <span>العودة</span>
        </button>
        <div className="flex items-center gap-3">
          {coupon.isActive ? (
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
              navigate('/coupons');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Edit size={18} />
            تعديل
          </button>
          <button
            onClick={() => {
              if (window.confirm(`هل أنت متأكد من حذف الكوبون "${coupon.code}"؟`)) {
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

      {/* Coupon Header Card */}
      <div className="glass-card rounded-2xl p-8 bg-white border border-primary-200">
        <div className="flex items-start gap-6">
          <div className={`w-32 h-32 rounded-2xl border-2 flex items-center justify-center shadow-2xl ${
            coupon.type === 'PERCENTAGE' 
              ? 'bg-blue-50 border-blue-500' 
              : 'bg-green-50 border-green-500'
          }`}>
            {coupon.type === 'PERCENTAGE' ? (
              <Percent className="text-blue-600" size={64} />
            ) : (
              <DollarSign className="text-green-600" size={64} />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl font-bold text-gray-900 font-mono">{coupon.code}</h1>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${
                isActive 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : isExpired
                  ? 'bg-red-100 text-red-700 border-red-200'
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}>
                {isActive ? 'نشط' : isExpired ? 'منتهي' : 'معطل'}
              </span>
            </div>
            <div className="flex items-center gap-6 mb-4">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `${coupon.value} ج.م`}
                </p>
                <p className="text-sm text-gray-500">
                  {coupon.type === 'PERCENTAGE' ? 'خصم نسبة مئوية' : 'خصم مبلغ ثابت'}
                </p>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{usedCount}</p>
                <p className="text-sm text-gray-500">استخدام</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>من {new Date(coupon.validFrom).toLocaleDateString('ar-EG')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>حتى {new Date(coupon.validUntil).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center mx-auto mb-3 ${
            coupon.type === 'PERCENTAGE' 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            {coupon.type === 'PERCENTAGE' ? (
              <Percent className="text-blue-600" size={28} />
            ) : (
              <DollarSign className="text-green-600" size={28} />
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `${coupon.value} ج.م`}
          </p>
          <p className="text-sm text-gray-500">قيمة الخصم</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="text-purple-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{usedCount}</p>
          <p className="text-sm text-gray-500">عدد الاستخدامات</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-3">
            <FileText className="text-gray-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {usageLimit || '∞'}
          </p>
          <p className="text-sm text-gray-500">حد الاستخدام</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center mx-auto mb-3 ${
            isActive 
              ? 'bg-green-50 border-green-200' 
              : isExpired
              ? 'bg-red-50 border-red-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            {isActive ? (
              <CheckCircle className="text-green-600" size={28} />
            ) : isExpired ? (
              <XCircle className="text-red-600" size={28} />
            ) : (
              <Clock className="text-gray-600" size={28} />
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {isActive ? 'نشط' : isExpired ? 'منتهي' : 'معطل'}
          </p>
          <p className="text-sm text-gray-500">الحالة</p>
        </div>
      </div>

      {/* Coupon Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Ticket className="text-primary-600" size={20} />
            معلومات الكوبون
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">كود الكوبون</span>
              <span className="text-sm font-semibold text-gray-900 font-mono">{coupon.code}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">النوع</span>
              <span className="text-sm font-semibold text-gray-900">
                {coupon.type === 'PERCENTAGE' ? 'نسبة مئوية' : 'مبلغ ثابت'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">القيمة</span>
              <span className="text-sm font-semibold text-gray-900">
                {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `${coupon.value} ج.م`}
              </span>
            </div>
            {coupon.minAmount && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">الحد الأدنى للطلب</span>
                <span className="text-sm font-semibold text-gray-900">{coupon.minAmount} ج.م</span>
              </div>
            )}
            {coupon.maxDiscount && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">الحد الأقصى للخصم</span>
                <span className="text-sm font-semibold text-gray-900">{coupon.maxDiscount} ج.م</span>
              </div>
            )}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">الحالة</span>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                isActive 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : isExpired
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}>
                {isActive ? 'نشط' : isExpired ? 'منتهي' : 'معطل'}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="text-primary-600" size={20} />
            معلومات التاريخ والاستخدام
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">معرف الكوبون</span>
              <span className="text-sm font-semibold text-gray-900 font-mono text-xs">{coupon.id}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">صالح من</span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(coupon.validFrom).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">صالح حتى</span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(coupon.validUntil).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">عدد الاستخدامات</span>
              <span className="text-sm font-semibold text-gray-900">{usedCount}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">حد الاستخدام</span>
              <span className="text-sm font-semibold text-gray-900">{usageLimit || '∞'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      {usageLimit && (
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="text-primary-600" size={20} />
            إحصائيات الاستخدام
          </h3>
          <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-6 border border-primary-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary-100 border border-primary-300 flex items-center justify-center">
                  <TrendingUp className="text-primary-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">معدل الاستخدام</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {usedCount} / {usageLimit}
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  usagePercentage > 80 ? 'bg-red-500' : usagePercentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              {usagePercentage.toFixed(1)}% من الحد الأقصى
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponDetails;

