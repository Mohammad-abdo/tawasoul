import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { reports } from '../../api/admin';
import { FileBarChart, Download, Plus, Loader2, Eye, Trash2, Calendar, User, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const Reports = () => {
  const navigate = useNavigate();
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-reports', page],
    queryFn: async () => {
      const response = await reports.getAll({ page, limit });
      return response.data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: reports.generate,
    onSuccess: () => {
      toast.success('تم بدء إنشاء التقرير');
      setShowGenerateModal(false);
      refetch();
    },
    onError: () => {
      toast.error('فشل إنشاء التقرير');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: reports.delete,
    onSuccess: () => {
      toast.success('تم حذف التقرير');
      refetch();
    },
    onError: () => {
      toast.error('فشل حذف التقرير');
    },
  });

  const reportsList = data?.data?.reports || [];

  const columns = [
    {
      header: 'اسم التقرير',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 border border-primary-200 flex items-center justify-center">
            <FileBarChart className="text-primary-600" size={20} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{row.name}</p>
            {row.description && (
              <p className="text-xs text-gray-500 line-clamp-1">{row.description}</p>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'النوع',
      accessor: 'type',
      render: (row) => (
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
          {row.type}
        </span>
      )
    },
    {
      header: 'الصيغة',
      accessor: 'format',
      render: (row) => (
        <span className="px-3 py-1 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg text-sm font-medium">
          {row.format}
        </span>
      )
    },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (row) => {
        const statusConfig = {
          COMPLETED: { label: 'مكتمل', color: 'bg-green-100 text-green-700 border-green-200' },
          PROCESSING: { label: 'قيد المعالجة', color: 'bg-blue-100 text-blue-700 border-blue-200' },
          PENDING: { label: 'معلق', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
          FAILED: { label: 'فاشل', color: 'bg-red-100 text-red-700 border-red-200' },
        };
        const config = statusConfig[row.status] || { label: row.status, color: 'bg-gray-100 text-gray-700 border-gray-200' };
        return (
          <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${config.color}`}>
            {config.label}
          </span>
        );
      }
    },
    {
      header: 'تم الإنشاء بواسطة',
      accessor: 'generatedByAdmin',
      render: (row) => (
        <div className="flex items-center gap-2">
          <User size={16} className="text-gray-400" />
          <span className="text-sm text-gray-700">{row.generatedByAdmin?.name || 'غير محدد'}</span>
        </div>
      )
    },
    {
      header: 'تاريخ الإنشاء',
      accessor: 'createdAt',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600">
            {new Date(row.createdAt).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      )
    },
  ];

  const actions = [
    {
      label: 'عرض التفاصيل',
      icon: Eye,
      onClick: (row) => {
        navigate(`/reports/${row.id}`);
      },
      className: 'text-primary-600 hover:bg-primary-50',
      show: () => true,
    },
    {
      label: 'تحميل',
      icon: Download,
      onClick: async (row) => {
        if (row.status === 'COMPLETED') {
          try {
            const response = await reports.download(row.id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report-${row.name}-${new Date().toISOString().split('T')[0]}.${row.format?.toLowerCase() || 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('تم تحميل التقرير');
          } catch (error) {
            toast.error('فشل التحميل');
          }
        } else {
          toast.error('التقرير غير جاهز للتحميل');
        }
      },
      className: 'text-green-600 hover:bg-green-50',
      show: (row) => row.status === 'COMPLETED',
    },
    {
      label: 'حذف',
      icon: Trash2,
      onClick: (row) => {
        if (window.confirm('هل أنت متأكد من حذف هذا التقرير؟')) {
          deleteMutation.mutate(row.id);
        }
      },
      className: 'text-red-600 hover:bg-red-50',
      show: () => true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">التقارير</h2>
          <p className="text-sm text-gray-500 mt-1">إدارة جميع التقارير المولدة</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          إنشاء تقرير
        </button>
      </div>

      <DataTable
        data={reportsList}
        columns={columns}
        isLoading={isLoading}
        searchable={true}
        filterable={true}
        exportable={true}
        pagination={true}
        pageSize={limit}
        emptyMessage="لا توجد تقارير"
        title="قائمة التقارير"
        actions={actions}
        filters={[
          {
            key: 'type',
            label: 'النوع',
            type: 'select',
            options: [
              { value: 'USERS', label: 'المستخدمين' },
              { value: 'DOCTORS', label: 'الأطباء' },
              { value: 'BOOKINGS', label: 'الحجوزات' },
              { value: 'PAYMENTS', label: 'المدفوعات' },
              { value: 'POSTS', label: 'المنشورات' },
              { value: 'REVENUE', label: 'الإيرادات' },
              { value: 'ANALYTICS', label: 'التحليلات' },
            ]
          },
          {
            key: 'status',
            label: 'الحالة',
            type: 'select',
            options: [
              { value: 'COMPLETED', label: 'مكتمل' },
              { value: 'PROCESSING', label: 'قيد المعالجة' },
              { value: 'PENDING', label: 'معلق' },
              { value: 'FAILED', label: 'فاشل' },
            ]
          },
          {
            key: 'format',
            label: 'الصيغة',
            type: 'select',
            options: [
              { value: 'PDF', label: 'PDF' },
              { value: 'CSV', label: 'CSV' },
              { value: 'EXCEL', label: 'Excel' },
              { value: 'JSON', label: 'JSON' },
            ]
          },
          {
            key: 'createdAt',
            label: 'تاريخ الإنشاء',
            type: 'dateRange'
          }
        ]}
      />

      {/* Generate Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="إنشاء تقرير جديد"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            generateMutation.mutate({
              type: formData.get('type'),
              name: formData.get('name'),
              description: formData.get('description') || undefined,
              format: formData.get('format'),
              filters: {
                startDate: formData.get('startDate') || undefined,
                endDate: formData.get('endDate') || undefined,
              },
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="label">نوع التقرير</label>
            <select name="type" className="input" required>
              <option value="USERS">المستخدمين</option>
              <option value="DOCTORS">الأطباء</option>
              <option value="BOOKINGS">الحجوزات</option>
              <option value="PAYMENTS">المدفوعات</option>
              <option value="POSTS">المنشورات</option>
              <option value="REVENUE">الإيرادات</option>
              <option value="ANALYTICS">التحليلات</option>
            </select>
          </div>
          <div>
            <label className="label">اسم التقرير</label>
            <input name="name" type="text" className="input" required placeholder="مثال: تقرير المستخدمين لشهر يناير" />
          </div>
          <div>
            <label className="label">الوصف (اختياري)</label>
            <textarea name="description" className="input" rows="3" placeholder="وصف التقرير..."></textarea>
          </div>
          <div>
            <label className="label">الصيغة</label>
            <select name="format" className="input" required>
              <option value="PDF">PDF</option>
              <option value="CSV">CSV</option>
              <option value="EXCEL">Excel</option>
              <option value="JSON">JSON</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">تاريخ البداية (اختياري)</label>
              <input name="startDate" type="date" className="input" />
            </div>
            <div>
              <label className="label">تاريخ النهاية (اختياري)</label>
              <input name="endDate" type="date" className="input" />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <button type="submit" className="btn-primary flex-1" disabled={generateMutation.isPending}>
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  جاري الإنشاء...
                </>
              ) : (
                'إنشاء'
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowGenerateModal(false)}
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

export default Reports;
