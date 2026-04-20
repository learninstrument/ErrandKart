import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, MapPin, PackageCheck, Receipt } from 'lucide-react';
import { Button } from '../../components/UI/Button';

export const CustomerConfirmation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 pb-20 pt-10 md:px-10">
        <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#111722] via-[#121826] to-[#0d1117] p-8 text-white shadow-[0_28px_70px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-kart-orange/15 text-kart-orange">
              <CheckCircle2 size={28} />
            </div>
            <h2 className="mt-5 text-3xl font-black">Errand placed successfully</h2>
            <p className="mt-2 text-sm text-white/70">
              Your request is live. We’re matching you with the best nearby runner.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Order ID <span className="text-kart-orange">EK-4920</span>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-[#111722] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3 text-white/70">
              <MapPin size={18} className="text-kart-orange" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Route</p>
            </div>
            <p className="mt-3 text-sm text-white/80">Shoprite, Lekki → Eko Atlantic</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-[#111722] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3 text-white/70">
              <PackageCheck size={18} className="text-market-green" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Status</p>
            </div>
            <p className="mt-3 text-sm text-white/80">Runner matching in progress</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-[#111722] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3 text-white/70">
              <Receipt size={18} className="text-white/70" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Total</p>
            </div>
            <p className="mt-3 text-sm text-white/80">₦5,200 (incl. service fee)</p>
          </div>
        </section>

        <section className="flex flex-col gap-3 md:flex-row">
          <Button className="w-full gap-2" onClick={() => navigate('/customer/track')}>
            Track errand
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/customer/orders')}>
            View activity
          </Button>
        </section>
      </main>
    </div>
  );
};
