import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, ShieldCheck, Settings } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { RunnerBottomNav } from './RunnerBottomNav';

export const RunnerProfile: React.FC = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/60 transition-colors hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-black text-white">Runner Profile</h2>
          <span className="rounded-full border border-market-green/40 bg-market-green/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-market-green">
            Pending verification
          </span>
        </div>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 md:px-10 md:pb-10">
        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
                alt="Profile"
                className="h-16 w-16 rounded-2xl border border-white/10 bg-white/5"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Runner profile</p>
                <p className="text-lg font-bold text-white">Michael B.</p>
                <p className="text-sm text-slate-400">michael@errandkart.com</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-white">
                <Camera size={16} />
                Upload
                <input type="file" className="hidden" />
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Status</div>
                <button
                  type="button"
                  onClick={() => setIsOnline(!isOnline)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    isOnline ? 'bg-market-green' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      isOnline ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-xs font-semibold text-white/70">{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">PERSONAL INFO</h3>
          <Input label="Full Name" placeholder="Michael B." theme="green" />
          <Input label="Email Address" type="email" placeholder="michael@errandkart.com" theme="green" />
          <Input label="Phone Number" type="tel" placeholder="+234 801 123 9876" theme="green" />
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black tracking-[0.2em] text-white/70">SETTINGS</h3>
              <p className="mt-2 text-sm text-slate-400">Notifications, safety, and job preferences.</p>
            </div>
            <Button onClick={() => navigate('/runner/settings')} className="gap-2 text-xs">
              <Settings size={14} /> Manage
            </Button>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">KYC VERIFICATION</h3>
          <div className="rounded-2xl border border-white/10 bg-[#0f141f] p-4 text-white/70">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-market-green/15 text-market-green">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Government ID</p>
                <p className="text-xs text-slate-400">Upload your NIN or Driver's License</p>
              </div>
            </div>
            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-white">
              Upload document
              <input type="file" className="hidden" />
            </label>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">VEHICLE INFO</h3>
          <label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Vehicle Type</label>
          <select className="mb-4 mt-1 w-full rounded-2xl border border-[#253043] bg-[#111621] px-4 py-3 text-sm text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none focus:border-market-green focus:ring-4 focus:ring-market-green/25">
            <option>Bicycle</option>
            <option>Motorbike</option>
            <option>Car</option>
            <option>Foot</option>
          </select>
          <Input label="License Plate" placeholder="ABC-1234" theme="green" />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {[
            { label: 'Rating', value: '4.8' },
            { label: 'Trips Completed', value: '120' },
          ].map((stat, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-black text-white">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">BANK DETAILS</h3>
          <Input label="Bank Name" placeholder="GTBank" theme="green" />
          <Input label="Account Number" placeholder="0123456789" theme="green" />
        </section>
      </main>

      <div className="md:hidden">
        <RunnerBottomNav activeTab="profile" />
      </div>
    </div>
  );
};
