import { useNavigate } from 'react-router-dom';
import { Truck, CheckSquare, Wallet, User } from 'lucide-react';

export const RunnerBottomNav = ({ activeTab }: { activeTab: 'available' | 'active' | 'wallet' | 'profile' }) => {
  const navigate = useNavigate();
  const baseClass = 'flex flex-col items-center gap-1 transition-colors';

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-md -translate-x-1/2 items-center justify-around rounded-3xl border border-white/10 bg-[#0d1117]/90 px-6 py-3 backdrop-blur-md shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
      <button
        onClick={() => navigate('/runner/dashboard')}
        className={`${baseClass} ${activeTab === 'available' ? 'text-market-green' : 'text-white/50 hover:text-white'}`}
      >
        <Truck size={24} className={activeTab === 'available' ? 'fill-current' : ''} />
        <span className="text-[10px] font-bold">Available</span>
      </button>

      <button
        onClick={() => navigate('/runner/active')}
        className={`${baseClass} ${activeTab === 'active' ? 'text-market-green' : 'text-white/50 hover:text-white'}`}
      >
        <CheckSquare size={24} className={activeTab === 'active' ? 'fill-current' : ''} />
        <span className="text-[10px] font-bold">Active</span>
      </button>

      <button
        onClick={() => navigate('/runner/wallet')}
        className={`${baseClass} ${activeTab === 'wallet' ? 'text-market-green' : 'text-white/50 hover:text-white'}`}
      >
        <Wallet size={24} className={activeTab === 'wallet' ? 'fill-current' : ''} />
        <span className="text-[10px] font-bold">Wallet</span>
      </button>

      <button
        onClick={() => navigate('/runner/profile')}
        className={`${baseClass} ${activeTab === 'profile' ? 'text-market-green' : 'text-white/50 hover:text-white'}`}
      >
        <User size={24} className={activeTab === 'profile' ? 'fill-current' : ''} />
        <span className="text-[10px] font-bold">Profile</span>
      </button>
    </div>
  );
};
