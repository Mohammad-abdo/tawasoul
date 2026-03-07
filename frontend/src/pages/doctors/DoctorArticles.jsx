import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MessageSquare, 
  ThumbsUp, 
  BarChart2,
  Save,
  X
} from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const DoctorArticles = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: ''
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['doctor-articles'],
    queryFn: async () => {
      const response = await apiClient.get('/doctor/articles');
      return response.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post('/doctor/articles', data),
    onSuccess: () => {
      toast.success('تم نشر المقال بنجاح');
      setIsModalOpen(false);
      refetch();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.put(`/doctor/articles/${id}`, data),
    onSuccess: () => {
      toast.success('تم تحديث المقال بنجاح');
      setIsModalOpen(false);
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/doctor/articles/${id}`),
    onSuccess: () => {
      toast.success('تم حذف المقال');
      refetch();
    },
  });

  const handleOpenModal = (article = null) => {
    if (article) {
      setSelectedArticle(article);
      setFormData({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt || ''
      });
    } else {
      setSelectedArticle(null);
      setFormData({ title: '', content: '', excerpt: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedArticle) {
      updateMutation.mutate({ id: selectedArticle.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns = [
    {
      header: 'المقال',
      accessor: 'title',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
            <FileText className="text-primary-600" size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{row.title}</p>
            <p className="text-xs text-gray-500">{new Date(row.createdAt).toLocaleDateString('ar-EG')}</p>
          </div>
        </div>
      )
    },
    {
      header: 'التفاعل',
      accessor: 'views',
      render: (row) => (
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Eye size={14} /> {row.views}</span>
          <span className="flex items-center gap-1"><ThumbsUp size={14} /> {row.likes}</span>
          <span className="flex items-center gap-1"><MessageSquare size={14} /> {row.comments}</span>
        </div>
      )
    },
    {
      header: 'الحالة',
      accessor: 'isFeatured',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${row.isFeatured ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
          {row.isFeatured ? 'مميز' : 'عادي'}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: 'تعديل',
      icon: Edit,
      onClick: (row) => handleOpenModal(row),
      className: 'text-blue-600 hover:bg-blue-50'
    },
    {
      label: 'حذف',
      icon: Trash2,
      onClick: (row) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المقال؟')) {
          deleteMutation.mutate(row.id);
        }
      },
      className: 'text-red-600 hover:bg-red-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مقالاتي</h1>
          <p className="text-gray-500">إدارة المقالات الطبية والتوعوية التي تنشرها</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          كتابة مقال جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-6 rounded-2xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><FileText size={24} /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data?.articles?.length || 0}</p>
              <p className="text-xs text-gray-500">إجمالي المقالات</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-xl text-green-600"><Eye size={24} /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data?.articles?.reduce((sum, a) => sum + a.views, 0) || 0}</p>
              <p className="text-xs text-gray-500">إجمالي المشاهدات</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-xl text-orange-600"><ThumbsUp size={24} /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data?.articles?.reduce((sum, a) => sum + a.likes, 0) || 0}</p>
              <p className="text-xs text-gray-500">إجمالي الإعجابات</p>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        data={data?.articles || []}
        columns={columns}
        isLoading={isLoading}
        actions={actions}
        title="قائمة المقالات"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedArticle ? 'تعديل المقال' : 'نشر مقال جديد'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">عنوان المقال</label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">وصف قصير (Excerpt)</label>
            <input
              type="text"
              className="input"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            />
          </div>
          <div>
            <label className="label">محتوى المقال</label>
            <textarea
              className="input min-h-[300px] py-3"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">إلغاء</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary flex items-center gap-2">
              <Save size={18} />
              {selectedArticle ? 'تحديث المقال' : 'نشر الآن'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorArticles;
