import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Info,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  Save,
  Video,
  VideoOff,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorBookings, doctorAssessments } from '../../api/doctor';
import AssessmentQuestionRenderer from '../../features/assessments/AssessmentQuestionRenderer';
import { getAssessmentConfig } from '../../features/assessments/assessmentRegistry';
import {
  getManualScoreOptions,
  getModalityLabel,
  getTestDisplayTitle,
} from '../../features/assessments/assessmentUiUtils';

const SessionPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const jitsiContainerRef = useRef(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testScores, setTestScores] = useState({});
  const [questionResponses, setQuestionResponses] = useState({});
  const [audio, setAudio] = useState(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionRating, setSessionRating] = useState(10);

  const { data: booking, isLoading: bookingLoading } = useQuery({
    queryKey: ['session-booking', bookingId],
    queryFn: async () => {
      const response = await doctorBookings.getById(bookingId);
      return response.data.data;
    },
  });

  const { data: availableTests } = useQuery({
    queryKey: ['available-tests'],
    queryFn: async () => {
      const response = await doctorAssessments.getTests();
      return response.data.data || [];
    },
    enabled: !!booking?.childId,
  });

  const { data: activeTestDetail, isLoading: activeTestLoading } = useQuery({
    queryKey: ['assessment-test-detail', currentTest?.id],
    queryFn: async () => {
      const response = await doctorAssessments.getTestById(currentTest.id);
      return response.data.data;
    },
    enabled: !!currentTest?.id,
  });

  const completeMutation = useMutation({
    mutationFn: ({ notes, rating }) => doctorBookings.complete(bookingId, { notes, rating }),
    onSuccess: () => {
      toast.success('تم إنهاء الجلسة بنجاح');
      navigate(`/bookings/${bookingId}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل إنهاء الجلسة');
    },
  });

  const submitTestMutation = useMutation({
    mutationFn: (data) => doctorAssessments.submitResult(data),
  });

  useEffect(() => {
    if (!booking || !jitsiContainerRef.current) return;

    let api = null;
    const roomName = `tawasoul-session-${bookingId}`;
    const domain = 'meet.jit.si';
    const options = {
      roomName,
      parentNode: jitsiContainerRef.current,
      configOverwrite: {
        startWithAudioMuted: !isAudioEnabled,
        startWithVideoMuted: !isVideoEnabled,
        enableWelcomePage: false,
        enableClosePage: false,
        disableDeepLinking: true,
        defaultLanguage: 'ar',
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone',
          'camera',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'profile',
          'chat',
          'settings',
          'videoquality',
          'filmstrip',
          'feedback',
          'stats',
          'shortcuts',
          'tileview',
          'videobackgroundblur',
          'download',
          'help',
          'mute-everyone',
          'security',
        ],
        SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile'],
        DEFAULT_BACKGROUND: '#875FD8',
      },
      userInfo: {
        displayName: booking.doctor?.name || 'Doctor',
      },
    };

    if (window.JitsiMeetExternalAPI) {
      api = new window.JitsiMeetExternalAPI(domain, options);

      api.addEventListener('videoConferenceJoined', () => {
        toast.success('تم الانضمام للجلسة بنجاح');
      });

      api.addEventListener('videoConferenceLeft', () => {
        toast.info('تم مغادرة الجلسة');
      });
    } else {
      const script = document.createElement('script');
      script.src = 'https://8x8.vc/external_api.js';
      script.async = true;
      script.onload = () => {
        if (window.JitsiMeetExternalAPI) {
          api = new window.JitsiMeetExternalAPI(domain, options);

          api.addEventListener('videoConferenceJoined', () => {
            toast.success('تم الانضمام للجلسة بنجاح');
          });

          api.addEventListener('videoConferenceLeft', () => {
            toast.info('تم مغادرة الجلسة');
          });
        }
      };
      document.body.appendChild(script);
    }

    return () => {
      if (api) {
        try {
          api.dispose();
        } catch (disposeError) {
          console.error('Error disposing Jitsi API:', disposeError);
        }
      }
    };
  }, [booking, bookingId, isAudioEnabled, isVideoEnabled]);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setTestScores({});
    setQuestionResponses({});
  }, [activeTestDetail?.id]);

  const handleStartTest = (test) => {
    setCurrentTest(test);
    setShowTestPanel(true);
    setCurrentQuestionIndex(0);
    setTestScores({});
  };

  const handleCloseCurrentTest = () => {
    setCurrentTest(null);
    setCurrentQuestionIndex(0);
    setTestScores({});
    setQuestionResponses({});
  };

  const playAudio = (url) => {
    if (!url) return;
    if (audio) audio.pause();

    const nextAudio = new Audio(url);
    nextAudio.play();
    setAudio(nextAudio);
    nextAudio.onended = () => setAudio(null);
  };

  const questions = activeTestDetail?.questions || [];
  const currentQuestion = questions[currentQuestionIndex] || null;
  const assessmentConfig = getAssessmentConfig(activeTestDetail?.testType);
  const supportsManualScoring = assessmentConfig.supportsManualScoring;
  const scoreOptions = getManualScoreOptions(currentQuestion);

  const handleScoreChange = (score) => {
    if (!currentQuestion || !supportsManualScoring) {
      return;
    }

    setTestScores((previousScores) => ({
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

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((previousIndex) => previousIndex - 1);
    }
  };

  const handleFinishTest = async () => {
    if (!activeTestDetail) return;

    if (!supportsManualScoring) {
      toast.success('تمت معاينة محتوى الاختبار');
      handleCloseCurrentTest();
      return;
    }

    const results = Object.keys(testScores).map((questionId) => ({
      childId: booking.childId,
      testId: activeTestDetail.id,
      questionId,
      scoreGiven: testScores[questionId],
      sessionId: bookingId,
    }));

    if (results.length === 0) {
      toast.error('يرجى إدخال درجة واحدة على الأقل قبل الحفظ');
      return;
    }

    if (results.length < questions.length) {
      const shouldContinue = window.confirm('لم يتم تقييم جميع الأسئلة، هل تريد الحفظ على أي حال؟');
      if (!shouldContinue) return;
    }

    try {
      await Promise.all(results.map((result) => submitTestMutation.mutateAsync(result)));
      toast.success('تم حفظ نتائج الاختبار');
      handleCloseCurrentTest();
    } catch (submitError) {
      toast.error(submitError.response?.data?.error?.message || 'فشل حفظ نتائج الاختبار');
    }
  };

  const handleEndSession = () => {
    if (window.confirm('هل تريد إنهاء الجلسة وحفظ الملاحظات؟')) {
      completeMutation.mutate({
        notes: sessionNotes,
        rating: sessionRating,
      });
    }
  };

  if (bookingLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <p className="text-gray-600">الحجز غير موجود</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-900">
      <div className="z-50 flex items-center justify-between bg-gray-800 p-4 text-white">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/bookings/${bookingId}`)}
            className="rounded-lg p-2 transition-colors hover:bg-gray-700"
          >
            <X size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold">جلسة مع {booking.user?.username || 'المستخدم'}</h1>
            <p className="text-sm text-gray-300">حجز #{booking.id.substring(0, 8)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTestPanel((currentValue) => !currentValue)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
              showTestPanel ? 'bg-primary-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <ClipboardList size={18} />
            {showTestPanel ? 'إخفاء الاختبارات' : 'إجراء اختبار'}
          </button>

          <button
            onClick={() => setIsAudioEnabled((currentValue) => !currentValue)}
            className={`rounded-lg p-2 transition-colors ${
              isAudioEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
          <button
            onClick={() => setIsVideoEnabled((currentValue) => !currentValue)}
            className={`rounded-lg p-2 transition-colors ${
              isVideoEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
          <button
            onClick={() => setIsFullscreen((currentValue) => !currentValue)}
            className="rounded-lg bg-gray-700 p-2 transition-colors hover:bg-gray-600"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        <div
          ref={jitsiContainerRef}
          className={`flex-1 transition-all duration-300 ${showTestPanel ? 'w-2/3' : 'w-full'}`}
          style={{ minHeight: '500px' }}
        />

        {showTestPanel ? (
          <div className="flex w-1/3 flex-col overflow-hidden border-l border-gray-200 bg-white">
            {!currentTest ? (
              <div className="overflow-y-auto p-6">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
                  <ClipboardList className="text-primary-600" size={24} />
                  اختر اختبار للتقييم
                </h3>
                <div className="space-y-3">
                  {availableTests?.map((test) => (
                    <button
                      key={test.id}
                      onClick={() => handleStartTest(test)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-right transition-all hover:border-primary-300 hover:bg-primary-50"
                    >
                      <h4 className="font-bold text-gray-900">{getTestDisplayTitle(test)}</h4>
                      <p className="mt-1 text-sm text-gray-500">{getModalityLabel(test.type)}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between bg-primary-600 p-4 text-white">
                  <button
                    onClick={handleCloseCurrentTest}
                    className="rounded p-1 transition-colors hover:bg-primary-700"
                  >
                    <X size={18} />
                  </button>
                  <h3 className="truncate px-3 text-center font-bold">
                    {getTestDisplayTitle(activeTestDetail || currentTest)}
                  </h3>
                  <span className="text-sm">
                    {Math.min(currentQuestionIndex + 1, Math.max(questions.length, 1))} / {questions.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {activeTestLoading ? (
                    <div className="flex min-h-[200px] items-center justify-center">
                      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600" />
                    </div>
                  ) : currentQuestion ? (
                    <>
                      <AssessmentQuestionRenderer
                        test={activeTestDetail}
                        question={currentQuestion}
                        questionIndex={currentQuestionIndex}
                        totalQuestions={questions.length}
                        onPlayAudio={playAudio}
                        response={questionResponses[currentQuestion.id]}
                        selectedChoiceIndex={questionResponses[currentQuestion.id]}
                        onSelectChoice={handleQuestionResponseChange}
                        onResponseChange={handleQuestionResponseChange}
                        compact
                      />

                      <div className="mt-6">
                        {supportsManualScoring ? (
                          <div className="space-y-3">
                            <p className="text-center text-sm font-bold text-gray-500">اختر درجة الاستجابة</p>
                            <div className="flex flex-wrap items-center justify-center gap-2">
                              {scoreOptions.map((scoreOption) => (
                                <button
                                  key={scoreOption}
                                  onClick={() => handleScoreChange(scoreOption)}
                                  className={`h-10 w-10 rounded-lg text-sm font-bold transition-all ${
                                    testScores[currentQuestion.id] === scoreOption
                                      ? 'scale-110 bg-primary-600 text-white shadow-lg'
                                      : 'border-2 border-gray-200 bg-white text-gray-400 hover:border-primary-300'
                                  }`}
                                >
                                  {scoreOption}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-right">
                            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-800">
                              <Info size={16} />
                              طريقة التنفيذ
                            </div>
                            <p className="text-xs leading-relaxed text-blue-700">
                              {assessmentConfig.scoreNotice}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
                      لا توجد عناصر متاحة لهذا الاختبار.
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-gray-200 bg-gray-50 p-4">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0 || questions.length === 0}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 disabled:opacity-30"
                  >
                    <ChevronRight size={18} />
                    السابق
                  </button>

                  {currentQuestionIndex === questions.length - 1 || questions.length === 0 ? (
                    <button
                      onClick={handleFinishTest}
                      disabled={submitTestMutation.isPending}
                      className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                    >
                      <Save size={18} />
                      {submitTestMutation.isPending ? 'جارٍ الحفظ...' : assessmentConfig.completionLabel}
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2 text-white transition-colors hover:bg-primary-700"
                    >
                      التالي
                      <ChevronLeft size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="border-t border-gray-700 bg-gray-800 p-4 text-white">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="mb-2 block text-sm text-gray-300">ملاحظات الجلسة</label>
            <textarea
              value={sessionNotes}
              onChange={(event) => setSessionNotes(event.target.value)}
              className="w-full rounded-lg bg-gray-700 p-3 text-sm text-white focus:ring-2 focus:ring-primary-500"
              placeholder="اكتب ملاحظاتك عن الجلسة..."
              rows={2}
            />
          </div>
          <div className="flex items-center gap-4">
            <div>
              <label className="mb-2 block text-sm text-gray-300">الدرجة</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSessionRating(num)}
                    className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                      sessionRating === num
                        ? 'scale-110 bg-primary-600 text-white shadow-md'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleEndSession}
              disabled={completeMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-bold transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              <X size={18} />
              {completeMutation.isPending ? 'جارٍ الحفظ...' : 'إنهاء الجلسة'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionPage;
