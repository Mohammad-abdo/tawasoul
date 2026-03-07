import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settings, pages } from '../../api/admin';
import { 
  Settings as SettingsIcon, 
  Save, 
  Upload, 
  Image, 
  Type, 
  Palette, 
  Globe, 
  Smartphone, 
  Monitor,
  FileText,
  Bell,
  Shield,
  CheckCircle,
  XCircle,
  Loader,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const FONTS = [
  { value: 'Cairo', label: 'Cairo' },
  { value: 'Tajawal', label: 'Tajawal' },
  { value: 'Almarai', label: 'Almarai' },
  { value: 'Changa', label: 'Changa' },
  { value: 'IBM Plex Sans Arabic', label: 'IBM Plex Sans Arabic' },
  { value: 'Noto Sans Arabic', label: 'Noto Sans Arabic' },
  { value: 'Amiri', label: 'Amiri' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState('branding');
  const queryClient = useQueryClient();
  
  // Form state for branding
  const [brandingForm, setBrandingForm] = useState({
    appName: '',
    appNameEn: '',
    primaryFont: 'Cairo',
    secondaryFont: 'Tajawal',
    primaryColor: '#14b8a6',
    secondaryColor: '#64748b',
    logo: '',
    logoMobile: '',
    favicon: '',
  });

  // Form state for general settings
  const [generalForm, setGeneralForm] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    doctorRegistrationEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    maxPostLength: 5000,
    maxFileSize: 10485760,
  });

  const { data: settingsData, isLoading, refetch } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      try {
        const response = await settings.get();
        return response.data;
      } catch (error) {
        console.error('Error fetching settings:', error);
        return null;
      }
    },
  });

  const { data: pagesData, isLoading: pagesLoading, refetch: refetchPages } = useQuery({
    queryKey: ['admin-pages'],
    queryFn: async () => {
      try {
        const response = await pages.getAll();
        return response.data;
      } catch (error) {
        console.error('Error fetching pages:', error);
        return { pages: [] };
      }
    },
    refetchOnWindowFocus: false,
  });

  // State for page forms
  const [pageForms, setPageForms] = useState({});

  // Update form state when settings data loads
  useEffect(() => {
    if (settingsData) {
      setBrandingForm({
        appName: settingsData.appName || 'تواصل',
        appNameEn: settingsData.appNameEn || 'Tawasoul',
        primaryFont: settingsData.primaryFont || 'Cairo',
        secondaryFont: settingsData.secondaryFont || 'Tajawal',
        primaryColor: settingsData.primaryColor || '#14b8a6',
        secondaryColor: settingsData.secondaryColor || '#64748b',
        logo: settingsData.logo || '',
        logoMobile: settingsData.logoMobile || '',
        favicon: settingsData.favicon || '',
      });

      setGeneralForm({
        maintenanceMode: settingsData.maintenanceMode || false,
        registrationEnabled: settingsData.registrationEnabled !== false,
        doctorRegistrationEnabled: settingsData.doctorRegistrationEnabled !== false,
        emailNotifications: settingsData.emailNotifications !== false,
        smsNotifications: settingsData.smsNotifications || false,
        maxPostLength: settingsData.maxPostLength || 5000,
        maxFileSize: settingsData.maxFileSize || 10485760,
      });
    }
  }, [settingsData]);

  // Update page forms when pages data loads
  useEffect(() => {
    if (pagesData?.pages && Array.isArray(pagesData.pages)) {
      const forms = {};
      pagesData.pages.forEach((page) => {
        forms[page.pageType] = {
          titleAr: page.titleAr || '',
          contentAr: page.contentAr || '',
        };
      });
      setPageForms(forms);
    }
  }, [pagesData]);

  // Auto-initialize pages when pages tab is opened and no pages exist
  useEffect(() => {
    if (activeTab === 'pages' && !pagesLoading) {
      // Check if pages exist, if not, refetch (which will auto-create them via getAllPages)
      if (!pagesData?.pages || pagesData.pages.length === 0) {
        // Refetch will trigger getAllPages which auto-creates missing pages
        refetchPages();
      }
    }
  }, [activeTab, pagesLoading, pagesData, refetchPages]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => settings.update(data),
    onSuccess: (response) => {
      toast.success(response.data?.message || 'تم حفظ الإعدادات بنجاح');
      queryClient.invalidateQueries(['admin-settings']);
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل حفظ الإعدادات');
    },
  });

  const updatePageMutation = useMutation({
    mutationFn: ({ type, data }) => pages.update(type, data),
    onSuccess: (response) => {
      toast.success(response.data?.message || 'تم تحديث المحتوى بنجاح');
      refetchPages();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل تحديث المحتوى');
    },
  });

  const initializePagesMutation = useMutation({
    mutationFn: () => pages.initialize(),
    onSuccess: (response) => {
      toast.success(response.data?.message || 'تم إنشاء الصفحات بنجاح');
      refetchPages();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'فشل إنشاء الصفحات');
    },
  });

  const handlePageChange = (pageType, field, value) => {
    setPageForms(prev => ({
      ...prev,
      [pageType]: {
        ...prev[pageType],
        [field]: value
      }
    }));
  };

  const handlePageSubmit = (e, pageType) => {
    e.preventDefault();
    const formData = pageForms[pageType];
    if (formData) {
      updatePageMutation.mutate({
        type: pageType,
        data: {
          titleAr: formData.titleAr,
          contentAr: formData.contentAr,
        },
      });
    }
  };

  const handleBrandingChange = (field, value) => {
    setBrandingForm(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneralChange = (field, value) => {
    setGeneralForm(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (type, file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const logoUrl = reader.result;
      handleBrandingChange(type, logoUrl);
      // Auto-save logo
      updateSettingsMutation.mutate({
        [type]: logoUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleBrandingSubmit = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate(brandingForm);
  };

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate(generalForm);
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

  const tabs = [
    { id: 'branding', label: 'الهوية البصرية', icon: Image },
    { id: 'general', label: 'الإعدادات العامة', icon: SettingsIcon },
    { id: 'pages', label: 'محتوى الصفحات', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الإعدادات</h2>
          <p className="text-sm text-gray-500 mt-1">إدارة إعدادات التطبيق والهوية البصرية</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card rounded-xl p-2 border border-gray-200">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="glass-card rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
                <Image className="text-primary-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">الهوية البصرية</h3>
                <p className="text-sm text-gray-500">تخصيص الشعارات والألوان والخطوط</p>
              </div>
            </div>

            <form onSubmit={handleBrandingSubmit} className="space-y-6">
              {/* App Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label flex items-center gap-2">
                    <Globe size={16} />
                    اسم التطبيق (عربي)
                  </label>
                  <input
                    type="text"
                    value={brandingForm.appName}
                    onChange={(e) => handleBrandingChange('appName', e.target.value)}
                    className="input"
                    placeholder="تواصل"
                  />
                </div>
                <div>
                  <label className="label flex items-center gap-2">
                    <Globe size={16} />
                    اسم التطبيق (إنجليزي)
                  </label>
                  <input
                    type="text"
                    value={brandingForm.appNameEn}
                    onChange={(e) => handleBrandingChange('appNameEn', e.target.value)}
                    className="input"
                    placeholder="Tawasoul"
                  />
                </div>
              </div>

              {/* Logos */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Upload size={18} />
                  الشعارات
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Desktop Logo */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <label className="label flex items-center gap-2 mb-2">
                      <Monitor size={16} />
                      شعار سطح المكتب
                    </label>
                    <div className="space-y-2">
                      {brandingForm.logo && (
                        <img 
                          src={brandingForm.logo} 
                          alt="Logo" 
                          className="w-full h-32 object-contain bg-white border rounded-lg p-2" 
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload('logo', e.target.files[0])}
                        className="input text-sm"
                      />
                    </div>
                  </div>

                  {/* Mobile Logo */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <label className="label flex items-center gap-2 mb-2">
                      <Smartphone size={16} />
                      شعار الموبايل
                    </label>
                    <div className="space-y-2">
                      {brandingForm.logoMobile && (
                        <img 
                          src={brandingForm.logoMobile} 
                          alt="Mobile Logo" 
                          className="w-full h-32 object-contain bg-white border rounded-lg p-2" 
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload('logoMobile', e.target.files[0])}
                        className="input text-sm"
                      />
                    </div>
                  </div>

                  {/* Favicon */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <label className="label flex items-center gap-2 mb-2">
                      <Image size={16} />
                      الأيقونة (Favicon)
                    </label>
                    <div className="space-y-2">
                      {brandingForm.favicon && (
                        <img 
                          src={brandingForm.favicon} 
                          alt="Favicon" 
                          className="w-16 h-16 object-contain bg-white border rounded-lg p-2 mx-auto" 
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload('favicon', e.target.files[0])}
                        className="input text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fonts */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Type size={18} />
                  الخطوط
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">الخط الأساسي</label>
                    <select
                      value={brandingForm.primaryFont}
                      onChange={(e) => handleBrandingChange('primaryFont', e.target.value)}
                      className="input"
                    >
                      {FONTS.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">الخط الثانوي</label>
                    <select
                      value={brandingForm.secondaryFont}
                      onChange={(e) => handleBrandingChange('secondaryFont', e.target.value)}
                      className="input"
                    >
                      {FONTS.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Palette size={18} />
                  الألوان
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">اللون الأساسي</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={brandingForm.primaryColor}
                        onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                        className="w-16 h-10 rounded-lg border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={brandingForm.primaryColor}
                        onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                        className="input flex-1"
                        placeholder="#14b8a6"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">اللون الثانوي</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={brandingForm.secondaryColor}
                        onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                        className="w-16 h-10 rounded-lg border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={brandingForm.secondaryColor}
                        onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                        className="input flex-1"
                        placeholder="#64748b"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary flex items-center gap-2 w-full md:w-auto"
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    حفظ التغييرات
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="glass-card rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                <SettingsIcon className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">الإعدادات العامة</h3>
                <p className="text-sm text-gray-500">إدارة إعدادات التطبيق العامة</p>
              </div>
            </div>

            <form onSubmit={handleGeneralSubmit} className="space-y-6">
              {/* Toggle Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      generalForm.maintenanceMode 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {generalForm.maintenanceMode ? <XCircle size={20} /> : <CheckCircle size={20} />}
                    </div>
                    <div>
                      <label className="font-semibold text-gray-900 cursor-pointer">وضع الصيانة</label>
                      <p className="text-sm text-gray-500">إيقاف التطبيق مؤقتاً للصيانة</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generalForm.maintenanceMode}
                      onChange={(e) => handleGeneralChange('maintenanceMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      generalForm.registrationEnabled 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {generalForm.registrationEnabled ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    </div>
                    <div>
                      <label className="font-semibold text-gray-900 cursor-pointer">تفعيل تسجيل المستخدمين</label>
                      <p className="text-sm text-gray-500">السماح للمستخدمين الجدد بالتسجيل</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generalForm.registrationEnabled}
                      onChange={(e) => handleGeneralChange('registrationEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      generalForm.doctorRegistrationEnabled 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {generalForm.doctorRegistrationEnabled ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    </div>
                    <div>
                      <label className="font-semibold text-gray-900 cursor-pointer">تفعيل تسجيل الأطباء</label>
                      <p className="text-sm text-gray-500">السماح للأطباء الجدد بالتسجيل</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generalForm.doctorRegistrationEnabled}
                      onChange={(e) => handleGeneralChange('doctorRegistrationEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      generalForm.emailNotifications 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {generalForm.emailNotifications ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    </div>
                    <div>
                      <label className="font-semibold text-gray-900 cursor-pointer">الإشعارات عبر البريد</label>
                      <p className="text-sm text-gray-500">إرسال الإشعارات عبر البريد الإلكتروني</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generalForm.emailNotifications}
                      onChange={(e) => handleGeneralChange('emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      generalForm.smsNotifications 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {generalForm.smsNotifications ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    </div>
                    <div>
                      <label className="font-semibold text-gray-900 cursor-pointer">الإشعارات عبر الرسائل</label>
                      <p className="text-sm text-gray-500">إرسال الإشعارات عبر الرسائل النصية</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generalForm.smsNotifications}
                      onChange={(e) => handleGeneralChange('smsNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>

              {/* Numeric Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">الحد الأقصى لطول المنشور</label>
                  <input
                    type="number"
                    value={generalForm.maxPostLength}
                    onChange={(e) => handleGeneralChange('maxPostLength', parseInt(e.target.value) || 0)}
                    className="input"
                    min="0"
                  />
                </div>
                <div>
                  <label className="label">الحد الأقصى لحجم الملف (بايت)</label>
                  <input
                    type="number"
                    value={generalForm.maxFileSize}
                    onChange={(e) => handleGeneralChange('maxFileSize', parseInt(e.target.value) || 0)}
                    className="input"
                    min="0"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary flex items-center gap-2 w-full md:w-auto"
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    حفظ الإعدادات
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Pages Tab */}
        {activeTab === 'pages' && (
          <div className="space-y-4">
            {/* Loading State */}
            {pagesLoading && (
              <div className="glass-card rounded-2xl p-6 border border-gray-200 text-center">
                <Loader className="animate-spin mx-auto text-primary-600 mb-4" size={48} />
                <p className="text-gray-700 font-medium">جاري تحميل الصفحات...</p>
              </div>
            )}

            {/* Pages Forms - Always show fixed pages */}
            {!pagesLoading && (() => {
              // Define fixed pages that should always exist
              const fixedPages = [
                { pageType: 'ABOUT_APP', titleAr: 'عن التطبيق' },
                { pageType: 'PRIVACY_POLICY', titleAr: 'سياسة الخصوصية' },
                { pageType: 'TERMS_AND_CONDITIONS', titleAr: 'الشروط والأحكام' },
                { pageType: 'COMMUNITY_GUIDELINES', titleAr: 'إرشادات المجتمع' },
                { pageType: 'HELP_CENTER', titleAr: 'مركز المساعدة' }
              ];

              // Use existing pages from API or create forms for fixed pages
              const pagesToShow = pagesData?.pages && pagesData.pages.length > 0 
                ? pagesData.pages 
                : fixedPages.map(fp => ({
                    pageType: fp.pageType,
                    titleAr: fp.titleAr,
                    contentAr: '',
                    updatedAt: null
                  }));

              return pagesToShow.map((page) => {
                const formData = pageForms[page.pageType] || { 
                  titleAr: page.titleAr || '', 
                  contentAr: page.contentAr || '' 
                };
                
                return (
                  <div key={page.pageType} className="glass-card rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <FileText className="text-white" size={28} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {page.titleAr || page.pageType}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            محتوى هذه الصفحة سيظهر في تطبيق الهاتف
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/pages/${page.pageType}`}
                        target="_blank"
                        className="btn-secondary flex items-center gap-2 whitespace-nowrap"
                      >
                        <Eye size={18} />
                        معاينة
                        <ExternalLink size={16} />
                      </Link>
                    </div>
                    
                    <form
                      onSubmit={(e) => handlePageSubmit(e, page.pageType)}
                      className="space-y-6"
                    >
                      <div>
                        <label className="label text-base font-semibold mb-2">
                          عنوان الصفحة (عربي)
                        </label>
                        <input
                          type="text"
                          value={formData.titleAr}
                          onChange={(e) => handlePageChange(page.pageType, 'titleAr', e.target.value)}
                          className="input text-lg"
                          placeholder="مثال: سياسة الخصوصية"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          هذا العنوان سيظهر في تطبيق الهاتف
                        </p>
                      </div>
                      
                      <div>
                        <label className="label text-base font-semibold mb-2">
                          محتوى الصفحة (عربي)
                        </label>
                        <textarea
                          value={formData.contentAr}
                          onChange={(e) => handlePageChange(page.pageType, 'contentAr', e.target.value)}
                          className="input min-h-[300px] text-base leading-relaxed"
                          placeholder="أدخل محتوى الصفحة هنا... سيظهر هذا المحتوى في تطبيق الهاتف"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          يمكنك استخدام أسطر متعددة. هذا المحتوى سيُرسل إلى تطبيق الهاتف
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                          آخر تحديث: {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'لم يتم التحديث'}
                        </div>
                        <button 
                          type="submit" 
                          className="btn-primary flex items-center gap-2 px-6"
                          disabled={updatePageMutation.isPending}
                        >
                          {updatePageMutation.isPending ? (
                            <>
                              <Loader className="animate-spin" size={18} />
                              جاري الحفظ...
                            </>
                          ) : (
                            <>
                              <Save size={18} />
                              حفظ المحتوى
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
