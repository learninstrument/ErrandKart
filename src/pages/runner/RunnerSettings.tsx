import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, ShieldCheck, MapPin, SlidersHorizontal, LifeBuoy, LogOut, Wallet, TrendingUp, User } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { RunnerBottomNav } from './RunnerBottomNav';
import { ThemeSwitcher } from '../../components/UI/ThemeSwitcher';
import { clearSession } from '../../utils/auth';

const ToggleRow = ({ label, description, value, onToggle, accent = 'green' }: { label: string; description?: string; value: boolean; onToggle: () => void; accent?: 'green' | 'orange' }) => (
  <div className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-4 mb-3 transition-all hover:bg-black/10 dark:hover:bg-white/10">
    <div>
      <span className="text-sm font-semibold text-black dark:text-white">{label}</span>
      {description && <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
        value ? (accent === 'green' ? 'bg-market-green' : 'bg-kart-orange') : 'bg-black/20 dark:bg-white/10'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

export const RunnerSettings: React.FC = () => {
  const navigate = useNavigate();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [autoAccept, setAutoAccept] = useState(false);
  const [priorityAlerts, setPriorityAlerts] = useState(true);
  const [shareLocation, setShareLocation] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const apiBaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL ?? 'http://localhost:4000');

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(`${apiBaseUrl}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('[Logout]', error);
    } finally {
      clearSession();
      setIsLoggingOut(false);
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-white dark:bg-[#000000] text-black dark:text-white transition-colors duration-300">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/85 dark:bg-[#000000]/85 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all -ml-1">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-extrabold tracking-tight text-black dark:text-white">Runner Settings</h2>
        <ThemeSwitcher />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 lg:grid lg:items-start lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:px-10 lg:pb-10 animate-fade-in-up">
        <div className="flex flex-col gap-6">

          {/* Notifications */}
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-market-green/10 text-market-green">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">Notifications</h3>
                <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">Control how we reach you</p>
              </div>
            </div>
            <ToggleRow label="Push alerts" description="In-app and device notifications" value={pushEnabled} onToggle={() => setPushEnabled(!pushEnabled)} />
            <ToggleRow label="SMS alerts" description="Text messages for key events" value={smsEnabled} onToggle={() => setSmsEnabled(!smsEnabled)} />
            <ToggleRow label="Priority job alerts" description="First to know about high-value errands" value={priorityAlerts} onToggle={() => setPriorityAlerts(!priorityAlerts)} />
            <Button variant="outline" className="mt-2 w-full gap-2 h-12 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/runner/notifications')}>
              View notification history
            </Button>
          </section>

          {/* Job Preferences */}
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5 dark:bg-white/10 text-black dark:text-white">
                <SlidersHorizontal size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">Job Preferences</h3>
                <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">Customize how you receive errands</p>
              </div>
            </div>
            <ToggleRow label="Auto-accept nearby errands" description="Automatically take jobs within 2 km" value={autoAccept} onToggle={() => setAutoAccept(!autoAccept)} />
          </section>

          {/* Safety */}
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-market-green/10 text-market-green">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">Safety</h3>
                <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">Your security & privacy controls</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-4 mb-3 transition-all hover:bg-black/10 dark:hover:bg-white/10">
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-black/40 dark:text-white/40" />
                <div>
                  <span className="text-sm font-semibold text-black dark:text-white">Share live location</span>
                  <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">Visible to customer during delivery</p>
                </div>
              </div>
              <button type="button" onClick={() => setShareLocation(!shareLocation)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${shareLocation ? 'bg-market-green' : 'bg-black/20 dark:bg-white/10'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${shareLocation ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </section>

          {/* Support */}
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-market-green/10 text-market-green">
                <LifeBuoy size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">Support</h3>
                <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">Report issues, disputes, or get help</p>
              </div>
            </div>
            <Button theme="green" className="w-full gap-2 h-12" onClick={() => navigate('/runner/support')}>
              Open help center
            </Button>
          </section>

          {/* Account */}
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <h3 className="mb-4 text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">Account</h3>
            <Button variant="outline" className="w-full gap-2 h-12 border-red-500/20 text-red-500 dark:text-red-400 hover:bg-red-500/5" onClick={handleLogout} disabled={isLoggingOut}>
              <LogOut size={16} /> {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </Button>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-6">
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">Quick Actions</h3>
            <div className="mt-4 flex flex-col gap-3">
              <Button theme="green" className="w-full gap-2 h-11" onClick={() => navigate('/runner/wallet')}>
                <Wallet size={16} /> Open wallet
              </Button>
              <Button variant="outline" className="w-full gap-2 h-11 border-black/10 dark:border-white/10" onClick={() => navigate('/runner/earnings')}>
                <TrendingUp size={16} /> View analytics
              </Button>
              <Button variant="outline" className="w-full gap-2 h-11 border-black/10 dark:border-white/10" onClick={() => navigate('/runner/profile')}>
                <User size={16} /> Update profile
              </Button>
            </div>
          </section>

          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">Preference Snapshot</h3>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Auto-accept', value: autoAccept },
                { label: 'Priority alerts', value: priorityAlerts },
                { label: 'Share location', value: shareLocation },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-3">
                  <span className="text-sm text-black/70 dark:text-white/70">{item.label}</span>
                  <span className={`text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${item.value ? 'bg-market-green/10 text-market-green' : 'bg-black/5 dark:bg-white/10 text-black/40 dark:text-white/40'}`}>
                    {item.value ? 'On' : 'Off'}
                  </span>
                </div>
              ))}
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
