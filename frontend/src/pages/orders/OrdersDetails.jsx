import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { orders } from '../../api/admin';

const OrdersDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await orders.getById(id);
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-12">جاري التحميل...</div>;
  }

  const order = data?.data?.order;

  if (!order) {
    return <div className="text-center py-12">الطلب غير موجود</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-gray-600 hover:text-primary-600"
      >
        <ArrowLeft size={20} />
        <span>العودة</span>
      </button>

      <div className="glass-card rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">طلب #{order.id.substring(0, 8)}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-sm text-gray-500 mb-2 block">المستخدم</label>
            <p className="text-lg text-gray-900">{order.user?.fullName || 'غير محدد'}</p>
          </div>
          
          <div>
            <label className="text-sm text-gray-500 mb-2 block">الحالة</label>
            <span className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-100 text-blue-700">
              {order.status}
            </span>
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-2 block">المبلغ الإجمالي</label>
            <p className="text-2xl font-bold text-primary-600">{order.totalAmount} ج.م</p>
          </div>
        </div>

        {order.items && order.items.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">المنتجات</h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.product?.nameAr || item.product?.name}</p>
                    <p className="text-sm text-gray-500">الكمية: {item.quantity}</p>
                  </div>
                  <p className="text-lg font-bold text-primary-600">{item.price * item.quantity} ج.م</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersDetails;

