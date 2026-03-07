import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DollarSign, CheckCircle, XCircle, Clock, Eye, Calendar, Stethoscope, TrendingUp, CreditCard, Building2, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { withdrawals } from '../../api/admin';
import DataTable from '../../components/common/DataTable';

const Withdrawals = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['withdrawals', page],
    queryFn: async () => {
      const response = await withdrawals.getAll({ page, limit });
      return response.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id) => withdrawals.approve(id),
    onSuccess: () => {
      toast.success('تم الموافقة على طلب السحب');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل الموافقة على طلب السحب');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => withdrawals.reject(id, { reason }),
    onSuccess: () => {
      toast.success('تم رفض طلب السحب');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل رفض طلب السحب');
    },
  });

  const withdrawalsList = data?.data?.withdrawals || [];
  const total = data?.data?.pagination?.total || withdrawalsList.length;
  const pendingCount = withdrawalsList.filter(w => w.status === 'PENDING').length;
  const completedCount = withdrawalsList.filter(w => w.status === 'COMPLETED').length;
  const rejectedCount = withdrawalsList.filter(w => w.status === 'REJECTED').length;
  const totalAmount = withdrawalsList.reduce((sum, w) => sum + (w.amount || 0), 0);

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
      <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border inline-flex items-center gap-1 ${badge.bg} ${badge.text} ${badge.border}`}>
        <Icon size={14} />
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
      <div className="flex items-center gap-2">
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${methodConfig.color}`}>
          <Icon size={18} />
        </div>
        <span className="text-sm font-medium text-gray-900">{methodConfig.label}</span>
      </div>
    );
  };

  const columns = [
    {
      header: 'الطبيب',
      accessor: 'doctor',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
            <span className="text-white text-lg font-bold">
              {row.doctor?.name?.charAt(0) || 'D'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{row.doctor?.name || 'غير معروف'}</p>
            <p className="text-xs text-gray-500">{row.doctor?.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'المبلغ',
      accessor: 'amount',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
            <DollarSign className="text-green-600" size={18} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{row.amount} ج.م</p>
            <p className="text-xs text-gray-500">مبلغ السحب</p>
          </div>
        </div>
      )
    },
    {
      header: 'طريقة السحب',
      accessor: 'method',
      render: (row) => getMethodBadge(row.method)
    },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (row) => getStatusBadge(row.status)
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
              {new Date(row.createdAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(row.createdAt).toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      )
    },
  ];

  const actions = [
    {
      label: 'عرض التفاصيل',
      icon: Eye,
      onClick: (row) => {
        navigate(`/withdrawals/${row.id}`);
      },
      className: 'text-primary-600 hover:bg-primary-50',
      show: () => true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">طلبات السحب</h2>
          <p className="text-sm text-gray-500 mt-1">إدارة طلبات سحب الأطباء</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
              <DollarSign className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
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
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-xs text-gray-500">معلق</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
              <p className="text-xs text-gray-500">مكتمل</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalAmount.toLocaleString()} ج.م</p>
              <p className="text-xs text-gray-500">إجمالي المبلغ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={withdrawalsList}
        columns={columns}
        isLoading={isLoading}
        searchable={true}
        filterable={true}
        exportable={true}
        pagination={true}
        pageSize={limit}
        emptyMessage="لا توجد طلبات سحب"
        title="قائمة طلبات السحب"
        actions={actions}
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
    </div>
  );
};

export default Withdrawals;
