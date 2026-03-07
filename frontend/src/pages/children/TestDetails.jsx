import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowRight, 
  FileText, 
  Activity, 
  ClipboardList, 
  User, 
  Stethoscope,
  Calendar,
  Clock,
  TrendingUp,
  Brain,
  MessageSquare,
  CheckCircle,
  Download,
  Share2,
  AlertCircle
} from 'lucide-react';
import { bookings } from '../../api/admin';

const TestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['booking-test', id],
    queryFn: async () => {
      const response = await bookings.getById(id);
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass-card p-12 rounded-3xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto mb-6"></div>
          <p className="text-gray-600 font-bold text-xl">جاري استخراج نتائج التقييم...</p>
        </div>
      </div>
    );
  }

  const booking = data;

  if (!booking || error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass-card p-12 rounded-3xl text-center max-w-md">
          <AlertCircle size={64} className="text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">فشل تحميل التقرير</h2>
          <p className="text-gray-600 mb-8">عذراً، لم نتمكن من العثور على بيانات هذا التقييم أو الاختبار.</p>
          <button onClick={() => navigate(-1)} className="btn-primary w-full flex items-center justify-center gap-2">
            <ArrowRight size={20} />
            العودة للسابق
          </button>
        </div>
      </div>
    );
  }

  // Helper to parse notes if they contain structured results (like in my seed)
  const parseResults = (notes) => {
    if (!notes) return [];
    if (notes.includes('نتائج التقييم:')) {
      const parts = notes.split('التوصيات:');
      const resultsSection = parts[0].replace('نتائج التقييم:', '').trim();
      const recommendationsSection = parts[1]?.trim() || '';
      
      const resultItems = resultsSection.split(/\d+\./).filter(Boolean).map(item => item.trim());
      return { items: resultItems, recommendations: recommendationsSection };
    }
    return { items: [notes], recommendations: null };
  };

  const { items, recommendations } = parseResults(booking.notes);

  return (
    <div className="space-y-8 pb-12">
      {/* Premium Header */}
      <div className="relative overflow-hidden glass-card rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-primary-600 to-primary-700 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/30">
                <ClipboardList size={40} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                    تقرير تقييم طبي شامل
                  </span>
                  <span className="bg-green-400/20 backdrop-blur-md text-green-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-green-400/30">
                    <CheckCircle size={12} />
                    تم الفحص
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-1">نتائج فحص الحالة</h1>
                <p className="opacity-80 flex items-center gap-2">
                   <Calendar size={16} />
                   {new Date(booking.scheduledAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-all border border-white/10">
                <Share2 size={24} />
              </button>
              <button className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl backdrop-blur-md transition-all border border-white/20">
                <Download size={24} />
              </button>
              <button onClick={() => navigate(-1)} className="px-6 py-3 bg-white text-primary-600 font-bold rounded-2xl shadow-lg hover:scale-105 transition-all">
                رجوع
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Summary & Recommendations */}
        <div className="lg:col-span-1 space-y-8">
          {/* Patient & Doctor Card */}
          <div className="glass-card rounded-[2rem] p-6 border border-gray-100 shadow-xl overflow-hidden relative group">
             <div className="absolute top-0 left-0 w-2 h-full bg-primary-600"></div>
             <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
               <User className="text-primary-600" size={20} />
               أطراف الفحص
             </h3>
             <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 group-hover:bg-white group-hover:border-primary-100 transition-all duration-300">
                   <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center border border-primary-200">
                     <Brain className="text-primary-600" size={24} />
                   </div>
                   <div>
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">الحالة / الطفل</p>
                     <p className="font-bold text-gray-900">{booking.child?.name || booking.user?.fullName || 'غير محدد'}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 group-hover:bg-white group-hover:border-primary-100 transition-all duration-300">
                   <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center border border-orange-200">
                     <Stethoscope className="text-orange-600" size={24} />
                   </div>
                   <div>
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">الفاحص / الطبيب</p>
                     <p className="font-bold text-gray-900">{booking.doctor?.name || 'طبيب متخصص'}</p>
                     <p className="text-xs text-orange-600">{booking.doctor?.specialization}</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Recommendations Card */}
          <div className="glass-card rounded-[2rem] p-8 border border-green-100 bg-gradient-to-br from-white to-green-50 shadow-xl">
             <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
               <TrendingUp className="text-green-600" size={24} />
               التوصيات العلاجية
             </h3>
             {recommendations ? (
                <div className="space-y-4">
                  {recommendations.split('+').map((rec, i) => (
                    <div key={i} className="flex gap-3">
                       <div className="mt-1 w-5 h-5 rounded-full bg-green-500 text-white flex shrink-0 items-center justify-center text-[10px] font-bold">
                         {i + 1}
                       </div>
                       <p className="text-gray-700 font-medium leading-relaxed">{rec.trim()}</p>
                    </div>
                  ))}
                  <div className="mt-8 p-4 bg-white/60 backdrop-blur rounded-2xl border border-green-200 text-sm text-green-800 font-medium">
                     * ينصح بالبدء الفوري في خطة العلاج الموصى بها لضمان أفضل استجابة للحالة.
                  </div>
                </div>
             ) : (
                <p className="text-gray-500 italic">لا توجد توصيات محددة مسجلة في هذا التقرير.</p>
             )}
          </div>
        </div>

        {/* Right Side: Detailed Results */}
        <div className="lg:col-span-2 space-y-8">
           <div className="glass-card rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-2xl bg-white relative">
              <div className="absolute top-8 left-8">
                <FileText className="text-gray-100" size={120} />
              </div>

              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-10 flex items-center gap-3">
                  <Activity className="text-primary-600" size={32} />
                  تفاصيل الفحوصات والقياسات
                </h2>

                <div className="space-y-12">
                   {items && items.length > 0 ? (
                      items.map((item, idx) => {
                         const [title, content] = item.split(':');
                         return (
                           <div key={idx} className="group relative">
                              <div className="flex flex-col md:flex-row gap-6">
                                 <div className="md:w-1/3">
                                   <div className="flex items-center gap-2 mb-2">
                                      <span className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
                                        {(idx + 1).toString().padStart(2, '0')}
                                      </span>
                                      <h4 className="font-black text-gray-900 text-lg">{title?.trim() || `بند رقم ${idx + 1}`}</h4>
                                   </div>
                                   <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-primary-600 w-1/4 group-hover:w-full transition-all duration-700 ease-out"></div>
                                   </div>
                                 </div>
                                 <div className="md:w-2/3 p-6 rounded-3xl bg-gray-50 border border-gray-100 group-hover:border-primary-200 group-hover:shadow-lg transition-all transform group-hover:-translate-y-1">
                                    <p className="text-gray-700 leading-loose text-lg font-medium">
                                      {content?.trim() || title?.trim()}
                                    </p>
                                 </div>
                              </div>
                           </div>
                         )
                      })
                   ) : (
                      <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                        <MessageSquare className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500 font-bold">لا يوجد تفاصيل نصية لنتائج هذا التقرير</p>
                      </div>
                   )}
                </div>

                <div className="mt-16 pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="text-center md:text-right">
                      <p className="text-sm text-gray-400 font-bold mb-1">الموعد القادم المقترح</p>
                      <div className="flex items-center gap-2 text-primary-600 font-black">
                        <Clock size={20} />
                        <span>يتم تحديده لاحقاً بناءً على تقدم الحالة</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">د. {booking.doctor?.name || 'المختص'}</p>
                        <p className="text-xs text-gray-400">توقيع المختص</p>
                      </div>
                      <div className="w-16 h-16 rounded-full border-2 border-primary-100 p-1">
                         <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center text-primary-200">
                           <FileText size={24} />
                         </div>
                      </div>
                   </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TestDetails;
