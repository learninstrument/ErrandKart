import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Splash } from './pages/auth/Splash';
import { Onboarding } from './pages/Onboarding';
import { LoginScreen } from './pages/auth/LoginScreen';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { PostErrand } from './pages/customer/PostErrand';
import { TrackErrand } from './pages/customer/TrackErrand';
import { CustomerProfile } from './pages/customer/CustomerProfile';
import { CustomerWallet } from './pages/customer/CustomerWallet';
import { CustomerOrders } from './pages/customer/CustomerOrders';
import { CustomerSettings } from './pages/customer/CustomerSettings';
import { CustomerNotifications } from './pages/customer/CustomerNotifications';
import { CustomerChat } from './pages/customer/CustomerChat';
import { CustomerSupport } from './pages/customer/CustomerSupport';
import { CustomerOrderDetails } from './pages/customer/CustomerOrderDetails';
import { CustomerCheckout } from './pages/customer/CustomerCheckout';
import { CustomerConfirmation } from './pages/customer/CustomerConfirmation';
import { RunnerDashboard } from './pages/runner/RunnerDashboard';
import { RunnerProfile } from './pages/runner/RunnerProfile';
import { RunnerWallet } from './pages/runner/RunnerWallet';
import { RunnerActive } from './pages/runner/RunnerActive';
import { RunnerErrandDetails } from './pages/runner/RunnerErrandDetails';
import { RunnerSettings } from './pages/runner/RunnerSettings';
import { RunnerNotifications } from './pages/runner/RunnerNotifications';
import { RunnerChat } from './pages/runner/RunnerChat';
import { RunnerSupport } from './pages/runner/RunnerSupport';
import { RunnerDeliveryReview } from './pages/runner/RunnerDeliveryReview';
import { RunnerEarnings } from './pages/runner/RunnerEarnings';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminActivity } from './pages/admin/AdminActivity';
import { AdminAdmins } from './pages/admin/AdminAdmins';

function App() {
  return (
    <BrowserRouter>
      <PathNormalizer />
      <div className="min-h-screen text-white">
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route
            path="/onboarding"
            element={
              <>
                <div className="block md:hidden">
                  <Onboarding />
                </div>
                <div className="hidden md:block">
                  <LoginScreen />
                </div>
              </>
            }
          />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/post-errand" element={<PostErrand />} />
          <Route path="/customer/track" element={<TrackErrand />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />
          <Route path="/customer/wallet" element={<CustomerWallet />} />
          <Route path="/customer/orders" element={<CustomerOrders />} />
          <Route path="/customer/orders/:orderId" element={<CustomerOrderDetails />} />
          <Route path="/customer/checkout" element={<CustomerCheckout />} />
          <Route path="/customer/confirmation" element={<CustomerConfirmation />} />
          <Route path="/customer/settings" element={<CustomerSettings />} />
          <Route path="/customer/notifications" element={<CustomerNotifications />} />
          <Route path="/customer/chat/:orderId" element={<CustomerChat />} />
          <Route path="/customer/support" element={<CustomerSupport />} />
          <Route path="/runner/dashboard" element={<RunnerDashboard />} />
          <Route path="/runner/profile" element={<RunnerProfile />} />
          <Route path="/runner/wallet" element={<RunnerWallet />} />
          <Route path="/runner/active" element={<RunnerActive />} />
          <Route path="/runner/errand/:id" element={<RunnerErrandDetails />} />
          <Route path="/runner/settings" element={<RunnerSettings />} />
          <Route path="/runner/notifications" element={<RunnerNotifications />} />
          <Route path="/runner/chat/:orderId" element={<RunnerChat />} />
          <Route path="/runner/support" element={<RunnerSupport />} />
          <Route path="/runner/delivery-review/:orderId" element={<RunnerDeliveryReview />} />
          <Route path="/runner/earnings" element={<RunnerEarnings />} />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/activity" element={<AdminActivity />} />
          <Route path="/admin/admins" element={<AdminAdmins />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

const PathNormalizer = () => {
  const location = useLocation();
  const normalizedPath = location.pathname.replace(/\/{2,}/g, '/');

  if (normalizedPath !== location.pathname) {
    return <Navigate to={`${normalizedPath}${location.search}${location.hash}`} replace />;
  }

  return null;
};
