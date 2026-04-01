import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { bookings } from '../../api/admin';
import { doctorBookings } from '../../api/doctor';
import { useAuthStore } from '../../store/authStore';
import { Calendar, User, Clock, DollarSign, Stethoscope, Edit, Trash2, Eye, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import toast from 'react-hot-toast';

const Bookings = () => {
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [role === 'doctor' ? 'doctor-bookings' : 'admin-bookings', page],
    queryFn: async () => {
      if (role === 'doctor') {
        const response = await doctorBookings.getAll({ page, limit });
        return response.data;
      }
      const response = await bookings.getAll({ page, limit });
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: bookings.delete,
    onSuccess: () => {
      toast.success('تم حذف الحجز بنجاح');
      refetch();
    },
    onError: () => {
      toast.error('فشل حذف الحجز');
    },
  });

  const confirmMutation = useMutation({
    mutationFn: doctorBookings.confirm,
    onSuccess: () => {
      toast.success('تم تأكيد الحجز بنجاح');
      refetch();
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => doctorBookings.cancel(id, reason),
    onSuccess: () => {
      toast.success('تم إلغاء الحجز بنجاح');
      refetch();
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <p className="text-red-600 mb-4">خطأ في تحميل البيانات</p>
          <p className="text-gray-500 text-sm mb-4">{error.message}</p>
          <button onClick={() => refetch()} className="btn-primary">
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const bookingsList = data?.data?.bookings || [];
  const total = data?.data?.pagination?.total || bookingsList.length;
  const completedCount = bookingsList.filter(b => b.status === 'COMPLETED').length;
  const confirmedCount = bookingsList.filter(b => b.status === 'CONFIRMED').length;
  const pendingCount = bookingsList.filter(b => b.status === 'PENDING').length;
  const cancelledCount = bookingsList.filter(b => b.status === 'CANCELLED').length;
  const totalRevenue = bookingsList
    .filter(b => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0);

  const columns = [
    {
      header: 'الحجز',
      accessor: 'id',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
            <Calendar className="text-white" size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">حجز #{row.id.substring(0, 8)}</p>
            <p className="text-xs text-gray-500">{row.sessionType === 'VIDEO' ? 'فيديو' : row.sessionType === 'AUDIO' ? 'صوتي' : 'نصي'}</p>
          </div>
        </div>
      )
    },
    ...(role !== 'doctor' ? [{
      header: 'الطبيب',
      accessor: 'doctor',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
            <Stethoscope size={16} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{row.doctor?.name || '-'}</p>
            <p className="text-xs text-gray-500">{row.doctor?.specialization || ''}</p>
          </div>
        </div>
      )
    }] : []),
    {
      header: 'المستخدم',
      accessor: 'user',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
            <span className="text-blue-600 text-sm font-bold">
              {row.user?.username?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{row.user?.username || 'مجهول'}</p>
            <p className="text-xs text-gray-500">مستخدم</p>
          </div>
        </div>
      )
    },
    {
      header: 'التاريخ والوقت',
      accessor: 'scheduledAt',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {new Date(row.scheduledAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(row.scheduledAt).toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      )
    },
    // {
    //   header: 'المبلغ',
    //   accessor: 'price',
    //   sortable: true,
    //   render: (row) => (
    //     <div className="flex items-center gap-2">
    //       <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
    //         <DollarSign size={16} className="text-green-600" />
    //       </div>
    //       <div>
    //         <p className="text-lg font-bold text-gray-900">{row.price} ج.م</p>
    //         <p className="text-xs text-gray-500">{row.duration} دقيقة</p>
    //       </div>
    //     </div>
    //   )
    // },
    {
      header: 'الحالة',
      accessor: 'status',
      sortable: true,
      render: (row) => {
        const statusConfig = {
          COMPLETED: { label: 'مكتملة', color: 'bg-green-100 text-green-700 border-green-200' },
          CONFIRMED: { label: 'مؤكدة', color: 'bg-blue-100 text-blue-700 border-blue-200' },
          PENDING: { label: 'بانتظار', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
          CANCELLED: { label: 'ملغاة', color: 'bg-red-100 text-red-700 border-red-200' },
        };
        const config = statusConfig[row.status] || statusConfig.PENDING;
        return (
          <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${config.color}`}>
            {config.label}
          </span>
        );
      }
    },
  ];

  const actions = [
    {
      label: 'عرض التفاصيل',
      icon: Eye,
      onClick: (row) => {
        navigate(`/bookings/${row.id}`);
      },
      className: 'text-primary-600 hover:bg-primary-50',
      show: () => true,
    },
    {
      label: 'حذف',
      icon: Trash2,
      onClick: (row) => {
        if (window.confirm(`هل أنت متأكد من حذف الحجز #${row.id.substring(0, 8)}؟`)) {
          deleteMutation.mutate(row.id);
        }
      },
      className: 'text-red-600 hover:bg-red-50',
      show: () => role !== 'doctor',
    },
    {
      label: 'تأكيد الحجز',
      icon: CheckCircle,
      onClick: (row) => {
        if (window.confirm('هل أنت متأكد من تأكيد هذا الحجز؟')) {
          confirmMutation.mutate(row.id);
        }
      },
      className: 'text-green-600 hover:bg-green-50',
      show: (row) => role === 'doctor' && row.status === 'PENDING',
    },
    {
      label: 'إلغاء الحجز',
      icon: XCircle,
      onClick: (row) => {
        const reason = window.prompt('سبب الإلغاء:');
        if (reason) {
          cancelMutation.mutate({ id: row.id, reason });
        }
      },
      className: 'text-red-600 hover:bg-red-50',
      show: (row) => role === 'doctor' && (row.status === 'PENDING' || row.status === 'CONFIRMED'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الحجوزات</h2>
          <p className="text-sm text-gray-500 mt-1">إدارة جميع الحجوزات في النظام</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
              <Calendar className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-xs text-gray-500">إجمالي الحجوزات</p>
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
              <p className="text-xs text-gray-500">مكتملة</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
              <CheckCircle className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{confirmedCount}</p>
              <p className="text-xs text-gray-500">مؤكدة</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-center">
              <AlertCircle className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-xs text-gray-500">معلقة</p>
            </div>
          </div>
        </div>
        {/* <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-gray-500">إجمالي الإيرادات (ج.م)</p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Data Table */}
      <DataTable
        data={bookingsList}
        columns={columns}
        isLoading={isLoading}
        searchable={true}
        filterable={true}
        exportable={true}
        pagination={true}
        pageSize={limit}
        emptyMessage="لا توجد حجوزات"
        title="قائمة الحجوزات"
        actions={actions}
        filters={[
          {
            key: 'status',
            label: 'الحالة',
            type: 'select',
            options: [
              { value: 'PENDING', label: 'معلق' },
              { value: 'CONFIRMED', label: 'مؤكد' },
              { value: 'COMPLETED', label: 'مكتمل' },
              { value: 'CANCELLED', label: 'ملغي' }
            ]
          },
          {
            key: 'sessionType',
            label: 'نوع الجلسة',
            type: 'select',
            options: [
              { value: 'VIDEO', label: 'فيديو' },
              { value: 'AUDIO', label: 'صوتي' },
              { value: 'TEXT', label: 'نصي' }
            ]
          },
          // {
          //   key: 'price',
          //   label: 'السعر',
          //   type: 'numberRange'
          // },
          {
            key: 'scheduledAt',
            label: 'تاريخ الحجز',
            type: 'dateRange'
          }
        ]}
      />
    </div>
  );
};

export default Bookings;
