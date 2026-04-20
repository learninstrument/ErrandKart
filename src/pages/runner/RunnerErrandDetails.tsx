import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, BadgeCheck, Navigation, PackageCheck } from 'lucide-react';
import { Button } from '../../components/UI/Button';

export const RunnerErrandDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/60 transition-colors hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-white">Errand Details</h2>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 md:px-10 md:pb-10">
        <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0e1a14] via-[#101f18] to-[#0d1117] p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">Order #{id}</p>
              <h3 className="mt-2 text-2xl font-black">Grocery Pickup at Whole Foods</h3>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/70">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-market-green" /> Lekki Phase 1
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-market-green" /> 1.2 km away
                </span>
                <span className="flex items-center gap-1">
                  <PackageCheck size={14} className="text-market-green" /> 8 items
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-market-green/40 bg-market-green/15 px-5 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-market-green">Payout</p>
              <p className="mt-2 text-2xl font-black text-white">₦4,500</p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">CUSTOMER NOTES</h3>
          <p className="text-sm text-white/70">
            Please pick fresh produce, avoid substitutions on dairy, and send a quick chat before checkout.
          </p>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">CHECKLIST</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              '2x Whole wheat bread',
              '1x Almond milk',
              '3x Eggs (medium)',
              '1x Detergent',
              '1x Fresh tomatoes',
              '1x Rice (2kg)',
              '1x Laundry bleach',
              '2x Bottled water',
            ].map(item => (
              <div key={item} className="rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3 text-sm text-white/80">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">ROUTE PREVIEW</h3>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Pickup</p>
              <p className="text-sm font-bold text-white">Whole Foods, Lekki</p>
            </div>
            <Navigation size={18} className="text-market-green" />
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Dropoff</p>
              <p className="text-sm font-bold text-white">Eko Atlantic, VI</p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3 md:flex-row">
          <Button variant="outline" className="w-full gap-2">
            <BadgeCheck size={16} className="text-white/70" /> Decline
          </Button>
          <Button theme="green" className="w-full gap-2" onClick={() => navigate('/runner/active')}>
            Accept Errand
          </Button>
        </section>
      </main>
    </div>
  );
};
