import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Shield, Check, Info, Lock, Wallet as WalletIcon, CreditCard, HelpCircle } from 'lucide-react';
import { Button } from '../../components/UI/Button';

export const CustomerCheckout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const errand = location.state?.errand;
  
  const [useWallet, setUseWallet] = useState(true);
  const [priority, setPriority] = useState(false);
  const [promo, setPromo] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  // Slide-to-Pay State
  const [slideX, setSlideX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

  if (!errand) {
    navigate('/customer/post-errand', { replace: true });
    return null;
  }

  const serviceFee = 700;
  const runnerFee = Number(errand.budget_service_fee) || 0;
  const priorityFee = priority ? 500 : 0;
  const discount = promoApplied ? 1000 : 0;
  const total = Math.max(0, serviceFee + runnerFee + priorityFee - discount);

  // Drag Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isSuccess) return;
    setIsDragging(true);
    startXRef.current = e.clientX - slideX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isSuccess) return;
    if (!trackRef.current || !handleRef.current) return;
    const maxSlide = trackRef.current.clientWidth - handleRef.current.clientWidth - 8;
    const x = e.clientX - startXRef.current;
    const newX = Math.max(0, Math.min(x, maxSlide));
    setSlideX(newX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isSuccess) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (!trackRef.current || !handleRef.current) return;
    const maxSlide = trackRef.current.clientWidth - handleRef.current.clientWidth - 8;

    if (slideX >= maxSlide * 0.85) {
      setSlideX(maxSlide);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/customer/confirmation', { state: { errand } });
      }, 2200);
    } else {
      setSlideX(0);
    }
  };

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === 'EKFREE' || promo.trim().toUpperCase() === 'ERRANDKART') {
      setPromoApplied(true);
    } else {
      alert('Invalid promo code');
    }
  };

  const displayPromoDiscount = promoApplied ? '₦1,000' : '-';

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#0A0A0A] text-[#f8ddd2] overflow-x-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-[#0A0A0A]/85 px-6 py-4 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95">
          <ArrowLeft size={18} className="text-[#ff6600]" />
        </button>
        <h1 className="text-lg font-extrabold tracking-tight text-white">Payment</h1>
        <div className="w-10" />
      </header>

      {/* Main Form content */}
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 pb-44 pt-6 animate-fade-in-up">
        {/* Secure Escrow Header Card */}
        <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0f0f0f]/80 p-6 shadow-2xl backdrop-blur-md">
          <div className="absolute top-0 left-0 h-[3px] w-full bg-[#ff6600]/40 animate-shimmer"></div>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-extrabold text-[#ff6600] tracking-tight">Secure Escrow Payment</h2>
              <p className="text-xs text-[#e3bfb1]/60 mt-1">Transaction: #EK-{errand.id?.split('-')[0].toUpperCase() || 'NEW'}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2e8b57]/20 text-[#7ed99e]">
              <Shield size={20} className="fill-[#7ed99e]/20" />
            </div>
          </div>

          <div className="mt-5 border-y border-white/5 py-4 flex gap-4 items-center">
            <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
              <span className="text-[#ff6600] font-black text-xs">EK</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white">Premium Errand Courier</h3>
              <p className="text-xs text-[#e3bfb1]/60 mt-0.5">Budgeted Runner Service</p>
            </div>
            <div className="text-right">
              <p className="text-base font-extrabold text-white">₦{runnerFee.toLocaleString()}</p>
            </div>
          </div>

          {/* Pricing breakdown */}
          <div className="mt-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#e3bfb1]/60">Runner fee</span>
              <span className="font-semibold text-white">₦{runnerFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#e3bfb1]/60">Service fee</span>
              <span className="font-semibold text-white">₦{serviceFee.toLocaleString()}</span>
            </div>
            {priority && (
              <div className="flex justify-between text-sm">
                <span className="text-[#e3bfb1]/60">Priority dispatch</span>
                <span className="font-semibold text-white">₦{priorityFee.toLocaleString()}</span>
              </div>
            )}
            {promoApplied && (
              <div className="flex justify-between text-sm text-[#7ed99e]">
                <span>Promo discount</span>
                <span className="font-semibold">-₦1,000</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-dashed border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-white/80 font-bold">Escrow Guarantee Hold</span>
                <Info size={13} className="text-[#ff6600]" title="Secured during task, fully released to runner upon completion" />
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70">Verified</span>
            </div>
          </div>

          {/* Final amount */}
          <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-base font-bold text-white">Total Amount</span>
            <span className="text-2xl font-black text-[#ff6600]">₦{total.toLocaleString()}</span>
          </div>
        </section>

        {/* Priority Boost Option */}
        <section className="rounded-2xl border border-white/5 bg-[#0f0f0f]/80 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-xs font-black tracking-widest uppercase text-[#aa8a7d]">Priority Delivery Handling</h4>
              <p className="mt-1 text-xs text-[#e3bfb1]/60">Broadcast to runners as top priority (increases matching speed)</p>
            </div>
            <button
              type="button"
              onClick={() => setPriority(!priority)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                priority ? 'bg-[#ff6600]' : 'bg-white/10'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  priority ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Payment Methods */}
        <section>
          <h3 className="text-xs font-black tracking-widest uppercase text-[#aa8a7d] mb-3 px-1">Payment Method</h3>
          <div className="flex flex-col gap-3">
            {/* Wallet */}
            <button
              onClick={() => setUseWallet(true)}
              className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all backdrop-blur-md ${
                useWallet
                  ? 'border-[#ff6600]/40 bg-[#ff6600]/10 text-white ring-1 ring-[#ff6600]/40'
                  : 'border-white/5 bg-[#0f0f0f]/80 text-[#e3bfb1]/70 hover:border-white/10'
              }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                useWallet ? 'bg-[#ff6600]/20 text-[#ffb596]' : 'bg-white/5 text-[#e3bfb1]/50'
              }`}>
                <WalletIcon size={20} />
              </div>
              <div className="flex-grow">
                <p className="text-sm font-bold">ErrandKart Wallet</p>
                <p className="text-xs text-[#e3bfb1]/50">Balance: ₦48,200</p>
              </div>
              {useWallet ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff6600]">
                  <Check size={14} className="text-black stroke-[3]" />
                </div>
              ) : (
                <div className="h-6 w-6 rounded-full border border-white/20" />
              )}
            </button>

            {/* Paystack Card */}
            <button
              onClick={() => setUseWallet(false)}
              className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all backdrop-blur-md ${
                !useWallet
                  ? 'border-[#ff6600]/40 bg-[#ff6600]/10 text-white ring-1 ring-[#ff6600]/40'
                  : 'border-white/5 bg-[#0f0f0f]/80 text-[#e3bfb1]/70 hover:border-white/10'
              }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                !useWallet ? 'bg-[#ff6600]/20 text-[#ffb596]' : 'bg-white/5 text-[#e3bfb1]/50'
              }`}>
                <CreditCard size={20} />
              </div>
              <div className="flex-grow">
                <p className="text-sm font-bold">Paystack Online Checkout</p>
                <p className="text-xs text-[#e3bfb1]/50">Card, Bank Transfer, USSD</p>
              </div>
              {!useWallet ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff6600]">
                  <Check size={14} className="text-black stroke-[3]" />
                </div>
              ) : (
                <div className="h-6 w-6 rounded-full border border-white/20" />
              )}
            </button>
          </div>
        </section>

        {/* Promo Code */}
        <section className="rounded-2xl border border-white/5 bg-[#0f0f0f]/80 p-5 shadow-lg backdrop-blur-md">
          <h4 className="text-xs font-black tracking-widest uppercase text-[#aa8a7d] mb-3">Promo Code</h4>
          <div className="flex gap-3">
            <input
              type="text"
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="Enter promo code"
              disabled={promoApplied}
              className="flex-grow rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff6600]/40 disabled:opacity-50"
            />
            <Button
              variant="outline"
              onClick={applyPromo}
              disabled={promoApplied}
              className="border-white/10 hover:bg-white/5"
            >
              {promoApplied ? 'Applied' : 'Apply'}
            </Button>
          </div>
        </section>

        {/* Support Link */}
        <section className="flex gap-3 rounded-2xl border border-white/5 bg-[#ff6600]/5 p-4 items-center">
          <HelpCircle size={18} className="text-[#ff6600]" />
          <p className="text-xs text-[#e3bfb1]/80">
            Escrow ensures funds are held securely until you confirm completion.
          </p>
        </section>
      </main>

      {/* Bottom sliding Action Sheet */}
      <div className="fixed bottom-0 left-0 w-full z-40 border-t border-white/5 bg-[#0A0A0A]/90 backdrop-blur-xl px-6 pt-4 pb-8 max-w-lg left-1/2 -translate-x-1/2 shadow-2xl rounded-t-[32px]">
        <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-5"></div>
        <div className="flex justify-between items-center mb-5 px-1">
          <div>
            <p className="text-xs text-[#e3bfb1]/50">Secure verification</p>
            <p className="text-lg font-black text-white">₦{total.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#e3bfb1]/50">Escrow Security</p>
            <div className="flex items-center gap-1 text-xs font-bold text-[#7ed99e] mt-0.5 justify-end">
              <Lock size={12} /> SSL Encrypted
            </div>
          </div>
        </div>

        {/* Slide Button */}
        <div
          ref={trackRef}
          id="slide-track"
          className="relative w-full h-[64px] bg-white/5 rounded-full p-1 border border-white/10 overflow-hidden slide-to-pay group touch-none"
        >
          {/* Progress bar */}
          <div
            className="absolute top-0 left-0 h-full bg-[#ff6600]/10 transition-all duration-75"
            style={{ width: `${slideX + 56}px` }}
          />

          {/* Prompt text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className="text-xs font-bold text-[#ff6600] tracking-widest uppercase flex items-center gap-1.5 transition-opacity"
              style={{ opacity: 1 - slideX / (trackRef.current ? trackRef.current.clientWidth - 72 : 200) }}
            >
              Slide to Escrow Pay
              <span className="inline-block animate-pulse">➔</span>
            </span>
          </div>

          {/* Grab handle */}
          <div
            ref={handleRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative z-10 w-14 h-14 bg-[#ff6600] rounded-full flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing transition-transform"
            style={{ transform: `translateX(${slideX}px)` }}
          >
            <Lock size={20} className="text-black stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Full screen success state overlay */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
          <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
            <div className="absolute w-24 h-24 bg-[#2e8b57]/20 rounded-full animate-ping"></div>
            <div className="relative w-20 h-20 bg-[#2e8b57] rounded-full flex items-center justify-center animate-scale-in">
              <Check size={40} className="text-white stroke-[3.5]" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">Payment Locked</h2>
          <p className="text-sm text-[#e3bfb1]/70 max-w-xs leading-relaxed">
            Funds are secured in escrow. Your errand is now being broadcast to professional runners.
          </p>
        </div>
      )}
    </div>
  );
};
