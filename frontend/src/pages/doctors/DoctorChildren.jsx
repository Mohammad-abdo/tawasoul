import { useQuery } from '@tanstack/react-query';
import { doctorChildren } from '../../api/doctor';
import { useAuthStore } from '../../store/authStore';
import { 
  Baby, 
  Calendar, 
  ChevronLeft, 
  Activity, 
  ClipboardList,
  User,
  Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DoctorChildren = () => {
  const { data: children, isLoading } = useQuery({
    queryKey: ['doctor-children'],
    queryFn: async () => {
      const response = await doctorChildren.getAll();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ملفات الأطفال</h1>
          <p className="text-gray-500">قائمة الأطفال الذين تتابع حالاتهم</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children?.length > 0 ? (
          children.map((child) => (
            <div key={child.id} className="glass-card rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 border border-primary-200 flex items-center justify-center overflow-hidden">
                  {child.profileImage ? (
                    <img src={child.profileImage} alt={child.name} className="w-full h-full object-cover" />
                  ) : (
                    <Baby className="text-primary-600" size={32} />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{child.name}</h3>
                  <p className="text-sm text-gray-500">
                    {child.status === 'AUTISM' ? 'توحد' : 
                     child.status === 'SPEECH_DISORDER' ? 'تخاطب' : 
                     child.status || 'غير محدد'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User size={16} className="text-primary-500" />
                  <span>ولي الأمر: {child.user?.fullName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={16} className="text-primary-500" />
                  <span>{child.user?.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Activity size={16} className="text-primary-500" />
                  <span>الفئة العمرية: {
                    child.ageGroup === 'UNDER_4' ? 'أقل من 4 سنوات' :
                    child.ageGroup === 'BETWEEN_5_15' ? 'من 5 إلى 15 سنة' :
                    child.ageGroup === 'OVER_15' ? 'أكبر من 15 سنة' : 'غير محدد'
                  }</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <Link
                  to={`/doctor/children/${child.id}`}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 py-2 text-sm"
                >
                  <ClipboardList size={16} />
                  عرض التقييمات
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 glass-card rounded-2xl border border-gray-200">
            <Baby className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500">لا يوجد أطفال مسجلين لديك حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorChildren;
