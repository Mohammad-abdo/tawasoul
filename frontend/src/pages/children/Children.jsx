import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, Baby, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { children } from '../../api/admin';
import DataTable from '../../components/common/DataTable';

const Children = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['children', page],
    queryFn: async () => {
      const response = await children.getAll({ page, limit });
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: children.delete,
    onSuccess: () => {
      toast.success('تم حذف ملف الطفل بنجاح');
      refetch();
    },
    onError: () => {
      toast.error('فشل حذف ملف الطفل');
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
          <button onClick={() => refetch()} className="btn-primary">
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const childrenList = data?.data?.children || [];
  const total = data?.data?.pagination?.total || childrenList.length;

  const columns = [
    {
      header: 'الطفل',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
            <Baby className="text-white" size={24} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{row.name || 'بدون اسم'}</p>
            <p className="text-xs text-gray-500">{row.user?.fullName || 'مستخدم'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (row) => {
        const statusMap = {
          AUTISM: { label: 'توحد', color: 'bg-blue-100 text-blue-700 border-blue-200' },
          SPEECH_DISORDER: { label: 'تخاطب', color: 'bg-purple-100 text-purple-700 border-purple-200' }
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
      header: 'الفئة العمرية',
      accessor: 'ageGroup',
      render: (row) => {
        const ageMap = {
          UNDER_4: 'أقل من 4 سنوات',
          '5_TO_15': 'من 5 إلى 15 سنة',
          OVER_15: 'أكبر من 15 سنة'
        };
        return <span className="text-sm text-gray-700">{ageMap[row.ageGroup] || row.ageGroup}</span>;
      }
    },
    {
      header: 'تاريخ الإنشاء',
      accessor: 'createdAt',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <span className="text-sm text-gray-700">
            {new Date(row.createdAt).toLocaleDateString('ar-EG')}
          </span>
        </div>
      )
    },
  ];

  const actions = [
    {
      label: 'عرض التفاصيل',
      icon: Eye,
      onClick: (row) => navigate(`/children/${row.id}`),
      className: 'text-primary-600 hover:bg-primary-50',
    },
    {
      label: 'حذف',
      icon: Trash2,
      onClick: (row) => {
        if (window.confirm(`هل أنت متأكد من حذف ملف الطفل "${row.name}"؟`)) {
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">ملفات الأطفال</h1>
            <p className="text-gray-600">إدارة ملفات الأطفال المسجلة في النظام</p>
          </div>
        </div>

        <DataTable
          data={childrenList}
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

export default Children;

