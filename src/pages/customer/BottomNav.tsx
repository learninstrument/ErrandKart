import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, FileText, Wallet, User } from 'lucide-react';

export const BottomNav = ({ activeTab }: { activeTab: 'home' | 'orders' | 'wallet' | 'profile' }) => {
  const navigate = useNavigate();
  return (
    <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 flex justify-around items-center py-4 px-6 z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <button onClick={() => navigate('/customer/dashboard')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-[#FF6600]' : 'text-gray-400 hover:text-gray-600'}`}>
        <Home size={24} className={activeTab === 'home' ? 'fill-current' : ''} />
        <span className="text-[10px] font-bold">Home</span>
      </button>
      
      {/* Connected to Track Errand */}
      <button onClick={() => navigate('/customer/track')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'orders' ? 'text-[#FF6600]' : 'text-gray-400 hover:text-gray-600'}`}>
        <FileText size={24} className={activeTab === 'orders' ? 'fill-current' : ''} />
        <span className="text-[10px] font-bold">Activity</span>
      </button>
      
      <button onClick={() => {}} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'wallet' ? 'text-[#FF6600]' : 'text-gray-400 hover:text-gray-600'}`}>
        <Wallet size={24} className={activeTab === 'wallet' ? 'fill-current' : ''} />
        <span className="text-[10px] font-bold">Wallet</span>
      </button>
      <button onClick={() => {}} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-[#FF6600]' : 'text-gray-400 hover:text-gray-600'}`}>
        <User size={24} className={activeTab === 'profile' ? 'fill-current' : ''} />
        <span className="text-[10px] font-bold">Profile</span>
      </button>
    </div>
  );
};
