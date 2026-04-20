import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Wallet, Tag, ShieldCheck, CreditCard, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/UI/Button';

export const CustomerCheckout: React.FC = () => {
  const navigate = useNavigate();
  const [useWallet, setUseWallet] = useState(true);
  const [priority, setPriority] = useState(false);
  const [promo, setPromo] = useState('');

  const serviceFee = 700;
  const runnerFee = 4500;
  const priorityFee = priority ? 500 : 0;
  const total = serviceFee + runnerFee + priorityFee;

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/60 transition-colors hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-white">Checkout</h2>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 md:px-10 md:pb-10">
        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-3 text-white/70">
            <MapPin size={18} className="text-kart-orange" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">Delivery Route</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0f141f] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Pickup</p>
              <p className="mt-2 text-sm font-bold text-white">Shoprite, Lekki Phase 1</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0f141f] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Dropoff</p>
              <p className="mt-2 text-sm font-bold text-white">Eko Atlantic, Victoria Island</p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="mb-4 flex items-center gap-3 text-white/70">
            <ShieldCheck size={18} className="text-market-green" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">Pricing Summary</p>
          </div>
          <div className="space-y-3 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>Runner fee</span>
              <span className="font-semibold text-white">₦{runnerFee.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Service fee</span>
              <span className="font-semibold text-white">₦{serviceFee.toLocaleString()}</span>
            </div>
            {priority && (
              <div className="flex items-center justify-between">
                <span>Priority boost</span>
                <span className="font-semibold text-white">₦{priorityFee.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-base font-bold text-white">
              <span>Total</span>
              <span>₦{total.toLocaleString()}</span>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="mb-4 flex items-center gap-3 text-white/70">
            <Wallet size={18} className="text-kart-orange" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">Payment</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setUseWallet(true)}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
                useWallet ? 'border-kart-orange/40 bg-kart-orange/15 text-white' : 'border-white/10 bg-[#0f141f] text-white/70'
              }`}
            >
              <span className="flex items-center gap-2">
                <Wallet size={16} className="text-kart-orange" /> Wallet balance
              </span>
              <span className="font-semibold">₦48,200</span>
            </button>
            <button
              onClick={() => setUseWallet(false)}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
                !useWallet ? 'border-kart-orange/40 bg-kart-orange/15 text-white' : 'border-white/10 bg-[#0f141f] text-white/70'
              }`}
            >
              <span className="flex items-center gap-2">
                <CreditCard size={16} className="text-kart-orange" /> Paystack checkout
              </span>
              <span className="font-semibold">Card/Bank</span>
            </button>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="mb-4 flex items-center gap-3 text-white/70">
            <Tag size={18} className="text-market-green" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">Promo</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={promo}
              onChange={(event) => setPromo(event.target.value)}
              placeholder="Enter promo code"
              className="w-full rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-kart-orange/40"
            />
            <Button variant="outline">Apply</Button>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 text-sm text-white/70 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Priority handling</p>
              <p className="mt-2 text-sm text-white/70">Get the closest runner in under 10 minutes.</p>
            </div>
            <button
              type="button"
              onClick={() => setPriority(!priority)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                priority ? 'bg-kart-orange' : 'bg-white/10'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  priority ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-4xl -translate-x-1/2 border-t border-white/5 bg-[#0d1117]/95 p-5 backdrop-blur-md md:p-6">
        <Button fullWidth className="gap-2" onClick={() => navigate('/customer/confirmation')}>
          <CheckCircle2 size={16} /> Confirm & Place Errand
        </Button>
      </div>
    </div>
  );
};
