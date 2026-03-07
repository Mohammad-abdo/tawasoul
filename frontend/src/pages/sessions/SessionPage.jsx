import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { doctorBookings, doctorAssessments } from '../../api/doctor';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  X, 
  Maximize2, 
  Minimize2,
  ClipboardList,
  Play,
  Pause,
  Volume2,
  Image as ImageIcon,
  CheckCircle,
  Save,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Baby
} from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionRating, setSessionRating] = useState(10);

  // Get booking details
  const { data: booking, isLoading: bookingLoading } = useQuery({
    queryKey: ['session-booking', bookingId],
    queryFn: async () => {
      const response = await doctorBookings.getById(bookingId);
      return response.data.data;
    },
  });

  // Get available tests
  const { data: availableTests } = useQuery({
    queryKey: ['available-tests'],
    queryFn: async () => {
      const response = await doctorAssessments.getTests();
      return response.data.data || [];
    },
    enabled: !!booking?.childId,
  });

  // Get test questions when test is selected
  const { data: testQuestions } = useQuery({
    queryKey: ['test-questions', currentTest?.id],
    queryFn: async () => {
      const response = await doctorAssessments.getTestQuestions(currentTest.id);
      return response.data.data;
    },
    enabled: !!currentTest?.id,
  });

  const completeMutation = useMutation({
    mutationFn: ({ notes, rating }) => {
      return doctorBookings.complete(bookingId, { notes, rating });
    },
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
    onSuccess: () => {
      // Success handled per result
    },
  });

  // Initialize Jitsi Meet
  useEffect(() => {
    if (!booking || !jitsiContainerRef.current) return;

    let api = null;

    // Generate room name from booking ID
    const roomName = `tawasoul-session-${bookingId}`;
    const domain = 'meet.jit.si'; // Free Jitsi Meet domain
    
    // Jitsi Meet configuration
    const options = {
      roomName: roomName,
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
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'chat', 'settings', 'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone', 'security'
        ],
        SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile'],
        DEFAULT_BACKGROUND: '#875FD8',
      },
      userInfo: {
        displayName: booking.doctor?.name || 'Doctor',
      },
    };

    // Load Jitsi Meet API if not already loaded
    if (window.JitsiMeetExternalAPI) {
      api = new window.JitsiMeetExternalAPI(domain, options);
      
      api.addEventListener('videoConferenceJoined', () => {
        toast.success('تم الانضمام للجلسة بنجاح');
      });

      api.addEventListener('videoConferenceLeft', () => {
        toast.info('تم مغادرة الجلسة');
      });
    } else {
      // Load Jitsi Meet API script
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

    // Cleanup
    return () => {
      if (api) {
        try {
          api.dispose();
        } catch (e) {
          console.error('Error disposing Jitsi API:', e);
        }
      }
    };
  }, [booking, bookingId]);

  const handleStartTest = (test) => {
    setCurrentTest(test);
    setShowTestPanel(true);
    setCurrentQuestionIndex(0);
    setTestScores({});
  };

  const playAudio = (path) => {
    if (audio) audio.pause();
    const newAudio = new Audio(`http://localhost:3000/${path}`);
    newAudio.play();
    setAudio(newAudio);
    setIsPlaying(true);
    newAudio.onended = () => setIsPlaying(false);
  };

  const handleScoreChange = (score) => {
    setTestScores({
      ...testScores,
      [testQuestions[currentQuestionIndex]?.id]: score
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsPlaying(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setIsPlaying(false);
    }
  };

  const handleFinishTest = () => {
    const results = Object.keys(testScores).map(qId => ({
      childId: booking.childId,
      questionId: qId,
      scoreGiven: testScores[qId],
      sessionId: bookingId
    }));

    if (results.length < testQuestions.length) {
      if (!window.confirm('لم يتم تقييم جميع الأسئلة، هل تريد الحفظ على أي حال؟')) return;
    }

    results.forEach(res => {
      submitTestMutation.mutate(res, {
        onSuccess: () => {
          // Individual success handled by mutation
        }
      });
    });

    toast.success('تم حفظ نتائج الاختبار');
    setShowTestPanel(false);
    setCurrentTest(null);
  };

  const handleEndSession = () => {
    if (window.confirm('هل تريد إنهاء الجلسة وحفظ الملاحظات؟')) {
      completeMutation.mutate({
        notes: sessionNotes,
        rating: sessionRating
      });
    }
  };

  if (bookingLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <p className="text-gray-600">الحجز غير موجود</p>
        </div>
      </div>
    );
  }

  const currentQuestion = testQuestions?.[currentQuestionIndex];

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/bookings/${bookingId}`)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold">جلسة مع {booking.user?.username || 'المستخدم'}</h1>
            <p className="text-sm text-gray-300">حجز #{booking.id.substring(0, 8)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Test Panel Toggle */}
          <button
            onClick={() => setShowTestPanel(!showTestPanel)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              showTestPanel ? 'bg-primary-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <ClipboardList size={18} />
            {showTestPanel ? 'إخفاء الاختبارات' : 'إجراء اختبار'}
          </button>

          {/* Controls */}
          <button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              isAudioEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
          <button
            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              isVideoEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Video Container */}
        <div 
          ref={jitsiContainerRef} 
          className={`flex-1 ${showTestPanel ? 'w-2/3' : 'w-full'} transition-all duration-300`}
          style={{ minHeight: '500px' }}
        />

        {/* Test Panel Sidebar */}
        {showTestPanel && (
          <div className="w-1/3 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
            {!currentTest ? (
              // Test Selection
              <div className="p-6 overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ClipboardList className="text-primary-600" size={24} />
                  اختر اختبار للتقييم
                </h3>
                <div className="space-y-3">
                  {availableTests?.map((test) => (
                    <button
                      key={test.id}
                      onClick={() => handleStartTest(test)}
                      className="w-full p-4 bg-gray-50 hover:bg-primary-50 rounded-xl border border-gray-200 hover:border-primary-300 transition-all text-right"
                    >
                      <h4 className="font-bold text-gray-900">{test.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {test.category === 'AUDITORY' ? 'تقييم سمعي' : 'تقييم بصري'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Test Execution
              <div className="flex flex-col h-full">
                <div className="p-4 bg-primary-600 text-white flex items-center justify-between">
                  <button
                    onClick={() => {
                      setCurrentTest(null);
                      setCurrentQuestionIndex(0);
                      setTestScores({});
                    }}
                    className="p-1 hover:bg-primary-700 rounded"
                  >
                    <X size={18} />
                  </button>
                  <h3 className="font-bold">{currentTest.title}</h3>
                  <span className="text-sm">
                    {currentQuestionIndex + 1} / {testQuestions?.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {/* Question Media */}
                  <div className="mb-6 p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[200px]">
                    {currentQuestion?.audioAssetPath && (
                      <div className="space-y-4">
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                          <Volume2 size={40} className="text-blue-600" />
                        </div>
                        <button 
                          onClick={() => playAudio(currentQuestion.audioAssetPath)}
                          className={`px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all ${
                            isPlaying ? 'bg-orange-500 text-white' : 'bg-primary-600 text-white hover:scale-105'
                          }`}
                        >
                          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                          {isPlaying ? 'جاري التشغيل...' : 'تشغيل الصوت'}
                        </button>
                      </div>
                    )}

                    {currentQuestion?.imageAssetPath && (
                      <div className="space-y-4">
                        <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                          <img 
                            src={`http://localhost:3000/${currentQuestion.imageAssetPath}`} 
                            alt="Question" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <p className="text-gray-500 text-sm flex items-center gap-2">
                          <ImageIcon size={16} /> تم عرض الصورة
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Scoring Guide */}
                  <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 mb-6">
                    <h4 className="font-bold text-primary-800 mb-2 flex items-center gap-2 text-sm">
                      <CheckCircle size={16} /> دليل التقييم:
                    </h4>
                    <p className="text-xs text-primary-700">
                      {currentQuestion?.scoringGuide || 'قم بتقييم استجابة الطفل بناءً على الملاحظة المباشرة.'}
                    </p>
                  </div>

                  {/* Score Selection */}
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-gray-500 text-center">اختر درجة الاستجابة</p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          onClick={() => handleScoreChange(num)}
                          className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                            testScores[currentQuestion?.id] === num 
                              ? 'bg-primary-600 text-white shadow-lg scale-110' 
                              : 'bg-white text-gray-400 border-2 border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Test Navigation */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-2">
                  <button 
                    onClick={handlePrevQuestion} 
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 bg-white rounded-lg border border-gray-200 disabled:opacity-30 flex items-center gap-2"
                  >
                    <ChevronRight size={18} /> السابق
                  </button>

                  {currentQuestionIndex === testQuestions.length - 1 ? (
                    <button 
                      onClick={handleFinishTest}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Save size={18} /> إنهاء الاختبار
                    </button>
                  ) : (
                    <button 
                      onClick={handleNextQuestion}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                    >
                      التالي <ChevronLeft size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Session Notes Footer */}
      <div className="bg-gray-800 text-white p-4 border-t border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm text-gray-300 mb-2 block">ملاحظات الجلسة</label>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500"
              placeholder="اكتب ملاحظاتك عن الجلسة..."
              rows={2}
            />
          </div>
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">الدرجة</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSessionRating(num)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      sessionRating === num 
                        ? 'bg-primary-600 text-white shadow-md scale-110' 
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
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <X size={18} />
              {completeMutation.isPending ? 'جاري الحفظ...' : 'إنهاء الجلسة'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionPage;
