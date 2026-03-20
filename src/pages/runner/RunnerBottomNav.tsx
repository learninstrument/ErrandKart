import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, CheckSquare, Wallet, User } from 'lucide-react';

export const RunnerBottomNav = ({ activeTab }: { activeTab: 'available' | 'active' | 'wallet' | 'profile' }) => {
  const navigate = useNavigate();
  return (
    <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 flex justify-around items-center py-4 px-6 z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <button onClick={() => navigate('/runner/dashboard')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'available' ? 'text-[#2E8B57]' : 'text-gray-400 hover:text-gray-600'}`}>
        <Truck size={24} className={activeTab === 'available' ? 'fill-current' : ''} />
        <span className="text-[10px] font-bold">Available</span>
      </button>
      <button onClick={() => {}} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'active' ? 'text-[#2E8B57]' : 'text-gray-400 hover:text-gray-600'}`}>
        <CheckSquare size={24} className={activeTab === 'active' ? 'fill-current' : ''} />
        <span className="text-[10px] font-bold">Active</span>
      </button>
      <button onClick={() => {}} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'wallet' ? 'text-[#2E8B57]' : 'text-gray-400 hover:text-gray-600'}`}>
        <Wallet size={24} className={activeTab === 'wallet' ? 'fill-current' : ''} />
        <span className="text-[10px] font-bold">Wallet</span>
      </button>
      <button onClick={() => {}} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-[#2E8B57]' : 'text-gray-400 hover:text-gray-600'}`}>
        <User size={24} className={activeTab === 'profile' ? 'fill-current' : ''} />
        <span className="text-[10px] font-bold">Profile</span>
      </button>
    </div>
  );
};
