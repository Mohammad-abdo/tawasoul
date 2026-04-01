import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Check, Loader, ShieldAlert } from 'lucide-react';
import { doctorVbMapp } from '../../api/doctor';
import toast from 'react-hot-toast';

const BarriersTab = ({ session, onUpdate }) => {
  const [localScores, setLocalScores] = useState({});
  const [saveStatus, setSaveStatus] = useState('idle');

  const { data: barriersData, isLoading, isError } = useQuery({
    queryKey: ['vbmapp-barriers'],
    queryFn: async () => {
      const response = await doctorVbMapp.getBarriers();
      return response.data.data;
    },
  });

  useEffect(() => {
    if (session?.barrierScores) {
      const initialScores = {};
      session.barrierScores.forEach((scoreObj) => {
        initialScores[scoreObj.barrierId] = scoreObj;
      });
      setLocalScores(initialScores);
    }
  }, [session]);

  const submitMutation = useMutation({
    mutationFn: (scoresArray) =>
      doctorVbMapp.submitBarriers(session.id, { scores: scoresArray }),
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

  const handleScoreChange = (barrierId, scoreValue) => {
    const updatedScoreObj = {
      barrierId,
      score: scoreValue,
      notes: localScores[barrierId]?.notes || '',
    };
    
    setLocalScores((prev) => ({
      ...prev,
      [barrierId]: updatedScoreObj,
    }));

    submitMutation.mutate([updatedScoreObj]);
  };

  const SCORE_OPTIONS = [
    { value: 'ZERO', label: '0', title: 'لا يوجد عائق', color: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300 ring-green-400' },
    { value: 'ONE', label: '1', title: 'عائق بسيط', color: 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200 ring-green-300' },
    { value: 'TWO', label: '2', title: 'عائق متوسط', color: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300 ring-amber-400' },
    { value: 'THREE', label: '3', title: 'عائق شديد', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-300 ring-orange-400' },
    { value: 'FOUR', label: '4', title: 'عائق شديد جداً', color: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300 ring-red-400' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-center text-red-500 py-8">فشل تحميل العوائق. يرجى المحاولة مرة أخرى.</div>;
  }

  const barriers = barriersData || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 text-red-600 rounded-lg">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">تقييم العوائق (Barriers)</h2>
            <p className="text-sm text-gray-500">من 0 (لا يوجد عائق) إلى 4 (عائق شديد)</p>
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

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-100">
          {barriers.map((barrier, index) => {
            const currentScore = localScores[barrier.id]?.score;
            
            return (
              <div key={barrier.id} className="p-4 md:p-6 hover:bg-gray-50/50 transition-colors flex flex-col xl:flex-row xl:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 font-bold rounded-lg text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-gray-900 text-base mb-1">
                        {barrier.nameAr}
                      </h4>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                        {barrier.nameEn}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 flex flex-wrap gap-2 justify-end">
                  {SCORE_OPTIONS.map((option) => {
                    const isSelected = currentScore === option.value;
                    return (
                      <button
                        key={option.value}
                        title={option.title}
                        onClick={() => handleScoreChange(barrier.id, option.value)}
                        className={`w-12 h-12 flex items-center justify-center text-lg font-bold rounded-xl border transition-all duration-200 ${
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
      
      {/* Legend */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-wrap justify-between gap-4 text-sm font-medium text-gray-600">
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> 0: لا يوجد عائق</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-300"></div> 1: عائق بسيط</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div> 2: عائق متوسط</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> 3: عائق شديد</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> 4: شديد جداً</span>
      </div>
    </div>
  );
};

export default BarriersTab;
