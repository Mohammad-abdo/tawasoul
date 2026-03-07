import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Layers, Check, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { packages } from '../../api/admin';
import DataTable from '../../components/common/DataTable';

const Packages = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['packages', page],
    queryFn: async () => {
      const response = await packages.getAll({ page, limit });
      return response.data;
    },
  });

  const activateMutation = useMutation({
    mutationFn: packages.activate,
    onSuccess: () => {
      toast.success('تم تفعيل الباقة');
      refetch();
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: packages.deactivate,
    onSuccess: () => {
      toast.success('تم تعطيل الباقة');
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: packages.delete,
    onSuccess: () => {
      toast.success('تم حذف الباقة');
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

  const packagesList = data?.data?.packages || [];
  const total = data?.data?.pagination?.total || packagesList.length;

  const columns = [
    {
      header: 'الباقة',
      accessor: 'name',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.nameAr || row.name}</p>
          <p className="text-xs text-gray-500">{row.descriptionAr || row.description || ''}</p>
        </div>
      )
    },
    {
      header: 'السعر',
      accessor: 'price',
      render: (row) => (
        <span className="text-lg font-bold text-primary-600">{row.price} ج.م</span>
      )
    },
    {
      header: 'الجلسات',
      accessor: 'sessionsCount',
      render: (row) => (
        <span className="text-gray-700">{row.sessionsCount} جلسة</span>
      )
    },
    {
      header: 'الحالة',
      accessor: 'isActive',
      render: (row) => (
        <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${
          row.isActive 
            ? 'bg-green-100 text-green-700 border-green-200' 
            : 'bg-gray-100 text-gray-700 border-gray-200'
        }`}>
          {row.isActive ? 'نشط' : 'معطل'}
        </span>
      )
    },
  ];

  const actions = [
    {
      label: 'عرض',
      icon: Eye,
      onClick: (row) => navigate(`/packages/${row.id}`),
      className: 'text-primary-600 hover:bg-primary-50',
    },
    {
      label: (row) => row.isActive ? 'تعطيل' : 'تفعيل',
      icon: (row) => row.isActive ? X : Check,
      onClick: (row) => {
        if (row.isActive) {
          deactivateMutation.mutate(row.id);
        } else {
          activateMutation.mutate(row.id);
        }
      },
      className: (row) => row.isActive 
        ? 'text-orange-600 hover:bg-orange-50' 
        : 'text-green-600 hover:bg-green-50',
    },
    {
      label: 'حذف',
      icon: Trash2,
      onClick: (row) => {
        if (window.confirm(`هل أنت متأكد من حذف الباقة "${row.nameAr || row.name}"؟`)) {
          deleteMutation.mutate(row.id);
        }
      },
      className: 'text-red-600 hover:bg-red-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">الباقات</h1>
            <p className="text-gray-600">إدارة باقات العلاج المتاحة</p>
          </div>
        </div>

        <DataTable
          data={packagesList}
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

export default Packages;

