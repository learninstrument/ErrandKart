import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, ShieldCheck, MapPin, SlidersHorizontal, LifeBuoy, LogOut } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { RunnerBottomNav } from './RunnerBottomNav';

export const RunnerSettings: React.FC = () => {
  const navigate = useNavigate();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [autoAccept, setAutoAccept] = useState(false);
  const [priorityAlerts, setPriorityAlerts] = useState(true);
  const [shareLocation, setShareLocation] = useState(true);

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/60 transition-colors hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-white">Runner Settings</h2>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 md:px-10 md:pb-10">
        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-market-green/15 text-market-green">
              <Bell size={18} />
            </div>
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">NOTIFICATIONS</h3>
          </div>

          {[
            { label: 'Push alerts', value: pushEnabled, setValue: setPushEnabled },
            { label: 'SMS alerts', value: smsEnabled, setValue: setSmsEnabled },
            { label: 'Priority job alerts', value: priorityAlerts, setValue: setPriorityAlerts },
          ].map(setting => (
            <div key={setting.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3 mb-3">
              <span className="text-sm text-white">{setting.label}</span>
              <button
                type="button"
                onClick={() => setting.setValue(!setting.value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  setting.value ? 'bg-market-green' : 'bg-white/10'
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
            onClick={() => navigate('/runner/notifications')}
          >
            Manage notification history
          </Button>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
              <SlidersHorizontal size={18} />
            </div>
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">JOB PREFERENCES</h3>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3 mb-3">
            <span className="text-sm text-white">Auto-accept nearby errands</span>
            <button
              type="button"
              onClick={() => setAutoAccept(!autoAccept)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoAccept ? 'bg-market-green' : 'bg-white/10'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoAccept ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-market-green/15 text-market-green">
              <ShieldCheck size={18} />
            </div>
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">SAFETY</h3>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
            <div className="flex items-center gap-3 text-sm text-white">
              <MapPin size={16} className="text-slate-400" />
              Share live location with customers
            </div>
            <button
              type="button"
              onClick={() => setShareLocation(!shareLocation)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                shareLocation ? 'bg-market-green' : 'bg-white/10'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  shareLocation ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-market-green/15 text-market-green">
              <LifeBuoy size={18} />
            </div>
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">SUPPORT</h3>
          </div>
          <p className="text-sm text-slate-400">
            Report issues, disputes, or request account help.
          </p>
          <Button className="mt-4 w-full gap-2 text-xs" onClick={() => navigate('/runner/support')}>
            Open help center
          </Button>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">ACCOUNT</h3>
          <Button variant="outline" className="w-full gap-2">
            <LogOut size={16} className="text-white/70" /> Sign out
          </Button>
        </section>
      </main>

      <div className="md:hidden">
        <RunnerBottomNav activeTab="profile" />
      </div>
    </div>
  );
};
