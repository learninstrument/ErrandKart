import { useNavigate } from 'react-router-dom';
import { Home, FileText, Wallet, User } from 'lucide-react';

export const BottomNav = ({ activeTab }: { activeTab: 'home' | 'orders' | 'wallet' | 'profile' }) => {
  const navigate = useNavigate();
  const baseClass = 'flex flex-col items-center gap-1 transition-colors';

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-md -translate-x-1/2 items-center justify-around rounded-3xl border border-white/10 bg-[#0d1117]/90 px-6 py-3 backdrop-blur-md shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
      <button
        onClick={() => navigate('/customer/dashboard')}
        className={`${baseClass} ${activeTab === 'home' ? 'text-kart-orange' : 'text-white/50 hover:text-white'}`}
      >
        <Home size={24} className={activeTab === 'home' ? 'fill-current' : ''} />
        <span className="text-[10px] font-bold">Home</span>
      </button>

      <button
        onClick={() => navigate('/customer/track')}
        className={`${baseClass} ${activeTab === 'orders' ? 'text-kart-orange' : 'text-white/50 hover:text-white'}`}
      >
        <FileText size={24} className={activeTab === 'orders' ? 'fill-current' : ''} />
        <span className="text-[10px] font-bold">Activity</span>
      </button>

      <button className={`${baseClass} ${activeTab === 'wallet' ? 'text-kart-orange' : 'text-white/50 hover:text-white'}`}>
        <Wallet size={24} className={activeTab === 'wallet' ? 'fill-current' : ''} />
        <span className="text-[10px] font-bold">Wallet</span>
      </button>

      <button className={`${baseClass} ${activeTab === 'profile' ? 'text-kart-orange' : 'text-white/50 hover:text-white'}`}>
        <User size={24} className={activeTab === 'profile' ? 'fill-current' : ''} />
        <span className="text-[10px] font-bold">Profile</span>
      </button>
    </div>
  );
};
