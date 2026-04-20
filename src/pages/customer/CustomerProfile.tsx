import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, MapPin, Plus } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { BottomNav } from './BottomNav';

export const CustomerProfile: React.FC = () => {
  const navigate = useNavigate();

  const savedLocations = [
    { id: 1, label: 'Home', address: '12 Admiralty Way, Lekki' },
    { id: 2, label: 'Office', address: '17A Idejo St, Victoria Island' },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/60 transition-colors hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-white">Profile</h2>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 md:px-10 md:pb-10">
        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                alt="Profile"
                className="h-16 w-16 rounded-2xl border border-white/10 bg-white/5"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Profile photo</p>
                <p className="text-lg font-bold text-white">Sarah Daniels</p>
                <p className="text-sm text-slate-400">sarah@errandkart.com</p>
              </div>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-white">
              <Camera size={16} />
              Upload
              <input type="file" className="hidden" />
            </label>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">PERSONAL INFO</h3>
          <Input label="Full Name" placeholder="Sarah Daniels" />
          <Input label="Email Address" type="email" placeholder="sarah@errandkart.com" />
          <Input label="Phone Number" type="tel" placeholder="+234 801 234 5678" />
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">SAVED LOCATIONS</h3>
            <Button variant="outline" className="gap-2 text-xs">
              <Plus size={14} /> Add
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {savedLocations.map(location => (
              <div
                key={location.id}
                className="rounded-2xl border border-white/10 bg-[#0f141f] p-4 shadow-[0_10px_24px_rgba(0,0,0,0.25)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kart-orange/15 text-kart-orange">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{location.label}</p>
                    <p className="text-xs text-slate-400">{location.address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="md:hidden">
        <BottomNav activeTab="profile" />
      </div>
    </div>
  );
};
