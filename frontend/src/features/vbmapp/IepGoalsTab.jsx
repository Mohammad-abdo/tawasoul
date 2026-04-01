import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Target, PlusCircle, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { doctorVbMapp } from '../../api/doctor';
import toast from 'react-hot-toast';

const IepGoalsTab = ({ session, onUpdate }) => {
  const [convertingMilestoneId, setConvertingMilestoneId] = useState(null);
  const [newGoalForm, setNewGoalForm] = useState({ targetDate: '', description: '' });

  const { data: skillAreasData, isLoading: isAreasLoading } = useQuery({
    queryKey: ['vbmapp-skill-areas'],
    queryFn: async () => {
      const response = await doctorVbMapp.getSkillAreas();
      return response.data.data;
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: (data) => doctorVbMapp.createIepGoal(session.id, data),
    onSuccess: () => {
      toast.success('تمت إضافة الهدف بنجاح');
      setConvertingMilestoneId(null);
      setNewGoalForm({ targetDate: '', description: '' });
      if (onUpdate) onUpdate();
    },
    onError: () => {
      toast.error('حدث خطأ أثناء إضافة الهدف');
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ goalId, data }) => doctorVbMapp.updateIepGoal(goalId, data),
    onSuccess: () => {
      toast.success('تم تحديث حالة الهدف');
      if (onUpdate) onUpdate();
    },
    onError: () => {
      toast.error('حدث خطأ أثناء تحديث الهدف');
    },
  });

  const handleCreateGoal = (milestoneId) => {
    if (!newGoalForm.targetDate || !newGoalForm.description) {
      toast.error('يرجى تحديد التاريخ المستهدف ووصف الهدف');
      return;
    }
    
    createGoalMutation.mutate({
      milestoneId,
      targetDate: newGoalForm.targetDate,
      description: newGoalForm.description,
    });
  };

  const handleUpdateStatus = (goalId, newStatus) => {
    updateGoalMutation.mutate({
      goalId,
      data: {
        status: newStatus,
        ...(newStatus === 'ACHIEVED' ? { achievedDate: new Date().toISOString() } : {}),
      }
    });
  };

  const { suggestedGoals, activeGoals } = useMemo(() => {
    if (!session || !skillAreasData) return { suggestedGoals: [], activeGoals: [] };

    // Extract all milestone descriptions for quick lookup
    const milestoneMap = {};
    skillAreasData.forEach(area => {
      area.milestones?.forEach(m => {
        milestoneMap[m.id] = { ...m, areaName: area.nameAr };
      });
    });

    const active = session.iepGoals || [];
    const activeMilestoneIds = new Set(active.map(g => g.milestoneId).filter(Boolean));

    // A milestone is suggested if it was scored PARTIAL or NOT_ACHIEVED, and isn't already a goal
    const suggested = (session.milestoneScores || [])
      .filter(s => (s.score === 'PARTIAL' || s.score === 'NOT_ACHIEVED') && !activeMilestoneIds.has(s.milestoneId))
      .map(s => {
        const m = milestoneMap[s.milestoneId];
        return {
          ...s,
          descriptionAr: m?.descriptionAr || 'وصف غير متوفر',
          areaName: m?.areaName || '',
          level: m?.level || '',
          milestoneNumber: m?.milestoneNumber || '',
        };
      });

    return { suggestedGoals: suggested, activeGoals: active };
  }, [session, skillAreasData]);

  if (isAreasLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  const STATUS_BADGES = {
    ACTIVE: { label: 'قيد التنفيذ', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
    ACHIEVED: { label: 'تم التحقيق', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
    DISCONTINUED: { label: 'متوقف', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-sm border border-gray-100 sticky top-0 z-10">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          <Target size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">الأهداف التربوية الفردية (IEP)</h2>
          <p className="text-sm text-gray-500">تحويل المهارات غير المكتملة إلى أهداف قابلة للتتبع</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Suggested Goals Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <AlertCircle size={20} className="text-amber-500" />
              أهداف مقترحة
            </h3>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
              {suggestedGoals.length} مهارة
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto hide-scrollbar pr-2">
            {suggestedGoals.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500">لا توجد مهارات مقترحة. جميع المهارات التي تم اختبارها مكتملة، أو لم تقم بتقييم أي مهارة بعد.</p>
              </div>
            ) : (
              suggestedGoals.map((sg) => (
                <div key={sg.milestoneId} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-200 transition-colors">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className="inline-block text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded mb-2 border border-indigo-100">
                        {sg.areaName} {sg.milestoneNumber}
                      </span>
                      <p className="text-sm font-medium text-gray-800 leading-relaxed mb-3">
                        {sg.descriptionAr}
                      </p>
                      
                      {/* Convert Form */}
                      {convertingMilestoneId === sg.milestoneId ? (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3 mt-2">
                          <input
                            type="text"
                            placeholder="وصف الهدف (قابل للتعديل)..."
                            value={newGoalForm.description}
                            onChange={(e) => setNewGoalForm({ ...newGoalForm, description: e.target.value })}
                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          <div className="flex gap-2">
                            <input
                              type="date"
                              value={newGoalForm.targetDate}
                              onChange={(e) => setNewGoalForm({ ...newGoalForm, targetDate: e.target.value })}
                              className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 flex-1"
                            />
                            <button
                              onClick={() => handleCreateGoal(sg.milestoneId)}
                              disabled={createGoalMutation.isPending}
                              className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                            >
                              حفظ
                            </button>
                            <button
                              onClick={() => setConvertingMilestoneId(null)}
                              className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-300"
                            >
                              إلغاء
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setConvertingMilestoneId(sg.milestoneId);
                            setNewGoalForm({ targetDate: '', description: sg.descriptionAr });
                          }}
                          className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          <PlusCircle size={16} />
                          تحويل إلى هدف
                        </button>
                      )}
                    </div>
                    
                    <span className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded border ${
                      sg.score === 'PARTIAL' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {sg.score === 'PARTIAL' ? 'جزئي' : 'لم يتحقق'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Goals Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Target size={20} className="text-blue-500" />
              الأهداف الحالية
            </h3>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
              {activeGoals.length} هدف
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto hide-scrollbar pr-2">
            {activeGoals.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500">لا توجد أهداف نشطة حالياً. قم بتحويل המهارات المقترحة لتبدأ.</p>
              </div>
            ) : (
              activeGoals.map((goal) => {
                const badge = STATUS_BADGES[goal.status] || STATUS_BADGES.ACTIVE;
                const Icon = badge.icon;

                return (
                  <div key={goal.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-200 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded border ${badge.color}`}>
                        <Icon size={12} />
                        {badge.label}
                      </span>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        المستهدف: {new Date(goal.targetDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium text-gray-800 leading-relaxed mb-4">
                      {goal.goalDescription}
                    </p>

                    <div className="flex gap-2 border-t border-gray-100 pt-3">
                      {goal.status !== 'ACTIVE' && (
                        <button
                          onClick={() => handleUpdateStatus(goal.id, 'ACTIVE')}
                          disabled={updateGoalMutation.isPending}
                          className="flex-1 text-xs font-semibold py-1.5 rounded border border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          تنشيط
                        </button>
                      )}
                      {goal.status !== 'ACHIEVED' && (
                        <button
                          onClick={() => handleUpdateStatus(goal.id, 'ACHIEVED')}
                          disabled={updateGoalMutation.isPending}
                          className="flex-1 text-xs font-semibold py-1.5 rounded border border-green-200 text-green-700 hover:bg-green-50"
                        >
                          تم التحقيق
                        </button>
                      )}
                      {goal.status !== 'DISCONTINUED' && (
                        <button
                          onClick={() => handleUpdateStatus(goal.id, 'DISCONTINUED')}
                          disabled={updateGoalMutation.isPending}
                          className="flex-1 text-xs font-semibold py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                          إيقاف
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IepGoalsTab;
