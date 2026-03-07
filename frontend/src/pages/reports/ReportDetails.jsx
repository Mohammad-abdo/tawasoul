import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { reports } from '../../api/admin';
import { 
  ArrowRight, 
  Download, 
  Trash2,
  FileBarChart,
  Calendar,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: report, isLoading, error, refetch } = useQuery({
    queryKey: ['report-details', id],
    queryFn: async () => {
      const response = await reports.getById(id);
      return response.data.data;
    },
    refetchInterval: (data) => {
      // Poll for status updates if report is not completed
      if (data?.status && !['COMPLETED', 'FAILED'].includes(data.status)) {
        return 2000; // Poll every 2 seconds
      }
      return false;
    },
  });

  const downloadMutation = useMutation({
    mutationFn: () => reports.download(id),
    onSuccess: (response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${report.name}-${new Date().toISOString().split('T')[0]}.${report.format?.toLowerCase() || 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('تم تحميل التقرير بنجاح');
    },
    onError: () => {
      toast.error('فشل تحميل التقرير');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => reports.delete(id),
    onSuccess: () => {
      toast.success('تم حذف التقرير');
      navigate('/reports');
    },
    onError: () => {
      toast.error('فشل حذف التقرير');
    },
  });

  const handleDelete = () => {
    if (window.confirm('هل أنت متأكد من حذف هذا التقرير؟')) {
      deleteMutation.mutate();
    }
  };

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

  if (error || !report) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">التقرير غير موجود</h3>
          <p className="text-gray-600 mb-4">لم يتم العثور على بيانات التقرير</p>
          <button
            onClick={() => navigate('/reports')}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <ArrowRight size={18} />
            العودة إلى قائمة التقارير
          </button>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'COMPLETED':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'مكتمل'
        };
      case 'PROCESSING':
        return {
          icon: Loader2,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'قيد المعالجة',
          animate: true
        };
      case 'PENDING':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'معلق'
        };
      case 'FAILED':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'فاشل'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: status
        };
    }
  };

  const statusConfig = getStatusConfig(report.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/reports')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowRight size={20} />
          <span>العودة</span>
        </button>
        <div className="flex items-center gap-3">
          {report.status === 'COMPLETED' && (
            <button
              onClick={() => downloadMutation.mutate()}
              disabled={downloadMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {downloadMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  جاري التحميل...
                </>
              ) : (
                <>
                  <Download size={18} />
                  تحميل التقرير
                </>
              )}
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <Trash2 size={18} />
            حذف
          </button>
        </div>
      </div>

      {/* Report Header Card */}
      <div className="glass-card rounded-2xl p-8 bg-white border border-primary-200">
        <div className="flex items-start gap-6">
          <div className={`w-20 h-20 rounded-2xl ${statusConfig.bgColor} border-2 ${statusConfig.borderColor} flex items-center justify-center shadow-lg`}>
            <StatusIcon className={`${statusConfig.color} ${statusConfig.animate ? 'animate-spin' : ''}`} size={40} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold text-gray-900">{report.name}</h1>
              <span className={`px-4 py-1.5 ${statusConfig.bgColor} ${statusConfig.borderColor} border-2 ${statusConfig.color} rounded-full text-sm font-semibold`}>
                {statusConfig.label}
              </span>
            </div>
            {report.description && (
              <p className="text-gray-600 mb-4">{report.description}</p>
            )}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-gray-600">
                <FileBarChart size={20} />
                <div>
                  <p className="text-lg font-semibold text-gray-900">{report.type}</p>
                  <p className="text-xs text-gray-500">نوع التقرير</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FileText size={20} />
                <div>
                  <p className="text-lg font-semibold text-gray-900">{report.format}</p>
                  <p className="text-xs text-gray-500">الصيغة</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User size={20} />
                <div>
                  <p className="text-lg font-semibold text-gray-900">{report.generatedByAdmin?.name || 'غير محدد'}</p>
                  <p className="text-xs text-gray-500">تم الإنشاء بواسطة</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="text-primary-600" size={20} />
            معلومات التقرير
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">تاريخ الإنشاء</span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(report.createdAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            {report.startedAt && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">تاريخ البدء</span>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date(report.startedAt).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
            {report.completedAt && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">تاريخ الإكمال</span>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date(report.completedAt).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
            {report.completedAt && report.startedAt && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">مدة المعالجة</span>
                <span className="text-sm font-semibold text-gray-900">
                  {Math.round((new Date(report.completedAt) - new Date(report.startedAt)) / 1000)} ثانية
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="text-primary-600" size={20} />
            معلومات الملف
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">معرف التقرير</span>
              <span className="text-sm font-semibold text-gray-900 font-mono">{report.id}</span>
            </div>
            {report.fileUrl && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">رابط الملف</span>
                <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                >
                  عرض الملف
                </a>
              </div>
            )}
            {report.filePath && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">مسار الملف</span>
                <span className="text-sm font-semibold text-gray-900 font-mono text-xs">{report.filePath}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">الحالة</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {report.filters && Object.keys(report.filters).length > 0 && (
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileBarChart className="text-primary-600" size={20} />
            الفلاتر المستخدمة
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {JSON.stringify(report.filters, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Processing Status */}
      {report.status === 'PROCESSING' && (
        <div className="glass-card rounded-xl p-6 border border-blue-200 bg-blue-50">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin text-blue-600" size={24} />
            <div>
              <p className="font-semibold text-blue-900">التقرير قيد المعالجة</p>
              <p className="text-sm text-blue-700">يرجى الانتظار حتى يكتمل إنشاء التقرير...</p>
            </div>
          </div>
        </div>
      )}

      {/* Failed Status */}
      {report.status === 'FAILED' && (
        <div className="glass-card rounded-xl p-6 border border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <XCircle className="text-red-600" size={24} />
            <div>
              <p className="font-semibold text-red-900">فشل إنشاء التقرير</p>
              <p className="text-sm text-red-700">حدث خطأ أثناء إنشاء التقرير. يرجى المحاولة مرة أخرى.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetails;

