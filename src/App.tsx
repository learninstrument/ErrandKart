import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Auth Pages
import { Splash } from './pages/auth/Splash';
import { Onboarding } from './pages/Onboarding';
import { LoginScreen } from './pages/auth/LoginScreen';

// Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { PostErrand } from './pages/customer/PostErrand';
import { TrackErrand } from './pages/customer/TrackErrand'; // <--- Properly imported!

// Runner Pages
import { RunnerDashboard } from './pages/runner/RunnerDashboard';

function App() {
  return (
    <div className="flex justify-center min-h-screen bg-gray-200 font-sans text-[#333333]">
      <main className="w-full max-w-md md:max-w-none bg-white min-h-screen shadow-2xl relative overflow-x-hidden">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Splash />} />
            
            <Route path="/onboarding" element={
              <>
                <div className="block md:hidden"><Onboarding /></div>
                <div className="hidden md:block"><LoginScreen /></div>
              </>
            } />
            
            <Route path="/login" element={<LoginScreen />} />
            
            {/* Customer Routes */}
            <Route path="/customer/dashboard" element={<div className="md:bg-gray-200 min-h-screen flex justify-center"><CustomerDashboard /></div>} />
            <Route path="/customer/post-errand" element={<div className="md:bg-gray-200 min-h-screen flex justify-center"><PostErrand /></div>} />
            
            {/* THIS IS THE ROUTE FIXING YOUR ERROR */}
            <Route path="/customer/track" element={<div className="md:bg-gray-200 min-h-screen flex justify-center"><TrackErrand /></div>} /> 
            
            {/* Runner Routes */}
            <Route path="/runner/dashboard" element={<div className="md:bg-gray-200 min-h-screen flex justify-center"><RunnerDashboard /></div>} />
          </Routes>
        </BrowserRouter>
      </main>
    </div>
  );
}

export default App;
