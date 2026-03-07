import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, Check, X, Plus, Edit, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { products } from '../../api/admin';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const Products = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    price: '',
    priceBeforeDiscount: '',
    stock: '',
    category: '',
    images: [],
    isActive: true,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products', page],
    queryFn: async () => {
      const response = await products.getAll({ page, limit });
      return response.data;
    },
  });

  const activateMutation = useMutation({
    mutationFn: products.activate,
    onSuccess: () => {
      toast.success('تم تفعيل المنتج');
      refetch();
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: products.deactivate,
    onSuccess: () => {
      toast.success('تم تعطيل المنتج');
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: products.delete,
    onSuccess: () => {
      toast.success('تم حذف المنتج');
      refetch();
    },
  });

  const upsertMutation = useMutation({
    mutationFn: (data) => {
      if (editingProduct) {
        return products.update(editingProduct.id, data);
      }
      return products.create(data);
    },
    onSuccess: () => {
      toast.success(editingProduct ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح');
      handleCloseModal();
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'حدث خطأ ما');
    }
  });

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        nameAr: product.nameAr || '',
        description: product.description || '',
        descriptionAr: product.descriptionAr || '',
        price: product.price || '',
        priceBeforeDiscount: product.priceBeforeDiscount || '',
        stock: product.stock || '',
        category: product.category || '',
        images: product.images || [],
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured || false,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        price: '',
        priceBeforeDiscount: '',
        stock: '',
        category: '',
        images: [],
        isActive: true,
        isFeatured: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      priceBeforeDiscount: formData.priceBeforeDiscount ? parseFloat(formData.priceBeforeDiscount) : null,
      stock: parseInt(formData.stock),
    };
    upsertMutation.mutate(payload);
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

  const productsList = data?.data?.products || [];
  const total = data?.data?.pagination?.total || productsList.length;

  const columns = [
    {
      header: 'المنتج',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
            {row.images && row.images[0] ? (
              <img src={row.images[0]} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={20} className="text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{row.nameAr || row.name}</p>
            <p className="text-xs text-gray-500">{row.category || 'بدون فئة'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'السعر',
      accessor: 'price',
      render: (row) => (
        <div>
          <p className="text-lg font-bold text-primary-600">{row.price} ج.م</p>
          {row.priceBeforeDiscount && (
            <p className="text-xs text-gray-400 line-through">{row.priceBeforeDiscount} ج.م</p>
          )}
        </div>
      )
    },
    {
      header: 'المخزون',
      accessor: 'stock',
      render: (row) => (
        <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
          row.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {row.stock} قطعة
        </span>
      )
    },
    {
      header: 'الحالة',
      accessor: 'isActive',
      render: (row) => (
        <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${
          row.isActive 
            ? 'bg-green-100 text-green-700 border-green-200' 
            : 'bg-gray-100 text-gray-700 border-gray-200'
        }`}>
          {row.isActive ? 'نشط' : 'معطل'}
        </span>
      )
    },
  ];

  const actions = [
    {
      label: 'عرض',
      icon: Eye,
      onClick: (row) => navigate(`/products/${row.id}`),
      className: 'text-primary-600 hover:bg-primary-50',
    },
    {
      label: 'تعديل',
      icon: Edit,
      onClick: (row) => handleOpenModal(row),
      className: 'text-blue-600 hover:bg-blue-50',
    },
    {
      label: (row) => row.isActive ? 'تعطيل' : 'تفعيل',
      icon: (row) => row.isActive ? X : Check,
      onClick: (row) => {
        if (row.isActive) {
          deactivateMutation.mutate(row.id);
        } else {
          activateMutation.mutate(row.id);
        }
      },
      className: (row) => row.isActive 
        ? 'text-orange-600 hover:bg-orange-50' 
        : 'text-green-600 hover:bg-green-50',
    },
    {
      label: 'حذف',
      icon: Trash2,
      onClick: (row) => {
        if (window.confirm(`هل أنت متأكد من حذف المنتج "${row.nameAr || row.name}"؟`)) {
          deleteMutation.mutate(row.id);
        }
      },
      className: 'text-red-600 hover:bg-red-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">المنتجات</h1>
            <p className="text-gray-600">إدارة منتجات المتجر</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            إضافة منتج جديد
          </button>
        </div>

        <DataTable
          data={productsList}
          columns={columns}
          actions={actions}
          pagination={{
            page,
            limit,
            total,
            onPageChange: setPage
          }}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">الاسم (بالعربية)</label>
              <input
                type="text"
                required
                className="input w-full"
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Name (English)</label>
              <input
                type="text"
                required
                className="input w-full"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1 block">الوصف (بالعربية)</label>
              <textarea
                className="input w-full min-h-[100px] py-2"
                value={formData.descriptionAr}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Description (English)</label>
              <textarea
                className="input w-full min-h-[100px] py-2"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">السعر</label>
              <input
                type="number"
                step="0.01"
                required
                className="input w-full"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">السعر قبل الخصم (اختياري)</label>
              <input
                type="number"
                step="0.01"
                className="input w-full"
                value={formData.priceBeforeDiscount}
                onChange={(e) => setFormData({ ...formData, priceBeforeDiscount: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">المخزون</label>
              <input
                type="number"
                required
                className="input w-full"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">الفئة</label>
              <select
                className="input w-full"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">اختر الفئة</option>
                <option value="TOYS">ألعاب</option>
                <option value="BOOKS">كتب</option>
                <option value="TOOLS">أدوات</option>
                <option value="EQUIPMENT">معدات</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1 block">روابط الصور (واحدة لكل سطر)</label>
              <textarea
                className="input w-full min-h-[80px] py-2 font-mono text-xs"
                placeholder="https://example.com/image1.jpg"
                value={formData.images.join('\n')}
                onChange={(e) => setFormData({ ...formData, images: e.target.value.split('\n').filter(Boolean) })}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">نشط</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">منتج مميز</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={upsertMutation.isPending}
              className="btn-primary min-w-[120px]"
            >
              {upsertMutation.isPending ? 'جاري الحفظ...' : (editingProduct ? 'حفظ التغييرات' : 'إضافة المنتج')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
