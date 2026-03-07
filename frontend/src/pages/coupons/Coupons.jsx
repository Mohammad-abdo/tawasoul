import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Ticket, Plus, Edit, Trash2, Calendar, Percent, DollarSign, Eye, CheckCircle, XCircle, TrendingUp, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { coupons } from '../../api/admin';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const Coupons = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-coupons', page],
    queryFn: async () => {
      const response = await coupons.getAll({ page, limit });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: coupons.create,
    onSuccess: () => {
      toast.success('تم إضافة الكوبون بنجاح');
      setShowModal(false);
      setEditingCoupon(null);
      refetch();
    },
    onError: () => {
      toast.error('فشل إضافة الكوبون');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => coupons.update(id, data),
    onSuccess: () => {
      toast.success('تم تحديث الكوبون بنجاح');
      setShowModal(false);
      setEditingCoupon(null);
      refetch();
    },
    onError: () => {
      toast.error('فشل تحديث الكوبون');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: coupons.delete,
    onSuccess: () => {
      toast.success('تم حذف الكوبون');
      refetch();
    },
    onError: () => {
      toast.error('فشل حذف الكوبون');
    },
  });

  const activateMutation = useMutation({
    mutationFn: coupons.activate,
    onSuccess: () => {
      toast.success('تم تفعيل الكوبون');
      refetch();
    },
    onError: () => {
      toast.error('فشل تفعيل الكوبون');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: coupons.deactivate,
    onSuccess: () => {
      toast.success('تم إلغاء تفعيل الكوبون');
      refetch();
    },
    onError: () => {
      toast.error('فشل إلغاء تفعيل الكوبون');
    },
  });

  const couponsList = data?.data?.coupons || [];

  // Calculate stats
  const activeCoupons = couponsList.filter(c => c.isActive).length;
  const expiredCoupons = couponsList.filter(c => new Date(c.validUntil) < new Date()).length;
  const totalUsage = couponsList.reduce((sum, c) => sum + (c.usedCount || 0), 0);
  const totalDiscount = couponsList.reduce((sum, c) => {
    if (c.type === 'PERCENTAGE') {
      return sum + (c.usedCount || 0) * (c.value || 0);
    } else {
      return sum + (c.usedCount || 0) * (c.value || 0);
    }
  }, 0);

  const columns = [
    {
      header: 'كود الكوبون',
      accessor: 'code',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center">
            <Ticket className="text-primary-600" size={24} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{row.code}</p>
            <p className="text-xs text-gray-500">ID: {row.id.substring(0, 8)}...</p>
          </div>
        </div>
      )
    },
    {
      header: 'القيمة',
      accessor: 'value',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
            row.type === 'PERCENTAGE' 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            {row.type === 'PERCENTAGE' ? (
              <Percent className="text-blue-600" size={18} />
            ) : (
              <DollarSign className="text-green-600" size={18} />
            )}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">
              {row.type === 'PERCENTAGE' ? `${row.value}%` : `${row.value} ج.م`}
            </p>
            <p className="text-xs text-gray-500">{row.type === 'PERCENTAGE' ? 'نسبة' : 'مبلغ'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'الاستخدام',
      accessor: 'usage',
      render: (row) => {
        const used = row.usedCount || 0;
        const limit = row.usageLimit || '∞';
        const percentage = limit !== '∞' && limit > 0 ? (used / limit) * 100 : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={18} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{used} / {limit}</p>
              <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                <div 
                  className={`h-1.5 rounded-full ${
                    percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'تاريخ الانتهاء',
      accessor: 'validUntil',
      sortable: true,
      render: (row) => {
        const isExpired = new Date(row.validUntil) < new Date();
        return (
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
              isExpired 
                ? 'bg-red-50 border-red-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <Clock className={isExpired ? 'text-red-600' : 'text-gray-600'} size={18} />
            </div>
            <div>
              <p className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                {new Date(row.validUntil).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
              <p className="text-xs text-gray-500">
                {isExpired ? 'منتهي' : 'نشط'}
              </p>
            </div>
          </div>
        );
      }
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
      label: 'عرض التفاصيل',
      icon: Eye,
      onClick: (row) => {
        navigate(`/coupons/${row.id}`);
      },
      className: 'text-primary-600 hover:bg-primary-50',
      show: () => true,
    },
    {
      label: 'تعديل',
      icon: Edit,
      onClick: (row) => {
        setEditingCoupon(row);
        setShowModal(true);
      },
      className: 'text-blue-600 hover:bg-blue-50',
      show: () => true,
    },
    {
      label: (row) => row.isActive ? 'إلغاء التفعيل' : 'تفعيل',
      icon: (row) => row.isActive ? XCircle : CheckCircle,
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
      show: () => true,
    },
    {
      label: 'حذف',
      icon: Trash2,
      onClick: (row) => {
        if (window.confirm(`هل أنت متأكد من حذف الكوبون "${row.code}"؟`)) {
          deleteMutation.mutate(row.id);
        }
      },
      className: 'text-red-600 hover:bg-red-50',
      show: () => true,
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      code: formData.get('code'),
      type: formData.get('type'),
      value: parseFloat(formData.get('value')),
      minAmount: formData.get('minAmount') ? parseFloat(formData.get('minAmount')) : undefined,
      maxDiscount: formData.get('maxDiscount') ? parseFloat(formData.get('maxDiscount')) : undefined,
      usageLimit: formData.get('usageLimit') ? parseInt(formData.get('usageLimit')) : undefined,
      usageLimitPerUser: formData.get('usageLimitPerUser') ? parseInt(formData.get('usageLimitPerUser')) : undefined,
      validFrom: new Date(formData.get('validFrom')).toISOString(),
      validUntil: new Date(formData.get('validUntil')).toISOString(),
      isActive: formData.get('isActive') === 'on',
    };

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الكوبونات والخصومات</h2>
          <p className="text-sm text-gray-500 mt-1">إدارة جميع الكوبونات والخصومات المتاحة</p>
        </div>
        <button
          onClick={() => {
            setEditingCoupon(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة كوبون جديد
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
              <Ticket className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{couponsList.length}</p>
              <p className="text-xs text-gray-500">إجمالي الكوبونات</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeCoupons}</p>
              <p className="text-xs text-gray-500">كوبونات نشطة</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
              <XCircle className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{expiredCoupons}</p>
              <p className="text-xs text-gray-500">كوبونات منتهية</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalUsage}</p>
              <p className="text-xs text-gray-500">إجمالي الاستخدامات</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={couponsList}
        columns={columns}
        isLoading={isLoading}
        searchable={true}
        filterable={true}
        exportable={true}
        pagination={true}
        pageSize={limit}
        emptyMessage="لا توجد كوبونات"
        title="قائمة الكوبونات"
        actions={actions}
        filters={[
          {
            key: 'type',
            label: 'النوع',
            type: 'select',
            options: [
              { value: 'PERCENTAGE', label: 'نسبة مئوية' },
              { value: 'FIXED_AMOUNT', label: 'مبلغ ثابت' }
            ]
          },
          {
            key: 'isActive',
            label: 'الحالة',
            type: 'boolean'
          },
          {
            key: 'value',
            label: 'القيمة',
            type: 'numberRange'
          },
          {
            key: 'validUntil',
            label: 'تاريخ الانتهاء',
            type: 'dateRange'
          }
        ]}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCoupon(null);
        }}
        title={editingCoupon ? 'تعديل كوبون' : 'إضافة كوبون جديد'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">كود الكوبون *</label>
            <input
              name="code"
              type="text"
              defaultValue={editingCoupon?.code}
              className="input"
              placeholder="مثال: SUMMER2024"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">النوع *</label>
              <select name="type" className="input" defaultValue={editingCoupon?.type || 'PERCENTAGE'} required>
                <option value="PERCENTAGE">نسبة مئوية</option>
                <option value="FIXED_AMOUNT">مبلغ ثابت</option>
              </select>
            </div>
            <div>
              <label className="label">القيمة *</label>
              <input
                name="value"
                type="number"
                step="0.01"
                defaultValue={editingCoupon?.value}
                className="input"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">الحد الأدنى للطلب</label>
              <input
                name="minAmount"
                type="number"
                step="0.01"
                defaultValue={editingCoupon?.minAmount}
                className="input"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="label">الحد الأقصى للخصم</label>
              <input
                name="maxDiscount"
                type="number"
                step="0.01"
                defaultValue={editingCoupon?.maxDiscount}
                className="input"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">حد الاستخدام الإجمالي</label>
              <input
                name="usageLimit"
                type="number"
                defaultValue={editingCoupon?.usageLimit}
                className="input"
                placeholder="∞"
              />
            </div>
            <div>
              <label className="label">حد الاستخدام لكل مستخدم</label>
              <input
                name="usageLimitPerUser"
                type="number"
                defaultValue={editingCoupon?.usageLimitPerUser}
                className="input"
                placeholder="1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">صالح من *</label>
              <input
                name="validFrom"
                type="datetime-local"
                defaultValue={editingCoupon?.validFrom ? new Date(editingCoupon.validFrom).toISOString().slice(0, 16) : ''}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">صالح حتى *</label>
              <input
                name="validUntil"
                type="datetime-local"
                defaultValue={editingCoupon?.validUntil ? new Date(editingCoupon.validUntil).toISOString().slice(0, 16) : ''}
                className="input"
                required
              />
            </div>
          </div>
          {editingCoupon && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                defaultChecked={editingCoupon.isActive}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                نشط
              </label>
            </div>
          )}
          <div className="flex gap-2 pt-4">
            <button 
              type="submit" 
              className="btn-primary flex-1"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingCoupon ? 'تحديث' : 'إضافة'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingCoupon(null);
              }}
              className="btn-secondary"
            >
              إلغاء
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Coupons;
