import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { adminAuth } from '../../api/admin';
import { doctorAuth } from '../../api/doctor';
import toast from 'react-hot-toast';
import { LogIn, UserCircle, ShieldCheck } from 'lucide-react';

const Login = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    // If the user manually navigated to /login, but they are authenticated, 
    // we should only redirect if they didn't just logout or if they are not 
    // trying to switch roles.
    // For now, let's just allow them to stay on login page if they want.
  }, [isAuthenticated, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState('admin'); // 'admin' or 'doctor'

  useEffect(() => {
    // Clear state when switching roles to avoid confusion
    setEmail('');
    setPassword('');
  }, [loginRole]);
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clear previous session completely before login attempt
      logout();
      queryClient.clear();

      console.log(`Attempting login as ${loginRole} for ${email}`);

      let response;
      if (loginRole === 'doctor') {
        response = await doctorAuth.login({ email, password });
      } else {
        response = await adminAuth.login({ email, password });
      }
      
      if (response.data && response.data.success && response.data.data) {
        const { token } = response.data.data;
        const userObj = loginRole === 'doctor' ? response.data.data.doctor : response.data.data.admin;
        
        if (token && userObj) {
          // Clear any stale queries from previous sessions
          queryClient.clear();
          
          login(userObj, token, loginRole);
          
          toast.success('تم تسجيل الدخول بنجاح');
          navigate('/dashboard');
        } else {
          toast.error('خطأ في بيانات الاستجابة');
        }
      } else {
        toast.error('استجابة غير صحيحة من السيرفر');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          error.message || 
                          'فشل تسجيل الدخول';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="glass-strong rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">تواصل</h1>
          <p className="text-gray-600">لوحة التحكم</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
          <button
            onClick={() => setLoginRole('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
              loginRole === 'admin' 
                ? 'bg-white text-primary-600 shadow-sm font-bold' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShieldCheck size={18} />
            أدمن
          </button>
          <button
            onClick={() => setLoginRole('doctor')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
              loginRole === 'doctor' 
                ? 'bg-white text-primary-600 shadow-sm font-bold' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserCircle size={18} />
            طبيب
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="admin@tawasoul.com"
              required
            />
          </div>

          <div>
            <label className="label">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                جاري تسجيل الدخول...
              </>
            ) : (
              <>
                <LogIn size={20} />
                تسجيل الدخول
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

