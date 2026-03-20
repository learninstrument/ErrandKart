import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, Plus, ShoppingBasket, Pill } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { Button } from '../../components/UI/Button';

export const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Mock data matching the PDF feed style
  const userErrands = [
    { id: 1, title: 'Grocery Pickup at Whole Foods', price: '₦4,500', location: 'Lekki Phase 1', time: 'In Progress', status: 'active', icon: <ShoppingBasket size={24} /> },
    { id: 2, title: 'Pharmacy Run for Medication', price: '₦2,000', location: 'Victoria Island', time: 'Yesterday', status: 'completed', icon: <Pill size={24} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] w-full">
      {/* --- DESKTOP TOP NAVIGATION (From PDF) --- */}
      <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF6600] rounded-lg flex items-center justify-center text-white font-black italic">K</div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Errand<span className="text-[#FF6600]">Kart</span></h1>
          </div>
          <nav className="flex gap-8">
            <button className="text-[#FF6600] font-bold border-b-2 border-[#FF6600] pb-1">Dashboard</button>
            
            {/* Connected to Track Errand */}
            <button onClick={() => navigate('/customer/track')} className="text-gray-500 hover:text-gray-900 font-medium pb-1 transition-colors">Activity</button>
            
            <button className="text-gray-500 hover:text-gray-900 font-medium pb-1 transition-colors">Wallet</button>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <Button onClick={() => navigate('/customer/post-errand')} className="gap-2 px-6 py-2.5 shadow-md shadow-orange-200">
            <Plus size={18} /> Post New Errand
          </Button>
          <div className="w-10 h-10 rounded-full bg-orange-50 text-[#FF6600] flex items-center justify-center font-bold border border-orange-100 cursor-pointer hover:bg-orange-100 transition-colors">
            SD
          </div>
        </div>
      </header>

      {/* --- MOBILE HEADER --- */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#FF6600] rounded-lg flex items-center justify-center text-white font-black italic text-xs">K</div>
          <h1 className="text-lg font-black text-gray-900 tracking-tight">Errand<span className="text-[#FF6600]">Kart</span></h1>
        </div>
        <div className="w-9 h-9 rounded-full bg-orange-50 text-[#FF6600] flex items-center justify-center font-bold text-sm border border-orange-100">
          SD
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-10 pb-24 md:pb-10">
        
        {/* Welcome & Search Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Welcome back, Sarah</h2>
            <p className="text-gray-500">Manage your errands and track deliveries.</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search your errands..." 
                className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#FF6600] focus:border-transparent focus:outline-none transition-all shadow-sm"
              />
            </div>
            <div className="md:hidden w-full">
               <Button fullWidth onClick={() => navigate('/customer/post-errand')} className="gap-2">
                 <Plus size={18} /> Post New Errand
               </Button>
            </div>
          </div>
        </div>

        {/* --- FEED SECTION (Modern List View) --- */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
             <h3 className="text-lg font-bold text-gray-900">Recent Errands</h3>
             <button onClick={() => navigate('/customer/track')} className="text-[#FF6600] text-sm font-bold hover:underline">View All</button>
          </div>

          <div className="flex flex-col gap-3">
            {userErrands.map(errand => (
              <div 
                key={errand.id} 
                onClick={() => navigate('/customer/track')}
                className="group flex items-center justify-between p-4 md:p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-4 md:gap-5 w-full md:w-auto">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${errand.status === 'active' ? 'bg-orange-50 text-[#FF6600] group-hover:bg-[#FF6600] group-hover:text-white' : 'bg-gray-50 text-gray-500 group-hover:bg-gray-100'}`}>
                    {errand.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base md:text-lg mb-1">{errand.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-500">
                      <span className="flex items-center gap-1"><MapPin size={14} className="text-gray-400" /> {errand.location}</span>
                      <span className="hidden md:inline text-gray-300">•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} className="text-gray-400" /> 
                        {errand.status === 'active' ? <span className="text-[#FF6600] font-medium">{errand.time}</span> : errand.time}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Price & Status */}
                <div className="hidden md:flex flex-col items-end justify-center min-w-[100px]">
                  <span className="font-bold text-gray-900 text-lg">{errand.price}</span>
                  {errand.status === 'active' && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#FF6600] bg-orange-50 px-2 py-1 rounded-md mt-1">
                      Active
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden">
        <BottomNav activeTab="home" />
      </div>
    </div>
  );
};
