import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Users from './pages/users/Users';
import Doctors from './pages/doctors/Doctors';
import Bookings from './pages/bookings/Bookings';
import BookingDetails from './pages/bookings/BookingDetails';
import Payments from './pages/payments/Payments';
import Support from './pages/support/Support';
import SupportDetails from './pages/support/SupportDetails';
import Reports from './pages/reports/Reports';
import ReportDetails from './pages/reports/ReportDetails';
import Settings from './pages/settings/Settings';
import Coupons from './pages/coupons/Coupons';
import CouponDetails from './pages/coupons/CouponDetails';
import ActivityLogs from './pages/activity-logs/ActivityLogs';
import ActivityLogDetails from './pages/activity-logs/ActivityLogDetails';
import Children from './pages/children/Children';
import ChildrenDetails from './pages/children/ChildrenDetails';
import TestDetails from './pages/children/TestDetails';
import Packages from './pages/packages/Packages';
import PackagesDetails from './pages/packages/PackagesDetails';
import Products from './pages/products/Products';
import ProductsDetails from './pages/products/ProductsDetails';
import Orders from './pages/orders/Orders';
import OrdersDetails from './pages/orders/OrdersDetails';
import Withdrawals from './pages/withdrawals/Withdrawals';
import WithdrawalDetails from './pages/withdrawals/WithdrawalDetails';
import Admins from './pages/admins/Admins';
import AdminDetails from './pages/admins/AdminDetails';
import DoctorDetails from './pages/doctors/DoctorDetails';
import Onboarding from './pages/onboarding/Onboarding';
import OnboardingDetails from './pages/onboarding/OnboardingDetails';
import Notifications from './pages/notifications/Notifications';
import NotificationDetails from './pages/notifications/NotificationDetails';
import DoctorChildren from './pages/doctors/DoctorChildren';
import DoctorChildDetails from './pages/doctors/DoctorChildDetails';
import DoctorArticles from './pages/doctors/DoctorArticles';
import DoctorAssessment from './pages/doctors/DoctorAssessment';
import Availability from './pages/doctors/Availability';
import DoctorProfile from './pages/doctors/DoctorProfile';
import DoctorMessages from './pages/doctors/DoctorMessages';
import DoctorConversation from './pages/doctors/DoctorConversation';
import HomeSliders from './pages/home-sliders/HomeSliders';
import HomeServices from './pages/home-services/HomeServices';
import HomeArticles from './pages/home-articles/HomeArticles';
import FAQs from './pages/faqs/FAQs';
import UserDetails from './pages/users/UserDetails';
import Scales from './pages/scales/Scales';
import PageView from './pages/public/PageView';
import SessionPage from './pages/sessions/SessionPage';
import Assessments from './pages/assessments/Assessments';
import AssessmentCategories from './pages/assessments/AssessmentCategories';
import TestQuestions from './pages/assessments/TestQuestions';
import TestsList from './pages/tests/TestsList';
import TestDetail from './pages/tests/TestDetail';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/pages/:pageType" element={<PageView />} />

      {/* Session Route (No Layout - Full Screen) */}
      <Route
        path="/sessions/:bookingId"
        element={
          <ProtectedRoute>
            <SessionPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes with Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<UserDetails />} />
        <Route path="/children" element={<Children />} />
        <Route path="/children/:id" element={<ChildrenDetails />} />
        <Route path="/tests/:id" element={<TestDetails />} />
        <Route path="/scales" element={<Scales />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:id" element={<DoctorDetails />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/bookings/:id" element={<BookingDetails />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/packages/:id" element={<PackagesDetails />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductsDetails />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrdersDetails />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/withdrawals" element={<Withdrawals />} />
        <Route path="/withdrawals/:id" element={<WithdrawalDetails />} />
        <Route path="/admins" element={<Admins />} />
        <Route path="/admins/:id" element={<AdminDetails />} />
        <Route path="/support" element={<Support />} />
        <Route path="/support/:id" element={<SupportDetails />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:id" element={<ReportDetails />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/coupons" element={<Coupons />} />
        <Route path="/coupons/:id" element={<CouponDetails />} />
        <Route path="/activity-logs" element={<ActivityLogs />} />
        <Route path="/activity-logs/:id" element={<ActivityLogDetails />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/onboarding/:id" element={<OnboardingDetails />} />
        <Route path="/home-sliders" element={<HomeSliders />} />
        <Route path="/home-services" element={<HomeServices />} />
        <Route path="/home-articles" element={<HomeArticles />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/assessments" element={<Assessments />} />
        <Route path="/assessments/categories" element={<AssessmentCategories />} />
        <Route path="/assessments/:id/questions" element={<TestQuestions />} />
        <Route path="/dashboard/tests" element={<TestsList />} />
        <Route path="/dashboard/tests/:testId" element={<TestDetail />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/notifications/:id" element={<NotificationDetails />} />

        {/* Doctor Specific Routes */}
        <Route path="/doctor/children" element={<DoctorChildren />} />
        <Route path="/doctor/children/:id" element={<DoctorChildDetails />} />
        <Route path="/doctor/assessment/:testId/:childId" element={<DoctorAssessment />} />
        <Route path="/doctor/messages" element={<DoctorMessages />} />
        <Route path="/doctor/messages/:userId" element={<DoctorConversation />} />
        <Route path="/articles" element={<DoctorArticles />} />
        <Route path="/availability" element={<Availability />} />
        <Route path="/doctor/profile" element={<DoctorProfile />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

