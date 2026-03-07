import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicPages } from '../../api/public';
import { FileText, Loader, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PageView = () => {
  const { pageType } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-page', pageType],
    queryFn: async () => {
      const response = await publicPages.getByType(pageType);
      return response.data;
    },
    enabled: !!pageType,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card p-8 rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <div className="text-gray-700 font-medium">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card p-8 rounded-2xl text-center">
          <div className="text-red-600 mb-4">
            <FileText size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">خطأ في تحميل الصفحة</h2>
          <p className="text-gray-500 mb-4">
            {error.response?.data?.error?.message || 'حدث خطأ أثناء تحميل الصفحة'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} />
            العودة للخلف
          </button>
        </div>
      </div>
    );
  }

  const page = data?.data;

  if (!page) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card p-8 rounded-2xl text-center">
          <div className="text-gray-400 mb-4">
            <FileText size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">الصفحة غير موجودة</h2>
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} />
            العودة للخلف
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="glass-card rounded-2xl p-8 border border-gray-200">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div className="w-12 h-12 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
              <FileText className="text-primary-600" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{page.titleAr}</h1>
              {page.updatedAt && (
                <p className="text-sm text-gray-500 mt-1">
                  آخر تحديث: {new Date(page.updatedAt).toLocaleDateString('ar-EG')}
                </p>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div 
              className="text-gray-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: page.contentAr?.replace(/\n/g, '<br />') }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageView;

