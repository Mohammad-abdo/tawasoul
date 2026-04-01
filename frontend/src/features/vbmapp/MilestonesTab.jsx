import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Check, Loader, Info, HelpCircle } from 'lucide-react';
import { doctorVbMapp } from '../../api/doctor';
import toast from 'react-hot-toast';

const MilestonesTab = ({ session, onUpdate }) => {
  const [localScores, setLocalScores] = useState({});
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'

  // Fetch all skill areas and their milestones
  const { data: skillAreasData, isLoading, isError } = useQuery({
    queryKey: ['vbmapp-skill-areas'],
    queryFn: async () => {
      const response = await doctorVbMapp.getSkillAreas();
      return response.data.data;
    },
  });

  // Initialize local score state from the session
  useEffect(() => {
    if (session?.milestoneScores) {
      const initialScores = {};
      session.milestoneScores.forEach((scoreObj) => {
        initialScores[scoreObj.milestoneId] = scoreObj;
      });
      setLocalScores(initialScores);
    }
  }, [session]);

  const submitMutation = useMutation({
    mutationFn: (scoresArray) =>
      doctorVbMapp.submitMilestones(session.id, { scores: scoresArray }),
    onMutate: () => {
      setSaveStatus('saving');
    },
    onSuccess: () => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000); // Back to idle after 2 sec
      if (onUpdate) onUpdate();
    },
    onError: () => {
      setSaveStatus('idle');
      toast.error('لم يتم الحفظ! يرجى التحقق من اتصالك بالإنترنت');
    },
  });

  const handleScoreChange = (milestoneId, scoreValue) => {
    // Update local state instantly for snappy UI
    const updatedScoreObj = {
      milestoneId,
      score: scoreValue,
      notes: localScores[milestoneId]?.notes || '',
    };
    
    setLocalScores((prev) => ({
      ...prev,
      [milestoneId]: updatedScoreObj,
    }));

    // Auto-save just this modified score
    submitMutation.mutate([updatedScoreObj]);
  };

  const SCORE_OPTIONS = [
    { value: 'ACHIEVED', label: 'تحقق', color: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300' },
    { value: 'PARTIAL', label: 'جزئي', color: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300' },
    { value: 'NOT_ACHIEVED', label: 'لم يتحقق', color: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-center text-red-500 py-8">فشل تحميل المهارات. يرجى المحاولة مرة أخرى.</div>;
  }

  const skillAreas = skillAreasData || [];
  
  // Group skill areas by Level
  const levels = [
    { id: 'LEVEL_1', title: 'المستوى الأول (0 - 18 شهر)' },
    { id: 'LEVEL_2', title: 'المستوى الثاني (18 - 30 شهر)' },
    { id: 'LEVEL_3', title: 'المستوى الثالث (30 - 48 شهر)' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">تقييم المهارات (Milestones)</h2>
          <p className="text-sm text-gray-500">قم بتقييم كل مهارة ليتم حفظ النتيجة تلقائياً</p>
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
        const levelAreas = skillAreas.filter((area) => area.level === level.id);
        
        if (levelAreas.length === 0) return null;

        return (
          <div key={level.id} className="space-y-6">
            <h3 className="text-xl font-extrabold text-primary-900 border-b-2 border-primary-100 pb-2">
              {level.title}
            </h3>
            
            <div className="space-y-6">
              {levelAreas.map((area) => (
                <div key={area.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  {/* Area Header */}
                  <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 text-lg">
                      {area.nameAr} <span className="text-gray-500 text-sm font-normal">({area.nameEn})</span>
                    </h4>
                    <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                      {area.code}
                    </span>
                  </div>

                  {/* Milestones List */}
                  <div className="divide-y divide-gray-100">
                    {area.milestones?.map((milestone) => {
                      const currentScore = localScores[milestone.id]?.score;
                      
                      return (
                        <div key={milestone.id} className="p-4 md:p-6 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary-100 text-primary-700 font-bold rounded-lg text-sm">
                                {milestone.milestoneNumber}
                              </span>
                              <div>
                                <p className="text-gray-800 text-sm md:text-base font-medium leading-relaxed">
                                  {milestone.descriptionAr}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    طريقة التقييم:
                                  </span>
                                  <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded border border-primary-100">
                                    {milestone.assessmentMethod === 'OBSERVATION' ? 'مراقبة (م)' :
                                     milestone.assessmentMethod === 'DIRECT' ? 'مباشر (ف)' :
                                     milestone.assessmentMethod === 'TIMED' ? 'مؤقت (م.م)' : 'مباشر/مراقبة (ف/م)'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Score Controls */}
                          <div className="flex-shrink-0 flex gap-2">
                            {SCORE_OPTIONS.map((option) => {
                              const isSelected = currentScore === option.value;
                              return (
                                <button
                                  key={option.value}
                                  onClick={() => handleScoreChange(milestone.id, option.value)}
                                  className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all duration-200 flex items-center gap-1.5 ${
                                    isSelected 
                                      ? `${option.color} shadow-sm ring-2 ring-offset-1 ring-${option.color.split('-')[1]}-400`
                                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                  }`}
                                >
                                  {isSelected && <Check size={14} />}
                                  {option.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
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

export default MilestonesTab;
