import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Brain, Volume2, Image as ImageIcon, X, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { mahara } from '../../api/admin';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const MaharaActivities = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [page, setPage] = useState(1);
  const [skillGroupFilter, setSkillGroupFilter] = useState('');
  const limit = 20;

  const { data: skillGroupsData } = useQuery({
    queryKey: ['mahara-skill-groups-list'],
    queryFn: async () => {
      const response = await mahara.getSkillGroups({ limit: 100 });
      return response.data.data;
    },
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['mahara-activities', page, skillGroupFilter],
    queryFn: async () => {
      const params = { page, limit };
      if (skillGroupFilter) params.skillGroupId = skillGroupFilter;
      const response = await mahara.getActivities(params);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: mahara.createActivity,
    onSuccess: () => {
      toast.success('تم إنشاء النشاط بنجاح');
      setShowModal(false);
      refetch();
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'فشل الإنشاء'),
  });

  const deleteMutation = useMutation({
    mutationFn: mahara.deleteActivity,
    onSuccess: () => {
      toast.success('تم الحذف بنجاح');
      refetch();
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'فشل الحذف'),
  });

  const activities = data?.data || [];

  const columns = [
    {
      header: 'النشاط',
      accessor: 'type',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
            <Brain size={20} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{row.type}</p>
            <p className="text-xs text-gray-500">مستوى: {row.levelOrder}</p>
          </div>
        </div>
      )
    },
    {
      header: 'المجموعة',
      accessor: 'skillGroup',
      render: (row) => row.skillGroup?.name || '-'
    },
    {
      header: 'الوسائط',
      accessor: 'media',
      render: (row) => (
        <div className="flex gap-2">
          {row.images?.length > 0 && <ImageIcon size={16} className="text-purple-500" title="صور" />}
          {row.audios?.length > 0 && <Volume2 size={16} className="text-blue-500" title="صوت" />}
        </div>
      )
    },
    {
      header: 'الإجراءات',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/mahara/activities/${row.id}`}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
          >
            <Eye size={18} />
          </Link>
          <button
            onClick={() => {
              if (window.confirm('هل أنت متأكد من حذف هذا النشاط؟')) {
                deleteMutation.mutate(row.id);
              }
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const type = formData.get('type');
    const images = formData.getAll('images').filter(f => f.size > 0);
    const audios = formData.getAll('audios').filter(f => f.size > 0);

    // Validation
    if (type === 'LISTEN_WATCH' || type === 'AUDIO_ASSOCIATION') {
      if (images.length !== 1 || audios.length !== 1) {
        return toast.error('هذا النوع يتطلب صورة واحدة وملف صوتي واحد بالضبط');
      }
    }

    if (type === 'LISTEN_CHOOSE_IMAGE') {
      if (images.length < 2 || images.length > 3) {
        return toast.error('استماع واختيار صورة يتطلب من 2 إلى 3 صور');
      }
      if (audios.length !== 1) {
        return toast.error('استماع واختيار صورة يتطلب ملف صوتي واحد بالضبط');
      }
      if (!formData.get('correctImageIndex')) {
        return toast.error('برجاء اختيار الصورة الصحيحة');
      }
    }

    if (type === 'MATCHING') {
      if (images.length === 0 || audios.length === 0) {
        return toast.error('التوصيل يتطلب صور وملفات صوتية');
      }
      if (images.length !== audios.length) {
        return toast.error('التوصيل يتطلب عدد متساوي من الصور والملفات الصوتية (1:1)');
      }
      // Auto-generate match pairs (1:1 mapping)
      const pairs = images.map((_, i) => ({ imageIndex: i, audioIndex: i }));
      formData.set('matchPairs', JSON.stringify(pairs));
    }

    if (type === 'SEQUENCE_ORDER') {
      if (images.length < 2) {
        return toast.error('الترتيب يتطلب صورتين على الأقل');
      }
      // Auto-generate sequence (0, 1, 2...)
      const sequence = images.map((_, i) => i);
      formData.set('sequence', JSON.stringify(sequence));
    }

    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">أنشطة مهارة</h2>
          <p className="text-sm text-gray-500 mt-1">إدارة الأنشطة التعليمية التفاعلية</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة نشاط جديد
        </button>
      </div>

      <div className="glass-card p-4 flex gap-4">
        <select
          value={skillGroupFilter}
          onChange={(e) => setSkillGroupFilter(e.target.value)}
          className="input w-64"
        >
          <option value="">كل المجموعات</option>
          {skillGroupsData?.map(sg => (
            <option key={sg.id} value={sg.id}>{sg.name}</option>
          ))}
        </select>
      </div>

      <div className="glass-card">
        <DataTable
          data={activities}
          columns={columns}
          isLoading={isLoading}
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="إضافة نشاط جديد"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">نوع النشاط *</label>
              <select name="type" className="input" required>
                <option value="LISTEN_WATCH">استماع ومشاهدة</option>
                <option value="LISTEN_CHOOSE_IMAGE">استماع واختيار صورة</option>
                <option value="MATCHING">توصيل</option>
                <option value="SEQUENCE_ORDER">ترتيب</option>
                <option value="AUDIO_ASSOCIATION">ربط صوتي</option>
              </select>
            </div>
            <div>
              <label className="label">مجموعة المهارات *</label>
              <select name="skillGroupId" className="input" required>
                <option value="">اختر المجموعة</option>
                {skillGroupsData?.map(sg => (
                  <option key={sg.id} value={sg.id}>{sg.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">الترتيب / المستوى *</label>
            <input name="levelOrder" type="number" className="input" required min="1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">الصور (يمكنك اختيار أكثر من صورة) *</label>
              <input name="images" type="file" multiple className="input" accept="image/*" required />
            </div>
            <div>
              <label className="label">الملفات الصوتية *</label>
              <input name="audios" type="file" multiple className="input" accept="audio/*" required />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-2">
            <p className="text-xs text-blue-700 font-semibold mb-1">ملاحظة تنفيذية:</p>
            <ul className="text-[10px] text-blue-600 space-y-1 list-disc list-inside">
              <li>لأنشطة التوصيل والترتيب، سيتم استخدام الترتيب المرفوع في الربط تلقائياً.</li>
              <li>يرجى رفع الملفات بالترتيب الصحيح (الصورة الأولى مع الصوت الأول، وهكذا).</li>
            </ul>
          </div>

          <div className="border-t pt-4">
            <label className="label">اختيار الصورة الصحيحة (لنشاط "اختيار صورة" فقط) *</label>
            <div className="flex gap-4">
              {[0, 1, 2].map(idx => (
                <label key={idx} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="correctImageIndex" value={idx} className="text-primary-600" />
                  الصورة رقم {idx + 1}
                </label>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">يجب اختيار رقم يطابق عدد الصور التي سترفعها.</p>
          </div>

          <div className="flex gap-2 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">إلغاء</button>
            <button type="submit" className="btn-primary flex-1">
              {createMutation.isPending ? 'جاري الحفظ...' : 'حفظ النشاط'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaharaActivities;
