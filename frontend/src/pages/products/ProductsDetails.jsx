import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Package, 
  Tag, 
  Star, 
  Box, 
  DollarSign, 
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  BarChart,
  ShoppingCart
} from 'lucide-react';
import { products } from '../../api/admin';
import DataTable from '../../components/common/DataTable';

const ProductsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await products.getById(id);
      return response.data;
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

  const product = data?.data?.product;
  const reviews = product?.reviews || [];

  if (error || !product) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 rounded-2xl text-center">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">المنتج غير موجود</h3>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary flex items-center gap-2 mx-auto mt-4"
          >
            <ArrowRight size={18} />
            العودة للقائمة
          </button>
        </div>
      </div>
    );
  }

  const reviewColumns = [
    {
      header: 'المستخدم',
      accessor: 'user',
      render: (review) => (
        <span className="font-medium text-gray-900">{review.user?.fullName || 'مستخدم'}</span>
      )
    },
    {
      header: 'التقييم',
      accessor: 'rating',
      render: (review) => (
        <div className="flex items-center gap-1 text-yellow-500">
          <span className="font-bold text-gray-900 ml-2">{review.rating}</span>
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={14} 
              fill={i < review.rating ? "currentColor" : "none"} 
              className={i < review.rating ? "text-yellow-500" : "text-gray-300"} 
            />
          ))}
        </div>
      )
    },
    {
      header: 'التعليق',
      accessor: 'comment',
      render: (review) => (
        <p className="text-sm text-gray-600 line-clamp-2">{review.comment || '-'}</p>
      )
    },
    {
      header: 'التاريخ',
      accessor: 'createdAt',
      render: (review) => (
        <span className="text-sm text-gray-500">
          {new Date(review.createdAt).toLocaleDateString('ar-EG')}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowRight size={20} />
          <span>العودة للقائمة</span>
        </button>
        <div className="flex gap-2">
          {product.isFeatured && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold flex items-center gap-1">
              <Star size={14} fill="currentColor" />
              منتج مميز
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${
            product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {product.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {product.isActive ? 'نشط' : 'غير نشط'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gallery Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card rounded-2xl p-2 border border-blue-100 overflow-hidden bg-white">
            <div className="aspect-square relative rounded-xl overflow-hidden bg-gray-50 mb-2 border border-gray-100">
               {product.images && product.images.length > 0 ? (
                 <img 
                   src={product.images[selectedImage]} 
                   alt={product.name} 
                   className="w-full h-full object-contain"
                 />
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                   <ImageIcon size={48} />
                   <span className="text-sm mt-2">لا توجد صور</span>
                 </div>
               )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 px-1 custom-scrollbar">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Card */}
          <div className="glass-card rounded-2xl p-6 border border-gray-200 bg-gradient-to-br from-white to-gray-50">
             <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">السعر الحالي</p>
                  <p className="text-3xl font-bold text-primary-600 flex items-center gap-1">
                    {product.price} <span className="text-sm font-normal text-gray-500">ج.م</span>
                  </p>
                </div>
                {product.priceBeforeDiscount && (
                   <div className="text-left">
                     <p className="text-xs text-gray-400 mb-0.5">قبل الخصم</p>
                     <p className="text-lg font-medium text-gray-400 line-through">
                       {product.priceBeforeDiscount} ج.م
                     </p>
                     <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full">
                       خصم {Math.round(((product.priceBeforeDiscount - product.price) / product.priceBeforeDiscount) * 100)}%
                     </span>
                   </div>
                )}
             </div>
             
             <div className="w-full h-px bg-gray-200 my-4"></div>
             
             <div className="flex justify-between items-center">
               <div className="flex items-center gap-2">
                 <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${product.stock > 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                   <Box size={20} />
                 </div>
                 <div>
                   <p className="text-sm text-gray-500">المخزون</p>
                   <p className={`font-bold ${product.stock > 0 ? 'text-gray-900' : 'text-red-600'}`}>
                     {product.stock > 0 ? `${product.stock} قطعة` : 'نفذت الكمية'}
                   </p>
                 </div>
               </div>
               
               <div className="flex items-center gap-2">
                 <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                   <Star size={20} />
                 </div>
                 <div>
                   <p className="text-sm text-gray-500">التقييم</p>
                   <p className="font-bold text-gray-900 flex items-center gap-1">
                     {product.rating?.toFixed(1) || '0.0'} 
                     <span className="text-xs text-gray-400 font-normal">({product.totalRatings || 0})</span>
                   </p>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-8 border border-gray-200 bg-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                   {product.category && (
                     <span className="px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                       {product.category}
                     </span>
                   )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{product.nameAr}</h1>
                <h2 className="text-xl text-gray-500 font-medium mt-1 dir-ltr text-right">{product.name}</h2>
              </div>
            </div>

            <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">الوصف</h3>
              <p>{product.descriptionAr || product.description || 'لا يوجد وصف متاح'}</p>
            </div>
            
            {product.description && product.description !== product.descriptionAr && (
               <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">English Description</h3>
                  <p className="text-gray-500 text-sm dir-ltr">{product.description}</p>
               </div>
            )}
          </div>

          {/* Stats / Reviews */}
          <div className="glass-card rounded-2xl p-6 border border-gray-200">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                 <ShoppingBagIcon />
                 تقييمات العملاء
               </h3>
             </div>
             
             {reviews.length > 0 ? (
               <DataTable 
                 data={reviews}
                 columns={reviewColumns}
                 pagination={true}
                 pageSize={5}
                 emptyMessage="لا توجد تقييمات"
               />
             ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                   <Star className="mx-auto text-gray-300 mb-2" size={32} />
                   <p className="text-gray-500">لا توجد تقييمات لهذا المنتج بعد</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ShoppingBagIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-bag text-primary-600">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

export default ProductsDetails;
