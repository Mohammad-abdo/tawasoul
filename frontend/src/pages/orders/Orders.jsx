import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Eye, Ticket, AlertCircle } from 'lucide-react';
import { orders } from '../../api/admin';
import DataTable from '../../components/common/DataTable';

const Orders = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['orders', page],
    queryFn: async () => {
      const response = await orders.getAll({ page, limit });
      return response.data;
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

  const ordersList = data?.data?.orders || [];
  const total = data?.data?.pagination?.total || ordersList.length;

  const columns = [
    {
      header: 'الطلب',
      accessor: 'id',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">#{row.id.substring(0, 8)}</p>
          <p className="text-xs text-gray-500">{row.user?.fullName || 'مستخدم'}</p>
        </div>
      )
    },
    {
      header: 'المبلغ',
      accessor: 'totalAmount',
      render: (row) => (
        <span className="text-lg font-bold text-primary-600">{row.totalAmount} ج.م</span>
      )
    },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (row) => {
        const statusMap = {
          PENDING: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
          CONFIRMED: { label: 'مؤكد', color: 'bg-blue-100 text-blue-700 border-blue-200' },
          PROCESSING: { label: 'قيد المعالجة', color: 'bg-purple-100 text-purple-700 border-purple-200' },
          SHIPPED: { label: 'تم الشحن', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
          DELIVERED: { label: 'تم التسليم', color: 'bg-green-100 text-green-700 border-green-200' },
          CANCELLED: { label: 'ملغي', color: 'bg-red-100 text-red-700 border-red-200' }
        };
        const status = statusMap[row.status] || { label: row.status, color: 'bg-gray-100 text-gray-700 border-gray-200' };
        return (
          <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${status.color}`}>
            {status.label}
          </span>
        );
      }
    },
    {
      header: 'عدد المنتجات',
      accessor: 'items',
      render: (row) => (
        <span className="text-gray-700">{row.items?.length || 0} منتج</span>
      )
    },
  ];

  const actions = [
    {
      label: 'عرض التفاصيل',
      icon: Eye,
      onClick: (row) => navigate(`/orders/${row.id}`),
      className: 'text-primary-600 hover:bg-primary-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">الطلبات</h1>
            <p className="text-gray-600">إدارة طلبات المتجر</p>
          </div>
        </div>

        <DataTable
          data={ordersList}
          columns={columns}
          actions={actions}
          pagination={{
            page,
            limit,
            total,
            onPageChange: setPage
          }}
        />
      </div>
    </div>
  );
};

export default Orders;

