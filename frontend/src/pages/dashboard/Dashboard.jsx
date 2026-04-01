import { useQuery } from '@tanstack/react-query';
import { dashboard } from '../../api/admin';
import { doctorDashboard } from '../../api/doctor';
import { useAuthStore } from '../../store/authStore';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  DollarSign,
  FileText,
  Headphones,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Zap,
  Layers,
  Ticket,
  Baby
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { role } = useAuthStore();
  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dashboard-stats', role],
    queryFn: async () => {
      if (role === 'doctor') {
        const response = await doctorDashboard.getStats();
        return response.data.data;
      }
      const response = await dashboard.getStats();
      return response.data.data;
    },
    enabled: !!role,
  });

  const adminStatCards = [
    {
      title: 'إجمالي المستخدمين',
      value: stats?.totalUsers || 0,
      icon: Users,
      iconBg: 'bg-gray-100',
      iconColor: 'text-primary-600',
      subtitle: 'مستخدم مسجل',
    },
    {
      title: 'إجمالي الأطباء',
      value: stats?.totalDoctors || 0,
      icon: Stethoscope,
      iconBg: 'bg-gray-100',
      iconColor: 'text-primary-600',
      subtitle: 'طبيب مسجل',
    },
    {
      title: 'الحجوزات اليوم',
      value: stats?.todayBookings || 0,
      icon: Calendar,
      iconBg: 'bg-gray-100',
      iconColor: 'text-primary-600',
      subtitle: 'حسب تاريخ الإنشاء',
    },
    {
      title: 'الإيرادات اليوم',
      value: `${stats?.todayRevenue || 0} ج.م`,
      icon: DollarSign,
      iconBg: 'bg-gray-100',
      iconColor: 'text-primary-600',
      subtitle: 'مدفوعات مكتملة',
    },
    {
      title: 'ملفات الأطفال',
      value: stats?.totalChildren || 0,
      icon: Baby,
      iconBg: 'bg-gray-100',
      iconColor: 'text-primary-600',
      subtitle: 'ملف مسجل',
    },
    {
      title: 'الباقات النشطة',
      value: stats?.activePackages || 0,
      icon: Layers,
      iconBg: 'bg-gray-100',
      iconColor: 'text-primary-600',
      subtitle: 'اشتراك فعّال',
    },
  ];

  const doctorStatCards = [
    {
      title: 'إجمالي الحجوزات',
      value: stats?.stats?.bookings?.total || 0,
      icon: Calendar,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      subtitle: 'موعد مسجل',
    },
    {
      title: 'الجلسات المكتملة',
      value: stats?.stats?.bookings?.completed || 0,
      icon: CheckCircle,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      subtitle: 'جلسة تم تنفيذها',
    },
    {
      title: 'إجمالي الأرباح',
      value: `${stats?.stats?.earnings?.total || 0} ج.م`,
      icon: DollarSign,
      iconBg: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      subtitle: 'أرباح محققة',
    },
    {
      title: 'المقالات المنشورة',
      value: stats?.stats?.content?.articles || 0,
      icon: FileText,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      subtitle: 'مقال توعوي',
    },
  ];

  const statCards = role === 'doctor' ? doctorStatCards : adminStatCards;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[16rem] gap-4 glass-card rounded-2xl p-8">
        <AlertCircle className="text-red-500" size={40} />
        <p className="text-gray-700 text-center max-w-md">
          {error?.response?.data?.error?.message || error?.message || 'تعذر تحميل بيانات لوحة التحكم'}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

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

  const isAdmin = role === 'admin';
  const adminRevenueChart = stats?.revenueByMonth ?? [];
  const weeklyUserGrowth = stats?.weeklyUserGrowth ?? [];
  const doctorMonthly = stats?.monthlyEarnings ?? [];
  const doctorBookingBar =
    stats?.stats?.bookings != null
      ? [
          { name: 'إجمالي', count: stats.stats.bookings.total },
          { name: 'معلقة', count: stats.stats.bookings.pending },
          { name: 'مكتملة', count: stats.stats.bookings.completed },
          { name: 'ملغاة', count: stats.stats.bookings.cancelled },
        ]
      : [];
  const statusData = (stats?.userStatusBreakdown ?? []).filter((x) => x.value > 0);
  const COLORS = statusData.map((s) => s.color || '#875FD8');
  const totalDoctorBookings = stats?.stats?.bookings?.total || 0;
  const completedDoctorBookings = stats?.stats?.bookings?.completed || 0;
  const doctorCompletionRate =
    totalDoctorBookings > 0
      ? Math.round((completedDoctorBookings / totalDoctorBookings) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="glass-card rounded-2xl p-6 bg-white border border-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">مرحباً بك في لوحة التحكم</h1>
            <p className="text-gray-600">نظرة عامة على أداء النظام والإحصائيات</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-primary-200">
            <Clock className="text-primary-600" size={18} />
            <span className="text-sm font-medium text-gray-700">
              {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards - Modern Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group border border-gray-200 hover:border-primary-400"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.iconBg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 border border-primary-200`}>
                  <Icon className={stat.iconColor} size={24} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats Row */}
      {isAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-primary-200">
              <CheckCircle className="text-primary-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">الحجوزات المكتملة</p>
              <p className="text-lg font-bold text-gray-900">{stats?.completedBookings ?? 0}</p>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-primary-200">
              <Clock className="text-primary-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">الحجوزات المعلقة</p>
              <p className="text-lg font-bold text-gray-900">{stats?.pendingBookings ?? 0}</p>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-primary-200">
              <XCircle className="text-primary-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">الحجوزات الملغاة</p>
              <p className="text-lg font-bold text-gray-900">{stats?.cancelledBookings ?? 0}</p>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-primary-200">
              <Target className="text-primary-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">معدل إتمام الحجوزات</p>
              <p className="text-lg font-bold text-gray-900">{stats?.completionRate ?? 0}%</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-primary-200">
              <CheckCircle className="text-primary-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">الجلسات المكتملة</p>
              <p className="text-lg font-bold text-gray-900">{stats?.stats?.bookings?.completed ?? 0}</p>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-primary-200">
              <Clock className="text-primary-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">المعلقة</p>
              <p className="text-lg font-bold text-gray-900">{stats?.stats?.bookings?.pending ?? 0}</p>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-primary-200">
              <XCircle className="text-primary-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">الملغاة</p>
              <p className="text-lg font-bold text-gray-900">{stats?.stats?.bookings?.cancelled ?? 0}</p>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-primary-200">
              <Target className="text-primary-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">معدل الإتمام</p>
              <p className="text-lg font-bold text-gray-900">{doctorCompletionRate}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      {isAdmin ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">الإيرادات والحجوزات</h3>
                <p className="text-sm text-gray-500 mt-1">آخر 6 أشهر (من السيرفر)</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg border border-primary-200">
                <BarChart3 className="text-primary-600" size={20} />
              </div>
            </div>
            {adminRevenueChart.length === 0 ? (
              <p className="text-center text-gray-500 py-16 text-sm">لا توجد بيانات في هذه الفترة</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={adminRevenueChart}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#875FD8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#875FD8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#14b8a6"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="الإيرادات (ج.م)"
                  />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    stroke="#22c55e"
                    fillOpacity={1}
                    fill="url(#colorBookings)"
                    name="الحجوزات (عدد)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="glass-card rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">نمو المستخدمين والأطباء</h3>
                <p className="text-sm text-gray-500 mt-1">آخر 4 أسابيع (تسجيلات جديدة)</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg border border-primary-200">
                <TrendingUp className="text-primary-600" size={20} />
              </div>
            </div>
            {weeklyUserGrowth.length === 0 ? (
              <p className="text-center text-gray-500 py-16 text-sm">لا توجد بيانات في هذه الفترة</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyUserGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#875FD8"
                    strokeWidth={3}
                    dot={{ fill: '#875FD8', r: 4 }}
                    name="المستخدمين"
                  />
                  <Line
                    type="monotone"
                    dataKey="doctors"
                    stroke="#A384E1"
                    strokeWidth={3}
                    dot={{ fill: '#A384E1', r: 4 }}
                    name="الأطباء"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">أرباحك الشهرية</h3>
                <p className="text-sm text-gray-500 mt-1">آخر 6 أشهر</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg border border-primary-200">
                <DollarSign className="text-primary-600" size={20} />
              </div>
            </div>
            {doctorMonthly.length === 0 ? (
              <p className="text-center text-gray-500 py-16 text-sm">لا توجد أرباح مسجلة في هذه الفترة</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={doctorMonthly}>
                  <defs>
                    <linearGradient id="docRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#875FD8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#875FD8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#875FD8"
                    fillOpacity={1}
                    fill="url(#docRev)"
                    name="الإيرادات (ج.م)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="glass-card rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">ملخص الحجوزات</h3>
                <p className="text-sm text-gray-500 mt-1">حسب الحالة</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg border border-primary-200">
                <Calendar className="text-primary-600" size={20} />
              </div>
            </div>
            {doctorBookingBar.length === 0 ? (
              <p className="text-center text-gray-500 py-16 text-sm">لا توجد بيانات</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={doctorBookingBar}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="#875FD8" name="العدد" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution or Doctor Upcoming Bookings */}
        {role === 'doctor' ? (
          <div className="glass-card rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">المواعيد القادمة</h3>
                <p className="text-sm text-gray-500 mt-1">أقرب 5 جلسات</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                <Calendar className="text-blue-600" size={20} />
              </div>
            </div>
            <div className="space-y-3">
              {stats?.upcomingBookings?.length > 0 ? (
                stats.upcomingBookings.map((booking) => (
                  <div key={booking.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-sm font-bold text-gray-900">{booking.user?.fullName || booking.user?.username}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">{new Date(booking.scheduledAt).toLocaleString('ar-EG')}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{booking.sessionType}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-gray-500 text-sm">لا يوجد مواعيد قادمة</p>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">توزيع الحالات</h3>
                <p className="text-sm text-gray-500 mt-1">حالة المستخدمين</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg border border-primary-200">
                <PieChartIcon className="text-primary-600" size={20} />
              </div>
            </div>
            {statusData.length === 0 ? (
              <p className="text-center text-gray-500 py-16 text-sm">لا توجد بيانات مستخدمين للعرض</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Recent Activity or Doctor Recent Bookings */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {role === 'doctor' ? 'آخر الحجوزات' : 'النشاط الأخير'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {role === 'doctor' ? 'آخر 10 حجوزات تمت معك' : 'آخر 10 أنشطة'}
              </p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg border border-primary-200">
              <Zap className="text-primary-600" size={20} />
            </div>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {role === 'doctor' ? (
              stats?.recentBookings?.length > 0 ? (
                stats.recentBookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 border border-primary-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Calendar className="text-primary-600" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        حجز من {booking.user?.fullName || booking.user?.username}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(booking.createdAt).toLocaleString('ar-EG')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Calendar className="text-gray-300 mx-auto mb-2" size={48} />
                  <p className="text-gray-500">لا يوجد حجوزات حديثة</p>
                </div>
              )
            ) : (
              stats?.recentActivity?.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 border border-primary-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Activity className="text-primary-600" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {activity.adminName || 'System'} - {activity.action} {activity.entityType}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(activity.time).toLocaleString('ar-EG')}
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 animate-pulse"></div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Activity className="text-gray-400" size={32} />
                  </div>
                  <p className="text-gray-500 font-medium">لا يوجد نشاط حديث</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

