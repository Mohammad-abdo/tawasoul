import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Award, Activity, Shield, TrendingUp, Mic, Target } from 'lucide-react';
import { doctorVbMapp } from '../../api/doctor';
import MilestonesTab from '../../features/vbmapp/MilestonesTab';
import BarriersTab from '../../features/vbmapp/BarriersTab';
import TransitionsTab from '../../features/vbmapp/TransitionsTab';
import TaskStepsTab from '../../features/vbmapp/TaskStepsTab';
import EesaTab from '../../features/vbmapp/EesaTab';
import IepGoalsTab from '../../features/vbmapp/IepGoalsTab';

const VbMappSessionDetail = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('milestones');

  const { data: session, isLoading, isError, refetch } = useQuery({
    queryKey: ['vbmapp-session', sessionId],
    queryFn: async () => {
      const response = await doctorVbMapp.getSession(sessionId);
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-700">تعذر تحميل بيانات الجلسة</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-sm text-red-600 underline">
            العودة للخلف
          </button>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'milestones', label: 'المهارات', icon: Award },
    { id: 'taskSteps', label: 'تحليل المهام', icon: Activity },
    { id: 'barriers', label: 'العوائق', icon: Shield },
    { id: 'transitions', label: 'الانتقال', icon: TrendingUp },
    { id: 'eesa', label: 'المهارات الصوتية', icon: Mic },
    { id: 'iep', label: 'الأهداف المستهدفة', icon: Target },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50"
        >
          <ChevronRight size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            تقييم VB-MAPP - جلسة {session.sessionNumber}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            الطفل: {session.child?.name || 'غير معروف'} • تاريخ التقييم: {new Date(session.assessmentDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="glass-card rounded-[1.5rem] border border-gray-200 bg-white p-2 shadow-sm overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                <span className="font-semibold text-sm whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass-card rounded-[2rem] border border-gray-200 bg-white p-6 md:p-10 shadow-sm min-h-[50vh]">
        {activeTab === 'milestones' && (
          <MilestonesTab session={session} onUpdate={refetch} />
        )}
        
        {activeTab === 'taskSteps' && (
          <TaskStepsTab session={session} onUpdate={refetch} />
        )}

        {activeTab === 'barriers' && (
          <BarriersTab session={session} onUpdate={refetch} />
        )}

        {activeTab === 'transitions' && (
          <TransitionsTab session={session} onUpdate={refetch} />
        )}
        
        {activeTab === 'eesa' && (
          <EesaTab session={session} onUpdate={refetch} />
        )}

        {activeTab === 'iep' && (
          <IepGoalsTab session={session} onUpdate={refetch} />
        )}
      </div>
    </div>
  );
};

export default VbMappSessionDetail;
