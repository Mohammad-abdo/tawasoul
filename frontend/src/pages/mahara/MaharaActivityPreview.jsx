import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Volume2, Image as ImageIcon, CheckCircle2, Info } from 'lucide-react';
import { mahara } from '../../api/admin';

const MaharaActivityPreview = () => {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['mahara-activity', id],
    queryFn: async () => {
      const response = await mahara.getActivityById(id);
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <div className="text-gray-700 font-medium text-center">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  const activity = data;
  if (!activity) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
      <Info size={48} className="mb-4 text-gray-300" />
      <p>النشاط غير موجود</p>
      <Link to="/mahara/activities" className="mt-4 text-primary-600 hover:underline flex items-center gap-1">
        <ArrowRight size={16} /> العودة قائمة الأنشطة
      </Link>
    </div>
  );

  const getTypeText = (type) => {
    switch (type) {
      case 'LISTEN_WATCH': return 'استماع ومشاهدة';
      case 'LISTEN_CHOOSE_IMAGE': return 'استماع واختيار صورة';
      case 'MATCHING': return 'توصيل';
      case 'SEQUENCE_ORDER': return 'ترتيب';
      case 'AUDIO_ASSOCIATION': return 'ربط صوتي';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/mahara/activities" className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600">
            <ArrowRight size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{getTypeText(activity.type)}</h2>
            <p className="text-sm text-gray-500 mt-1">مستوى: {activity.levelOrder} | {activity.skillGroup?.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Images Section */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-primary-600 font-semibold border-b pb-2">
            <ImageIcon size={20} />
            <h3>الصور المضافة</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {activity.images.map((img, index) => (
              <div key={img.id} className="relative group">
                <div className={`aspect-square rounded-xl overflow-hidden border-2 ${activity.correctImageId === img.id ? 'border-green-500 shadow-lg shadow-green-100' : 'border-gray-100'}`}>
                  <img src={img.url} alt={`Activity Image ${index + 1}`} className="w-full h-full object-cover" />
                </div>
                <div className="mt-2 flex items-center justify-between px-1">
                  <span className="text-xs font-medium text-gray-500">صورة {index + 1}</span>
                  {activity.correctImageId === img.id && (
                    <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                      <CheckCircle2 size={10} /> الإجابة الصحيحة
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Section */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-primary-600 font-semibold border-b pb-2">
            <Volume2 size={20} />
            <h3>الملفات الصوتية</h3>
          </div>
          <div className="space-y-3">
            {activity.audios.map((audio, index) => (
              <div key={audio.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between group hover:border-primary-200 hover:bg-primary-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    <Volume2 size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">ملف صوتي {index + 1}</p>
                    <p className="text-[10px] text-gray-400">تحميل واستماع للنشاط</p>
                  </div>
                </div>
                <audio controls src={audio.url} className="h-8 w-48" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logic Details Section */}
      {(activity.type === 'MATCHING' || activity.type === 'SEQUENCE_ORDER') && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-primary-600 font-semibold border-b pb-2">
            <Info size={20} />
            <h3>منطق النشاط</h3>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-800">
              {activity.type === 'MATCHING' 
                ? 'هذا النشاط يعتمد على التوصيل بين الصور والأصوات حسب الترتيب الموضح أعلاه (1 مع 1، 2 مع 2...)' 
                : 'سيطلب من الطفل ترتيب هذه الصور بالتسلسل الصحيح المعروض.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaharaActivityPreview;
