import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Award, BookOpen, Camera, Mail, Phone, Save, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorAuth } from '../../api/doctor';

const DoctorProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    hourlyRate: '',
    bio: '',
    avatar: '',
    specialties: []
  });

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['doctor-profile'],
    queryFn: async () => {
      const response = await doctorAuth.getMe();
      return response.data.data;
    }
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    setFormData({
      name: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      specialization: profile.specialization || '',
      hourlyRate: profile.hourlyRate || '',
      bio: profile.bio || '',
      avatar: profile.avatar || '',
      specialties: profile.specialties?.map((specialty) => specialty.specialty) || []
    });
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
          <p className="text-gray-500">إدارة بياناتك الشخصية وملفك المهني</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-12">
        <div className="glass-card rounded-2xl border border-gray-200 p-6">
          <div className="mb-8 flex items-center gap-6">
            <div className="group relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-2 border-primary-200 bg-primary-50">
                {formData.avatar ? (
                  <img src={formData.avatar} alt={formData.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="text-primary-600" size={40} />
                )}
              </div>
              <button
                type="button"
                className="absolute -bottom-2 -right-2 rounded-xl border border-gray-100 bg-white p-2 text-primary-600 shadow-lg transition-transform hover:scale-110"
              >
                <Camera size={16} />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{formData.name}</h3>
              <p className="text-sm text-gray-500">{formData.specialization || 'طبيب مختص'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
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
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Mail size={16} className="text-primary-500" /> البريد الإلكتروني
              </label>
              <input
                type="email"
                value={formData.email}
                className="input bg-gray-50 opacity-60"
                disabled
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
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
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
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

            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Award size={16} className="text-primary-500" /> السعر لكل ساعة
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                className="input"
                placeholder="300"
              />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-gray-200 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
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

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-primary flex items-center gap-2 px-12 shadow-xl transition-all hover:scale-105"
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
