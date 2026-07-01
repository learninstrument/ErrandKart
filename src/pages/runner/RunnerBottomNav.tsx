import { useNavigate } from 'react-router-dom';
import { Truck, CheckSquare, Wallet, User } from 'lucide-react';

export const RunnerBottomNav = ({ activeTab }: { activeTab: 'available' | 'active' | 'wallet' | 'profile' }) => {
  const navigate = useNavigate();

  const tabs = [
    { key: 'available', label: 'Available', icon: Truck, href: '/runner/dashboard' },
    { key: 'active', label: 'Active', icon: CheckSquare, href: '/runner/active' },
    { key: 'wallet', label: 'Wallet', icon: Wallet, href: '/runner/wallet' },
    { key: 'profile', label: 'Profile', icon: User, href: '/runner/profile' },
  ] as const;

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-md -translate-x-1/2 items-center justify-around rounded-3xl border border-black/5 dark:border-white/10 bg-white/90 dark:bg-[#050505]/90 px-6 py-3 backdrop-blur-md shadow-[0_16px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;

        if (isActive) {
          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.href)}
              className="flex flex-col items-center gap-1 text-market-green transition-colors"
            >
              <Icon size={24} className="fill-current" />
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          );
        }

        return (
          <button
            key={tab.key}
            onClick={() => navigate(tab.href)}
            className="flex flex-col items-center gap-1 text-black/40 dark:text-white/30 transition-colors hover:text-black dark:hover:text-white/70"
          >
            <Icon size={20} />
            <span className="text-[10px] font-bold">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
