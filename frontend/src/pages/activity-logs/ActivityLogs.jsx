import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Calendar, 
  User, 
  Activity, 
  Search,
  Eye,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Shield
} from 'lucide-react';
import { activityLogs } from '../../api/admin';
import DataTable from '../../components/common/DataTable';
import toast from 'react-hot-toast';

const ActivityLogs = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['activity-logs', page],
    queryFn: async () => {
      const response = await activityLogs.getAll({ page, limit });
      return response.data;
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['activity-logs-stats'],
    queryFn: async () => {
      const response = await activityLogs.getStats();
      return response.data;
    },
  });

  const handleExport = async () => {
    try {
      const response = await activityLogs.export({ format: 'CSV' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-logs-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('تم تصدير السجل بنجاح');
    } catch (error) {
      toast.error('فشل تصدير السجل');
    }
  };

  if (isLoading && !data) {
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

  const logsList = data?.data?.logs || data?.logs || [];
  const total = data?.data?.pagination?.total || data?.pagination?.total || logsList.length;
  const stats = statsData || {};
  
  // Calculate stats from logs if stats API not available
  const createCount = logsList.filter(log => log.action === 'CREATE').length;
  const updateCount = logsList.filter(log => log.action === 'UPDATE').length;
  const deleteCount = logsList.filter(log => log.action === 'DELETE').length;
  const approveCount = logsList.filter(log => log.action === 'APPROVE').length;
  const rejectCount = logsList.filter(log => log.action === 'REJECT').length;

  const columns = [
    {
      header: 'الإجراء',
      accessor: 'action',
      sortable: true,
      render: (row) => {
        const actionConfig = {
          CREATE: { label: 'إنشاء', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
          UPDATE: { label: 'تحديث', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Edit },
          DELETE: { label: 'حذف', color: 'bg-red-100 text-red-700 border-red-200', icon: Trash2 },
          APPROVE: { label: 'موافقة', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
          REJECT: { label: 'رفض', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
        };
        const config = actionConfig[row.action] || { 
          label: row.action, 
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: Activity
        };
        const Icon = config.icon;
        return (
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${config.color}`}>
              <Icon size={18} />
            </div>
            <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${config.color}`}>
              {config.label}
            </span>
          </div>
        );
      },
    },
    {
      header: 'النوع',
      accessor: 'entityType',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
            <FileText className="text-primary-600" size={18} />
          </div>
          <span className="text-sm font-medium text-gray-900">{row.entityType || '-'}</span>
        </div>
      ),
    },
    {
      header: 'الأدمن',
      accessor: 'admin',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
            <span className="text-white text-sm font-bold">
              {row.admin?.name?.charAt(0) || 'A'}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{row.admin?.name || '-'}</p>
            <p className="text-xs text-gray-500">{row.admin?.email || ''}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'الوصف',
      accessor: 'description',
      render: (row) => (
        <span className="text-sm text-gray-600 max-w-md truncate block">
          {row.description || '-'}
        </span>
      ),
    },
    {
      header: 'التاريخ',
      accessor: 'createdAt',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {new Date(row.createdAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(row.createdAt).toLocaleTimeString('ar-EG', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>
      ),
    },
  ];

  const actions = [
    {
      label: 'عرض التفاصيل',
      icon: Eye,
      onClick: (row) => {
        navigate(`/activity-logs/${row.id}`);
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
          <h2 className="text-2xl font-bold text-gray-900">سجل الأنشطة</h2>
          <p className="text-sm text-gray-500 mt-1">تتبع جميع الأنشطة والإجراءات في النظام</p>
        </div>
        <button
          onClick={handleExport}
          className="btn-primary flex items-center gap-2"
        >
          <Download size={20} />
          تصدير السجل
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
              <Activity className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-xs text-gray-500">إجمالي السجلات</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{createCount + approveCount}</p>
              <p className="text-xs text-gray-500">إنشاء/موافقة</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Edit className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{updateCount}</p>
              <p className="text-xs text-gray-500">تحديثات</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
              <Trash2 className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{deleteCount + rejectCount}</p>
              <p className="text-xs text-gray-500">حذف/رفض</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center">
              <Shield className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {logsList.filter(log => log.admin).length}
              </p>
              <p className="text-xs text-gray-500">أنشطة أدمن</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={logsList}
        columns={columns}
        isLoading={isLoading}
        searchable={true}
        filterable={true}
        exportable={true}
        pagination={true}
        pageSize={limit}
        emptyMessage="لا يوجد سجل أنشطة"
        title="قائمة سجل الأنشطة"
        actions={actions}
        filters={[
          {
            key: 'action',
            label: 'الإجراء',
            type: 'select',
            options: [
              { value: 'CREATE', label: 'إنشاء' },
              { value: 'UPDATE', label: 'تحديث' },
              { value: 'DELETE', label: 'حذف' },
              { value: 'APPROVE', label: 'موافقة' },
              { value: 'REJECT', label: 'رفض' }
            ]
          },
          {
            key: 'entityType',
            label: 'نوع الكيان',
            type: 'select',
            options: [
              { value: 'User', label: 'مستخدم' },
              { value: 'Doctor', label: 'طبيب' },
              { value: 'Post', label: 'منشور' },
              { value: 'Booking', label: 'حجز' },
              { value: 'Payment', label: 'دفع' },
              { value: 'Withdrawal', label: 'سحب' }
            ]
          },
          {
            key: 'createdAt',
            label: 'التاريخ',
            type: 'dateRange'
          }
        ]}
      />
    </div>
  );
};

export default ActivityLogs;
