import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { activityLogs } from '../../api/admin';
import { 
  ArrowRight, 
  Calendar, 
  User,
  Activity,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Shield,
  Info,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const ActivityLogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: log, isLoading, error } = useQuery({
    queryKey: ['activity-log-details', id],
    queryFn: async () => {
      const response = await activityLogs.getById(id);
      return response.data.data;
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

  if (error || !log) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">السجل غير موجود</h3>
          <p className="text-gray-600 mb-4">لم يتم العثور على بيانات السجل</p>
          <button
            onClick={() => navigate('/activity-logs')}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <ArrowRight size={18} />
            العودة إلى سجل الأنشطة
          </button>
        </div>
      </div>
    );
  }

  const getActionConfig = (action) => {
    const configs = {
      CREATE: { 
        label: 'إنشاء', 
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle,
        bgColor: 'bg-green-50 border-green-200'
      },
      UPDATE: { 
        label: 'تحديث', 
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Edit,
        bgColor: 'bg-blue-50 border-blue-200'
      },
      DELETE: { 
        label: 'حذف', 
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: Trash2,
        bgColor: 'bg-red-50 border-red-200'
      },
      APPROVE: { 
        label: 'موافقة', 
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle,
        bgColor: 'bg-green-50 border-green-200'
      },
      REJECT: { 
        label: 'رفض', 
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: XCircle,
        bgColor: 'bg-red-50 border-red-200'
      },
    };
    return configs[action] || { 
      label: action, 
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: Activity,
      bgColor: 'bg-gray-50 border-gray-200'
    };
  };

  const actionConfig = getActionConfig(log.action);
  const ActionIcon = actionConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">تفاصيل سجل النشاط</h2>
          <p className="text-sm text-gray-500 mt-1">معلومات تفصيلية عن النشاط</p>
        </div>
        <button
          onClick={() => navigate('/activity-logs')}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowRight size={18} />
          العودة
        </button>
      </div>

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className={`w-16 h-16 rounded-xl ${actionConfig.bgColor} flex items-center justify-center mx-auto mb-3`}>
            <ActionIcon className={actionConfig.color.replace('bg-', 'text-').split(' ')[0]} size={32} />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{actionConfig.label}</p>
          <p className="text-sm text-gray-500">الإجراء</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center mx-auto mb-3">
            <FileText className="text-primary-600" size={28} />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{log.entityType || '-'}</p>
          <p className="text-sm text-gray-500">نوع الكيان</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center mx-auto mb-3">
            <Shield className="text-purple-600" size={28} />
          </div>
          <p className="text-lg font-bold text-gray-900 mb-1 truncate">
            {log.admin?.name || '-'}
          </p>
          <p className="text-sm text-gray-500">الأدمن</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-3">
            <Calendar className="text-blue-600" size={28} />
          </div>
          <p className="text-lg font-bold text-gray-900 mb-1">
            {new Date(log.createdAt).toLocaleDateString('ar-EG', {
              day: 'numeric',
              month: 'short'
            })}
          </p>
          <p className="text-sm text-gray-500">التاريخ</p>
        </div>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admin Information */}
        {log.admin && (
          <div className="glass-card rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User size={24} className="text-primary-600" />
              معلومات الأدمن
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-3xl font-bold">
                    {log.admin.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-2xl font-bold text-gray-900">{log.admin.name}</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">البريد الإلكتروني:</span>
                      <span className="text-sm font-medium text-gray-900">{log.admin.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">معرف الأدمن:</span>
                      <span className="text-sm font-medium text-gray-900 font-mono text-xs">
                        {log.admin.id?.substring(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Information */}
        <div className="glass-card rounded-2xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity size={24} className="text-primary-600" />
            معلومات النشاط
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Info size={16} />
                معرف السجل
              </span>
              <span className="text-sm font-semibold text-gray-900 font-mono">
                {log.id.substring(0, 8)}...
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <FileText size={16} />
                نوع الكيان
              </span>
              <span className="text-sm font-semibold text-gray-900">{log.entityType || '-'}</span>
            </div>
            {log.entityId && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <FileText size={16} />
                  معرف الكيان
                </span>
                <span className="text-sm font-semibold text-gray-900 font-mono">
                  {log.entityId.substring(0, 8)}...
                </span>
              </div>
            )}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Clock size={16} />
                التاريخ والوقت
              </span>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-900 block">
                  {new Date(log.createdAt).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(log.createdAt).toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      {log.description && (
        <div className="glass-card rounded-2xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={24} className="text-primary-600" />
            الوصف
          </h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {log.description}
          </p>
        </div>
      )}

      {/* Metadata Section */}
      {log.metadata && (
        <div className="glass-card rounded-2xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info size={24} className="text-primary-600" />
            البيانات الإضافية
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogDetails;

