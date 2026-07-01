import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, CheckCircle2, AlertCircle, PackageCheck } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { BottomNav } from './BottomNav';
import { ThemeSwitcher } from '../../components/UI/ThemeSwitcher';

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'Runner assigned',
    description: 'Michael B. accepted your grocery errand and is on the way to pickup.',
    time: '2 mins ago',
    type: 'success',
    icon: <PackageCheck size={18} />,
  },
  {
    id: 2,
    title: 'Errand completed',
    description: 'Your delivery was completed. Receipt is available for review.',
    time: 'Today · 9:12 AM',
    type: 'success',
    icon: <CheckCircle2 size={18} />,
  },
  {
    id: 3,
    title: 'Top up received',
    description: '₦10,000 has been added to your wallet and is ready to use.',
    time: 'Yesterday · 3:48 PM',
    type: 'success',
    icon: <Bell size={18} />,
  },
  {
    id: 4,
    title: 'Payment issue',
    description: 'We could not process the last payment method. Please update your card.',
    time: 'Apr 18 · 6:01 PM',
    type: 'warning',
    icon: <AlertCircle size={18} />,
  },
];

export const CustomerNotifications: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full flex-col bg-white dark:bg-[#000000] text-black dark:text-white transition-colors duration-300">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/85 dark:bg-[#000000]/85 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all -ml-1">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-extrabold tracking-tight text-black dark:text-white">Notifications</h2>
        <ThemeSwitcher />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-6 pb-28 pt-6 lg:grid lg:items-start lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:px-10 lg:pb-10 animate-fade-in-up">
        <div className="flex flex-col gap-4">
          <p className="px-1 text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">{NOTIFICATIONS.length} Notifications</p>
          {NOTIFICATIONS.map(notification => (
            <div
              key={notification.id}
              className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-xl backdrop-blur-md transition-all hover:border-black/10 dark:hover:border-white/10 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${
                  notification.type === 'warning' ? 'bg-red-500/10 text-red-500' : 'bg-kart-orange/10 text-kart-orange'
                }`}>
                  {notification.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-bold text-black dark:text-white">{notification.title}</h3>
                    <span className="text-[10px] font-semibold whitespace-nowrap text-black/40 dark:text-white/40 mt-0.5">
                      {notification.time}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-black/60 dark:text-white/60 leading-relaxed">{notification.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-6">
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kart-orange/10 text-kart-orange">
                <Bell size={18} />
              </div>
              <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">Controls</h3>
            </div>
            <p className="text-sm text-black/60 dark:text-white/60 mb-4">Manage alerts for new runners, payments, and delivery updates.</p>
            <div className="flex flex-col gap-3">
              <Button className="w-full gap-2 h-11" onClick={() => navigate('/customer/settings')}>
                <Bell size={16} /> Manage settings
              </Button>
              <Button variant="outline" className="w-full gap-2 h-11 border-black/10 dark:border-white/10">
                <CheckCircle2 size={16} /> Mark all read
              </Button>
            </div>
          </section>

          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40 mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="w-full gap-2 h-11 border-black/10 dark:border-white/10" onClick={() => navigate('/customer/track')}>
                <PackageCheck size={16} className="text-kart-orange" /> Track active errand
              </Button>
              <Button variant="outline" className="w-full h-11 border-black/10 dark:border-white/10" onClick={() => navigate('/customer/orders')}>
                View activity
              </Button>
            </div>
          </section>
        </aside>
      </main>

      <div className="md:hidden">
        <BottomNav activeTab="profile" />
      </div>
    </div>
  );
};
