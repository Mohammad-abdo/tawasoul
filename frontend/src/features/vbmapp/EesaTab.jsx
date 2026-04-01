import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Check, Loader, Mic } from 'lucide-react';
import { doctorVbMapp } from '../../api/doctor';
import toast from 'react-hot-toast';

const EesaTab = ({ session, onUpdate }) => {
  const [localScores, setLocalScores] = useState({});
  const [saveStatus, setSaveStatus] = useState('idle');

  const { data: eesaGroupsData, isLoading, isError } = useQuery({
    queryKey: ['vbmapp-eesa-groups'],
    queryFn: async () => {
      const response = await doctorVbMapp.getEesaGroups();
      return response.data.data;
    },
  });

  useEffect(() => {
    if (session?.eesaScores) {
      const initialScores = {};
      session.eesaScores.forEach((scoreObj) => {
        initialScores[scoreObj.itemId] = scoreObj;
      });
      setLocalScores(initialScores);
    }
  }, [session]);

  const submitMutation = useMutation({
    mutationFn: (scoresArray) =>
      doctorVbMapp.submitEesa(session.id, { scores: scoresArray }),
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

  const handleScoreChange = (itemId, scoreValue) => {
    const updatedScoreObj = {
      itemId,
      score: scoreValue,
      notes: localScores[itemId]?.notes || '',
    };
    
    setLocalScores((prev) => ({
      ...prev,
      [itemId]: updatedScoreObj,
    }));

    submitMutation.mutate([updatedScoreObj]);
  };

  const SCORE_OPTIONS = [
    { value: 'ACHIEVED', label: '1', title: 'تحقق (نقطة كاملة)', color: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300 ring-green-400' },
    { value: 'PARTIAL', label: '0.5', title: 'جزئي (نصف نقطة)', color: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300 ring-amber-400' },
    { value: 'NOT_ACHIEVED', label: '0', title: 'لم يتحقق (لا توجد نقطة)', color: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300 ring-red-400' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-center text-red-500 py-8">فشل تحميل مجموعات المهارات الصوتية. يرجى المحاولة مرة أخرى.</div>;
  }

  const eesaGroups = eesaGroupsData || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
            <Mic size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">المهارات الصوتية (EESA)</h2>
            <p className="text-sm text-gray-500">تقييم النطق والتقليد الصوتي</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {eesaGroups.map((group) => (
          <div key={group.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-4">
              <h3 className="font-bold text-gray-900">{group.nameAr}</h3>
            </div>
            
            <div className="divide-y divide-gray-50 flex-1">
              {group.items?.map((item) => {
                const currentScore = localScores[item.id]?.score;

                return (
                  <div key={item.id} className="p-3 hover:bg-gray-50/50 transition-colors flex items-center justify-between gap-4">
                    <span className="font-semibold text-lg text-gray-800 mr-2 min-w-[3rem]">
                      {item.word}
                    </span>
                    
                    <div className="flex gap-1.5">
                      {SCORE_OPTIONS.map((option) => {
                        const isSelected = currentScore === option.value;
                        return (
                          <button
                            key={option.value}
                            title={option.title}
                            onClick={() => handleScoreChange(item.id, option.value)}
                            className={`w-12 h-10 flex items-center justify-center font-bold text-sm rounded-lg border transition-all duration-200 ${
                              isSelected 
                                ? `${option.color} shadow-sm ring-2 ring-offset-1`
                                : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-600'
                            }`}
                          >
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
      
      {/* Legend */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-600">
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> 1: نقطة كاملة</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div> 0.5: نصف نقطة</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> 0: لا توجد نقطة</span>
      </div>
    </div>
  );
};

export default EesaTab;
