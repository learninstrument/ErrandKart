import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MessageSquare, CheckCircle, Circle, Navigation } from 'lucide-react';

// FIXED: Using uppercase 'UI'
import { Button } from '../../components/UI/Button';

export const TrackErrand: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    { title: 'Errand Posted', subtitle: 'Request sent to the system', completed: true },
    { title: 'Runner Assigned', subtitle: 'Michael B. accepted your errand', completed: true },
    { title: 'On the way', subtitle: 'Runner is heading to pickup', completed: true, active: true },
    { title: 'Completed', subtitle: 'Awaiting drop-off', completed: false }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] w-full">
      <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/customer/dashboard')}>
            <div className="w-8 h-8 bg-[#FF6600] rounded-lg flex items-center justify-center text-white font-black italic">K</div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Errand<span className="text-[#FF6600]">Kart</span></h1>
          </div>
          <nav className="flex gap-8">
            <button className="text-gray-500 hover:text-gray-900 font-medium pb-1 transition-colors" onClick={() => navigate('/customer/dashboard')}>Dashboard</button>
            <button className="text-[#FF6600] font-bold border-b-2 border-[#FF6600] pb-1">Activity</button>
            <button className="text-gray-500 hover:text-gray-900 font-medium pb-1 transition-colors">Wallet</button>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-full bg-orange-50 text-[#FF6600] flex items-center justify-center font-bold border border-orange-100 cursor-pointer">
            SD
          </div>
        </div>
      </header>

      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-[#FF6600] transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-gray-900">Errand Status</h2>
        <div className="w-8"></div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto md:p-8 flex flex-col md:flex-row gap-0 md:gap-8 relative">
        <div className="w-full md:w-2/3 flex flex-col">
          <div className="bg-white p-6 md:p-8 md:rounded-t-3xl border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
            <div>
              <h3 className="font-black text-gray-900 text-xl md:text-2xl mb-1">Grocery Pickup</h3>
              <p className="text-gray-500 text-sm font-medium">Order #EK-4920</p>
            </div>
            <span className="bg-orange-50 text-[#FF6600] text-xs md:text-sm font-bold px-4 py-2 rounded-full tracking-wide border border-orange-100 uppercase">
              In Progress
            </span>
          </div>

          <div className="h-[40vh] md:h-[60vh] bg-gray-200 relative w-full overflow-hidden md:rounded-b-3xl">
             <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
             <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-gray-800 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
             </div>
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#FF6600] rounded-full border-4 border-white shadow-xl flex items-center justify-center animate-bounce z-10">
                <Navigation size={20} className="text-white fill-current transform rotate-45" />
             </div>
             <svg className="absolute inset-0 w-full h-full pointer-events-none">
               <path d="M 25% 25% Q 50% 25% 50% 50%" stroke="#FF6600" strokeWidth="4" fill="none" strokeDasharray="10,5" className="animate-pulse" />
             </svg>
          </div>
        </div>

        <div className="w-full md:w-1/3 flex flex-col bg-white md:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-sm z-20 -mt-6 md:mt-0 border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8 flex-1">
            <h4 className="font-bold text-gray-900 mb-6 text-lg">Activity History</h4>
            <div className="space-y-8 pl-2 relative">
              <div className="absolute left-[15px] top-2 bottom-6 w-0.5 bg-gray-100"></div>
              {steps.map((step, index) => (
                <div key={index} className="flex gap-6 relative z-10">
                  <div className="flex-shrink-0 bg-white">
                    {step.completed ? (
                      <CheckCircle size={24} className="text-[#FF6600] fill-orange-50" />
                    ) : (
                      <Circle size={24} className="text-gray-200" />
                    )}
                  </div>
                  <div className="-mt-1">
                    <h5 className={`font-bold ${step.active ? 'text-[#FF6600]' : step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.title}
                    </h5>
                    <p className={`text-xs mt-1 ${step.active ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>{step.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 pb-10 md:pb-8">
            <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-4">
                  <img src="[https://api.dicebear.com/7.x/avataaars/svg?seed=Michael](https://api.dicebear.com/7.x/avataaars/svg?seed=Michael)" alt="Runner" className="w-14 h-14 bg-white rounded-2xl border-2 border-gray-200 shadow-sm" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Your Runner</p>
                    <h4 className="font-black text-gray-900 text-lg leading-tight">Michael B.</h4>
                    <div className="flex items-center text-xs text-gray-500 mt-1 font-medium">
                      ⭐ 4.9 (120 trips)
                    </div>
                  </div>
               </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" fullWidth className="gap-2 py-3 shadow-sm bg-white hover:bg-gray-50">
                <Phone size={18} className="text-gray-700" /> Call
              </Button>
              <Button theme="green" fullWidth className="gap-2 py-3 shadow-md shadow-green-200">
                <MessageSquare size={18} /> Chat
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
