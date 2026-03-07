import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  FileText, 
  Calendar, 
  Clock, 
  DollarSign, 
  Headphones, 
  FileBarChart, 
  Settings,
  LogOut,
  Menu,
  X,
  Tag,
  Ticket,
  Hash,
  Bell,
  User,
  ChevronDown,
  Search,
  Moon,
  Sun,
  Shield,
  Layers,
  Trash2,
  CheckCheck,
  Activity,
  FileQuestion,
  Brain
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { notifications } from '../../api/admin';
import toast from 'react-hot-toast';

const Layout = ({ children = null }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuthStore();
  const userDropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch notifications (only for admins)
  const { data: notificationsData, refetch: refetchNotifications } = useQuery({
    queryKey: ['admin-notifications-header', user?.id], // Add user ID to key
    queryFn: async () => {
      const currentRole = useAuthStore.getState().role;
      if (currentRole !== 'admin' && !currentRole?.includes('ADMIN')) {
        return { notifications: [], unreadCount: 0 };
      }
      try {
        const response = await notifications.getAll({ page: 1, limit: 10 });
        return response.data.data;
      } catch (error) {
        return { notifications: [], unreadCount: 0 };
      }
    },
    refetchInterval: 15000,
    enabled: !!user && (role === 'admin' || role?.includes('ADMIN')),
  });

  const notificationsList = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  // Play sound when new notifications arrive
  useEffect(() => {
    if (unreadCount > previousUnreadCount && previousUnreadCount > 0) {
      playNotificationSound();
    }
    setPreviousUnreadCount(unreadCount);
  }, [unreadCount, previousUnreadCount]);

  const playNotificationSound = () => {
    try {
      // Use Web Audio API for notification sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Pleasant notification tone
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      // Silent fail if audio is not supported
      console.log('Audio notification not supported');
    }
  };

  const clearAllMutation = useMutation({
    mutationFn: notifications.clearAll,
    onSuccess: () => {
      toast.success('تم مسح جميع الإشعارات');
      refetchNotifications();
      queryClient.invalidateQueries(['admin-notifications']);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notifications.markAllAsRead,
    onSuccess: () => {
      toast.success('تم تحديد جميع الإشعارات كمقروءة');
      refetchNotifications();
      queryClient.invalidateQueries(['admin-notifications']);
    },
  });

  const handleClearAll = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع الإشعارات؟')) {
      clearAllMutation.mutate();
    }
  };

  const adminMenuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { path: '/users', icon: Users, label: 'المستخدمين' },
    { path: '/children', icon: Users, label: 'ملفات الأطفال' },
    { path: '/doctors', icon: Stethoscope, label: 'الأطباء' },
    { path: '/bookings', icon: Calendar, label: 'الحجوزات' },
    { path: '/packages', icon: Layers, label: 'الباقات' },
    { path: '/products', icon: FileText, label: 'المنتجات' },
    { path: '/orders', icon: Ticket, label: 'الطلبات' },
    { path: '/payments', icon: DollarSign, label: 'المدفوعات' },
    { path: '/support', icon: Headphones, label: 'الدعم' },
    { path: '/reports', icon: FileBarChart, label: 'التقارير' },
    { path: '/coupons', icon: Ticket, label: 'الكوبونات' },
    { path: '/activity-logs', icon: FileText, label: 'سجل الأنشطة' },
    { path: '/onboarding', icon: Layers, label: 'التعريف (Onboarding)' },
    { path: '/home-sliders', icon: Layers, label: 'سلايدر الصفحة الرئيسية' },
    { path: '/home-services', icon: FileText, label: 'خدمات الصفحة الرئيسية' },
    { path: '/home-articles', icon: FileText, label: 'مقالات الصفحة الرئيسية' },
    { path: '/faqs', icon: FileText, label: 'الأسئلة الشائعة' },
    { path: '/assessments/categories', icon: Layers, label: 'فئات المقاييس' },
    { path: '/assessments', icon: FileQuestion, label: 'المقاييس والاختبارات' },
    { path: '/notifications', icon: Bell, label: 'الإشعارات' },
    ...(user?.role === 'SUPER_ADMIN' ? [{ path: '/admins', icon: Shield, label: 'إدارة الأدمن' }] : []),
    { path: '/settings', icon: Settings, label: 'الإعدادات' },
  ];

  const doctorMenuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { path: '/doctor/children', icon: Users, label: 'ملفات الأطفال' },
    { path: '/bookings', icon: Calendar, label: 'مواعيدي' },
    { path: '/availability', icon: Clock, label: 'مواعيد العمل' },
    { path: '/articles', icon: FileText, label: 'مقالاتي' },
    { path: '/payments', icon: DollarSign, label: 'أرباحي' },
    { path: '/doctor/profile', icon: User, label: 'الملف الشخصي' },
  ];

  const menuItems = (role === 'admin' || role?.includes('ADMIN')) ? adminMenuItems : doctorMenuItems;

  const isActive = (path) => location.pathname === path;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/login');
  };

  return (
    <div className="flex h-screen relative overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-20'
        } glass-sidebar transition-all duration-300 flex flex-col relative z-10 shadow-xl`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200/50 bg-white">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border-2 border-primary-500 flex items-center justify-center shadow-lg">
                  <span className="text-primary-600 font-bold text-lg">س</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-primary-600">تواصل</h1>
                  <p className="text-xs text-gray-500">لوحة التحكم</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl glass-btn text-gray-700 hover:text-primary-600 hover:bg-gray-50 border border-gray-200 hover:border-primary-200 transition-all duration-300"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative transform hover:scale-[1.02] ${
                  active
                    ? 'bg-white text-primary-600 shadow-lg border-2 border-primary-500 scale-[1.02]'
                    : 'text-gray-700 hover:bg-white hover:text-primary-600 hover:shadow-md hover:border hover:border-primary-200'
                }`}
              >
                <div className={`relative ${active ? 'text-primary-600' : 'text-gray-500 group-hover:text-primary-600'} transition-colors`}>
                  <Icon size={20} />
                </div>
                {sidebarOpen && (
                  <span className={`font-medium flex-1 ${active ? 'text-primary-600' : 'text-gray-700 group-hover:text-primary-600'} transition-colors`}>
                    {item.label}
                  </span>
                )}
                {active && sidebarOpen && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-600 rounded-r-full shadow-lg"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info - Only show when sidebar is open */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200/50 bg-white">
            <div className="glass-card rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white border-2 border-primary-500 flex items-center justify-center shadow-lg">
                  <span className="text-primary-600 font-bold text-base">
                    {user?.name?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.name || user?.fullName || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                  {role && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-white border border-primary-300 text-primary-700 rounded text-xs font-semibold">
                      {role === 'SUPER_ADMIN' ? 'مدير عام' : role === 'admin' ? 'أدمن' : role === 'doctor' ? 'طبيب' : role}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="glass-header px-6 py-4 relative z-50 overflow-visible">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {menuItems.find(item => item.path === location.pathname)?.label || 'لوحة التحكم'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-4 relative z-50 overflow-visible">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="بحث..."
                  className="input pl-10 pr-10 py-2 w-64"
                />
              </div>

              {/* Notifications */}
              <div className="relative z-[100] overflow-visible" ref={notificationsRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 border border-gray-200 hover:border-primary-300 rounded-xl transition-all duration-300 z-[100]"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <div className="absolute left-0 mt-2 w-96 glass-strong rounded-2xl shadow-2xl z-[100] border border-gray-200">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">الإشعارات</h3>
                      {notificationsList.length > 0 && (
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={() => {
                                markAllAsReadMutation.mutate();
                                setNotificationsOpen(false);
                              }}
                              className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
                              title="تحديد الكل كمقروء"
                            >
                              <CheckCheck size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              handleClearAll();
                              setNotificationsOpen(false);
                            }}
                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="مسح الكل"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notificationsList.length > 0 ? (
                        notificationsList.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-300 ${
                              !notification.isRead ? 'bg-blue-50/50' : ''
                            }`}
                            onClick={() => {
                              if (!notification.isRead) {
                                notifications.markAsRead(notification.id).then(() => {
                                  refetchNotifications();
                                });
                              }
                              setNotificationsOpen(false);
                              navigate('/notifications');
                            }}
                          >
                            <div className="flex items-start gap-3">
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                                  {notification.message || notification.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(notification.createdAt).toLocaleDateString('ar-EG', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="mx-auto mb-2 text-gray-400" size={32} />
                          <p>لا توجد إشعارات</p>
                        </div>
                      )}
                    </div>
                    {notificationsList.length > 0 && (
                      <div className="p-3 border-t border-gray-200 text-center">
                        <Link
                          to="/notifications"
                          onClick={() => setNotificationsOpen(false)}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                        >
                          عرض الكل
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative z-[100] overflow-visible" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl glass-btn text-gray-700 hover:bg-gray-50 transition-all duration-300 z-[100]"
                >
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-primary-500 flex items-center justify-center shadow-md">
                    <span className="text-primary-600 font-semibold text-sm">
                      {user?.name?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-semibold text-gray-900">{user?.name || user?.fullName || 'User'}</p>
                    <p className="text-xs text-gray-500">{role === 'admin' ? 'أدمن' : role === 'doctor' ? 'طبيب' : role}</p>
                  </div>
                  <ChevronDown 
                    className={`text-gray-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} 
                    size={18} 
                  />
                </button>
                {userDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 glass-strong rounded-2xl shadow-2xl z-[100] border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{user?.name || user?.fullName || 'User'}</p>
                      <p className="text-xs text-gray-500 mt-1">{user?.email || ''}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        to={role === 'doctor' ? '/doctor/profile' : '/settings'}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 text-gray-700 transition-all duration-300"
                      >
                        <User size={18} />
                        <span className="text-sm">الملف الشخصي</span>
                      </Link>
                      {(role === 'admin' || role?.includes('ADMIN')) && (
                        <Link
                          to="/settings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 text-gray-700 transition-all duration-300"
                        >
                          <Settings size={18} />
                          <span className="text-sm">الإعدادات</span>
                        </Link>
                      )}
                      <div className="border-t border-gray-200 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 transition-all duration-300"
                      >
                        <LogOut size={18} />
                        <span className="text-sm font-medium">تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 relative z-0">
          <div className="relative">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

