import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { homeServices } from '../../api/admin';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const HomeServices = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [page, setPage] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  const limit = 20;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['home-services', page],
    queryFn: async () => {
      const response = await homeServices.getAll({ page, limit });
      return response.data.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: homeServices.create,
    onSuccess: () => {
      toast.success('تم إنشاء الخدمة بنجاح');
      setShowModal(false);
      setEditingItem(null);
      setImagePreview(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل الإنشاء');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => homeServices.update(id, data),
    onSuccess: () => {
      toast.success('تم التحديث بنجاح');
      setShowModal(false);
      setEditingItem(null);
      setImagePreview(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل التحديث');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: homeServices.delete,
    onSuccess: () => {
      toast.success('تم الحذف بنجاح');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل الحذف');
    },
  });

  const servicesList = data || [];

  const columns = [
    {
      header: 'الترتيب',
      accessor: 'order',
      sortable: true,
      render: (row) => (
        <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
          <span className="text-primary-600 font-bold">{row.order}</span>
        </div>
      )
    },
    {
      header: 'الخدمة',
      accessor: 'title',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.image ? (
            <img 
              src={row.image} 
              alt={row.titleAr} 
              className="w-12 h-12 object-cover rounded-xl border border-gray-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
              <Image className="text-gray-400" size={20} />
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 text-lg">{row.titleAr}</p>
            <p className="text-xs text-gray-500">{row.titleEn || ''}</p>
          </div>
        </div>
      )
    },
    {
      header: 'الوصف',
      accessor: 'description',
      render: (row) => (
        <p className="text-sm text-gray-600 line-clamp-2 max-w-md">
          {row.descriptionAr || row.descriptionEn || 'لا يوجد وصف'}
        </p>
      )
    },
    {
      header: 'الحالة',
      accessor: 'isActive',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          row.isActive 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          {row.isActive ? 'نشط' : 'غير نشط'}
        </span>
      )
    },
    {
      header: 'الإجراءات',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingItem(row);
              setImagePreview(row.image);
              setShowModal(true);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => {
              if (window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
                deleteMutation.mutate(row.id);
              }
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
    
    const uploadData = new FormData();
    uploadData.append('titleAr', formData.get('titleAr'));
    uploadData.append('titleEn', formData.get('titleEn') || '');
    uploadData.append('descriptionAr', formData.get('descriptionAr') || '');
    uploadData.append('descriptionEn', formData.get('descriptionEn') || '');
    uploadData.append('order', formData.get('order') || '0');
    uploadData.append('isActive', formData.get('isActive') === 'on' ? 'true' : 'false');
    uploadData.append('link', formData.get('link') || '');
    
    const imageFile = formData.get('imageFile');
    const imageUrl = formData.get('imageUrl');
    
    if (imageFile && imageFile.size > 0) {
      uploadData.append('image', imageFile);
    } else if (imageUrl) {
      uploadData.append('image', imageUrl);
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: uploadData });
    } else {
      createMutation.mutate(uploadData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة خدمات الصفحة الرئيسية</h2>
          <p className="text-sm text-gray-500 mt-1">إدارة الخدمات المعروضة في الصفحة الرئيسية</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setImagePreview(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة خدمة جديدة
        </button>
      </div>

      <div className="glass-card">
        <DataTable
          data={servicesList}
          columns={columns}
          isLoading={isLoading}
          searchable={true}
          searchPlaceholder="بحث في الخدمات..."
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
          setImagePreview(null);
        }}
        title={editingItem ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">العنوان (عربي) *</label>
              <input
                name="titleAr"
                type="text"
                defaultValue={editingItem?.titleAr}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">العنوان (إنجليزي)</label>
              <input
                name="titleEn"
                type="text"
                defaultValue={editingItem?.titleEn}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">الوصف (عربي)</label>
              <textarea
                name="descriptionAr"
                defaultValue={editingItem?.descriptionAr}
                className="input min-h-[100px]"
              />
            </div>
            <div>
              <label className="label">الوصف (إنجليزي)</label>
              <textarea
                name="descriptionEn"
                defaultValue={editingItem?.descriptionEn}
                className="input min-h-[100px]"
              />
            </div>
          </div>

          <div>
            <label className="label">صورة الخدمة</label>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رفع صورة جديدة
                </label>
                <input
                  name="imageFile"
                  type="file"
                  accept="image/*"
                  className="input"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setImagePreview(event.target.result);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setImagePreview(null);
                    }
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  أو رابط الصورة
                </label>
                <input
                  name="imageUrl"
                  type="url"
                  defaultValue={editingItem?.image}
                  className="input"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              {(imagePreview || editingItem?.image) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    معاينة الصورة
                  </label>
                  <img 
                    src={imagePreview || editingItem?.image || ''} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="label">رابط الخدمة</label>
            <input
              name="link"
              type="text"
              defaultValue={editingItem?.link}
              className="input"
              placeholder="مثال: /appointments/booking"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">الترتيب</label>
              <input
                name="order"
                type="number"
                defaultValue={editingItem?.order || 0}
                className="input"
                min="0"
              />
            </div>
            <div>
              <label className="label">الحالة</label>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <input
                  name="isActive"
                  type="checkbox"
                  defaultChecked={editingItem?.isActive !== false}
                  className="w-5 h-5 text-primary-600 rounded"
                />
                <label className="font-semibold text-gray-900">تفعيل الخدمة</label>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingItem(null);
                setImagePreview(null);
              }}
              className="btn-secondary flex-1"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HomeServices;


