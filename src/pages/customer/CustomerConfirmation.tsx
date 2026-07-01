import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, ShieldCheck, Clock, RefreshCw, Radar, Home, HelpCircle } from 'lucide-react';
import { Button } from '../../components/UI/Button';

export const CustomerConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const errand = location.state?.errand;

  // Animation effect for entering items
  useEffect(() => {
    const timer = setTimeout(() => {
      // items can fade in
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!errand) {
    navigate('/customer/dashboard', { replace: true });
    return null;
  }

  const displayOrderId = `EK-${errand.id?.split('-')[0].toUpperCase() || '8829'}`;
  const runnerFee = Number(errand.budget_service_fee) || 0;
  const serviceFee = 700;
  const total = runnerFee + serviceFee;

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#0A0A0A] text-[#f8ddd2] overflow-x-hidden">
      {/* CSS checkmark animations */}
      <style>{`
        @keyframes stroke-anim {
          100% { stroke-dashoffset: 0; }
        }
        @keyframes scale-anim {
          0%, 100% { transform: none; }
          50% { transform: scale3d(1.1, 1.1, 1); }
        }
        @keyframes fill-anim {
          100% { box-shadow: inset 0px 0px 0px 50px #2e8b57; }
        }
        .checkmark-circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 2;
          stroke-miterlimit: 10;
          stroke: #7ed99e;
          fill: none;
          animation: stroke-anim 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .checkmark-svg {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          display: block;
          stroke-width: 2.5;
          stroke: #0A0A0A;
          stroke-miterlimit: 10;
          box-shadow: inset 0px 0px 0px #7ed99e;
          animation: fill-anim .4s ease-in-out .4s forwards, scale-anim .3s ease-in-out .9s both;
        }
        .checkmark-check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke-anim 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }
        .glow-pulse {
          animation: glow-pulse-keyframes 2.5s infinite ease-in-out;
        }
        @keyframes glow-pulse-keyframes {
          0%, 100% { box-shadow: 0 0 15px rgba(255, 102, 0, 0.25); }
          50% { box-shadow: 0 0 35px rgba(255, 102, 0, 0.55); }
        }
      `}</style>

      {/* Background blurs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-[#ff6600]/5 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-[#2e8b57]/5 blur-[100px]" />
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-[#0A0A0A]/85 px-6 py-4 backdrop-blur-xl">
        <div className="text-lg font-black tracking-tight text-[#ff6600]">ErrandKart</div>
        <div className="h-8 w-8 rounded-full border border-white/10 bg-[#0f0f0f] flex items-center justify-center overflow-hidden">
          <span className="text-xs text-[#ff6600] font-bold">EK</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-md flex-grow flex-col items-center justify-center px-6 pb-20 pt-8 animate-fade-in-up">
        <div className="w-full flex flex-col items-center space-y-6">
          
          {/* Animated checkmark svg */}
          <div className="relative flex items-center justify-center h-32 w-32">
            <svg className="checkmark-svg" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
              <circle className="checkmark-circle" cx="26" cy="26" fill="none" />
              <path className="checkmark-check" d="M14.1 27.2l7.1 7.2 16.7-16.8" fill="none" />
            </svg>
          </div>

          {/* Success Title */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">Errand Posted Successfully</h2>
            <p className="text-sm text-[#e3bfb1]/70 leading-relaxed max-w-[280px] mx-auto">
              Your request is live. Professional runners in your area have been notified.
            </p>
          </div>

          {/* Bento Card 1: Order Reference */}
          <div className="w-full rounded-3xl border border-white/5 bg-[#0f0f0f]/80 p-6 flex flex-col items-center text-center shadow-lg backdrop-blur-md">
            <span className="text-[10px] font-black tracking-widest text-[#aa8a7d] uppercase">Order Reference</span>
            <div className="text-3xl font-black text-[#ff6600] tracking-tighter mt-1">{displayOrderId}</div>
            <div className="mt-4 w-full h-[1px] bg-white/5"></div>
            <div className="mt-4 flex items-center gap-2 text-[#7ed99e] text-xs">
              <ShieldCheck size={16} />
              <span className="font-semibold">Escrow Secured (₦{total.toLocaleString()})</span>
            </div>
          </div>

          {/* Bento Card 2: Routing / Details */}
          <div className="w-full rounded-2xl border border-white/5 bg-[#0f0f0f]/80 p-5 shadow-lg backdrop-blur-md">
            <span className="text-[10px] font-black tracking-widest text-[#aa8a7d] uppercase flex items-center gap-1.5">
              <MapPin size={12} className="text-[#ff6600]" /> Route Details
            </span>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex gap-2">
                <span className="text-[#e3bfb1]/50 font-bold w-12">Pickup:</span>
                <span className="text-white font-medium truncate flex-grow text-left">{errand.pickup_address}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#e3bfb1]/50 font-bold w-12">Dropoff:</span>
                <span className="text-white font-medium truncate flex-grow text-left">{errand.dropoff_address}</span>
              </div>
            </div>
          </div>

          {/* Bento Card 3: Status and Pickup Estimate */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="rounded-2xl border border-white/5 bg-[#0f0f0f]/80 p-4 shadow-lg backdrop-blur-md">
              <span className="text-[10px] font-black tracking-widest text-[#aa8a7d] uppercase flex items-center gap-1">
                <Clock size={11} className="text-[#ff6600]" /> Est. Match
              </span>
              <p className="text-base font-extrabold text-white mt-1.5">Under 5m</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#0f0f0f]/80 p-4 shadow-lg backdrop-blur-md">
              <span className="text-[10px] font-black tracking-widest text-[#aa8a7d] uppercase flex items-center gap-1">
                <RefreshCw size={11} className="text-[#7ed99e] animate-spin" style={{ animationDuration: '3s' }} /> Matching
              </span>
              <p className="text-base font-extrabold text-[#7ed99e] mt-1.5">Active</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="w-full space-y-3 pt-4">
            <Button
              onClick={() => navigate('/customer/track')}
              className="w-full h-14 bg-[#ff6600] text-black font-extrabold text-base rounded-2xl flex items-center justify-center gap-2 hover:bg-[#ff6600]/90 transition-transform active:scale-95 glow-pulse border-none"
            >
              <Radar size={18} />
              <span>Track Errand Live</span>
            </Button>
            
            <button
              onClick={() => navigate('/customer/dashboard')}
              className="w-full h-14 border border-white/10 text-white hover:bg-white/5 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Home size={16} />
              <span>Back to Dashboard</span>
            </button>
          </div>

        </div>
      </main>

      {/* Decorative footer snippet */}
      <footer className="fixed bottom-0 left-0 w-full h-16 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent"></div>
      </footer>
    </div>
  );
};
