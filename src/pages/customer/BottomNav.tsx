import { useNavigate } from 'react-router-dom';
import { Home, FileText, Wallet, User } from 'lucide-react';

export const BottomNav = ({ activeTab }: { activeTab: 'home' | 'orders' | 'wallet' | 'profile' }) => {
  const navigate = useNavigate();

  const tabs = [
    { key: 'home', label: 'Explore', icon: Home, href: '/customer/dashboard' },
    { key: 'orders', label: 'Tasks', icon: FileText, href: '/customer/orders' },
    { key: 'wallet', label: 'Wallet', icon: Wallet, href: '/customer/wallet' },
    { key: 'profile', label: 'Account', icon: User, href: '/customer/profile' },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full max-w-full items-center justify-around border-t border-black/5 dark:border-white/[0.06] bg-white/90 dark:bg-[#0A0A0A]/90 px-4 pb-8 pt-3 backdrop-blur-2xl lg:hidden">
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;

        if (isActive) {
          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.href)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-kart-orange text-white shadow-[0_0_15px_rgba(255,102,0,0.3)] transition-transform active:scale-95"
            >
              <Icon size={22} fill="currentColor" />
            </button>
          );
        }

        return (
          <button
            key={tab.key}
            onClick={() => navigate(tab.href)}
            className="flex flex-col items-center justify-center gap-1 text-black/40 dark:text-white/35 transition-colors hover:text-black dark:hover:text-white/60"
          >
            <Icon size={22} />
            <span className="text-[10px] font-bold">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
