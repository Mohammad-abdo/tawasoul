import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Plus, Activity, BookOpen, AlertCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorVbMapp } from '../../api/doctor';
import apiClient from '../../api/client';
import MonthlyReportModal from '../../features/vbmapp/reports/MonthlyReportModal';

const VbMappAssessment = () => {
  const { testId, childId } = useParams();
  const navigate = useNavigate();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Fetch child info directly for basic display (using existing endpoint)
  const { data: child, isLoading: isChildLoading } = useQuery({
    queryKey: ['doctor-child', childId],
    queryFn: async () => {
      const response = await apiClient.get(`/doctor/children/${childId}`);
      return response.data.data;
    },
  });

  // Fetch VB-MAPP sessions for this child
  const { data: sessions, isLoading: isSessionsLoading } = useQuery({
    queryKey: ['vbmapp-sessions', childId],
    queryFn: async () => {
      const response = await doctorVbMapp.getChildSessions(childId);
      return response.data.data || [];
    },
  });

  const handleCreateSession = async () => {
    try {
      // Typically sessionNumber depends on previous sessions (FIRST, SECOND, THIRD, FOURTH)
      const sessionNumberMap = ['FIRST', 'SECOND', 'THIRD', 'FOURTH'];
      const nextSessionNumber = sessionNumberMap[Math.min(sessions?.length || 0, 3)];

      const response = await doctorVbMapp.createSession({
        childId,
        sessionNumber: nextSessionNumber,
        assessmentDate: new Date().toISOString(),
      });
      
      toast.success('تم فتح جلسة تقييم VB-MAPP جديدة');
      // Redirect to newly created session
      navigate(`/doctor/vbmapp/session/${response.data.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'تعذر إنشاء جلسة تقييم');
    }
  };

  if (isChildLoading || isSessionsLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50"
        >
          <ChevronRight size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تقييم VB-MAPP</h1>
          <p className="mt-1 text-sm text-gray-500">
            للطفل: {child?.name || 'جاري التحميل...'}
          </p>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] border border-gray-200 bg-white p-8 md:p-12">
        
        <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex shrink-0 items-center justify-center rounded-xl bg-blue-100 p-3 text-blue-600">
              <InfoIcon />
            </div>
            <div>
              <h3 className="font-bold text-blue-900">مرحباً بك في أداة تقييم VB-MAPP</h3>
              <p className="mt-2 text-sm leading-relaxed text-blue-800">
                هذه الشاشة تمثل الأساس لتقييم VB-MAPP الشامل الذي يحتوي على تقييم المهارات (Milestones)، والعوائق (Barriers)، ومؤشرات الانتقال (Transitions).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">الجلسات السابقة (التقييمات)</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors"
            >
              <FileText size={18} />
              تقرير شهري
            </button>
            <button 
              onClick={handleCreateSession}
              className="btn-primary flex items-center gap-2 px-4 shadow-sm"
            >
              <Plus size={18} />
              فتح تقييم جديد
            </button>
          </div>
        </div>

        {sessions && sessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <div 
                key={session.id} 
                onClick={() => navigate(`/doctor/vbmapp/session/${session.id}`)}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-6 flex flex-col items-center text-center hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
                  <Activity size={28} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">التقييم: {session.sessionNumber}</h3>
                <p className="text-sm text-gray-500 mb-4">{new Date(session.assessmentDate).toLocaleDateString()}</p>
                <div className="w-full flex gap-2 justify-center">
                  <span className="text-xs bg-white border border-gray-200 rounded-md px-3 py-1 font-medium text-gray-600">مهارات</span>
                  <span className="text-xs bg-white border border-gray-200 rounded-md px-3 py-1 font-medium text-gray-600">عوائق</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
            <BookOpen size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">لا توجد تقييمات سابقة</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm">
              لم يتم إجراء أي تقييم VB-MAPP لهذا الطفل حتى الآن. ابدأ بفتح جلسة تقييم جديدة.
            </p>
          </div>
        )}
      </div>

      <MonthlyReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        childId={childId} 
      />
    </div>
  );
};

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 16v-4"></path>
    <path d="M12 8h.01"></path>
  </svg>
)

export default VbMappAssessment;
