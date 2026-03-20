import React from 'react';
import { Search, MapPin, Clock, SlidersHorizontal, ShoppingBasket, Pill, Shirt } from 'lucide-react';
import { RunnerBottomNav } from './RunnerBottomNav';

export const RunnerDashboard: React.FC = () => {
  // Mock data matching the PDF feed style
  const availableErrands = [
    { id: 1, title: 'Grocery Pickup at Whole Foods', price: '₦4,500', location: 'Lekki Phase 1', time: '20 mins ago', distance: '1.2 km away', icon: <ShoppingBasket size={24} /> },
    { id: 2, title: 'Pharmacy Run for Medication', price: '₦2,000', location: 'Victoria Island', time: '1 hour ago', distance: '3.5 km away', icon: <Pill size={24} /> },
    { id: 3, title: 'Dry Cleaning Pickup', price: '₦1,500', location: 'Ikoyi', time: '2 hours ago', distance: '4.0 km away', icon: <Shirt size={24} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] w-full">
      {/* --- DESKTOP TOP NAVIGATION (From PDF) --- */}
      <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2E8B57] rounded-lg flex items-center justify-center text-white font-black italic">K</div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Errand<span className="text-[#2E8B57]">Kart</span></h1>
          </div>
          <nav className="flex gap-8">
            <button className="text-[#2E8B57] font-bold border-b-2 border-[#2E8B57] pb-1">Dashboard</button>
            <button className="text-gray-500 hover:text-gray-900 font-medium pb-1 transition-colors">Activity</button>
            <button className="text-gray-500 hover:text-gray-900 font-medium pb-1 transition-colors">Wallet</button>
          </nav>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E8B57] animate-pulse"></span>
            <span className="text-sm font-bold text-gray-700">Online</span>
          </div>
          <div className="w-px h-6 bg-gray-200"></div>
          <div className="w-10 h-10 rounded-full bg-green-50 text-[#2E8B57] flex items-center justify-center font-bold border border-green-100 cursor-pointer hover:bg-green-100 transition-colors">
            MB
          </div>
        </div>
      </header>

      {/* --- MOBILE HEADER --- */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#2E8B57] rounded-lg flex items-center justify-center text-white font-black italic text-xs">K</div>
          <h1 className="text-lg font-black text-gray-900 tracking-tight">Errand<span className="text-[#2E8B57]">Kart</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#2E8B57] animate-pulse"></span>
          <div className="w-9 h-9 rounded-full bg-green-50 text-[#2E8B57] flex items-center justify-center font-bold text-sm border border-green-100">
            MB
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-10 pb-24 md:pb-10">
        
        {/* Welcome & Search Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Available Errands</h2>
            <p className="text-gray-500 font-medium"><span className="text-[#2E8B57] font-bold">{availableErrands.length} opportunities</span> near you right now.</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search gigs near you..." 
                className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#2E8B57] focus:border-transparent focus:outline-none transition-all shadow-sm"
              />
            </div>
            <button className="bg-white border border-gray-200 p-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm flex-shrink-0">
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* --- FEED SECTION (Modern List View) --- */}
        <div className="flex flex-col gap-3">
          {availableErrands.map(errand => (
            <div 
              key={errand.id} 
              className="group flex items-center justify-between p-4 md:p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              {/* Left: Icon & Details */}
              <div className="flex items-center gap-4 md:gap-5 w-full md:w-auto">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-green-50 text-[#2E8B57] group-hover:bg-[#2E8B57] group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                  {errand.icon}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base md:text-lg mb-1">{errand.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-500">
                    <span className="flex items-center gap-1"><MapPin size={14} className="text-gray-400" /> {errand.location}</span>
                    <span className="hidden md:inline text-gray-300">•</span>
                    <span className="font-semibold text-[#2E8B57]">{errand.distance}</span>
                  </div>
                </div>
              </div>

              {/* Right: Price & Time */}
              <div className="hidden md:flex flex-col items-end justify-center min-w-[100px]">
                <span className="font-bold text-gray-900 text-lg">{errand.price}</span>
                <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium mt-1 uppercase tracking-wider">
                  <Clock size={12} /> {errand.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden">
        <RunnerBottomNav activeTab="available" />
      </div>
    </div>
  );
};
