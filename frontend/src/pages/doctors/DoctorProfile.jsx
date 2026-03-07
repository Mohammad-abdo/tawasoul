import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { doctorAuth } from '../../api/doctor';
import { 
  User, 
  Mail, 
  Phone, 
  Award, 
  BookOpen, 
  DollarSign, 
  Save, 
  Camera,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    bio: '',
    avatar: '',
    specialties: [],
    sessionPrices: [
      { duration: 30, price: 0 },
      { duration: 45, price: 0 },
      { duration: 60, price: 0 }
    ]
  });

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['doctor-profile'],
    queryFn: async () => {
      const response = await doctorAuth.getMe();
      return response.data.data;
    },
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        specialization: profile.specialization || '',
        bio: profile.bio || '',
        avatar: profile.avatar || '',
        specialties: profile.specialties?.map(s => s.specialty) || [],
        sessionPrices: [
          { duration: 30, price: profile.sessionPrices?.find(p => p.duration === 30)?.price || 0 },
          { duration: 45, price: profile.sessionPrices?.find(p => p.duration === 45)?.price || 0 },
          { duration: 60, price: profile.sessionPrices?.find(p => p.duration === 60)?.price || 0 }
        ]
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: doctorAuth.updateProfile,
    onSuccess: () => {
      toast.success('تم تحديث الملف الشخصي بنجاح');
      refetch();
    },
    onError: () => {
      toast.error('فشل تحديث الملف الشخصي');
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (index, value) => {
    const newPrices = [...formData.sessionPrices];
    newPrices[index].price = value;
    setFormData(prev => ({ ...prev, sessionPrices: newPrices }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
          <p className="text-gray-500">إدارة بياناتك الشخصية وأسعار الجلسات</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-12">
        {/* Basic Info */}
        <div className="glass-card rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl bg-primary-50 border-2 border-primary-200 flex items-center justify-center overflow-hidden">
                {formData.avatar ? (
                  <img src={formData.avatar} alt={formData.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="text-primary-600" size={40} />
                )}
              </div>
              <button type="button" className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-primary-600 hover:scale-110 transition-transform">
                <Camera size={16} />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{formData.name}</h3>
              <p className="text-sm text-gray-500">{formData.specialization || 'طبيب مختص'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User size={16} className="text-primary-500" /> الاسم بالكامل
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail size={16} className="text-primary-500" /> البريد الإلكتروني
              </label>
              <input
                type="email"
                value={formData.email}
                className="input opacity-60 bg-gray-50"
                disabled
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Phone size={16} className="text-primary-500" /> رقم الهاتف
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Award size={16} className="text-primary-500" /> التخصص الرئيسي
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="input"
                placeholder="مثال: أخصائي تخاطب وتعديل سلوك"
              />
            </div>
          </div>
        </div>

        {/* Bio & Professional Info */}
        <div className="glass-card rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-primary-600" /> النبذة التعريفية والخبرات
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-600">اكتب نبذة عن مسارك المهني وخبراتك</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="input min-h-[150px] py-3"
                placeholder="تحدث عن خبراتك والشهادات التي حصلت عليها..."
              />
            </div>
          </div>
        </div>

        {/* Session Pricing */}
        <div className="glass-card rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-primary-600" /> تحديد أسعار الجلسات
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {formData.sessionPrices.map((price, index) => (
              <div key={price.duration} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                  جلسة {price.duration} دقيقة
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={price.price}
                    onChange={(e) => handlePriceChange(index, e.target.value)}
                    className="input pr-12 font-bold"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold">ج.م</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-primary px-12 flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
          >
            <Save size={20} />
            {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ الملف الشخصي'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorProfile;
