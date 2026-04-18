import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MessageSquare, CheckCircle, Circle, Navigation } from 'lucide-react';
import { Button } from '../../components/UI/Button';

export const TrackErrand: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    { title: 'Errand Posted', subtitle: 'Request sent to ErrandKart', completed: true },
    { title: 'Runner Assigned', subtitle: 'Michael B. accepted your errand', completed: true },
    { title: 'On the way', subtitle: 'Runner is heading to pickup', completed: true, active: true },
    { title: 'Completed', subtitle: 'Awaiting drop-off', completed: false },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <header className="sticky top-0 z-30 hidden border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:block md:px-10">
        <div className="flex items-center gap-10">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex cursor-pointer items-center gap-2" onClick={() => navigate('/customer/dashboard')}>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-kart-orange text-xs font-black text-white">
                K
              </div>
              <h1 className="text-xl font-black tracking-tight text-white">
                Errand<span className="text-kart-orange">Kart</span>
              </h1>
            </div>
            <div className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 font-bold text-white md:flex">
              SD
            </div>
          </div>
        </div>
      </header>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:hidden">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/60 transition-colors hover:text-kart-orange">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-white">Errand Status</h2>
        <div className="w-8"></div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6 pb-10 md:flex-row md:p-10">
        <div className="flex w-full flex-col md:w-2/3">
          <div className="z-10 flex items-center justify-between rounded-t-[28px] border border-b-0 border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:p-8">
            <div>
              <h3 className="mb-1 text-xl font-black text-white md:text-2xl">Grocery Pickup</h3>
              <p className="text-sm font-medium text-slate-400">Order #EK-4920</p>
            </div>
            <span className="rounded-full border border-kart-orange/40 bg-kart-orange/15 px-4 py-2 text-xs font-bold uppercase tracking-wide text-kart-orange md:text-sm">
              In Progress
            </span>
          </div>

          <div className="relative h-[42vh] w-full overflow-hidden rounded-b-[28px] border border-white/10 bg-[#0f141f] md:h-[64vh]">
            <div
              className="absolute inset-0 opacity-35"
              style={{ backgroundImage: 'radial-gradient(#1f2937 1px, transparent 1px)', backgroundSize: '22px 22px' }}
            ></div>
            <div className="absolute left-[24%] top-[28%] flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/60 bg-white/10 shadow-lg">
              <div className="h-2.5 w-2.5 rounded-full bg-white"></div>
            </div>
            <div className="absolute left-1/2 top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 animate-bounce items-center justify-center rounded-full border-2 border-white/70 bg-kart-orange shadow-xl">
              <Navigation size={20} className="rotate-45 fill-current text-white" />
            </div>
            <svg className="pointer-events-none absolute inset-0 h-full w-full">
              <path
                d="M 24% 28% Q 50% 28% 50% 50%"
                stroke="#FF6600"
                strokeWidth="3"
                fill="none"
                strokeDasharray="10,6"
                className="animate-pulse"
              />
            </svg>
          </div>
        </div>

        <aside className="-mt-6 z-20 flex w-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#111722] shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:mt-0 md:w-1/3">
          <div className="flex-1 p-6 md:p-8">
            <h4 className="mb-6 text-lg font-bold text-white">Activity History</h4>
            <div className="relative space-y-8 pl-2">
              <div className="absolute bottom-6 left-[15px] top-2 w-0.5 bg-white/10"></div>
              {steps.map((step, index) => (
                <div key={index} className="flex gap-6 relative z-10">
                  <div className="flex-shrink-0 bg-[#111722]">
                    {step.completed ? (
                      <CheckCircle size={24} className="fill-kart-orange/20 text-kart-orange" />
                    ) : (
                      <Circle size={24} className="text-white/20" />
                    )}
                  </div>
                  <div className="-mt-1">
                    <h5 className={`font-bold ${step.active ? 'text-kart-orange' : step.completed ? 'text-white' : 'text-white/40'}`}>
                      {step.title}
                    </h5>
                    <p className={`mt-1 text-xs ${step.active ? 'text-white/70 font-medium' : 'text-slate-400'}`}>{step.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#0f141f] p-6 pb-10 md:p-8 md:pb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
                  alt="Runner"
                  className="h-14 w-14 rounded-2xl border-2 border-white/10 bg-white/5 shadow-sm"
                />
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Runner</p>
                  <h4 className="text-lg font-black leading-tight text-white">Michael B.</h4>
                  <div className="mt-1 flex items-center text-xs font-medium text-slate-400">⭐ 4.9 (120 trips)</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth className="gap-2 py-3">
                <Phone size={18} className="text-white/80" /> Call
              </Button>
              <Button theme="green" fullWidth className="gap-2 py-3">
                <MessageSquare size={18} /> Chat
              </Button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};
