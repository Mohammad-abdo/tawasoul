import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tags } from '../../api/admin';
import { 
  ArrowRight, 
  Hash, 
  FileText,
  Calendar,
  User,
  MessageSquare,
  Heart,
  TrendingUp,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/common/DataTable';

const TagDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: tag, isLoading, error, refetch } = useQuery({
    queryKey: ['tag-details', id],
    queryFn: async () => {
      const response = await tags.getById(id);
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <div className="text-gray-700 font-medium">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (error || !tag) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">التاج غير موجود</h3>
          <p className="text-gray-600 mb-4">لم يتم العثور على بيانات التاج</p>
          <button
            onClick={() => navigate('/tags')}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <ArrowRight size={18} />
            العودة إلى قائمة التاجات
          </button>
        </div>
      </div>
    );
  }

  const usageCount = tag._count?.posts || 0;
  const popularity = usageCount > 50 ? 'عالية' : usageCount > 20 ? 'متوسطة' : usageCount > 0 ? 'منخفضة' : 'غير مستخدم';
  const popularityColor = usageCount > 50 ? 'bg-green-100 text-green-700 border-green-200' : 
                         usageCount > 20 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                         usageCount > 0 ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                         'bg-gray-100 text-gray-700 border-gray-200';

  const postColumns = [
    {
      header: 'المحتوى',
      accessor: 'content',
      render: (post) => (
        <div className="max-w-md">
          {post.title && (
            <p className="font-semibold text-gray-900 text-sm mb-1">{post.title}</p>
          )}
          <p className="text-gray-700 text-sm line-clamp-2">{post.content}</p>
        </div>
      )
    },
    {
      header: 'المؤلف',
      accessor: 'author',
      render: (post) => (
        <div className="flex items-center gap-2">
          <User size={16} className="text-gray-400" />
          <span className="text-sm text-gray-700">{post.author?.username || 'مجهول'}</span>
        </div>
      )
    },
    {
      header: 'التاريخ',
      accessor: 'createdAt',
      render: (post) => (
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600">
            {new Date(post.createdAt).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
      )
    },
    {
      header: 'الإحصائيات',
      accessor: 'stats',
      render: (post) => (
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MessageSquare size={14} />
            <span>{post._count?.comments || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart size={14} />
            <span>{post._count?.likes || 0}</span>
          </div>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/tags')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowRight size={20} />
          <span>العودة</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              // Navigate to edit or open edit modal
              navigate('/tags');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Edit size={18} />
            تعديل
          </button>
          <button
            onClick={() => {
              if (window.confirm(`هل أنت متأكد من حذف التاج "${tag.name}"؟`)) {
                tags.delete(tag.id).then(() => {
                  toast.success('تم حذف التاج');
                  navigate('/tags');
                }).catch(() => {
                  toast.error('فشل حذف التاج');
                });
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            <Trash2 size={18} />
            حذف
          </button>
        </div>
      </div>

      {/* Tag Header Card */}
      <div className="glass-card rounded-2xl p-8 bg-white border border-primary-200">
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 rounded-2xl bg-gray-100 border-2 border-primary-500 flex items-center justify-center shadow-2xl">
            <Hash className="text-primary-600" size={64} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl font-bold text-gray-900">#{tag.name}</h1>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${popularityColor}`}>
                {popularity}
              </span>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-gray-600">
                <FileText size={20} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{usageCount}</p>
                  <p className="text-xs text-gray-500">منشور يستخدم هذا التاج</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp size={20} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {usageCount > 0 ? Math.round((usageCount / 100) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-500">نسبة الاستخدام</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={20} />
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(tag.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-gray-500">تاريخ الإنشاء</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center mx-auto mb-3">
            <FileText className="text-primary-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{usageCount}</p>
          <p className="text-sm text-gray-500">إجمالي المنشورات</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="text-blue-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {tag.posts?.reduce((sum, post) => sum + (post._count?.comments || 0), 0) || 0}
          </p>
          <p className="text-sm text-gray-500">إجمالي التعليقات</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-3">
            <Heart className="text-red-600 fill-red-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {tag.posts?.reduce((sum, post) => sum + (post._count?.likes || 0), 0) || 0}
          </p>
          <p className="text-sm text-gray-500">إجمالي الإعجابات</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="text-green-600" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{popularity}</p>
          <p className="text-sm text-gray-500">الشعبية</p>
        </div>
      </div>

      {/* Posts Using This Tag */}
      {tag.posts && tag.posts.length > 0 ? (
        <div className="glass-card rounded-2xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText size={24} className="text-primary-600" />
            المنشورات التي تستخدم هذا التاج ({tag.posts.length})
          </h3>
          <DataTable
            data={tag.posts}
            columns={postColumns}
            searchable={true}
            exportable={true}
            pagination={false}
            emptyMessage="لا توجد منشورات"
          />
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 border border-gray-200 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="text-gray-400" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد منشورات</h3>
          <p className="text-gray-600">لم يتم استخدام هذا التاج في أي منشور حتى الآن</p>
        </div>
      )}

      {/* Tag Information */}
      <div className="glass-card rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Hash className="text-primary-600" size={20} />
          معلومات التاج
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-600">معرف التاج</span>
            <span className="text-sm font-semibold text-gray-900 font-mono">{tag.id}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-600">اسم التاج</span>
            <span className="text-sm font-semibold text-gray-900">#{tag.name}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-600">تاريخ الإنشاء</span>
            <span className="text-sm font-semibold text-gray-900">
              {new Date(tag.createdAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-600">آخر تحديث</span>
            <span className="text-sm font-semibold text-gray-900">
              {new Date(tag.updatedAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagDetails;

