import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Splash } from './pages/auth/Splash';
import { Onboarding } from './pages/Onboarding';
import { LoginScreen } from './pages/auth/LoginScreen';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { PostErrand } from './pages/customer/PostErrand';
import { TrackErrand } from './pages/customer/TrackErrand';
import { RunnerDashboard } from './pages/runner/RunnerDashboard';

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
          <Route path="/runner/dashboard" element={<RunnerDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;