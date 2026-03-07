import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { packages } from '../../api/admin';

const PackagesDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['package', id],
    queryFn: async () => {
      const response = await packages.getById(id);
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-12">جاري التحميل...</div>;
  }

  const packageData = data?.data?.package;

  if (!packageData) {
    return <div className="text-center py-12">الباقة غير موجودة</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/packages')}
        className="flex items-center gap-2 text-gray-600 hover:text-primary-600"
      >
        <ArrowLeft size={20} />
        <span>العودة</span>
      </button>

      <div className="glass-card rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{packageData.nameAr || packageData.name}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-500 mb-2 block">السعر</label>
            <p className="text-2xl font-bold text-primary-600">{packageData.price} ج.م</p>
          </div>
          
          <div>
            <label className="text-sm text-gray-500 mb-2 block">عدد الجلسات</label>
            <p className="text-lg text-gray-900">{packageData.sessionsCount} جلسة</p>
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-2 block">مدة الباقة</label>
            <p className="text-lg text-gray-900">{packageData.durationMonths} شهر</p>
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-2 block">الحالة</label>
            <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
              packageData.isActive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {packageData.isActive ? 'نشط' : 'معطل'}
            </span>
          </div>

          {packageData.description && (
            <div className="md:col-span-2">
              <label className="text-sm text-gray-500 mb-2 block">الوصف</label>
              <p className="text-gray-900">{packageData.descriptionAr || packageData.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackagesDetails;

