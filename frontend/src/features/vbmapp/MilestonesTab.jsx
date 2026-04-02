import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Check, Loader, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { doctorVbMapp } from '../../api/doctor';
import toast from 'react-hot-toast';

const MilestonesTab = ({ session, onUpdate }) => {
  const [milestoneScores, setMilestoneScores] = useState({});
  const [taskStepScores, setTaskStepScores] = useState({});
  
  // Sets now store composite keys for areas: "areaId_levelId"
  const [expandedLevels, setExpandedLevels] = useState(new Set(['LEVEL_1'])); // default expand level 1
  const [expandedAreas, setExpandedAreas] = useState(new Set());
  const [expandedMilestones, setExpandedMilestones] = useState(new Set());
  
  const [savingRows, setSavingRows] = useState(new Set());
  const [savedRows, setSavedRows] = useState(new Set());

  // Fetch areas and milestones
  const { data: skillAreasData, isLoading, isError } = useQuery({
    queryKey: ['vbmapp-skill-areas'],
    queryFn: async () => {
      const response = await doctorVbMapp.getSkillAreas();
      return response.data.data;
    },
  });

  // Initialize state from session
  useEffect(() => {
    if (session?.milestoneScores) {
      const mState = {};
      session.milestoneScores.forEach((m) => {
        mState[m.milestoneId] = m;
      });
      setMilestoneScores(mState);
    }
    if (session?.taskStepScores) {
      const tState = {};
      session.taskStepScores.forEach((t) => {
        tState[t.stepId] = t;
      });
      setTaskStepScores(tState);
    }
  }, [session]);

  const setRowSaveState = (id, state) => {
    if (state === 'saving') {
      setSavingRows(prev => new Set([...prev, id]));
      setSavedRows(prev => { const n = new Set(prev); n.delete(id); return n; });
    } else if (state === 'saved') {
      setSavingRows(prev => { const n = new Set(prev); n.delete(id); return n; });
      setSavedRows(prev => new Set([...prev, id]));
      setTimeout(() => {
        setSavedRows(prev => { const n = new Set(prev); n.delete(id); return n; });
      }, 2000);
    } else {
      setSavingRows(prev => { const n = new Set(prev); n.delete(id); return n; });
      setSavedRows(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const submitMilestoneMutation = useMutation({
    mutationFn: ({ data }) => doctorVbMapp.submitMilestones(session.id, { scores: [data] }),
    onMutate: ({ milestoneId }) => setRowSaveState(milestoneId, 'saving'),
    onSuccess: (_, { milestoneId }) => {
      setRowSaveState(milestoneId, 'saved');
      if (onUpdate) onUpdate();
    },
    onError: (_, { milestoneId }) => {
      setRowSaveState(milestoneId, 'error');
      toast.error('لم يتم الحفظ! يرجى التحقق من اتصالك بالإنترنت');
    },
  });

  const submitTaskStepMutation = useMutation({
    mutationFn: ({ data }) => doctorVbMapp.submitTaskSteps(session.id, { scores: [data] }),
    onMutate: ({ stepId }) => setRowSaveState(`ts-${stepId}`, 'saving'),
    onSuccess: (_, { stepId }) => {
      setRowSaveState(`ts-${stepId}`, 'saved');
    },
    onError: (_, { stepId }) => {
      setRowSaveState(`ts-${stepId}`, 'error');
      toast.error('حدث خطأ أثناء حفظ خطوة المهمة');
    },
  });

  const handleMilestoneScore = (e, milestoneId, scoreValue) => {
    e.stopPropagation();

    const currentScore = milestoneScores[milestoneId]?.score;
    const newScore = currentScore === scoreValue ? null : scoreValue;
    const scoreToSend = newScore || 'NOT_TESTED';

    const updatedScoreObj = {
      milestoneId,
      score: scoreToSend,
      notes: milestoneScores[milestoneId]?.notes || '',
    };

    setMilestoneScores(prev => ({
      ...prev,
      [milestoneId]: updatedScoreObj
    }));

    submitMilestoneMutation.mutate({ milestoneId, data: updatedScoreObj });
  };

  const handleTaskStepScore = (stepId, visualScore) => {
    const currentScore = getTaskStepVisualScore(stepId);
    const newScore = currentScore === visualScore ? null : visualScore;

    let isAchieved = false;
    let notes = '';

    if (newScore === 'ACHIEVED') {
      isAchieved = true;
    } else if (newScore === 'PARTIAL') {
      isAchieved = false;
      notes = 'PARTIAL';
    } else if (newScore === 'NOT_ACHIEVED') {
      isAchieved = false;
      notes = 'NOT_ACHIEVED'; 
    }

    const updatedScoreObj = {
      stepId,
      isAchieved,
      notes
    };

    setTaskStepScores(prev => ({
      ...prev,
      [stepId]: updatedScoreObj
    }));

    submitTaskStepMutation.mutate({ stepId, data: updatedScoreObj });
  };

  const getTaskStepVisualScore = (stepId) => {
    const s = taskStepScores[stepId];
    if (!s) return null;
    if (s.isAchieved) return 'ACHIEVED';
    if (s.notes === 'PARTIAL') return 'PARTIAL';
    if (s.isAchieved === false && s.notes === 'NOT_ACHIEVED') return 'NOT_ACHIEVED';
    return null;
  };

  // Calculations
  const calculations = useMemo(() => {
    const calc = {
      totalScore: 0,
      totalMax: 170, // VB-MAPP standard
      levelScores: { LEVEL_1: { score: 0, max: 0 }, LEVEL_2: { score: 0, max: 0 }, LEVEL_3: { score: 0, max: 0 } },
      areaScores: {} 
    };

    if (!skillAreasData) return calc;

    skillAreasData.forEach(area => {
      area.milestones?.forEach(m => {
        if (!m.level) return;

        const rowScore = milestoneScores[m.id]?.score;
        let points = 0;
        if (rowScore === 'ACHIEVED') points = 1;
        if (rowScore === 'PARTIAL') points = 0.5;

        // Level Aggregation
        if (calc.levelScores[m.level]) {
          calc.levelScores[m.level].score += points;
          calc.levelScores[m.level].max += 1;
        }

        // Area-Level Aggregation
        const areaLevelKey = `${area.id}_${m.level}`;
        if (!calc.areaScores[areaLevelKey]) {
          calc.areaScores[areaLevelKey] = { score: 0, max: 0, partialCount: 0 };
        }
        
        calc.areaScores[areaLevelKey].score += points;
        calc.areaScores[areaLevelKey].max += 1;
        if (rowScore === 'PARTIAL') {
          calc.areaScores[areaLevelKey].partialCount += 1;
        }
      });
    });

    calc.totalScore = calc.levelScores.LEVEL_1.score + calc.levelScores.LEVEL_2.score + calc.levelScores.LEVEL_3.score;
    return calc;
  }, [milestoneScores, skillAreasData]);

  // Initial auto-expand logic
  useEffect(() => {
    if (skillAreasData && expandedAreas.size === 0) {
      const initialAreas = new Set();
      const initialLevels = new Set(expandedLevels);

      skillAreasData.forEach(area => {
        area.milestones?.forEach(m => {
          if (!m.level) return;
          const key = `${area.id}_${m.level}`;
          const stats = calculations.areaScores[key];
          
          if (stats && (stats.partialCount > 0 || (stats.score > 0 && stats.score < stats.max))) {
            initialAreas.add(key);
            initialLevels.add(m.level);
          }
        });
      });

      if(initialAreas.size > 0) setExpandedAreas(initialAreas);
      if(initialLevels.size > expandedLevels.size) setExpandedLevels(initialLevels);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculations, skillAreasData]);

  if (isLoading) return <div className="flex justify-center p-12"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600" /></div>;
  if (isError) return <div className="text-center text-red-500 py-8">فشل تحميل المهارات.</div>;

  const toggleLevel = (id) => {
    setExpandedLevels(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleArea = (id) => {
    setExpandedAreas(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleMilestone = (e, id) => {
    e.stopPropagation();
    setExpandedMilestones(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const levels = [
    { id: 'LEVEL_1', title: 'المستوى الأول', ageRange: '(0 - 18 شهر)' },
    { id: 'LEVEL_2', title: 'المستوى الثاني', ageRange: '(18 - 30 شهر)' },
    { id: 'LEVEL_3', title: 'المستوى الثالث', ageRange: '(30 - 48 شهر)' }
  ];

  return (
    <div className="space-y-6 dir-rtl animate-in fade-in duration-300">
      
      {/* 1. Page Level Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 border-r-4 border-primary-500 pr-3">
            تقييم المهارات
          </h2>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2 pr-4 text-xs font-semibold text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 max-w-[150px] md:max-w-xs truncate" title={session.child?.name}>الطفل: <span className="font-bold">{session.child?.name || 'غير محدد'}</span></span>
            <span className="bg-primary-50 text-primary-700 px-2 py-1 rounded border border-primary-100">جلسة: <span className="font-bold">{session.sessionNumber}</span></span>
            <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">تاريخ: <span className="font-bold">{new Date(session.assessmentDate).toLocaleDateString()}</span></span>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-gray-50 px-5 py-3 rounded-xl border border-gray-200">
          <div className="text-sm font-bold text-gray-700">النتيجة الإجمالية:</div>
          <div className="text-xl font-black text-primary-600">{calculations.totalScore} <span className="text-sm text-gray-400 font-medium">/ 170</span></div>
          <div className="w-48 h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${(calculations.totalScore / 170) * 100}%`}}></div>
          </div>
        </div>
      </div>

      {/* 2. Level Accordion */}
      {levels.map((level) => {
        // Filter skill areas to only those that have milestones in THIS level
        const areasInLevel = skillAreasData.map(area => {
          return {
            ...area,
            milestones: area.milestones?.filter(m => m.level === level.id) || []
          };
        }).filter(area => area.milestones.length > 0);

        if (areasInLevel.length === 0) return null;
        
        const lvlStats = calculations.levelScores[level.id];
        const isLevelStarted = lvlStats.score > 0;
        const isLevelComplete = lvlStats.score === lvlStats.max && lvlStats.max > 0;
        const isLevelExpanded = expandedLevels.has(level.id);
        
        let levelStateClasses = '';
        if (!isLevelStarted) levelStateClasses = 'opacity-80 grayscale-[10%] border-dashed'; 
        else if (isLevelStarted && !isLevelComplete) levelStateClasses = 'border-primary-300 shadow-md ring-1 ring-primary-100'; 
        else if (isLevelComplete) levelStateClasses = 'border-green-300 bg-green-50/20'; 

        return (
          <div key={level.id} className={`bg-white rounded-[1.25rem] border border-gray-200 overflow-hidden transition-all duration-300 ${levelStateClasses}`}>
            
            {/* Level Header (Clickable for Expand/Collapse) */}
            <div 
              onClick={() => toggleLevel(level.id)}
              className="p-4 md:p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
            >
               <div className="flex items-center gap-3">
                 <div className={`p-1.5 rounded-lg border shadow-sm ${isLevelExpanded ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-white border-gray-200 text-gray-400'}`}>
                   {isLevelExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                 </div>
                 <h3 className="text-lg md:text-xl font-black text-gray-900">{level.title}</h3>
                 <span className="text-sm font-medium text-gray-500">{level.ageRange}</span>
               </div>
               <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                 {isLevelComplete && (
                   <span className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold shrink-0">
                     <CheckCircle2 size={16} /> مكتمل
                   </span>
                 )}
                 <div className="flex-1 md:w-72">
                   <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                     <span>مجموع المستوى</span>
                     <span className="text-gray-900 font-black">{lvlStats.score} <span className="text-gray-400 font-medium">/ {lvlStats.max}</span></span>
                   </div>
                   <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div 
                        className={`h-full rounded-full transition-all duration-500 ${isLevelComplete ? 'bg-green-500' : 'bg-primary-500'}`}
                        style={{ width: `${(lvlStats.score / (lvlStats.max || 1)) * 100}%`}}
                     />
                   </div>
                 </div>
               </div>
            </div>

            {/* Level Body: Areas Collapsibles */}
            {isLevelExpanded && (
              <div className="px-4 pb-4 space-y-3 bg-gray-50/30 pt-2 border-t border-gray-100/50">
                {areasInLevel.map((area) => {
                  const areaLevelKey = `${area.id}_${level.id}`;
                  const areaStats = calculations.areaScores[areaLevelKey] || { score: 0, max: area.milestones.length, partialCount: 0 };
                  const isExpanded = expandedAreas.has(areaLevelKey);
                  
                  return (
                    <div key={areaLevelKey} className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
                      {/* Area Header */}
                      <div 
                        onClick={() => toggleArea(areaLevelKey)}
                        className="flex items-center justify-between p-3.5 bg-gray-50/80 hover:bg-gray-100/80 cursor-pointer select-none transition-colors border-b border-transparent data-[expanded=true]:border-gray-100"
                        data-expanded={isExpanded}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-gray-900 text-base">{area.nameAr}</h4>
                              <span className="bg-white border border-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-widest">{area.code}</span>
                            </div>
                            
                            {/* Dot progress */}
                            <div className="flex items-center gap-1.5 mt-2" dir="ltr">
                              {Array.from({ length: areaStats.max }).map((_, i) => {
                                 const solidDots = Math.floor(areaStats.score);
                                 const hasHalf = areaStats.score % 1 > 0;
                                 
                                 if (i < solidDots) return <div key={i} className="w-2.5 h-2.5 rounded-full bg-primary-600 shadow-sm" />;
                                 if (i === solidDots && hasHalf) return <div key={i} className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />;
                                 return <div key={i} className="w-2.5 h-2.5 rounded-full bg-gray-100 shadow-inner" />;
                              })}
                              <span className="text-[10px] font-bold text-gray-400 ml-2 pt-0.5">{areaStats.score} / {areaStats.max}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-gray-400 p-1 bg-white rounded-lg border border-gray-200 shadow-sm">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>

                      {/* Milestones Rows */}
                      {isExpanded && (
                        <div className="divide-y divide-gray-100 flex flex-col">
                          {area.milestones.map((milestone, index) => {
                            const currentScore = milestoneScores[milestone.id]?.score;
                            const isRowSaving = savingRows.has(milestone.id);
                            const isRowSaved = savedRows.has(milestone.id);
                            const hasTaskSteps = milestone.taskSteps && milestone.taskSteps.length > 0;
                            const isMilestoneExpanded = expandedMilestones.has(milestone.id);

                            return (
                              <div key={milestone.id} className="flex flex-col">
                                {/* Main Milestone Row */}
                                <div 
                                  className={`group flex flex-col lg:flex-row lg:items-center gap-4 p-3 md:px-5 hover:bg-gray-50/50 transition-colors ${hasTaskSteps ? 'cursor-pointer' : ''} ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                                  onClick={(e) => hasTaskSteps && toggleMilestone(e, milestone.id)}
                                >
                                  
                                  <div className="flex-1 flex items-start gap-4 min-w-0">
                                    <div className="flex-shrink-0 flex flex-col items-center gap-1">
                                      <span className="w-8 h-8 flex items-center justify-center font-bold text-sm rounded-full bg-gray-100 text-gray-700 shadow-sm border border-gray-200">
                                        {milestone.milestoneNumber}
                                      </span>
                                      {hasTaskSteps && (
                                        <div className="text-gray-400 bg-white group-hover:bg-primary-50 rounded-full p-0.5 border border-gray-200 group-hover:border-primary-200 transition-colors shadow-sm -mt-2 z-10" title="إظهار خطوات المهمة">
                                          {isMilestoneExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="min-w-0 flex-1 pt-1">
                                      <div className="relative cursor-help leading-none inline-block max-w-full">
                                        <p className="text-[13px] md:text-sm font-semibold text-gray-800 break-words mb-2 peer line-clamp-2 md:line-clamp-1">
                                          {milestone.descriptionAr}
                                        </p>
                                        {/* Tooltip on hover */}
                                        <div className="absolute right-0 bottom-full mb-2 hidden peer-hover:block w-max max-w-[280px] md:max-w-md bg-gray-900 border border-gray-700 text-white text-xs font-medium p-3 rounded-lg shadow-xl z-50 leading-relaxed pointer-events-none">
                                          {milestone.descriptionAr}
                                          <div className="absolute top-full right-4 -mt-px border-4 border-transparent border-t-gray-700"></div>
                                        </div>
                                      </div>
                                      <div>
                                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${
                                          milestone.assessmentMethod === 'OBSERVATION' ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm' :
                                          milestone.assessmentMethod === 'DIRECT' ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' :
                                          milestone.assessmentMethod === 'TIMED' ? 'bg-orange-50 text-orange-700 border-orange-200 shadow-sm' :
                                          'bg-teal-50 text-teal-700 border-teal-200 shadow-sm'
                                        }`}>
                                          {milestone.assessmentMethod === 'OBSERVATION' ? 'مراقبة' :
                                          milestone.assessmentMethod === 'DIRECT' ? 'مباشر' :
                                          milestone.assessmentMethod === 'TIMED' ? 'مؤقت' : 'مباشر / مراقبة'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Milestone Score Controls */}
                                  <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pl-1 mt-2 lg:mt-0 ml-12 lg:ml-0">
                                    <div className="w-5 shrink-0 flex justify-center">
                                      {isRowSaving && <Loader size={14} className="text-primary-500 animate-spin" />}
                                      {isRowSaved && <Check size={16} className="text-green-500 animate-in zoom-in" />}
                                    </div>

                                    <div className="flex items-center gap-1.5 p-1 bg-gray-100/70 rounded-[10px] border border-gray-200 shadow-inner">
                                      <ScoreButton 
                                        label="تحقق" 
                                        isActive={currentScore === 'ACHIEVED'} 
                                        onClick={(e) => handleMilestoneScore(e, milestone.id, 'ACHIEVED')} 
                                        activeClass="bg-green-500 text-white shadow ring-1 ring-green-600"
                                        inactiveClass="bg-white text-gray-600 hover:bg-green-50 border border-gray-200 hover:border-green-200"
                                      />
                                      <ScoreButton 
                                        label="جزئي" 
                                        isActive={currentScore === 'PARTIAL'} 
                                        onClick={(e) => handleMilestoneScore(e, milestone.id, 'PARTIAL')} 
                                        activeClass="bg-amber-400 text-white shadow ring-1 ring-amber-500"
                                        inactiveClass="bg-white text-gray-600 hover:bg-amber-50 border border-gray-200 hover:border-amber-200"
                                      />
                                      <ScoreButton 
                                        label="لم يتحقق" 
                                        isActive={currentScore === 'NOT_ACHIEVED'} 
                                        onClick={(e) => handleMilestoneScore(e, milestone.id, 'NOT_ACHIEVED')} 
                                        activeClass="bg-red-500 text-white shadow ring-1 ring-red-600"
                                        inactiveClass="bg-white text-gray-600 hover:bg-red-50 border border-gray-200 hover:border-red-200"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Task Steps Sub-rows */}
                                {hasTaskSteps && isMilestoneExpanded && (
                                  <div className="bg-gray-50/90 border-t border-gray-200/60 flex flex-col pr-12 pb-3 pt-1 shadow-inner relative">
                                    <div className="absolute top-0 bottom-0 right-7 w-px bg-gray-200"></div>
                                    <div className="text-[10px] font-extrabold text-gray-400/80 uppercase tracking-widest py-2 px-2">خطوات المهمة</div>
                                    
                                    <div className="flex flex-col gap-1.5">
                                      {milestone.taskSteps.map((step) => {
                                        const tsScore = getTaskStepVisualScore(step.id);
                                        const isTsSaving = savingRows.has(`ts-${step.id}`);
                                        const isTsSaved = savedRows.has(`ts-${step.id}`);

                                        return (
                                          <div key={step.id} className="relative flex flex-col lg:flex-row lg:items-center gap-3 py-2 px-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-primary-200 transition-colors group/ts mr-2">
                                            <div className="absolute right-0 top-1/2 -mr-3 w-3 border-t border-gray-200"></div>
                                            <div className="flex-1 flex items-start gap-2 pt-0.5">
                                              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 mt-px shrink-0">{step.stepCode}</span>
                                              <p className="text-xs font-semibold text-gray-700 leading-snug">{step.descriptionAr}</p>
                                            </div>
                                            
                                            <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 ml-7 lg:ml-0">
                                              <div className="w-5 flex justify-center opacity-0 group-hover/ts:opacity-100 transition-opacity">
                                                {isTsSaving && <Loader size={12} className="text-primary-500 animate-spin" />}
                                                {isTsSaved && <Check size={14} className="text-green-500" />}
                                              </div>

                                              <div className="flex items-center gap-1 p-0.5 bg-gray-50 rounded-lg border border-gray-200 shadow-inner">
                                                <ScoreButton 
                                                  label="تحقق" size="sm"
                                                  isActive={tsScore === 'ACHIEVED'} 
                                                  onClick={(e) => { e.stopPropagation(); handleTaskStepScore(step.id, 'ACHIEVED'); }} 
                                                  activeClass="bg-green-500 text-white shadow-sm ring-1 ring-green-600"
                                                  inactiveClass="bg-white text-gray-500 hover:bg-green-50 hover:text-green-700 border border-gray-200"
                                                />
                                                <ScoreButton 
                                                  label="جزئي" size="sm"
                                                  isActive={tsScore === 'PARTIAL'} 
                                                  onClick={(e) => { e.stopPropagation(); handleTaskStepScore(step.id, 'PARTIAL'); }} 
                                                  activeClass="bg-amber-400 text-white shadow-sm ring-1 ring-amber-500"
                                                  inactiveClass="bg-white text-gray-500 hover:bg-amber-50 hover:text-amber-700 border border-gray-200"
                                                />
                                                <ScoreButton 
                                                  label="لم يتحقق" size="sm" 
                                                  isActive={tsScore === 'NOT_ACHIEVED'} 
                                                  onClick={(e) => { e.stopPropagation(); handleTaskStepScore(step.id, 'NOT_ACHIEVED'); }} 
                                                  activeClass="bg-red-500 text-white shadow-sm ring-1 ring-red-600"
                                                  inactiveClass="bg-white text-gray-500 hover:bg-red-50 hover:text-red-700 border border-gray-200"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const ScoreButton = ({ label, isActive, onClick, activeClass, inactiveClass, size = 'default' }) => {
  const padding = size === 'sm' ? 'px-2 py-1 text-[10px]' : 'px-3 md:px-4 py-1.5 md:py-1 text-xs';
  return (
    <button
      onClick={onClick}
      className={`font-semibold transition-all duration-200 rounded-[7px] shrink-0 select-none ${padding} ${isActive ? activeClass : inactiveClass}`}
    >
      {label}
    </button>
  );
};

export default MilestonesTab;
