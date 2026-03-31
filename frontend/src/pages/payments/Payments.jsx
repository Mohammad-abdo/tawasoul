import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CreditCard,
  DollarSign,
  Loader2,
  Wallet as WalletIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { wallet as adminWallet } from '../../api/admin';
import { doctorWallet } from '../../api/doctor';
import { useAuthStore } from '../../store/authStore';

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ج.م`;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

const transactionTypeConfig = {
  EARNING: {
    label: 'إيراد',
    badge: 'bg-green-100 text-green-700 border-green-200',
    icon: ArrowDownLeft,
  },
  WITHDRAWAL: {
    label: 'سحب',
    badge: 'bg-red-100 text-red-700 border-red-200',
    icon: ArrowUpRight,
  },
};

const withdrawalStatusConfig = {
  PENDING: {
    label: 'قيد الانتظار',
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  APPROVED: {
    label: 'تمت الموافقة',
    badge: 'bg-green-100 text-green-700 border-green-200',
  },
  REJECTED: {
    label: 'مرفوض',
    badge: 'bg-red-100 text-red-700 border-red-200',
  },
};

const DoctorWalletView = () => {
  const queryClient = useQueryClient();
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['doctor-wallet'],
    queryFn: async () => {
      const response = await doctorWallet.get();
      return response.data.data;
    },
  });

  const withdrawalMutation = useMutation({
    mutationFn: doctorWallet.requestWithdrawal,
    onSuccess: () => {
      toast.success('تم إرسال طلب السحب بنجاح');
      setWithdrawAmount('');
      queryClient.invalidateQueries({ queryKey: ['doctor-wallet'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل إرسال طلب السحب');
    },
  });

  const handleSubmitWithdrawal = () => {
    const numericAmount = Number(withdrawAmount);
    const currentBalance = Number(data?.balance || 0);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error('يرجى إدخال مبلغ سحب صحيح');
      return;
    }

    if (numericAmount > currentBalance) {
      toast.error('المبلغ المطلوب يتجاوز الرصيد الحالي');
      return;
    }

    withdrawalMutation.mutate({ amount: numericAmount });
  };

  const pendingRequests = data?.withdrawalRequests?.filter((request) => request.status === 'PENDING') || [];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">محفظتي</h2>
        <p className="mt-1 text-sm text-gray-500">تابع رصيدك الحالي وسجل العمليات وطلبات السحب.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="glass-card rounded-2xl border border-gray-200 p-6 lg:col-span-1">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-200 bg-primary-50">
              <WalletIcon className="text-primary-600" size={26} />
            </div>
            <div>
              <p className="text-sm text-gray-500">الرصيد الحالي</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(data?.balance)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-4 text-sm text-yellow-800">
            طلبات السحب المعلقة: <span className="font-bold">{pendingRequests.length}</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-gray-200 p-6 lg:col-span-2">
          <h3 className="mb-4 text-lg font-bold text-gray-900">طلب سحب جديد</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">المبلغ</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={withdrawAmount}
                onChange={(event) => setWithdrawAmount(event.target.value)}
                placeholder="أدخل مبلغ السحب"
                className="input"
              />
              <p className="mt-2 text-xs text-gray-500">
                يتم خصم الرصيد فقط بعد موافقة الإدارة على الطلب.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSubmitWithdrawal}
              disabled={withdrawalMutation.isPending}
              className="btn-primary mt-7 flex items-center justify-center gap-2 px-8"
            >
              {withdrawalMutation.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <CreditCard size={18} />
              )}
              إرسال الطلب
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-gray-200 p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">سجل المعاملات</h3>
        {data?.transactions?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="text-right text-sm text-gray-500">
                  <th className="pb-3 font-semibold">النوع</th>
                  <th className="pb-3 font-semibold">المبلغ</th>
                  <th className="pb-3 font-semibold">الوصف</th>
                  <th className="pb-3 font-semibold">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.transactions.map((transaction) => {
                  const config = transactionTypeConfig[transaction.type] || transactionTypeConfig.EARNING;
                  const Icon = config.icon;

                  return (
                    <tr key={transaction.id}>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${config.badge}`}>
                          <Icon size={14} />
                          {config.label}
                        </span>
                      </td>
                      <td className="py-4 text-sm font-bold text-gray-900">{formatCurrency(transaction.amount)}</td>
                      <td className="py-4 text-sm text-gray-600">{transaction.description || '-'}</td>
                      <td className="py-4 text-sm text-gray-500">{formatDate(transaction.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-500">
            لا توجد معاملات مسجلة بعد.
          </div>
        )}
      </div>
    </div>
  );
};

const AdminWalletView = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('PENDING');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-wallet-withdrawal-requests', statusFilter],
    queryFn: async () => {
      const response = await adminWallet.getWithdrawalRequests({ status: statusFilter });
      return response.data.data;
    },
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, status }) => adminWallet.resolveWithdrawalRequest(id, { status }),
    onSuccess: (_, variables) => {
      toast.success(variables.status === 'APPROVED' ? 'تمت الموافقة على الطلب' : 'تم رفض الطلب');
      queryClient.invalidateQueries({ queryKey: ['admin-wallet-withdrawal-requests'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل تحديث حالة الطلب');
    },
  });

  const requests = data?.requests || [];

  const totals = useMemo(() => {
    return requests.reduce(
      (summary, request) => {
        summary.count += 1;
        summary.amount += Number(request.amount || 0);
        return summary;
      },
      { count: 0, amount: 0 }
    );
  }, [requests]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">طلبات السحب</h2>
        <p className="mt-1 text-sm text-gray-500">راجع طلبات الأطباء ووافق عليها أو ارفضها من هنا.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="glass-card rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">عدد الطلبات</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totals.count}</p>
        </div>
        <div className="glass-card rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">إجمالي المبالغ</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(totals.amount)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {['PENDING', 'APPROVED', 'REJECTED'].map((status) => {
          const config = withdrawalStatusConfig[status];
          const isActive = statusFilter === status;

          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all ${
                isActive
                  ? `${config.badge} shadow-sm`
                  : 'border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:text-primary-700'
              }`}
            >
              {config.label}
            </button>
          );
        })}
      </div>

      <div className="glass-card rounded-2xl border border-gray-200 p-6">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
          </div>
        ) : requests.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="text-right text-sm text-gray-500">
                  <th className="pb-3 font-semibold">الطبيب</th>
                  <th className="pb-3 font-semibold">المبلغ</th>
                  <th className="pb-3 font-semibold">تاريخ الطلب</th>
                  <th className="pb-3 font-semibold">الحالة</th>
                  <th className="pb-3 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((request) => {
                  const config = withdrawalStatusConfig[request.status] || withdrawalStatusConfig.PENDING;

                  return (
                    <tr key={request.id}>
                      <td className="py-4">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{request.doctor?.name || '-'}</p>
                          <p className="text-xs text-gray-500">{request.doctor?.email || '-'}</p>
                        </div>
                      </td>
                      <td className="py-4 text-sm font-bold text-gray-900">{formatCurrency(request.amount)}</td>
                      <td className="py-4 text-sm text-gray-500">{formatDate(request.createdAt)}</td>
                      <td className="py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${config.badge}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="py-4">
                        {request.status === 'PENDING' ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => resolveMutation.mutate({ id: request.id, status: 'APPROVED' })}
                              disabled={resolveMutation.isPending}
                              className="rounded-xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100"
                            >
                              موافقة
                            </button>
                            <button
                              type="button"
                              onClick={() => resolveMutation.mutate({ id: request.id, status: 'REJECTED' })}
                              disabled={resolveMutation.isPending}
                              className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
                            >
                              رفض
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {request.resolvedAt ? `تم الحسم ${formatDate(request.resolvedAt)}` : 'تم الحسم'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-500">
            لا توجد طلبات سحب بهذه الحالة.
          </div>
        )}
      </div>
    </div>
  );
};

const Payments = () => {
  const { role } = useAuthStore();

  return role === 'doctor' ? <DoctorWalletView /> : <AdminWalletView />;
};

export default Payments;
