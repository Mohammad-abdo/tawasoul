import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { doctors } from '../../api/admin';
import { Plus, X, Shield, ShieldOff, Mail, Calendar, Star, Edit, Eye, Stethoscope, UserCheck, UserX, Trash2, TrendingUp, AlertCircle, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const Doctors = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const limit = 20;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['doctors', page],
    queryFn: async () => {
      const response = await doctors.getAll({ page, limit });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: doctors.create,
    onSuccess: () => {
      toast.success('تم إضافة الطبيب بنجاح');
      setShowModal(false);
      setEditingDoctor(null);
      refetch();
    },
    onError: () => {
      toast.error('فشل إضافة الطبيب');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => doctors.update(id, data),
    onSuccess: () => {
      toast.success('تم تحديث الطبيب بنجاح');
      setShowModal(false);
      setEditingDoctor(null);
      refetch();
    },
    onError: () => {
      toast.error('فشل تحديث الطبيب');
    },
  });

  const approveMutation = useMutation({
    mutationFn: doctors.approve,
    onSuccess: () => {
      toast.success('تم الموافقة على الطبيب');
      refetch();
    },
    onError: () => {
      toast.error('فشل الموافقة');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => doctors.reject(id, { reason: 'رفض من الأدمن' }),
    onSuccess: () => {
      toast.success('تم رفض الطبيب');
      refetch();
    },
    onError: () => {
      toast.error('فشل الرفض');
    },
  });

  const verifyMutation = useMutation({
    mutationFn: doctors.verify,
    onSuccess: () => {
      toast.success('تم توثيق الطبيب');
      refetch();
    },
    onError: () => {
      toast.error('فشل التوثيق');
    },
  });

  const unverifyMutation = useMutation({
    mutationFn: doctors.unverify,
    onSuccess: () => {
      toast.success('تم إلغاء توثيق الطبيب');
      refetch();
    },
    onError: () => {
      toast.error('فشل إلغاء التوثيق');
    },
  });

  const activateMutation = useMutation({
    mutationFn: doctors.activate,
    onSuccess: () => {
      toast.success('تم تفعيل الطبيب');
      refetch();
    },
    onError: () => {
      toast.error('فشل التفعيل');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: doctors.deactivate,
    onSuccess: () => {
      toast.success('تم تعطيل الطبيب');
      refetch();
    },
    onError: () => {
      toast.error('فشل التعطيل');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: doctors.delete,
    onSuccess: () => {
      toast.success('تم حذف الطبيب');
      refetch();
    },
    onError: () => {
      toast.error('فشل حذف الطبيب');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password') || undefined,
      specialization: formData.get('specialization'),
      phone: formData.get('phone') || undefined,
      bio: formData.get('bio') || undefined,
      isApproved: true,
    };

    if (editingDoctor) {
      updateMutation.mutate({ id: editingDoctor.id, data });
    } else {
      if (!data.password) {
        toast.error('كلمة المرور مطلوبة للأطباء الجدد');
        return;
      }
      createMutation.mutate(data);
    }
  };

  const doctorsList = data?.data?.doctors || [];
  const total = data?.data?.pagination?.total || doctorsList.length;
  const approvedCount = doctorsList.filter(d => d.isApproved).length;
  const pendingCount = doctorsList.filter(d => !d.isApproved).length;
  const verifiedCount = doctorsList.filter(d => d.isVerified).length;
  const activeCount = doctorsList.filter(d => d.isActive).length;

  const columns = [
    {
      header: 'الطبيب',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
            <span className="text-white text-lg font-bold">
              {row.name?.charAt(0) || 'D'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{row.name}</p>
            <p className="text-xs text-gray-500">ID: {row.id.substring(0, 8)}...</p>
          </div>
        </div>
      )
    },
    {
      header: 'البريد الإلكتروني',
      accessor: 'email',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
            <Mail className="text-primary-600" size={18} />
          </div>
          <span className="text-sm font-medium text-gray-900">{row.email}</span>
        </div>
      )
    },
    {
      header: 'التخصص',
      accessor: 'specialization',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Stethoscope size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-900">{row.specialization || '-'}</span>
        </div>
      )
    },
    {
      header: 'التقييم',
      accessor: 'rating',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-center">
            <Star className="text-yellow-600 fill-yellow-600" size={18} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">
              {row.rating ? row.rating.toFixed(1) : '0.0'}
            </p>
            <p className="text-xs text-gray-500">تقييم</p>
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
            row.isApproved 
              ? 'bg-green-100 text-green-700 border-green-200' 
              : 'bg-yellow-100 text-yellow-700 border-yellow-200'
          }`}>
            {row.isApproved ? 'موافق' : 'بانتظار الموافقة'}
          </span>
          {row.isVerified && (
            <span className="px-3 py-1.5 rounded-lg text-sm font-semibold border bg-blue-100 text-blue-700 border-blue-200 inline-block w-fit">
              موثّق
            </span>
          )}
          {!row.isActive && (
            <span className="px-3 py-1.5 rounded-lg text-sm font-semibold border bg-gray-100 text-gray-700 border-gray-200 inline-block w-fit">
              معطل
            </span>
          )}
        </div>
      )
    },
    {
      header: 'تاريخ التسجيل',
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
        navigate(`/doctors/${row.id}`);
      },
      className: 'text-primary-600 hover:bg-primary-50',
      show: () => true,
    },
    {
      label: 'تعديل',
      icon: Edit,
      onClick: (row) => {
        setEditingDoctor(row);
        setShowModal(true);
      },
      className: 'text-blue-600 hover:bg-blue-50',
      show: () => true,
    },

    {
      label: (row) => row.isVerified ? 'إلغاء التوثيق' : 'توثيق',
      icon: (row) => row.isVerified ? ShieldOff : Shield,
      onClick: (row) => {
        if (row.isVerified) {
          unverifyMutation.mutate(row.id);
        } else {
          verifyMutation.mutate(row.id);
        }
      },
      className: (row) => row.isVerified 
        ? 'text-orange-600 hover:bg-orange-50' 
        : 'text-blue-600 hover:bg-blue-50',
      show: (row) => true,
    },
    {
      label: (row) => row.isActive ? 'تعطيل' : 'تفعيل',
      icon: (row) => row.isActive ? UserX : UserCheck,
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
      show: (row) => row.isApproved,
    },
    {
      label: 'حذف',
      icon: Trash2,
      onClick: (row) => {
        if (window.confirm(`هل أنت متأكد من حذف الطبيب "${row.name}"؟`)) {
          deleteMutation.mutate(row.id);
        }
      },
      className: 'text-red-600 hover:bg-red-50',
      show: () => true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الأطباء</h2>
          <p className="text-sm text-gray-500 mt-1">إدارة جميع الأطباء في النظام</p>
        </div>
        <button
          onClick={() => {
            setEditingDoctor(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة طبيب
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
              <Stethoscope className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-xs text-gray-500">إجمالي الأطباء</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
              <Check className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
              <p className="text-xs text-gray-500">موافق عليهم</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Shield className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{verifiedCount}</p>
              <p className="text-xs text-gray-500">موثقين</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center">
              <UserCheck className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
              <p className="text-xs text-gray-500">نشطين</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={doctorsList}
        columns={columns}
        isLoading={isLoading}
        searchable={true}
        filterable={true}
        exportable={true}
        pagination={true}
        pageSize={limit}
        emptyMessage="لا يوجد أطباء"
        title="قائمة الأطباء"
        actions={actions}
        filters={[

          {
            key: 'isVerified',
            label: 'التوثيق',
            type: 'boolean'
          },
          {
            key: 'isActive',
            label: 'النشاط',
            type: 'boolean'
          },
          {
            key: 'specialization',
            label: 'التخصص',
            type: 'text'
          },
          {
            key: 'rating',
            label: 'التقييم',
            type: 'numberRange'
          },
          {
            key: 'createdAt',
            label: 'تاريخ التسجيل',
            type: 'dateRange'
          }
        ]}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingDoctor(null);
        }}
        title={editingDoctor ? 'تعديل طبيب' : 'إضافة طبيب جديد'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">الاسم *</label>
              <input
                name="name"
                type="text"
                defaultValue={editingDoctor?.name}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">البريد الإلكتروني *</label>
              <input
                name="email"
                type="email"
                defaultValue={editingDoctor?.email}
                className="input"
                required
              />
            </div>
          </div>
          <div>
            <label className="label">
              كلمة المرور {editingDoctor && '(اتركه فارغاً للحفاظ على الكلمة الحالية)'} *
            </label>
            <input
              name="password"
              type="password"
              className="input"
              required={!editingDoctor}
              minLength={6}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">التخصص *</label>
              <input
                name="specialization"
                type="text"
                defaultValue={editingDoctor?.specialization}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">رقم الهاتف</label>
              <input
                name="phone"
                type="tel"
                defaultValue={editingDoctor?.phone}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">السيرة الذاتية</label>
            <textarea
              name="bio"
              defaultValue={editingDoctor?.bio}
              className="input min-h-[100px]"
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button 
              type="submit" 
              className="btn-primary flex-1"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingDoctor ? 'تحديث' : 'إضافة'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingDoctor(null);
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

export default Doctors;
