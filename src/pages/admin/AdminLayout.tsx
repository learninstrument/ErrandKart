import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Activity, Users, LogOut, ShieldCheck, Navigation, LifeBuoy, Store } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { clearSession } from '../../utils/auth';

type AdminSection = 'dashboard' | 'activity' | 'tracking' | 'support' | 'supermarkets' | 'users' | 'admins';

interface AdminLayoutProps {
  title: string;
  active: AdminSection;
  children: React.ReactNode;
}

const NAV_ITEMS: Array<{ id: AdminSection; label: string; icon: React.ReactNode; href: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/admin/dashboard' },
  { id: 'activity', label: 'Activity', icon: <Activity size={18} />, href: '/admin/activity' },
  { id: 'tracking', label: 'Tracking', icon: <Navigation size={18} />, href: '/admin/tracking' },
  { id: 'support', label: 'Support', icon: <LifeBuoy size={18} />, href: '/admin/support' },
  { id: 'supermarkets', label: 'Supermarkets', icon: <Store size={18} />, href: '/admin/supermarkets' },
  { id: 'users', label: 'Users', icon: <Users size={18} />, href: '/admin/users' },
  { id: 'admins', label: 'Admins', icon: <ShieldCheck size={18} />, href: '/admin/admins' },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ title, active, children }) => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/auth/me`, { method: 'GET', credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data?.user) {
          setFullName(data.user.full_name || '');
          setEmail(data.user.email || '');
        }
      })
      .catch(console.error);
  }, [apiBaseUrl]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(`${apiBaseUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('[Logout]', error);
    } finally {
      clearSession();
      setIsLoggingOut(false);
      navigate('/admin/login');
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#0b0f14] text-white">
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-[#0d1117] p-6 md:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 p-1">
            <img src="/logo.png" alt="ErrandKart" className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white/60">ErrandKart</p>
            <p className="text-lg font-black text-white">Admin Portal</p>
          </div>
        </div>

        <nav className="mt-10 flex flex-col gap-2">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.href)}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                active === item.id
                  ? 'border-kart-orange/40 bg-kart-orange/15 text-kart-orange'
                  : 'border-white/10 bg-white/5 text-white/70 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Signed in</p>
          <p className="mt-2 text-sm font-bold text-white">{fullName || 'Super Admin'}</p>
          <p className="text-xs text-white/50">{email || 'Loading...'}</p>
          <Button variant="outline" className="mt-4 w-full gap-2 text-xs" onClick={handleLogout} disabled={isLoggingOut}>
            <LogOut size={14} className="text-white/70" /> {isLoggingOut ? 'Logging out...' : 'Log out'}
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 p-1 md:hidden">
              <img src="/logo.png" alt="ErrandKart" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Admin</p>
              <h1 className="text-lg font-black text-white">{title}</h1>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 font-bold text-white">
              {fullName ? fullName.substring(0, 2).toUpperCase() : 'SA'}
            </div>
            <div className="text-sm font-semibold text-white/70">{fullName || 'Super Admin'}</div>
          </div>
        </header>

        <div className="md:hidden">
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-6 pb-3 pt-4">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => navigate(item.href)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                  active === item.id
                    ? 'border-kart-orange/40 bg-kart-orange/15 text-kart-orange'
                    : 'border-white/10 bg-white/5 text-white/60'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <main className="flex-1 px-6 pb-10 pt-6 md:px-10">{children}</main>
      </div>
    </div>
  );
};
