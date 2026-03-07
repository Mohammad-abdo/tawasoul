import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { payments, withdrawals } from '../../api/admin';
import { doctorAuth, doctorDashboard } from '../../api/doctor';
import { useAuthStore } from '../../store/authStore';
import { DollarSign, TrendingUp, Clock, Calendar, User, Check, X, CreditCard, Wallet, AlertCircle, ArrowDown, ArrowUp, Stethoscope, Plus } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import toast from 'react-hot-toast';

const Payments = () => {
  const { role } = useAuthStore();
  const [activeTab, setActiveTab] = useState('payments');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: paymentsData, isLoading: paymentsLoading, error: paymentsError, refetch: refetchPayments } = useQuery({
    queryKey: [role === 'doctor' ? 'doctor-payments' : 'admin-payments', page],
    queryFn: async () => {
      if (role === 'doctor') {
        // We'll use doctorDashboard stats for now or add a specific payments API
        const response = await doctorDashboard.getStats();
        return { data: { payments: response.data.data.recentBookings || [] } };
      }
      const response = await payments.getAll({ page, limit });
      return response.data;
    },
  });

  const { data: withdrawalsData, isLoading: withdrawalsLoading, error: withdrawalsError, refetch: refetchWithdrawals } = useQuery({
    queryKey: [role === 'doctor' ? 'doctor-withdrawals' : 'admin-withdrawals', page],
    queryFn: async () => {
      if (role === 'doctor') {
        const response = await apiClient.get('/doctor/withdrawals');
        return response.data;
      }
      const response = await withdrawals.getAll({ page, limit });
      return response.data;
    },
  });

  const approveWithdrawalMutation = useMutation({
    mutationFn: (id) => withdrawals.approve(id),
    onSuccess: () => {
      toast.success('تم الموافقة على طلب السحب');
      refetchWithdrawals();
    },
    onError: () => {
      toast.error('فشل الموافقة على طلب السحب');
    },
  });

  const rejectWithdrawalMutation = useMutation({
    mutationFn: (id) => withdrawals.reject(id, { reason: 'رفض من الأدمن' }),
    onSuccess: () => {
      toast.success('تم رفض طلب السحب');
      refetchWithdrawals();
    },
    onError: () => {
      toast.error('فشل رفض طلب السحب');
    },
  });

  const paymentsList = paymentsData?.data?.payments || [];
  const withdrawalsList = withdrawalsData?.data?.withdrawals || [];
  
  const totalPayments = paymentsData?.data?.pagination?.total || paymentsList.length;
  const totalWithdrawals = withdrawalsData?.data?.pagination?.total || withdrawalsList.length;
  
  const completedPayments = paymentsList.filter(p => p.status === 'COMPLETED').length;
  const pendingPayments = paymentsList.filter(p => p.status === 'PENDING').length;
  const failedPayments = paymentsList.filter(p => p.status === 'FAILED').length;
  
  const totalPaymentsAmount = paymentsList.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const totalWithdrawalsAmount = withdrawalsList.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
  
  const pendingWithdrawals = withdrawalsList.filter(w => w.status === 'PENDING').length;
  const completedWithdrawals = withdrawalsList.filter(w => w.status === 'COMPLETED').length;
  const rejectedWithdrawals = withdrawalsList.filter(w => w.status === 'REJECTED').length;

  const paymentColumns = [
    {
      header: 'المبلغ',
      accessor: 'amount',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
            <DollarSign className="text-green-600" size={20} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{row.amount} ج.م</p>
            <p className="text-xs text-gray-500">دفعة</p>
          </div>
        </div>
      )
    },
    {
      header: 'الطبيب',
      accessor: 'doctor',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
            <Stethoscope size={16} className="text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{row.booking?.doctor?.name || row.doctor?.name || '-'}</p>
            <p className="text-xs text-gray-500">{row.booking?.doctor?.specialization || row.doctor?.specialization || ''}</p>
          </div>
        </div>
      )
    },
    {
      header: 'المستخدم',
      accessor: 'user',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
            <span className="text-blue-600 text-sm font-bold">
              {row.booking?.user?.username?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{row.booking?.user?.username || '-'}</p>
            <p className="text-xs text-gray-500">مستخدم</p>
          </div>
        </div>
      )
    },
    {
      header: 'طريقة الدفع',
      accessor: 'method',
      render: (row) => {
        const methodConfig = {
          BANK_ACCOUNT: { label: 'حساب بنكي', icon: CreditCard },
          E_WALLET: { label: 'محفظة إلكترونية', icon: Wallet },
          PAYPAL: { label: 'PayPal', icon: CreditCard },
          VODAFONE_CASH: { label: 'فودافون كاش', icon: Wallet },
          FAWRY: { label: 'فوري', icon: CreditCard },
          INSTAPAY: { label: 'انستا باي', icon: Wallet },
        };
        const config = methodConfig[row.method] || { label: row.method || '-', icon: CreditCard };
        const Icon = config.icon;
        return (
          <div className="flex items-center gap-2">
            <Icon size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-900">{config.label}</span>
          </div>
        );
      }
    },
    {
      header: 'الحالة',
      accessor: 'status',
      sortable: true,
      render: (row) => {
        const statusConfig = {
          COMPLETED: { label: 'مكتمل', color: 'bg-green-100 text-green-700 border-green-200' },
          PENDING: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
          FAILED: { label: 'فشل', color: 'bg-red-100 text-red-700 border-red-200' },
          REFUNDED: { label: 'مسترد', color: 'bg-blue-100 text-blue-700 border-blue-200' },
        };
        const config = statusConfig[row.status] || statusConfig.PENDING;
        return (
          <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${config.color}`}>
            {config.label}
          </span>
        );
      }
    },
    {
      header: 'تاريخ الدفع',
      accessor: 'createdAt',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {row.createdAt ? new Date(row.createdAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : '-'}
            </p>
            <p className="text-xs text-gray-500">
              {row.createdAt ? new Date(row.createdAt).toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit'
              }) : ''}
            </p>
          </div>
        </div>
      )
    },
  ];

  const withdrawalColumns = [
    {
      header: 'المبلغ',
      accessor: 'amount',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
            <TrendingUp className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{row.amount} ج.م</p>
            <p className="text-xs text-gray-500">سحب</p>
          </div>
        </div>
      )
    },
    {
      header: 'الطبيب',
      accessor: 'doctor',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
            <span className="text-primary-600 text-sm font-bold">
              {row.doctor?.name?.charAt(0) || 'D'}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{row.doctor?.name || '-'}</p>
            <p className="text-xs text-gray-500">{row.doctor?.specialization || ''}</p>
          </div>
        </div>
      )
    },
    {
      header: 'طريقة السحب',
      accessor: 'method',
      render: (row) => {
        const methodConfig = {
          BANK_ACCOUNT: { label: 'حساب بنكي', icon: CreditCard },
          E_WALLET: { label: 'محفظة إلكترونية', icon: Wallet },
          PAYPAL: { label: 'PayPal', icon: CreditCard },
          VODAFONE_CASH: { label: 'فودافون كاش', icon: Wallet },
          FAWRY: { label: 'فوري', icon: CreditCard },
          INSTAPAY: { label: 'انستا باي', icon: Wallet },
        };
        const config = methodConfig[row.method] || { label: row.method || '-', icon: CreditCard };
        const Icon = config.icon;
        return (
          <div className="flex items-center gap-2">
            <Icon size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-900">{config.label}</span>
          </div>
        );
      }
    },
    {
      header: 'الحالة',
      accessor: 'status',
      sortable: true,
      render: (row) => {
        const statusConfig = {
          COMPLETED: { label: 'مكتمل', color: 'bg-green-100 text-green-700 border-green-200' },
          PENDING: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
          PROCESSING: { label: 'قيد المعالجة', color: 'bg-blue-100 text-blue-700 border-blue-200' },
          REJECTED: { label: 'مرفوض', color: 'bg-red-100 text-red-700 border-red-200' },
        };
        const config = statusConfig[row.status] || statusConfig.PENDING;
        return (
          <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${config.color}`}>
            {config.label}
          </span>
        );
      }
    },
    {
      header: 'تاريخ الطلب',
      accessor: 'createdAt',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {row.createdAt ? new Date(row.createdAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : '-'}
            </p>
            <p className="text-xs text-gray-500">
              {row.createdAt ? new Date(row.createdAt).toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit'
              }) : ''}
            </p>
          </div>
        </div>
      )
    },
  ];

  const withdrawalActions = [
    {
      label: 'موافقة',
      icon: Check,
      onClick: (row) => {
        if (window.confirm(`هل أنت متأكد من الموافقة على طلب السحب بقيمة ${row.amount} ج.م؟`)) {
          approveWithdrawalMutation.mutate(row.id);
        }
      },
      className: 'text-green-600 hover:bg-green-50',
      show: (row) => role !== 'doctor' && row.status === 'PENDING',
    },
    {
      label: 'رفض',
      icon: X,
      onClick: (row) => {
        if (window.confirm(`هل أنت متأكد من رفض طلب السحب بقيمة ${row.amount} ج.م؟`)) {
          rejectWithdrawalMutation.mutate(row.id);
        }
      },
      className: 'text-red-600 hover:bg-red-50',
      show: (row) => role !== 'doctor' && row.status === 'PENDING',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {role === 'doctor' ? 'أرباحي وسحوباتي' : 'المدفوعات والسحوبات'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {role === 'doctor' ? 'متابعة أرباح الجلسات وطلبات السحب' : 'إدارة جميع المعاملات المالية'}
          </p>
        </div>
        {role === 'doctor' && (
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            طلب سحب أرباح
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-6 py-3 font-semibold transition-colors relative ${
            activeTab === 'payments' 
              ? 'text-primary-600' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          المدفوعات
          {activeTab === 'payments' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-6 py-3 font-semibold transition-colors relative ${
            activeTab === 'withdrawals' 
              ? 'text-primary-600' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          طلبات السحب
          {activeTab === 'withdrawals' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></span>
          )}
        </button>
      </div>

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="glass-card rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
                  <CreditCard className="text-primary-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalPayments}</p>
                  <p className="text-xs text-gray-500">إجمالي المدفوعات</p>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
                  <Check className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{completedPayments}</p>
                  <p className="text-xs text-gray-500">مكتملة</p>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-center">
                  <Clock className="text-yellow-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pendingPayments}</p>
                  <p className="text-xs text-gray-500">معلقة</p>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
                  <X className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{failedPayments}</p>
                  <p className="text-xs text-gray-500">فاشلة</p>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <DollarSign className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalPaymentsAmount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">إجمالي المبلغ (ج.م)</p>
                </div>
              </div>
            </div>
          </div>

          <DataTable
            data={paymentsList}
            columns={paymentColumns}
            isLoading={paymentsLoading}
            searchable={true}
            filterable={true}
            exportable={true}
            pagination={true}
            pageSize={limit}
            emptyMessage="لا توجد مدفوعات"
            title="قائمة المدفوعات"
            filters={[
              {
                key: 'status',
                label: 'الحالة',
                type: 'select',
                options: [
                  { value: 'PENDING', label: 'معلق' },
                  { value: 'COMPLETED', label: 'مكتمل' },
                  { value: 'FAILED', label: 'فاشل' },
                  { value: 'REFUNDED', label: 'مسترد' }
                ]
              },
              {
                key: 'method',
                label: 'طريقة الدفع',
                type: 'select',
                options: [
                  { value: 'BANK_ACCOUNT', label: 'حساب بنكي' },
                  { value: 'E_WALLET', label: 'محفظة إلكترونية' },
                  { value: 'PAYPAL', label: 'PayPal' },
                  { value: 'VODAFONE_CASH', label: 'فودافون كاش' },
                  { value: 'FAWRY', label: 'فوري' },
                  { value: 'INSTAPAY', label: 'انستا باي' }
                ]
              },
              {
                key: 'amount',
                label: 'المبلغ',
                type: 'numberRange'
              },
              {
                key: 'createdAt',
                label: 'تاريخ الدفع',
                type: 'dateRange'
              }
            ]}
          />
        </>
      )}

      {/* Withdrawals Tab */}
      {activeTab === 'withdrawals' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="glass-card rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
                  <ArrowUp className="text-primary-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalWithdrawals}</p>
                  <p className="text-xs text-gray-500">إجمالي الطلبات</p>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-center">
                  <Clock className="text-yellow-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pendingWithdrawals}</p>
                  <p className="text-xs text-gray-500">معلقة</p>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
                  <Check className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{completedWithdrawals}</p>
                  <p className="text-xs text-gray-500">مكتملة</p>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
                  <X className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{rejectedWithdrawals}</p>
                  <p className="text-xs text-gray-500">مرفوضة</p>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <DollarSign className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalWithdrawalsAmount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">إجمالي المبلغ (ج.م)</p>
                </div>
              </div>
            </div>
          </div>

          <DataTable
            data={withdrawalsList}
            columns={withdrawalColumns}
            isLoading={withdrawalsLoading}
            searchable={true}
            filterable={true}
            exportable={true}
            pagination={true}
            pageSize={limit}
            emptyMessage="لا توجد طلبات سحب"
            title="قائمة طلبات السحب"
            actions={withdrawalActions}
            filters={[
              {
                key: 'status',
                label: 'الحالة',
                type: 'select',
                options: [
                  { value: 'PENDING', label: 'معلق' },
                  { value: 'PROCESSING', label: 'قيد المعالجة' },
                  { value: 'COMPLETED', label: 'مكتمل' },
                  { value: 'REJECTED', label: 'مرفوض' }
                ]
              },
              {
                key: 'method',
                label: 'طريقة السحب',
                type: 'select',
                options: [
                  { value: 'BANK_ACCOUNT', label: 'حساب بنكي' },
                  { value: 'E_WALLET', label: 'محفظة إلكترونية' },
                  { value: 'PAYPAL', label: 'PayPal' },
                  { value: 'VODAFONE_CASH', label: 'فودافون كاش' },
                  { value: 'FAWRY', label: 'فوري' },
                  { value: 'INSTAPAY', label: 'انستا باي' }
                ]
              },
              {
                key: 'amount',
                label: 'المبلغ',
                type: 'numberRange'
              },
              {
                key: 'createdAt',
                label: 'تاريخ الطلب',
                type: 'dateRange'
              }
            ]}
          />
        </>
      )}
    </div>
  );
};

export default Payments;
