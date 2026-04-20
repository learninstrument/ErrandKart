import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Splash } from './pages/auth/Splash';
import { Onboarding } from './pages/Onboarding';
import { LoginScreen } from './pages/auth/LoginScreen';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { PostErrand } from './pages/customer/PostErrand';
import { TrackErrand } from './pages/customer/TrackErrand';
import { CustomerProfile } from './pages/customer/CustomerProfile';
import { CustomerWallet } from './pages/customer/CustomerWallet';
import { CustomerOrders } from './pages/customer/CustomerOrders';
import { RunnerDashboard } from './pages/runner/RunnerDashboard';
import { RunnerProfile } from './pages/runner/RunnerProfile';
import { RunnerWallet } from './pages/runner/RunnerWallet';
import { RunnerActive } from './pages/runner/RunnerActive';
import { RunnerErrandDetails } from './pages/runner/RunnerErrandDetails';

function App() {
  return (
    <BrowserRouter>
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
          <Route path="/runner/dashboard" element={<RunnerDashboard />} />
          <Route path="/runner/profile" element={<RunnerProfile />} />
          <Route path="/runner/wallet" element={<RunnerWallet />} />
          <Route path="/runner/active" element={<RunnerActive />} />
          <Route path="/runner/errand/:id" element={<RunnerErrandDetails />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
