import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, Truck, Wallet } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { RunnerBottomNav } from './RunnerBottomNav';

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'New errand nearby',
    description: 'Grocery pickup in Lekki Phase 1 (1.2 km).',
    time: 'Just now',
    type: 'success',
    icon: <Truck size={18} />,
  },
  {
    id: 2,
    title: 'Payout sent',
    description: '₦10,000 sent to your bank account.',
    time: 'Today · 8:16 AM',
    type: 'success',
    icon: <Wallet size={18} />,
  },
  {
    id: 3,
    title: 'Errand completed',
    description: 'Receipt approved and payout released.',
    time: 'Yesterday · 7:22 PM',
    type: 'success',
    icon: <CheckCircle2 size={18} />,
  },
  {
    id: 4,
    title: 'Verification pending',
    description: 'KYC document is under review.',
    time: 'Apr 18 · 10:42 AM',
    type: 'warning',
    icon: <AlertCircle size={18} />,
  },
];

export const RunnerNotifications: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/60 transition-colors hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-white">Notifications</h2>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-6 pb-28 pt-6 md:grid md:grid-cols-[1.15fr_0.85fr] md:gap-8 md:px-10 md:pb-10">
        <div className="flex flex-col gap-4">
          {NOTIFICATIONS.map(notification => (
            <div
              key={notification.id}
              className="rounded-[24px] border border-white/10 bg-[#111722] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.35)]"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    notification.type === 'warning'
                      ? 'bg-red-500/15 text-red-400'
                      : 'bg-market-green/15 text-market-green'
                  }`}
                >
                  {notification.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-white">{notification.title}</h3>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                      {notification.time}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{notification.description}</p>
                </div>
              </div>
            </div>
          ))}

          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:hidden">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">NOTIFICATION CONTROLS</h3>
            <p className="mt-2 text-sm text-white/70">
              Stay on top of job offers, payouts, and verification updates.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Button theme="green" className="w-full gap-2" onClick={() => navigate('/runner/settings')}>
                <Truck size={16} /> Manage alerts
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <CheckCircle2 size={16} className="text-white/70" /> Mark all read
              </Button>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:hidden">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">QUICK ACTIONS</h3>
            <div className="mt-4 flex flex-col gap-3">
              <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/runner/active')}>
                <Truck size={16} className="text-market-green" /> Open active errand
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/runner/wallet')}>
                <Wallet size={16} className="text-market-green" /> View payouts
              </Button>
            </div>
          </section>
        </div>

        <aside className="hidden flex-col gap-6 md:flex">
          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">NOTIFICATION CONTROLS</h3>
            <p className="mt-2 text-sm text-white/70">
              Stay on top of job offers, payouts, and verification updates.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Button theme="green" className="w-full gap-2" onClick={() => navigate('/runner/settings')}>
                <Truck size={16} /> Manage alerts
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <CheckCircle2 size={16} className="text-white/70" /> Mark all read
              </Button>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">QUICK ACTIONS</h3>
            <div className="mt-4 flex flex-col gap-3">
              <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/runner/active')}>
                <Truck size={16} className="text-market-green" /> Open active errand
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/runner/wallet')}>
                <Wallet size={16} className="text-market-green" /> View payouts
              </Button>
            </div>
          </section>
        </aside>
      </main>

      <div className="md:hidden">
        <RunnerBottomNav activeTab="profile" />
      </div>
    </div>
  );
};
