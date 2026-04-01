import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Check, Loader, ActivitySquare } from 'lucide-react';
import { doctorVbMapp } from '../../api/doctor';
import toast from 'react-hot-toast';

const TaskStepsTab = ({ session, onUpdate }) => {
  const [localScores, setLocalScores] = useState({});
  const [saveStatus, setSaveStatus] = useState('idle');

  // Reuse the skill areas endpoint since it includes taskSteps nested inside
  const { data: skillAreasData, isLoading, isError } = useQuery({
    queryKey: ['vbmapp-skill-areas'],
    queryFn: async () => {
      const response = await doctorVbMapp.getSkillAreas();
      return response.data.data;
    },
  });

  useEffect(() => {
    if (session?.taskStepScores) {
      const initialScores = {};
      session.taskStepScores.forEach((scoreObj) => {
        initialScores[scoreObj.stepId] = scoreObj;
      });
      setLocalScores(initialScores);
    }
  }, [session]);

  const submitMutation = useMutation({
    mutationFn: (scoresArray) =>
      doctorVbMapp.submitTaskSteps(session.id, { scores: scoresArray }),
    onMutate: () => {
      setSaveStatus('saving');
    },
    onSuccess: () => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      if (onUpdate) onUpdate();
    },
    onError: () => {
      setSaveStatus('idle');
      toast.error('لم يتم الحفظ! يرجى التحقق من اتصالك بالإنترنت');
    },
  });

  const handleScoreChange = (stepId, isAchieved) => {
    const updatedScoreObj = {
      stepId,
      isAchieved,
      notes: localScores[stepId]?.notes || '',
    };
    
    setLocalScores((prev) => ({
      ...prev,
      [stepId]: updatedScoreObj,
    }));

    submitMutation.mutate([updatedScoreObj]);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-center text-red-500 py-8">فشل تحميل خطوات المهام. يرجى المحاولة مرة أخرى.</div>;
  }

  const skillAreas = skillAreasData || [];
  
  const levels = [
    { id: 'LEVEL_1', title: 'المستوى الأول (0 - 18 شهر)' },
    { id: 'LEVEL_2', title: 'المستوى الثاني (18 - 30 شهر)' },
    { id: 'LEVEL_3', title: 'المستوى الثالث (30 - 48 شهر)' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
            <ActivitySquare size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">تحليل المهام (Task Steps)</h2>
            <p className="text-sm text-gray-500">قائمة مرجعية للخطوات المكونة للمهارات</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-2 text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full">
              <Loader size={16} className="animate-spin" />
              جاري الحفظ...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
              <Check size={16} />
              تم الحفظ
            </span>
          )}
        </div>
      </div>

      {levels.map((level) => {
        // Filter areas that belong to this level AND have at least one milestone with task steps
        const levelAreas = skillAreas
          .filter((area) => area.level === level.id)
          .map((area) => ({
            ...area,
            milestones: area.milestones?.filter(m => m.taskSteps && m.taskSteps.length > 0) || []
          }))
          .filter((area) => area.milestones.length > 0);
        
        if (levelAreas.length === 0) return null;

        return (
          <div key={level.id} className="space-y-6">
            <h3 className="text-xl font-extrabold text-purple-900 border-b-2 border-purple-100 pb-2">
              {level.title}
            </h3>
            
            <div className="space-y-6">
              {levelAreas.map((area) => (
                <div key={area.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                    <h4 className="font-bold text-gray-900 text-lg">
                      {area.nameAr} <span className="text-gray-500 text-sm font-normal">({area.nameEn})</span>
                    </h4>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {area.milestones.map((milestone) => (
                      <div key={milestone.id} className="p-4 md:p-6 hover:bg-gray-50/30 transition-colors">
                        <div className="flex flex-col md:flex-row gap-6">
                          
                          {/* Milestone Reference */}
                          <div className="md:w-1/3 border-b md:border-b-0 md:border-l border-gray-100 pb-4 md:pb-0 md:pl-6">
                            <div className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 font-bold rounded-lg text-sm">
                                {milestone.milestoneNumber}
                              </span>
                              <div>
                                <p className="text-gray-700 text-sm font-medium">
                                  {milestone.descriptionAr}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Task Steps Checklist */}
                          <div className="md:w-2/3 space-y-3">
                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                              خطوات المهمة
                            </h5>
                            {milestone.taskSteps.map((step) => {
                              const isAchieved = localScores[step.id]?.isAchieved || false;
                              
                              return (
                                <label 
                                  key={step.id} 
                                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                                    isAchieved 
                                      ? 'bg-purple-50 border-purple-200' 
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="relative flex items-center pt-1">
                                    <input 
                                      type="checkbox" 
                                      className="peer sr-only"
                                      checked={isAchieved}
                                      onChange={(e) => handleScoreChange(step.id, e.target.checked)}
                                    />
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                      isAchieved 
                                        ? 'bg-purple-600 border-purple-600 text-white' 
                                        : 'bg-white border-gray-300 text-transparent hover:border-purple-400'
                                    }`}>
                                      <Check size={14} strokeWidth={3} />
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-xs font-bold text-gray-500 whitespace-nowrap">
                                        {step.stepCode}
                                      </span>
                                      <p className={`text-sm ${isAchieved ? 'text-purple-900 font-medium' : 'text-gray-700'}`}>
                                        {step.descriptionAr}
                                      </p>
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskStepsTab;
