import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { support } from '../../api/admin';
import { 
  ArrowRight, 
  Calendar, 
  User,
  Stethoscope,
  Headphones,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  MessageSquare,
  Send,
  Mail,
  FileText,
  Edit
} from 'lucide-react';
import toast from 'react-hot-toast';

const SupportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const { data: ticket, isLoading, error, refetch } = useQuery({
    queryKey: ['support-ticket', id],
    queryFn: async () => {
      const response = await support.getTicket(id);
      return response.data.data;
    },
  });

  const replyMutation = useMutation({
    mutationFn: (data) => support.addReply(id, data),
    onSuccess: () => {
      toast.success('تم إرسال الرد بنجاح');
      setReplyMessage('');
      setIsInternal(false);
      refetch();
    },
    onError: () => {
      toast.error('فشل إرسال الرد');
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status) => support.updateStatus(id, { status }),
    onSuccess: () => {
      toast.success('تم تحديث حالة التذكرة بنجاح');
      refetch();
    },
    onError: () => {
      toast.error('فشل تحديث الحالة');
    },
  });

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      toast.error('يرجى إدخال رسالة الرد');
      return;
    }
    replyMutation.mutate({ message: replyMessage, isInternal });
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

  if (error || !ticket) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">التذكرة غير موجودة</h3>
          <p className="text-gray-600 mb-4">لم يتم العثور على بيانات التذكرة</p>
          <button
            onClick={() => navigate('/support')}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <ArrowRight size={18} />
            العودة إلى تذاكر الدعم
          </button>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status) => {
    const configs = {
      OPEN: { 
        label: 'مفتوحة', 
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: AlertCircle,
        bgColor: 'bg-blue-50 border-blue-200'
      },
      IN_PROGRESS: { 
        label: 'قيد المعالجة', 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: Clock,
        bgColor: 'bg-yellow-50 border-yellow-200'
      },
      RESOLVED: { 
        label: 'محلولة', 
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle,
        bgColor: 'bg-green-50 border-green-200'
      },
      CLOSED: { 
        label: 'مغلقة', 
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: XCircle,
        bgColor: 'bg-gray-50 border-gray-200'
      },
    };
    return configs[status] || configs.OPEN;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      URGENT: { label: 'عاجل', color: 'bg-red-100 text-red-700 border-red-200' },
      HIGH: { label: 'عالية', color: 'bg-orange-100 text-orange-700 border-orange-200' },
      MEDIUM: { label: 'متوسطة', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      LOW: { label: 'منخفضة', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    };
    return configs[priority] || configs.LOW;
  };

  const statusConfig = getStatusConfig(ticket.status);
  const priorityConfig = getPriorityConfig(ticket.priority);
  const StatusIcon = statusConfig.icon;
  const sender = ticket.user || ticket.doctor;
  const senderName = ticket.user ? ticket.user.username : (ticket.doctor ? ticket.doctor.name : '-');
  const senderEmail = ticket.user ? ticket.user.email : (ticket.doctor ? ticket.doctor.email : '-');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">تفاصيل التذكرة</h2>
          <p className="text-sm text-gray-500 mt-1">معلومات تفصيلية عن تذكرة الدعم</p>
        </div>
        <button
          onClick={() => navigate('/support')}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowRight size={18} />
          العودة
        </button>
      </div>

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className={`w-16 h-16 rounded-xl ${statusConfig.bgColor} flex items-center justify-center mx-auto mb-3`}>
            <StatusIcon className={statusConfig.color.split(' ')[1]} size={32} />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{statusConfig.label}</p>
          <p className="text-sm text-gray-500">الحالة</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center mx-auto mb-3">
            <Headphones className="text-primary-600" size={28} />
          </div>
          <p className="text-lg font-bold text-gray-900 mb-1 truncate">{ticket.subject}</p>
          <p className="text-sm text-gray-500">الموضوع</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className={`w-16 h-16 rounded-xl ${priorityConfig.color.replace('text-', 'bg-').replace('-700', '-50')} border ${priorityConfig.color.replace('text-', 'border-').replace('-700', '-200')} flex items-center justify-center mx-auto mb-3`}>
            <AlertCircle className={priorityConfig.color.split(' ')[1]} size={28} />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{priorityConfig.label}</p>
          <p className="text-sm text-gray-500">الأولوية</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-3">
            <Calendar className="text-blue-600" size={28} />
          </div>
          <p className="text-lg font-bold text-gray-900 mb-1">
            {new Date(ticket.createdAt).toLocaleDateString('ar-EG', {
              day: 'numeric',
              month: 'short'
            })}
          </p>
          <p className="text-sm text-gray-500">تاريخ الإنشاء</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sender Information */}
        <div className="glass-card rounded-2xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            {ticket.user ? (
              <User size={24} className="text-primary-600" />
            ) : (
              <Stethoscope size={24} className="text-primary-600" />
            )}
            معلومات المرسل
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-6">
              <div className={`w-20 h-20 rounded-xl flex items-center justify-center shadow-lg ${
                ticket.user 
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600' 
                  : 'bg-gradient-to-br from-blue-500 to-blue-600'
              }`}>
                <span className="text-white text-3xl font-bold">
                  {senderName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="text-2xl font-bold text-gray-900">{senderName}</h4>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    ticket.user ? 'bg-primary-100 text-primary-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {ticket.user ? 'مستخدم' : 'طبيب'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{senderEmail}</span>
                  </div>
                  {ticket.user && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">معرف المستخدم:</span>
                      <span className="text-sm font-medium text-gray-900 font-mono text-xs">
                        {ticket.user.id?.substring(0, 8)}...
                      </span>
                    </div>
                  )}
                  {ticket.doctor && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">معرف الطبيب:</span>
                      <span className="text-sm font-medium text-gray-900 font-mono text-xs">
                        {ticket.doctor.id?.substring(0, 8)}...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Information */}
        <div className="glass-card rounded-2xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText size={24} className="text-primary-600" />
            معلومات التذكرة
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <FileText size={16} />
                معرف التذكرة
              </span>
              <span className="text-sm font-semibold text-gray-900 font-mono">
                {ticket.id.substring(0, 8)}...
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Calendar size={16} />
                تاريخ الإنشاء
              </span>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-900 block">
                  {new Date(ticket.createdAt).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(ticket.createdAt).toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
              </div>
            </div>
            {ticket.assignedAdmin && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Shield size={16} />
                  المُكلف
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center">
                    <Shield className="text-purple-600" size={14} />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{ticket.assignedAdmin.name}</span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <MessageSquare size={16} />
                عدد الردود
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {ticket.replies?.length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Message Section */}
      <div className="glass-card rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare size={24} className="text-primary-600" />
          الرسالة
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {ticket.message}
          </p>
        </div>
      </div>

      {/* Replies Section */}
      <div className="glass-card rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MessageSquare size={24} className="text-primary-600" />
          الردود ({ticket.replies?.length || 0})
        </h3>
        <div className="space-y-4">
          {ticket.replies && ticket.replies.length > 0 ? (
            ticket.replies.map((reply) => (
              <div
                key={reply.id}
                className={`p-4 rounded-xl border ${
                  reply.isInternal 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {reply.admin ? (
                      <>
                        <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center">
                          <Shield className="text-purple-600" size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{reply.admin.name}</p>
                          <p className="text-xs text-gray-500">أدمن</p>
                        </div>
                      </>
                    ) : reply.user ? (
                      <>
                        <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
                          <User className="text-primary-600" size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{reply.user.username}</p>
                          <p className="text-xs text-gray-500">مستخدم</p>
                        </div>
                      </>
                    ) : reply.doctor ? (
                      <>
                        <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                          <Stethoscope className="text-blue-600" size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{reply.doctor.name}</p>
                          <p className="text-xs text-gray-500">طبيب</p>
                        </div>
                      </>
                    ) : null}
                    {reply.isInternal && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
                        داخلي
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(reply.createdAt).toLocaleString('ar-EG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {reply.message}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="mx-auto mb-2 text-gray-400" size={32} />
              <p>لا توجد ردود بعد</p>
            </div>
          )}
        </div>
      </div>

      {/* Reply Form */}
      <div className="glass-card rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Send size={24} className="text-primary-600" />
          إضافة رد
        </h3>
        <form onSubmit={handleReply} className="space-y-4">
          <div>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="اكتب ردك هنا..."
              className="input min-h-[120px] resize-none"
              required
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">رد داخلي (للموظفين فقط)</span>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={replyMutation.isPending}
            >
              <Send size={18} />
              {replyMutation.isPending ? 'جاري الإرسال...' : 'إرسال الرد'}
            </button>
            {/* Status Update Buttons */}
            {ticket.status !== 'RESOLVED' && (
              <button
                type="button"
                onClick={() => statusMutation.mutate('RESOLVED')}
                className="btn-secondary flex items-center gap-2"
                disabled={statusMutation.isPending}
              >
                <CheckCircle size={18} />
                تحديد كمحلولة
              </button>
            )}
            {ticket.status !== 'CLOSED' && (
              <button
                type="button"
                onClick={() => statusMutation.mutate('CLOSED')}
                className="btn-secondary flex items-center gap-2"
                disabled={statusMutation.isPending}
              >
                <XCircle size={18} />
                إغلاق التذكرة
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupportDetails;

