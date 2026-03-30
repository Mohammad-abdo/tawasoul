import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'; // أضفنا useQueryClient هنا
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  Save,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorAssessments } from '../../api/doctor';
import AssessmentQuestionRenderer from '../../features/assessments/AssessmentQuestionRenderer';
import { getAssessmentConfig } from '../../features/assessments/assessmentRegistry';
import {
  getManualScoreOptions,
  getTestDisplayDescription,
  getTestDisplayTitle,
} from '../../features/assessments/assessmentUiUtils';

const DoctorAssessment = () => {
  const { testId, childId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // تعريف queryClient لمسح الكاش
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState({});
  const [questionResponses, setQuestionResponses] = useState({});
  const [audio, setAudio] = useState(null);

  const {
    data: test,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['assessment-test-detail', testId],
    queryFn: async () => {
      const response = await doctorAssessments.getTestById(testId);
      return response.data.data;
    },
  });

  // تعديل الـ Mutation عشان يوجه الريكويست حسب نوع الاختبار
  const submitMutation = useMutation({
    mutationFn: (payload) => {
      if (test?.testType === 'CARS') {
        // تأكد إن الدالة دي متعرفة في ملف api/doctor.js
        return doctorAssessments.submitCarsResult(payload); 
      }
      // مسار افتراضي لأي اختبارات تانية مستقبلاً
      return doctorAssessments.submitResult(payload); 
    },
  });

  const questions = test?.questions || [];
  const currentQuestion = questions[currentQuestionIndex] || null;
  const config = getAssessmentConfig(test?.testType);
  const supportsManualScoring = config.supportsManualScoring;
  const scoreOptions = getManualScoreOptions(currentQuestion);
  const isCars = test?.testType === 'CARS';
  const isCarsQuestionSetInvalid = isCars && questions.length > 0 && questions.length !== 15;

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setScores({});
    setQuestionResponses({});
  }, [test?.id]);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  const playAudio = (url) => {
    if (!url) return;
    if (audio) audio.pause();

    const nextAudio = new Audio(url);
    nextAudio.play();
    setAudio(nextAudio);
    nextAudio.onended = () => setAudio(null);
  };

  const handleScoreChange = (score) => {
    if (!currentQuestion || !supportsManualScoring) {
      return;
    }

    setScores((previousScores) => ({
      ...previousScores,
      [currentQuestion.id]: score,
    }));
  };

  const handleQuestionResponseChange = (nextResponse) => {
    if (!currentQuestion) {
      return;
    }

    setQuestionResponses((previousResponses) => ({
      ...previousResponses,
      [currentQuestion.id]: nextResponse,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((previousIndex) => previousIndex - 1);
    }
  };

  const handleFinish = async () => {
    if (!test) return;

    if (!supportsManualScoring) {
      toast.success('تمت معاينة محتوى الاختبار بنجاح');
      navigate(-1);
      return;
    }

    if (isCarsQuestionSetInvalid) {
      toast.error('اختبار كارز غير مكتمل (يجب أن يحتوي على 15 سؤال). تواصل مع الإدارة لإكمال بيانات الاختبار.');
      return;
    }

    // تجهيز الإجابات في Array زي ما الباك إند طالب
    const answers = Object.entries(scores).map(([questionId, scoreGiven]) => ({
      questionId,
      scoreGiven: parseFloat(scoreGiven),
    }));

    if (answers.length === 0) {
      toast.error('يرجى إدخال درجة واحدة على الأقل قبل الحفظ');
      return;
    }

    // Validation خاص بكارز: لازم كل الأسئلة (المفروض 15)
    if (test.testType === 'CARS' && answers.length < questions.length) {
      toast.error('يجب الإجابة على جميع أسئلة مقياس كارز قبل الحفظ');
      return;
    }

    // Validation لأي اختبارات تانية
    if (test.testType !== 'CARS' && answers.length < questions.length) {
      const shouldContinue = window.confirm('لم يتم تقييم جميع الأسئلة، هل تريد الحفظ على أي حال؟');
      if (!shouldContinue) return;
    }

    // تجهيز الـ Payload الشامل
    const payload = {
      childId,
      testId: test.id,
      sessionId: `doctor-${test.id}-${Date.now()}`,
      answers,
    };

    try {
      // إرسال ريكويست واحد فقط بالـ Payload
      await submitMutation.mutateAsync(payload);
      
      toast.success('تم حفظ نتيجة الاختبار وتحديث حالة الطفل بنجاح');
      
      // مسح الكاش عشان البروفايل يقرأ الداتا الجديدة فوراً
      queryClient.invalidateQueries({ queryKey: ['doctor-child-details', childId] });
      queryClient.invalidateQueries({ queryKey: ['doctor-children'] });

      navigate(-1);
    } catch (submitError) {
      toast.error(submitError.response?.data?.error?.message || 'فشل حفظ نتيجة الاختبار');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={42} />
          <p className="font-semibold text-red-700">
            {error?.response?.data?.error?.message || 'تعذر تحميل بيانات الاختبار'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 transition-colors hover:text-primary-600"
        >
          <ChevronRight size={20} />
          إلغاء الاختبار
        </button>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-500">
            {config.stepLabel} {Math.min(currentQuestionIndex + 1, Math.max(questions.length, 1))} من {questions.length}
          </span>
          <div className="h-2 w-48 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-primary-600 transition-all duration-500"
              style={{
                width: `${questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] border border-gray-200 bg-white p-8 text-center shadow-2xl md:p-12">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">{getTestDisplayTitle(test)}</h2>
        {getTestDisplayDescription(test) ? (
          <p className="mb-8 text-sm leading-relaxed text-gray-500">{getTestDisplayDescription(test)}</p>
        ) : null}

        {isCarsQuestionSetInvalid ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-right text-sm font-semibold text-amber-800">
            هذا الاختبار يجب أن يحتوي على 15 سؤال، لكن الموجود حالياً {questions.length}. لن يتم السماح بالحفظ قبل اكتمال بيانات الاختبار.
          </div>
        ) : null}

        {currentQuestion ? (
          <AssessmentQuestionRenderer
            test={test}
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            onPlayAudio={playAudio}
            response={questionResponses[currentQuestion.id]}
            selectedChoiceIndex={questionResponses[currentQuestion.id]}
            onSelectChoice={handleQuestionResponseChange}
            onResponseChange={handleQuestionResponseChange}
            onScoreChange={handleScoreChange}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-500">
            لا توجد عناصر متاحة لهذا الاختبار حالياً.
          </div>
        )}

        <div className="mt-8">
          {isCars ? null : (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-right">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-800">
                <Info size={16} />
                طريقة التنفيذ
              </div>
              <p className="text-sm leading-relaxed text-blue-700">{config.scoreNotice}</p>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/80 p-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0 || questions.length === 0}
            className="btn-secondary flex items-center gap-2 px-6 disabled:opacity-30"
          >
            <ChevronRight size={20} />
            السابق
          </button>

          {currentQuestionIndex === questions.length - 1 || questions.length === 0 ? (
            <button
              onClick={handleFinish}
              disabled={submitMutation.isPending || isCarsQuestionSetInvalid}
              className="btn-primary flex items-center gap-2 px-12"
            >
              <Save size={20} />
              {submitMutation.isPending ? 'جارٍ الحفظ...' : config.completionLabel}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="btn-primary flex items-center gap-2 px-8 shadow-lg shadow-primary-200"
            >
              التالي
              <ChevronLeft size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorAssessment;