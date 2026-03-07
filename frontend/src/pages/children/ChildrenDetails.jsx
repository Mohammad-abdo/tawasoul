import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Baby, 
  Calendar, 
  User, 
  FileText, 
  Activity, 
  Clock, 
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  ClipboardList,
  Eye
} from 'lucide-react';
import { children } from '../../api/admin';
import DataTable from '../../components/common/DataTable';


const ChildrenDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['child', id],
    queryFn: async () => {
      const response = await children.getById(id);
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

  const child = data?.data?.child;

  if (error || !child) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl text-center">
          <Baby className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">ملف الطفل غير موجود</h3>
          <button
            onClick={() => navigate('/children')}
            className="btn-primary flex items-center gap-2 mx-auto mt-4"
          >
            <ArrowRight size={18} />
            العودة للقائمة
          </button>
        </div>
      </div>
    );
  }

  // Booking Columns
  const bookingColumns = [
    {
      header: 'الطبيب',
      accessor: 'doctor',
      render: (booking) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            {booking.doctor?.avatar ? (
              <img src={booking.doctor.avatar} alt={booking.doctor.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <Stethoscope size={14} className="text-gray-500" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{booking.doctor?.name || 'غير محدد'}</p>
            <p className="text-xs text-gray-500">{booking.doctor?.specialization}</p>
          </div>
        </div>
      )
    },
    {
      header: 'نوع الجلسة',
      accessor: 'sessionType',
      render: (booking) => (
        <div className="flex flex-col">
           <span className="text-sm font-medium">
             {booking.category === 'EVALUATION' ? 'تقييم / اختبار' : 
              booking.category === 'INDIVIDUAL' ? 'جلسة فردية' :
              booking.category === 'GROUP' ? 'جلسة جماعية' : booking.category}
           </span>
           <span className="text-xs text-gray-500">
             {booking.sessionType === 'VIDEO' ? 'فيديو' : 
              booking.sessionType === 'AUDIO' ? 'صوتي' : 'نصي'}
           </span>
        </div>
      )
    },
    {
      header: 'التاريخ',
      accessor: 'scheduledAt',
      render: (booking) => (
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <span className="text-sm text-gray-900">
            {new Date(booking.scheduledAt).toLocaleDateString('ar-EG', {
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
    {
      header: 'الحالة',
      accessor: 'status',
      render: (booking) => {
        const statusColors = {
          COMPLETED: 'bg-green-100 text-green-700',
          PENDING: 'bg-yellow-100 text-yellow-700',
          CANCELLED: 'bg-red-100 text-red-700',
          CONFIRMED: 'bg-blue-100 text-blue-700'
        };
        return (
          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${statusColors[booking.status] || 'bg-gray-100'}`}>
            {booking.status === 'COMPLETED' ? 'مكتملة' : 
             booking.status === 'PENDING' ? 'معلقة' : 
             booking.status === 'CANCELLED' ? 'ملغاة' : 
             booking.status === 'CONFIRMED' ? 'مؤكدة' : booking.status}
          </span>
        );
      }
    },
    {
      header: 'ملاحظات/نتائج',
      accessor: 'notes',
      render: (booking) => (
        <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">{booking.notes || '-'}</p>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/children')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowRight size={20} />
          <span>العودة للقائمة</span>
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="glass-card rounded-2xl p-8 bg-white border border-primary-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Avatar Area */}
          <div className="w-full md:w-auto flex flex-col items-center">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center shadow-inner mb-4 overflow-hidden border-4 border-white">
              {child.profileImage ? (
                <img src={child.profileImage} alt={child.name} className="w-full h-full object-cover" />
              ) : (
                <Baby className="text-primary-500 w-16 h-16" />
              )}
            </div>
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${
              child.status === 'AUTISM' ? 'bg-purple-100 text-purple-700' :
              child.status === 'SPEECH_DISORDER' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {child.status === 'AUTISM' ? 'توحد' : 
               child.status === 'SPEECH_DISORDER' ? 'تخاطب' : 
               child.status}
            </div>
          </div>

          {/* Info Area */}
          <div className="flex-1 w-full space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{child.name}</h1>
              <div className="flex flex-wrap gap-4 text-gray-600">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  <User size={18} className="text-primary-500" />
                  <span className="text-sm font-medium">
                    {child.ageGroup === 'UNDER_4' ? 'أقل من 4 سنوات' :
                     child.ageGroup === 'BETWEEN_5_15' ? 'من 5 إلى 15 سنة' : // Fixed enum mapping
                     child.ageGroup === '5_TO_15' ? 'من 5 إلى 15 سنة' : // Fallback
                     'أكبر من 15 سنة'}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  <Calendar size={18} className="text-primary-500" />
                  <span className="text-sm font-medium">
                    تاريخ التسجيل: {new Date(child.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                  <Activity size={18} />
                  وصف الحالة
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {child.caseDescription || 'لا يوجد وصف للحالة حالياً'}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                 <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <ClipboardList size={18} />
                  ملاحظات سلوكية
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {child.behavioralNotes || 'لا توجد ملاحظات سلوكية مسجلة'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parent Info */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-xl p-6 border border-gray-200 h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-primary-600" />
              بيانات ولي الأمر
            </h3>
            {child.user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                    {child.user.avatar ? (
                      <img src={child.user.avatar} alt="Parent" className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{child.user.fullName || child.user.username || 'غير مسمى'}</p>
                    <p className="text-xs text-gray-500">ولي الأمر</p>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  {child.user.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={16} />
                      <span className="text-sm dir-ltr">{child.user.phone}</span>
                    </div>
                  )}
                  {child.user.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={16} />
                      <span className="text-sm">{child.user.email}</span>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => navigate(`/users/${child.user.id}`)}
                  className="w-full mt-2 py-2 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors font-medium"
                >
                  عرض ملف ولي الأمر
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">لا توجد بيانات لولي الأمر</p>
            )}
          </div>
        </div>

        {/* History / Test Results */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl p-6 border border-gray-200 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText size={20} className="text-primary-600" />
                سجل الجلسات والتقييمات
              </h3>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                {child.bookings?.length || 0} جلسة
              </span>
            </div>

            <div className="overflow-hidden">
               {child.bookings && child.bookings.length > 0 ? (
                  <DataTable 
                    data={child.bookings}
                    columns={bookingColumns}
                    actions={[
                      {
                        label: 'عرض التقرير',
                        icon: Eye,
                        onClick: (row) => navigate(`/tests/${row.id}`),
                        className: 'text-primary-600 hover:bg-primary-50',
                      }
                    ]}
                    pagination={true}
                    pageSize={5}
                    searchable={true}
                    emptyMessage="لا توجد جلسات سابقة"
                  />
               ) : (
                 <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                   <FileText size={32} className="mx-auto mb-2 opacity-50" />
                   <p>لا يوجد سجل جلسات أو تقييمات لهذا الطفل حتى الآن</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildrenDetails;
