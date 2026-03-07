import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { posts } from '../../api/admin';
import { Eye, Trash2, AlertTriangle, Check, X, User, Calendar, MessageSquare, Heart, Share2, FileText, TrendingUp, AlertCircle, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const Posts = () => {
  const [page, setPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const limit = 20;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-posts', page],
    queryFn: async () => {
      const response = await posts.getAll({ page, limit });
      return response.data;
    },
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, action }) => posts.moderate(id, { action, reason: 'من الأدمن' }),
    onSuccess: (_, variables) => {
      toast.success(`تم ${variables.action === 'APPROVE' ? 'الموافقة' : 'الرفض'}`);
      refetch();
    },
    onError: () => {
      toast.error('فشل العملية');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: posts.delete,
    onSuccess: () => {
      toast.success('تم الحذف');
      refetch();
      setShowViewModal(false);
      setSelectedPost(null);
    },
    onError: () => {
      toast.error('فشل الحذف');
    },
  });

  const handleModerate = (id, action) => {
    moderateMutation.mutate({ id, action });
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنشور؟')) {
      deleteMutation.mutate(id);
    }
  };

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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <p className="text-red-600 mb-4">خطأ في تحميل البيانات</p>
          <p className="text-gray-500 text-sm mb-4">{error.message}</p>
          <button onClick={() => refetch()} className="btn-primary">
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const postsList = data?.data?.posts || [];
  const total = data?.data?.pagination?.total || postsList.length;
  const publishedCount = postsList.filter(p => p.status === 'PUBLISHED').length;
  const pendingCount = postsList.filter(p => p.status === 'PENDING').length;
  const rejectedCount = postsList.filter(p => p.status === 'REJECTED').length;
  const sensitiveCount = postsList.filter(p => p.isSensitive).length;

  const columns = [
    {
      header: 'المنشور',
      accessor: 'content',
      sortable: true,
      render: (row) => (
        <div className="max-w-md">
          {row.title && (
            <p className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">{row.title}</p>
          )}
          <p className="text-sm text-gray-700 line-clamp-2">{row.content}</p>
          {row.images && row.images.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <ImageIcon size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500">{row.images.length} صورة</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'المؤلف',
      accessor: 'author',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
            <span className="text-primary-600 text-sm font-bold">
              {row.author?.username?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{row.author?.username || 'مجهول'}</p>
            <p className="text-xs text-gray-500">ID: {row.author?.id?.substring(0, 8) || '-'}...</p>
          </div>
        </div>
      )
    },
    {
      header: 'الإحصائيات',
      accessor: 'stats',
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
              <MessageSquare size={14} className="text-blue-600" />
            </div>
            <span className="text-sm font-bold text-gray-900">{row._count?.comments || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
              <Heart size={14} className="text-red-600" />
            </div>
            <span className="text-sm font-bold text-gray-900">{row._count?.likes || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
              <Share2 size={14} className="text-green-600" />
            </div>
            <span className="text-sm font-bold text-gray-900">{row._count?.shares || 0}</span>
          </div>
        </div>
      )
    },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (row) => (
        <div className="flex flex-col gap-1.5">
          <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border inline-block w-fit ${
            row.status === 'PUBLISHED' 
              ? 'bg-green-100 text-green-700 border-green-200' 
              : row.status === 'PENDING'
              ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
              : 'bg-red-100 text-red-700 border-red-200'
          }`}>
            {row.status === 'PUBLISHED' ? 'منشور' : 
             row.status === 'PENDING' ? 'معلق' : 
             row.status === 'REJECTED' ? 'مرفوض' : row.status}
          </span>
          {row.isSensitive && (
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200 w-fit">
              <AlertTriangle size={12} />
              حساس
            </span>
          )}
        </div>
      )
    },
    {
      header: 'تاريخ النشر',
      accessor: 'createdAt',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {new Date(row.createdAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(row.createdAt).toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      )
    },
  ];

  const actions = [
    {
      label: 'عرض التفاصيل',
      icon: Eye,
      onClick: (row) => {
        setSelectedPost(row);
        setShowViewModal(true);
      },
      className: 'text-primary-600 hover:bg-primary-50',
      show: () => true,
    },
    {
      label: 'موافقة',
      icon: Check,
      onClick: (row) => handleModerate(row.id, 'APPROVE'),
      className: 'text-green-600 hover:bg-green-50',
      show: (row) => row.status !== 'PUBLISHED',
    },
    {
      label: 'رفض',
      icon: X,
      onClick: (row) => {
        if (window.confirm('هل أنت متأكد من رفض هذا المنشور؟')) {
          handleModerate(row.id, 'REJECT');
        }
      },
      className: 'text-red-600 hover:bg-red-50',
      show: (row) => row.status !== 'REJECTED',
    },
    {
      label: 'حذف',
      icon: Trash2,
      onClick: (row) => handleDelete(row.id),
      className: 'text-red-600 hover:bg-red-50',
      show: () => true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">المنشورات</h2>
          <p className="text-sm text-gray-500 mt-1">إدارة جميع المنشورات في النظام</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
              <FileText className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-xs text-gray-500">إجمالي المنشورات</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
              <Check className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{publishedCount}</p>
              <p className="text-xs text-gray-500">منشور</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-center">
              <AlertCircle className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-xs text-gray-500">معلق</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
              <X className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
              <p className="text-xs text-gray-500">مرفوض</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center">
              <AlertTriangle className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{sensitiveCount}</p>
              <p className="text-xs text-gray-500">حساس</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={postsList}
        columns={columns}
        isLoading={isLoading}
        searchable={true}
        filterable={true}
        exportable={true}
        pagination={true}
        pageSize={limit}
        emptyMessage="لا توجد منشورات"
        title="قائمة المنشورات"
        actions={actions}
        filters={[
          {
            key: 'status',
            label: 'الحالة',
            type: 'select',
            options: [
              { value: 'PUBLISHED', label: 'منشور' },
              { value: 'PENDING', label: 'معلق' },
              { value: 'REJECTED', label: 'مرفوض' }
            ]
          },
          {
            key: 'isSensitive',
            label: 'حساس',
            type: 'boolean'
          },
          {
            key: 'createdAt',
            label: 'تاريخ النشر',
            type: 'dateRange'
          }
        ]}
      />

      {/* View Post Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedPost(null);
        }}
        title="تفاصيل المنشور"
        size="lg"
      >
        {selectedPost && (
          <div className="space-y-6">
            {/* Post Header */}
            <div className="flex items-start justify-between border-b border-gray-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-bold">
                    {selectedPost.author?.username?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {selectedPost.author?.username || 'مجهول'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedPost.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {selectedPost.isSensitive && (
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                    <AlertTriangle size={14} />
                    حساس
                  </span>
                )}
                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                  selectedPost.status === 'PUBLISHED' 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : selectedPost.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    : 'bg-red-100 text-red-700 border-red-200'
                }`}>
                  {selectedPost.status === 'PUBLISHED' ? 'منشور' : 
                   selectedPost.status === 'PENDING' ? 'معلق' : 
                   selectedPost.status === 'REJECTED' ? 'مرفوض' : selectedPost.status}
                </span>
              </div>
            </div>

            {/* Post Title */}
            {selectedPost.title && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedPost.title}</h2>
              </div>
            )}

            {/* Post Content */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
                {selectedPost.content}
              </p>
            </div>

            {/* Post Images */}
            {selectedPost.images && selectedPost.images.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <ImageIcon size={18} className="text-primary-600" />
                  الصور ({selectedPost.images.length})
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedPost.images.map((image, index) => (
                    <div key={index} className="relative rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                      <img
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Post Statistics */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <MessageSquare size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{selectedPost._count?.comments || 0}</p>
                  <p className="text-xs text-gray-500">تعليق</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
                  <Heart size={18} className="text-red-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{selectedPost._count?.likes || 0}</p>
                  <p className="text-xs text-gray-500">إعجاب</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
                  <Share2 size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{selectedPost._count?.shares || 0}</p>
                  <p className="text-xs text-gray-500">مشاركة</p>
                </div>
              </div>
            </div>

            {/* Post Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              {selectedPost.status !== 'PUBLISHED' && (
                <button
                  onClick={() => {
                    handleModerate(selectedPost.id, 'APPROVE');
                    setShowViewModal(false);
                  }}
                  disabled={moderateMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Check size={18} />
                  <span>موافقة</span>
                </button>
              )}
              {selectedPost.status !== 'REJECTED' && (
                <button
                  onClick={() => {
                    if (window.confirm('هل أنت متأكد من رفض هذا المنشور؟')) {
                      handleModerate(selectedPost.id, 'REJECT');
                      setShowViewModal(false);
                    }
                  }}
                  disabled={moderateMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <X size={18} />
                  <span>رفض</span>
                </button>
              )}
              <button
                onClick={() => handleDelete(selectedPost.id)}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <Trash2 size={18} />
                <span>حذف</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Posts;
