import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { doctorChildren } from '../../api/doctor';
import { 
  Baby, 
  ChevronRight, 
  Activity, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  ClipboardList,
  CheckCircle, 
  FileText,
  Plus
} from 'lucide-react';

const DoctorChildDetails = () => {
  const { id } = useParams();

  const { data: child, isLoading } = useQuery({
    queryKey: ['doctor-child-details', id],
    queryFn: async () => {
      const response = await doctorChildren.getById(id);
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/doctor/children" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ChevronRight size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تفاصيل حالة الطفل</h1>
          <p className="text-sm text-gray-500">متابعة سجل الاختبارات والجلسات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Child & Parent Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-gray-200">
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-3xl bg-primary-50 border-2 border-primary-200 flex items-center justify-center overflow-hidden mx-auto mb-4">
                {child.profileImage ? (
                  <img src={child.profileImage} alt={child.name} className="w-full h-full object-cover" />
                ) : (
                  <Baby className="text-primary-600" size={48} />
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{child.name}</h2>
              <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                {child.status || 'غير محدد'}
              </span>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">بيانات التواصل</h3>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <User size={18} className="text-primary-500" />
                <span>ولي الأمر: {child.user?.fullName}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone size={18} className="text-primary-500" />
                <span>{child.user?.phone}</span>
              </div>
              {child.user?.email && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail size={18} className="text-primary-500" />
                  <span>{child.user?.email}</span>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-primary-500" />
              ملاحظات الحالة
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">تاريخ الحالة</p>
                <p className="text-sm text-gray-800">{child.caseHistory || 'لا يوجد بيانات'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">وصف الحالة</p>
                <p className="text-sm text-gray-800">{child.caseDescription || 'لا يوجد بيانات'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">ملاحظات سلوكية</p>
                <p className="text-sm text-gray-800">{child.behavioralNotes || 'لا يوجد ملاحظات'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Results & History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity size={20} className="text-primary-500" />
                نتائج التقييمات والاختبارات
              </h3>
              <Link 
                to="/scales" 
                className="btn-primary py-1.5 px-4 text-xs flex items-center gap-2 shadow-lg"
              >
                <Plus size={14} /> بدء تقييم جديد
              </Link>
            </div>

            <div className="space-y-4">
              {child.assessmentResults?.length > 0 ? (
                child.assessmentResults.map((result) => (
                  <div key={result.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                          {result.question?.test?.category === 'AUDITORY' ? (
                            <Activity className="text-blue-500" size={24} />
                          ) : (
                            <Activity className="text-purple-500" size={24} />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{result.question?.test?.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {result.question?.test?.category === 'AUDITORY' ? 'تقييم سمعي' : 'تقييم بصري'} • 
                            {new Date(result.timestamp).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-lg font-bold text-primary-600">{result.scoreGiven}/10</div>
                        <p className="text-[10px] text-gray-400">النتيجة المعطاة</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <ClipboardList className="mx-auto mb-2 text-gray-300" size={48} />
                  <p className="text-gray-500">لم يتم إجراء أي اختبارات تقييمية بعد</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-primary-500" />
              الجلسات السابقة معك
            </h3>
            <div className="space-y-3">
              {child.bookings?.length > 0 ? (
                child.bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg border border-gray-200">
                        <CheckCircle className="text-green-500" size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {booking.sessionType === 'VIDEO' ? 'جلسة فيديو' : 'جلسة صوتية'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.scheduledAt).toLocaleString('ar-EG')}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-lg">
                      {booking.status === 'COMPLETED' ? 'مكتملة' : booking.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-gray-500 text-sm">لا يوجد جلسات سابقة مسجلة</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorChildDetails;
