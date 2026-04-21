import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, ShieldCheck, MapPin, Globe, LifeBuoy, LogOut, User, Wallet, FileText } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { BottomNav } from './BottomNav';

export const CustomerSettings: React.FC = () => {
  const navigate = useNavigate();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/60 transition-colors hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-white">Settings</h2>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 md:grid md:grid-cols-[1.15fr_0.85fr] md:gap-8 md:px-10 md:pb-10">
        <div className="flex flex-col gap-6">
          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kart-orange/15 text-kart-orange">
                <Bell size={18} />
              </div>
              <h3 className="text-sm font-black tracking-[0.2em] text-white/70">NOTIFICATIONS</h3>
            </div>

            {[
              { label: 'Push alerts', value: pushEnabled, setValue: setPushEnabled },
              { label: 'Email updates', value: emailEnabled, setValue: setEmailEnabled },
              { label: 'SMS updates', value: smsEnabled, setValue: setSmsEnabled },
            ].map(setting => (
              <div key={setting.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3 mb-3">
                <span className="text-sm text-white">{setting.label}</span>
                <button
                  type="button"
                  onClick={() => setting.setValue(!setting.value)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    setting.value ? 'bg-kart-orange' : 'bg-white/10'
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
              className="mt-4 w-full gap-2 text-xs"
              onClick={() => navigate('/customer/notifications')}
            >
              Manage notification history
            </Button>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-market-green/15 text-market-green">
                <ShieldCheck size={18} />
              </div>
              <h3 className="text-sm font-black tracking-[0.2em] text-white/70">PRIVACY</h3>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
              <div className="flex items-center gap-3 text-sm text-white">
                <MapPin size={16} className="text-slate-400" />
                Share location with runners
              </div>
              <button
                type="button"
                onClick={() => setLocationEnabled(!locationEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  locationEnabled ? 'bg-market-green' : 'bg-white/10'
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

          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                <Globe size={18} />
              </div>
              <h3 className="text-sm font-black tracking-[0.2em] text-white/70">PREFERENCES</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Language</label>
                <select className="mt-2 w-full rounded-2xl border border-[#253043] bg-[#111621] px-4 py-3 text-sm text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none focus:border-kart-orange focus:ring-4 focus:ring-kart-orange/25">
                  <option>English</option>
                  <option>Yoruba</option>
                  <option>Hausa</option>
                  <option>Igbo</option>
                </select>
              </div>
              <div>
                <label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Currency</label>
                <select className="mt-2 w-full rounded-2xl border border-[#253043] bg-[#111621] px-4 py-3 text-sm text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none focus:border-kart-orange focus:ring-4 focus:ring-kart-orange/25">
                  <option>NGN (₦)</option>
                  <option>USD ($)</option>
                  <option>GBP (£)</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kart-orange/15 text-kart-orange">
                <LifeBuoy size={18} />
              </div>
              <h3 className="text-sm font-black tracking-[0.2em] text-white/70">SUPPORT</h3>
            </div>
            <p className="text-sm text-slate-400">
              Get help with payments, orders, or account access.
            </p>
            <Button className="mt-4 w-full gap-2 text-xs" onClick={() => navigate('/customer/support')}>
              Open help center
            </Button>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">ACCOUNT</h3>
            <Button variant="outline" className="w-full gap-2">
              <LogOut size={16} className="text-white/70" /> Sign out
            </Button>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:hidden">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">QUICK ACTIONS</h3>
            <div className="mt-4 flex flex-col gap-3">
              <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/customer/profile')}>
                <User size={16} className="text-white/70" /> Update profile
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/customer/wallet')}>
                <Wallet size={16} className="text-white/70" /> Wallet overview
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/customer/orders')}>
                <FileText size={16} className="text-white/70" /> View activity
              </Button>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 text-sm text-white/70 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:hidden">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">PRIVACY SNAPSHOT</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
                <span>Location sharing</span>
                <span className="font-semibold text-white">{locationEnabled ? 'On' : 'Off'}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
                <span>Push alerts</span>
                <span className="font-semibold text-white">{pushEnabled ? 'On' : 'Off'}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
                <span>SMS updates</span>
                <span className="font-semibold text-white">{smsEnabled ? 'On' : 'Off'}</span>
              </div>
            </div>
          </section>
        </div>

        <aside className="hidden flex-col gap-6 md:flex">
          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">QUICK ACTIONS</h3>
            <div className="mt-4 flex flex-col gap-3">
              <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/customer/profile')}>
                <User size={16} className="text-white/70" /> Update profile
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/customer/wallet')}>
                <Wallet size={16} className="text-white/70" /> Wallet overview
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/customer/orders')}>
                <FileText size={16} className="text-white/70" /> View activity
              </Button>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 text-sm text-white/70 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">PRIVACY SNAPSHOT</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
                <span>Location sharing</span>
                <span className="font-semibold text-white">{locationEnabled ? 'On' : 'Off'}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
                <span>Push alerts</span>
                <span className="font-semibold text-white">{pushEnabled ? 'On' : 'Off'}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
                <span>SMS updates</span>
                <span className="font-semibold text-white">{smsEnabled ? 'On' : 'Off'}</span>
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
