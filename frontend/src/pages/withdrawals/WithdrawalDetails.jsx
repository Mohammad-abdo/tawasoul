import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { withdrawals } from '../../api/admin';
import { 
  ArrowRight, 
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Stethoscope,
  CreditCard,
  Building2,
  Wallet,
  FileText,
  TrendingUp,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { useState } from 'react';

const WithdrawalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { data: withdrawalData, isLoading, error, refetch } = useQuery({
    queryKey: ['withdrawal-details', id],
    queryFn: async () => {
      const response = await withdrawals.getById(id);
      return response.data.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => withdrawals.approve(id),
    onSuccess: () => {
      toast.success('تم الموافقة على طلب السحب');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل الموافقة على طلب السحب');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reason) => withdrawals.reject(id, { reason }),
    onSuccess: () => {
      toast.success('تم رفض طلب السحب');
      setShowRejectModal(false);
      setRejectReason('');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل رفض طلب السحب');
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

  if (error || !withdrawalData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">طلب السحب غير موجود</h3>
          <p className="text-gray-600 mb-4">لم يتم العثور على بيانات طلب السحب</p>
          <button
            onClick={() => navigate('/withdrawals')}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <ArrowRight size={18} />
            العودة إلى قائمة طلبات السحب
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock, label: 'معلق' },
      PROCESSING: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: Clock, label: 'قيد المعالجة' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle, label: 'مكتمل' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: XCircle, label: 'مرفوض' },
    };
    const badge = badges[status] || badges.PENDING;
    const Icon = badge.icon;
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 inline-flex items-center gap-2 ${badge.bg} ${badge.text} ${badge.border}`}>
        <Icon size={18} />
        {badge.label}
      </span>
    );
  };

  const getMethodBadge = (method) => {
    const methods = {
      BANK_ACCOUNT: { label: 'حساب بنكي', icon: Building2, color: 'bg-blue-50 border-blue-200 text-blue-600' },
      E_WALLET: { label: 'محفظة إلكترونية', icon: Wallet, color: 'bg-green-50 border-green-200 text-green-600' },
      PAYPAL: { label: 'PayPal', icon: CreditCard, color: 'bg-purple-50 border-purple-200 text-purple-600' },
      VODAFONE_CASH: { label: 'فودافون كاش', icon: Wallet, color: 'bg-red-50 border-red-200 text-red-600' },
      FAWRY: { label: 'فوري', icon: CreditCard, color: 'bg-orange-50 border-orange-200 text-orange-600' },
      INSTAPAY: { label: 'انستا باي', icon: Wallet, color: 'bg-indigo-50 border-indigo-200 text-indigo-600' },
    };
    const methodConfig = methods[method] || { label: method, icon: CreditCard, color: 'bg-gray-50 border-gray-200 text-gray-600' };
    const Icon = methodConfig.icon;
    return (
      <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center ${methodConfig.color}`}>
        <Icon size={32} />
      </div>
    );
  };

  const handleReject = (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error('يرجى إدخال سبب الرفض');
      return;
    }
    rejectMutation.mutate(rejectReason);
  };

  let accountDetails = {};
  try {
    const rawDetails = withdrawalData.accountDetails;
    if (typeof rawDetails === 'string') {
      // Only parse if it looks like a JSON object or array
      if (rawDetails.trim().startsWith('{') || rawDetails.trim().startsWith('[')) {
        accountDetails = JSON.parse(rawDetails);
      } else {
        // Plain string (like a phone number)
        accountDetails = { 'التفاصيل': rawDetails };
      }
    } else {
      accountDetails = rawDetails || {};
    }
  } catch (e) {
    accountDetails = { 'التفاصيل': withdrawalData.accountDetails };
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/withdrawals')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowRight size={20} />
          <span>العودة</span>
        </button>
        {withdrawalData.status === 'PENDING' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={18} />
              موافقة
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={rejectMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <XCircle size={18} />
              رفض
            </button>
          </div>
        )}
      </div>

      {/* Withdrawal Header Card */}
      <div className="glass-card rounded-2xl p-8 bg-white border border-primary-200">
        <div className="flex items-start gap-6">
          {getMethodBadge(withdrawalData.method)}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl font-bold text-gray-900">طلب السحب</h1>
              {getStatusBadge(withdrawalData.status)}
            </div>
            <div className="flex items-center gap-6 mb-4">
              <div>
                <p className="text-3xl font-bold text-gray-900">{withdrawalData.amount} ج.م</p>
                <p className="text-sm text-gray-500">مبلغ السحب</p>
              </div>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={20} />
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(withdrawalData.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-gray-500">تاريخ الطلب</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-3">
            <DollarSign className="text-green-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{withdrawalData.amount} ج.م</p>
          <p className="text-sm text-gray-500">مبلغ السحب</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center mx-auto mb-3">
            {getMethodBadge(withdrawalData.method)}
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {withdrawalData.method === 'BANK_ACCOUNT' ? 'بنكي' : 
             withdrawalData.method === 'E_WALLET' ? 'محفظة' : 
             withdrawalData.method === 'VODAFONE_CASH' ? 'فودافون كاش' :
             withdrawalData.method === 'FAWRY' ? 'فوري' :
             withdrawalData.method === 'INSTAPAY' ? 'انستا باي' : 'PayPal'}
          </p>
          <p className="text-sm text-gray-500">طريقة السحب</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-3">
            <Calendar className="text-blue-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {new Date(withdrawalData.createdAt).toLocaleDateString('ar-EG', {
              day: 'numeric',
              month: 'short'
            })}
          </p>
          <p className="text-sm text-gray-500">تاريخ الطلب</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center mx-auto mb-3">
            <FileText className="text-purple-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1 font-mono text-xs">
            {withdrawalData.id.substring(0, 8)}...
          </p>
          <p className="text-sm text-gray-500">معرف الطلب</p>
        </div>
      </div>

      {/* Doctor Information */}
      {withdrawalData.doctor && (
        <div className="glass-card rounded-2xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Stethoscope size={24} className="text-primary-600" />
            معلومات الطبيب
          </h3>
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl font-bold">
                {withdrawalData.doctor.name?.charAt(0) || 'D'}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h4 className="text-2xl font-bold text-gray-900">{withdrawalData.doctor.name}</h4>
              </div>
              <p className="text-gray-600 mb-2">{withdrawalData.doctor.email}</p>
              <button
                onClick={() => navigate(`/doctors/${withdrawalData.doctor.id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors w-fit mt-2"
              >
                <Eye size={18} />
                عرض الملف الشخصي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="text-primary-600" size={20} />
            معلومات السحب
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">المبلغ</span>
              <span className="text-sm font-semibold text-gray-900">{withdrawalData.amount} ج.م</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">طريقة السحب</span>
              <span className="text-sm font-semibold text-gray-900">
                {withdrawalData.method === 'BANK_ACCOUNT' ? 'حساب بنكي' : 
                 withdrawalData.method === 'E_WALLET' ? 'محفظة إلكترونية' : 
                 withdrawalData.method === 'VODAFONE_CASH' ? 'فودافون كاش' :
                 withdrawalData.method === 'FAWRY' ? 'فوري' :
                 withdrawalData.method === 'INSTAPAY' ? 'انستا باي' : 'PayPal'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">الحالة</span>
              {getStatusBadge(withdrawalData.status)}
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">معرف الطلب</span>
              <span className="text-sm font-semibold text-gray-900 font-mono text-xs">{withdrawalData.id}</span>
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
              <span className="text-sm text-gray-600">تاريخ الطلب</span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(withdrawalData.createdAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            {withdrawalData.processedAt && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">تاريخ المعالجة</span>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date(withdrawalData.processedAt).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
            {withdrawalData.rejectionReason && (
              <div className="py-2">
                <span className="text-sm text-gray-600 block mb-2">سبب الرفض</span>
                <p className="text-sm font-semibold text-red-600">{withdrawalData.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="glass-card rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="text-primary-600" size={20} />
          تفاصيل الحساب
        </h3>
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          {Object.keys(accountDetails).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(accountDetails).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                  <span className="text-sm font-medium text-gray-600">{key}:</span>
                  <span className="text-sm font-semibold text-gray-900">{String(value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">لا توجد تفاصيل حساب متاحة</p>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
        }}
        title="رفض طلب السحب"
        size="md"
      >
        <form onSubmit={handleReject} className="space-y-4">
          <div>
            <label className="label">سبب الرفض *</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="input min-h-[100px]"
              placeholder="أدخل سبب رفض طلب السحب..."
              required
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={rejectMutation.isPending}
              className="btn-primary flex-1"
            >
              {rejectMutation.isPending ? 'جاري الرفض...' : 'رفض'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
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

export default WithdrawalDetails;

