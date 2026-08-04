import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Shield, Check, Info, Lock, Wallet as WalletIcon, CreditCard, HelpCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/UI/Button';

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

export const CustomerCheckout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const errand = location.state?.errand;
  
  const [priority, setPriority] = useState(false);
  const [promo, setPromo] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [payError, setPayError] = useState('');

  // Slide-to-Pay State
  const [slideX, setSlideX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

  const apiBaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL ?? 'http://localhost:4000');

  // Fetch wallet balance
  useEffect(() => {
    fetch(`${apiBaseUrl}/api/wallet/balance`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setWalletBalance(data.wallet_balance ?? 0))
      .catch(() => setWalletBalance(0));
  }, [apiBaseUrl]);

  // Load Paystack Inline JS
  useEffect(() => {
    if (document.getElementById('paystack-script')) return;
    const script = document.createElement('script');
    script.id = 'paystack-script';
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  if (!errand) {
    navigate('/customer/post-errand', { replace: true });
    return null;
  }

  const serviceFee = 700;
  const runnerFee = Number(errand.budget_service_fee) || 0;
  const priorityFee = priority ? 500 : 0;
  const discount = promoApplied ? 1000 : 0;
  const total = Math.max(0, serviceFee + runnerFee + priorityFee - discount);

  const processWalletPayment = async () => {
    setIsProcessing(true);
    setPayError('');

    if (walletBalance !== null && walletBalance < total) {
      setPayError('Insufficient wallet balance. Please top up or use Paystack.');
      setIsProcessing(false);
      setSlideX(0);
      return;
    }

    try {
      // For wallet payments, we directly create an escrow hold
      const res = await fetch(`${apiBaseUrl}/api/payments/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: total,
          errand_id: errand.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to process wallet payment');

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/customer/confirmation', { state: { errand } });
      }, 2200);
    } catch (err: any) {
      setPayError(err.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
      setSlideX(0);
    }
  };

  // Drag Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isSuccess || isProcessing) return;
    setIsDragging(true);
    startXRef.current = e.clientX - slideX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isSuccess || isProcessing) return;
    if (!trackRef.current || !handleRef.current) return;
    const maxSlide = trackRef.current.clientWidth - handleRef.current.clientWidth - 8;
    const x = e.clientX - startXRef.current;
    const newX = Math.max(0, Math.min(x, maxSlide));
    setSlideX(newX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isSuccess || isProcessing) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (!trackRef.current || !handleRef.current) return;
    const maxSlide = trackRef.current.clientWidth - handleRef.current.clientWidth - 8;

    if (slideX >= maxSlide * 0.85) {
      setSlideX(maxSlide);
      processWalletPayment();
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

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white dark:bg-[#000000] text-black dark:text-white overflow-x-hidden transition-colors duration-300">
      {/* Top Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/85 dark:bg-[#000000]/85 px-6 py-4 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-95">
          <ArrowLeft size={18} className="text-kart-orange" />
        </button>
        <h1 className="text-lg font-extrabold tracking-tight text-black dark:text-white">Payment</h1>
        <div className="w-10" />
      </header>

      {/* Main Form content */}
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 pb-44 pt-6 animate-fade-in-up">
        {/* Secure Escrow Header Card */}
        <section className="relative overflow-hidden rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
          <div className="absolute top-0 left-0 h-[3px] w-full bg-kart-orange/40 animate-shimmer"></div>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-extrabold text-kart-orange tracking-tight">Secure Escrow Payment</h2>
              <p className="text-xs text-black/50 dark:text-white/50 mt-1">Transaction: #EK-{errand.id?.split('-')[0].toUpperCase() || 'NEW'}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-market-green/20 text-market-green">
              <Shield size={20} className="fill-market-green/20" />
            </div>
          </div>

          <div className="mt-5 border-y border-black/5 dark:border-white/5 py-4 flex gap-4 items-center">
            <div className="h-14 w-14 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center overflow-hidden">
              <span className="text-kart-orange font-black text-xs">EK</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-black dark:text-white">Premium Errand Courier</h3>
              <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">Budgeted Runner Service</p>
            </div>
            <div className="text-right">
              <p className="text-base font-extrabold text-black dark:text-white">₦{runnerFee.toLocaleString()}</p>
            </div>
          </div>

          {/* Pricing breakdown */}
          <div className="mt-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-black/60 dark:text-white/60">Runner fee</span>
              <span className="font-semibold text-black dark:text-white">₦{runnerFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-black/60 dark:text-white/60">Service fee</span>
              <span className="font-semibold text-black dark:text-white">₦{serviceFee.toLocaleString()}</span>
            </div>
            {priority && (
              <div className="flex justify-between text-sm">
                <span className="text-black/60 dark:text-white/60">Priority dispatch</span>
                <span className="font-semibold text-black dark:text-white">₦{priorityFee.toLocaleString()}</span>
              </div>
            )}
            {promoApplied && (
              <div className="flex justify-between text-sm text-market-green">
                <span>Promo discount</span>
                <span className="font-semibold">-₦1,000</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-dashed border-black/10 dark:border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-black/80 dark:text-white/80 font-bold">Escrow Guarantee Hold</span>
                <span title="Secured during task, fully released to runner upon completion">
                  <Info size={13} className="text-kart-orange" />
                </span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70">Verified</span>
            </div>
          </div>

          {/* Final amount */}
          <div className="mt-5 pt-4 border-t border-black/10 dark:border-white/10 flex justify-between items-center">
            <span className="text-base font-bold text-black dark:text-white">Total Amount</span>
            <span className="text-2xl font-black text-kart-orange">₦{total.toLocaleString()}</span>
          </div>
        </section>

        {/* Priority Boost Option */}
        <section className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">Priority Delivery Handling</h4>
              <p className="mt-1 text-xs text-black/50 dark:text-white/50">Broadcast to runners as top priority (increases matching speed)</p>
            </div>
            <button
              type="button"
              onClick={() => setPriority(!priority)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                priority ? 'bg-kart-orange' : 'bg-black/10 dark:bg-white/10'
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
          <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40 mb-3 px-1">Payment Method</h3>
          <div className="flex flex-col gap-3">
            <div
              className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all backdrop-blur-md border-kart-orange/40 bg-kart-orange/10 text-black dark:text-white ring-1 ring-kart-orange/40`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full transition-all bg-kart-orange/20 text-kart-orange">
                <WalletIcon size={20} />
              </div>
              <div className="flex-grow">
                <p className="text-sm font-bold">ErrandKart Wallet</p>
                <p className="text-xs text-black/50 dark:text-white/50">
                  Balance: {walletBalance !== null ? `₦${walletBalance.toLocaleString()}` : 'Loading...'}
                </p>
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-kart-orange">
                <Check size={14} className="text-black stroke-[3]" />
              </div>
            </div>
          </div>
        </section>

        {/* Promo Code */}
        <section className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-lg backdrop-blur-md">
          <h4 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40 mb-3">Promo Code</h4>
          <div className="flex gap-3">
            <input
              type="text"
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="Enter promo code"
              disabled={promoApplied}
              className="flex-grow rounded-xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-black/40 px-4 py-3 text-xs text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-none focus:border-kart-orange/40 disabled:opacity-50"
            />
            <Button
              variant="outline"
              onClick={applyPromo}
              disabled={promoApplied}
              className="border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
            >
              {promoApplied ? 'Applied' : 'Apply'}
            </Button>
          </div>
        </section>

        {/* Error display */}
        {payError && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-500">
            {payError}
          </div>
        )}

        {/* Support Link */}
        <section className="flex gap-3 rounded-2xl border border-market-green/20 bg-market-green/5 p-4 items-center">
          <HelpCircle size={18} className="text-market-green" />
          <p className="text-xs text-black/80 dark:text-white/80">
            Funds are held in a secure escrow vault. Payment is only released to the Runner once you confirm the task is complete.
          </p>
        </section>
      </main>

      {/* Bottom sliding Action Sheet */}
      <div className="fixed bottom-0 left-0 w-full z-40 border-t border-black/5 dark:border-white/5 bg-white/95 dark:bg-[#000000]/90 backdrop-blur-xl px-6 pt-4 pb-8 max-w-lg left-1/2 -translate-x-1/2 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-2xl rounded-t-[32px]">
        <div className="w-12 h-1 bg-black/10 dark:bg-white/10 rounded-full mx-auto mb-5"></div>
        <div className="flex justify-between items-center mb-5 px-1">
          <div>
            <p className="text-xs text-black/50 dark:text-white/50">Confirming payment of</p>
            <p className="text-lg font-black text-black dark:text-white">₦{total.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-black/50 dark:text-white/50">Wallet Pay</p>
            <div className="flex items-center gap-1 text-xs font-bold text-market-green mt-0.5 justify-end">
              <Lock size={12} /> Secured
            </div>
          </div>
        </div>

        {walletBalance !== null && walletBalance < total ? (
          <Button theme="green" className="w-full h-[64px] rounded-2xl text-lg font-bold" onClick={() => navigate('/customer/wallet')}>
            Top Up Wallet (₦{(total - walletBalance).toLocaleString()} Short)
          </Button>
        ) : (
          {/* Slide Button */}
          <div
            ref={trackRef}
            id="slide-track"
            className="relative w-full h-[64px] bg-black/5 dark:bg-white/5 rounded-full p-1 border border-black/10 dark:border-white/10 overflow-hidden slide-to-pay group touch-none"
          >
            {/* Progress bar */}
            <div
              className="absolute top-0 left-0 h-full bg-kart-orange/20 transition-all duration-75"
              style={{ width: `${slideX + 56}px` }}
            />

            {/* Prompt text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span
                className="text-xs font-bold text-kart-orange tracking-widest uppercase flex items-center gap-1.5 transition-opacity"
                style={{ opacity: 1 - slideX / 200 }}
              >
                {isProcessing ? (
                  <><Loader2 size={14} className="animate-spin" /> Processing...</>
                ) : (
                  <>Slide to Escrow Pay <span className="inline-block animate-pulse">➔</span></>
                )}
              </span>
            </div>

            {/* Grab handle */}
            <div
              ref={handleRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`relative z-10 w-14 h-14 bg-kart-orange rounded-full flex items-center justify-center shadow-lg transition-transform ${isProcessing ? 'cursor-not-allowed opacity-70' : 'cursor-grab active:cursor-grabbing'}`}
              style={{ transform: `translateX(${slideX}px)` }}
            >
              {isProcessing ? <Loader2 size={20} className="text-black animate-spin" /> : <Lock size={20} className="text-black stroke-[2.5]" />}
            </div>
          </div>
        )}
      </div>

      {/* Full screen success state overlay */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 bg-white/95 dark:bg-[#000000]/95 flex flex-col items-center justify-center p-6 text-center animate-fade-in-up backdrop-blur-md">
          <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
            <div className="absolute w-24 h-24 bg-market-green/20 rounded-full animate-ping"></div>
            <div className="relative w-20 h-20 bg-market-green rounded-full flex items-center justify-center animate-scale-in">
              <Check size={40} className="text-white dark:text-black stroke-[3.5]" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-black dark:text-white tracking-tight mb-2">Payment Locked</h2>
          <p className="text-sm text-black/70 dark:text-white/70 max-w-xs leading-relaxed">
            Funds are secured in escrow. Your errand is now being broadcast to professional runners.
          </p>
        </div>
      )}
    </div>
  );
};
