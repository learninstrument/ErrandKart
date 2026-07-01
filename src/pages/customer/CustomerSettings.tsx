import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, ShieldCheck, MapPin, Globe, LifeBuoy, LogOut, User, Wallet, FileText } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { BottomNav } from './BottomNav';
import { clearSession } from '../../utils/auth';

export const CustomerSettings: React.FC = () => {
  const navigate = useNavigate();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const apiBaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL ?? 'http://localhost:4000');

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
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-white dark:bg-[#000000] text-black dark:text-white transition-colors duration-300">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/85 dark:bg-[#000000]/85 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-black/60 dark:text-white/60 transition-colors hover:text-black dark:hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-extrabold tracking-tight text-black dark:text-white">Settings</h2>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 lg:grid lg:items-start lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:px-10 lg:pb-10 animate-fade-in-up">
        <div className="flex flex-col gap-6">
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-kart-orange/10 text-kart-orange">
                <Bell size={20} />
              </div>
              <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">NOTIFICATIONS</h3>
            </div>

            {[
              { label: 'Push alerts', value: pushEnabled, setValue: setPushEnabled },
              { label: 'Email updates', value: emailEnabled, setValue: setEmailEnabled },
              { label: 'SMS updates', value: smsEnabled, setValue: setSmsEnabled },
            ].map(setting => (
              <div key={setting.label} className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-4 mb-3 transition-all hover:bg-black/10 dark:hover:bg-white/10">
                <span className="text-sm font-semibold text-black dark:text-white">{setting.label}</span>
                <button
                  type="button"
                  onClick={() => setting.setValue(!setting.value)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    setting.value ? 'bg-kart-orange' : 'bg-black/20 dark:bg-white/10'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      setting.value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}

            <Button
              variant="outline"
              className="mt-4 w-full gap-2 h-12 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
              onClick={() => navigate('/customer/notifications')}
            >
              Manage notification history
            </Button>
          </section>

          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-market-green/10 text-market-green">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">PRIVACY</h3>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-4 transition-all hover:bg-black/10 dark:hover:bg-white/10">
              <div className="flex items-center gap-3 text-sm font-semibold text-black dark:text-white">
                <MapPin size={18} className="text-black/50 dark:text-white/50" />
                Share location with runners
              </div>
              <button
                type="button"
                onClick={() => setLocationEnabled(!locationEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  locationEnabled ? 'bg-market-green' : 'bg-black/20 dark:bg-white/10'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    locationEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5 dark:bg-white/10 text-black dark:text-white">
                <Globe size={20} />
              </div>
              <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">PREFERENCES</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50">Language</label>
                <select className="mt-2 w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-[#111621] px-4 py-3.5 text-sm font-semibold text-black dark:text-white shadow-sm dark:shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none focus:border-kart-orange focus:ring-4 focus:ring-kart-orange/25 appearance-none">
                  <option>English</option>
                  <option>Yoruba</option>
                  <option>Hausa</option>
                  <option>Igbo</option>
                </select>
              </div>
              <div>
                <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50">Currency</label>
                <select className="mt-2 w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-[#111621] px-4 py-3.5 text-sm font-semibold text-black dark:text-white shadow-sm dark:shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none focus:border-kart-orange focus:ring-4 focus:ring-kart-orange/25 appearance-none">
                  <option>NGN (₦)</option>
                  <option>USD ($)</option>
                  <option>GBP (£)</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-kart-orange/10 text-kart-orange">
                <LifeBuoy size={20} />
              </div>
              <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">SUPPORT</h3>
            </div>
            <p className="text-sm font-medium text-black/60 dark:text-white/60">
              Get help with payments, orders, or account access.
            </p>
            <Button className="mt-4 w-full gap-2 h-12 font-bold shadow-[0_4px_20px_rgba(255,102,0,0.2)]" onClick={() => navigate('/customer/support')}>
              Open help center
            </Button>
          </section>

          <section className="rounded-3xl border border-red-500/20 bg-red-500/5 dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <h3 className="mb-4 text-xs font-black tracking-widest uppercase text-red-500/70">ACCOUNT</h3>
            <Button variant="outline" className="w-full gap-2 h-12 border-red-500/20 text-red-500 hover:bg-red-500/10" onClick={handleLogout} disabled={isLoggingOut}>
              <LogOut size={16} /> {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </Button>
          </section>

          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md lg:hidden">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">QUICK ACTIONS</h3>
            <div className="mt-4 flex flex-col gap-3">
              <Button variant="outline" className="w-full gap-2 h-12 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/customer/profile')}>
                <User size={16} className="text-black/50 dark:text-white/50" /> Update profile
              </Button>
              <Button variant="outline" className="w-full gap-2 h-12 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/customer/wallet')}>
                <Wallet size={16} className="text-black/50 dark:text-white/50" /> Wallet overview
              </Button>
              <Button variant="outline" className="w-full gap-2 h-12 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/customer/orders')}>
                <FileText size={16} className="text-black/50 dark:text-white/50" /> View activity
              </Button>
            </div>
          </section>

          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md lg:hidden">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">PRIVACY SNAPSHOT</h3>
            <div className="mt-4 space-y-3 text-sm text-black/70 dark:text-white/70">
              <div className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-3.5">
                <span>Location sharing</span>
                <span className="font-bold text-black dark:text-white">{locationEnabled ? 'On' : 'Off'}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-3.5">
                <span>Push alerts</span>
                <span className="font-bold text-black dark:text-white">{pushEnabled ? 'On' : 'Off'}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-3.5">
                <span>SMS updates</span>
                <span className="font-bold text-black dark:text-white">{smsEnabled ? 'On' : 'Off'}</span>
              </div>
            </div>
          </section>
        </div>

        <aside className="hidden flex-col gap-6 lg:flex sticky top-24">
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">QUICK ACTIONS</h3>
            <div className="mt-4 flex flex-col gap-3">
              <Button variant="outline" className="w-full gap-2 h-12 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/customer/profile')}>
                <User size={16} className="text-black/50 dark:text-white/50" /> Update profile
              </Button>
              <Button variant="outline" className="w-full gap-2 h-12 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/customer/wallet')}>
                <Wallet size={16} className="text-black/50 dark:text-white/50" /> Wallet overview
              </Button>
              <Button variant="outline" className="w-full gap-2 h-12 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/customer/orders')}>
                <FileText size={16} className="text-black/50 dark:text-white/50" /> View activity
              </Button>
            </div>
          </section>

          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">PRIVACY SNAPSHOT</h3>
            <div className="mt-4 space-y-3 text-sm text-black/70 dark:text-white/70">
              <div className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-3.5">
                <span>Location sharing</span>
                <span className="font-bold text-black dark:text-white">{locationEnabled ? 'On' : 'Off'}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-3.5">
                <span>Push alerts</span>
                <span className="font-bold text-black dark:text-white">{pushEnabled ? 'On' : 'Off'}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-3.5">
                <span>SMS updates</span>
                <span className="font-bold text-black dark:text-white">{smsEnabled ? 'On' : 'Off'}</span>
              </div>
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
