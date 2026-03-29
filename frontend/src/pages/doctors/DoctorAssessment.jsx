import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { doctorAssessments } from '../../api/doctor';
import { 
  Play, 
  Pause, 
  Volume2, 
  Image as ImageIcon, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight,
  Save,
  AlertCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorAssessment = () => {
  const { testId, childId } = useParams();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState({});
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Get test details and questions
  const { data: test, isLoading } = useQuery({
    queryKey: ['assessment-test', testId],
    queryFn: async () => {
      const response = await doctorAssessments.getTestQuestions(testId);
      return response.data.data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data) => doctorAssessments.submitResult(data),
    onSuccess: () => {
      toast.success('تم حفظ نتيجة الاختبار بنجاح');
      navigate(-1);
    },
  });

  const questions = test || [];
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  const playAudio = (path) => {
    if (audio) audio.pause();
    // In a real app, this would be a full URL
    const newAudio = new Audio(`http://localhost:3000/${path}`);
    newAudio.play();
    setAudio(newAudio);
    setIsPlaying(true);
    newAudio.onended = () => setIsPlaying(false);
  };

  const handleScoreChange = (score) => {
    setScores({
      ...scores,
      [currentQuestion.id]: score
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setIsPlaying(false);
    }
  };

  const handleFinish = () => {
    const results = Object.keys(scores).map(qId => ({
      questionId: qId,
      scoreGiven: scores[qId]
    }));

    if (results.length < questions.length) {
      if (!window.confirm('لم يتم تقييم جميع الأسئلة، هل تريد الحفظ على أي حال؟')) return;
    }

    // Since our backend submitAssessmentResult takes one result at a time, 
    // we'll loop or update the API to take multiple. 
    // For now, let's just submit them.
    results.forEach(res => {
      submitMutation.mutate({
        childId,
        questionId: res.questionId,
        scoreGiven: res.scoreGiven,
        sessionId: `session-${Date.now()}` // Mock session ID
      });
    });
  };

  if (isLoading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-primary-600">
          <ChevronRight size={20} /> إلغاء الاختبار
        </button>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-500">سؤال {currentQuestionIndex + 1} من {questions.length}</span>
          <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-600 transition-all duration-500" 
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] p-8 md:p-12 border border-gray-200 shadow-2xl bg-white text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">تقييم استجابة الطفل</h2>

        {/* Media Content Section */}
        <div className="mb-12 p-8 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[300px]">
          {currentQuestion?.audioAssetPath && (
            <div className="space-y-6">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto shadow-inner">
                <Volume2 size={48} className="text-blue-600" />
              </div>
              <button 
                onClick={() => playAudio(currentQuestion.audioAssetPath)}
                className={`px-8 py-4 rounded-2xl flex items-center gap-3 font-bold transition-all ${
                  isPlaying ? 'bg-orange-500 text-white animate-pulse' : 'bg-primary-600 text-white hover:scale-105'
                }`}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                {isPlaying ? 'جاري التشغيل...' : 'تشغيل الصوت للمحاكاة'}
              </button>
            </div>
          )}

          {currentQuestion?.imageAssetPath && (
            <div className="space-y-6">
              <div className="w-64 h-64 rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                <img 
                  src={`http://localhost:3000/${currentQuestion.imageAssetPath}`} 
                  alt="Question Asset" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <p className="text-gray-500 font-medium flex items-center gap-2 justify-center">
                <ImageIcon size={18} /> تم عرض الصورة للطفل
              </p>
            </div>
          )}

          {!currentQuestion?.audioAssetPath && !currentQuestion?.imageAssetPath && (
            <div className="text-gray-400">
              <AlertCircle size={48} className="mx-auto mb-4" />
              <p>لا يوجد وسائط لهذا السؤال</p>
            </div>
          )}
        </div>

        {/* Scoring Guide */}
        <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100 mb-10 text-right">
          <h4 className="font-bold text-primary-800 mb-2 flex items-center gap-2">
            <CheckCircle size={18} /> دليل التقييم:
          </h4>
          <p className="text-sm text-primary-700 leading-relaxed">
            {currentQuestion?.scoringGuide || 'قم بتقييم استجابة الطفل بناءً على الملاحظة المباشرة.'}
          </p>
        </div>

        {/* Scoring Buttons */}
        <div className="space-y-4">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">اختر درجة الاستجابة</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                onClick={() => handleScoreChange(num)}
                className={`w-12 h-12 rounded-xl font-black text-lg transition-all transform hover:scale-110 ${
                  scores[currentQuestion?.id] === num 
                    ? 'bg-primary-600 text-white shadow-xl scale-110 rotate-3' 
                    : 'bg-white text-gray-400 border-2 border-gray-100 hover:border-primary-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button 
            onClick={handlePrev} 
            disabled={currentQuestionIndex === 0}
            className="btn-secondary flex items-center gap-2 px-6 disabled:opacity-30"
          >
            <ChevronRight size={20} /> السابق
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button 
              onClick={handleFinish}
              className="btn-primary flex items-center gap-2 px-12 bg-green-600 hover:bg-green-700 shadow-green-200 shadow-lg"
            >
              <Save size={20} /> إنهاء وحفظ النتائج
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="btn-primary flex items-center gap-2 px-8 shadow-primary-200 shadow-lg"
            >
              التالي <ChevronLeft size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorAssessment;
