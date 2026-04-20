import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, Send, Paperclip, MapPin, Wallet, PackageCheck, Navigation } from 'lucide-react';
import { Button } from '../../components/UI/Button';

const INITIAL_MESSAGES = [
  { id: 1, from: 'customer', text: 'Please pick ripe bananas only.', time: '10:08 AM' },
  { id: 2, from: 'runner', text: 'Got it. I’ll update you before checkout.', time: '10:09 AM' },
  { id: 3, from: 'customer', text: 'Also add 2L almond milk.', time: '10:10 AM' },
];

export const RunnerChat: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [message, setMessage] = useState('');
  const displayOrderId = orderId ?? 'EK-4920';

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/60 transition-colors hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-black text-white">Customer Chat</h2>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">Order {displayOrderId}</p>
        </div>
        <Button variant="outline" className="gap-2 text-xs">
          <Phone size={14} className="text-white/70" /> Call
        </Button>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 md:grid md:grid-cols-[1.15fr_0.85fr] md:gap-8 md:px-10 md:pb-10">
        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:p-6">
          <div className="rounded-[22px] border border-white/10 bg-[#0f141f] p-4 text-xs text-white/60">
            <div className="flex items-center gap-2 text-white/70">
              <MapPin size={14} className="text-market-green" />
              Delivering to Lekki Phase 1 · 3.5 km away
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {INITIAL_MESSAGES.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.from === 'runner' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-[0_12px_28px_rgba(0,0,0,0.35)] ${
                    msg.from === 'runner'
                      ? 'bg-market-green text-white'
                      : 'bg-[#0f141f] text-white/85'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="mt-2 block text-[10px] uppercase tracking-[0.2em] text-white/60">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 hidden border-t border-white/10 pt-5 md:block">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
              <button className="text-white/60 hover:text-white">
                <Paperclip size={18} />
              </button>
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Type a message..."
                className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
              <button className="text-market-green hover:text-white">
                <Send size={18} />
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-6 md:hidden">
          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/70">Order Summary</h3>
              <span className="text-xs font-semibold text-white/50">{displayOrderId}</span>
            </div>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Wallet size={14} className="text-market-green" />
                Payout: ₦4,500
              </div>
              <div className="flex items-center gap-2">
                <PackageCheck size={14} className="text-market-green" />
                Items: 8 · Grocery pickup
              </div>
              <div className="flex items-center gap-2">
                <Navigation size={14} className="text-market-green" />
                Route: Shoprite → Eko Atlantic
              </div>
            </div>
            <Button theme="green" className="mt-5 w-full" onClick={() => navigate('/runner/active')}>
              Open active errand
            </Button>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-4">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                alt="Customer"
                className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Customer</p>
                <p className="text-lg font-bold text-white">Sarah Daniels</p>
                <p className="text-xs text-slate-400">+234 801 234 5678</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button variant="outline" className="w-full gap-2">
                <Phone size={16} className="text-white/70" /> Call
              </Button>
              <Button theme="green" className="w-full" onClick={() => navigate('/runner/support')}>
                Get help
              </Button>
            </div>
          </section>
        </div>

        <aside className="hidden flex-col gap-6 md:flex">
          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/70">Order Summary</h3>
              <span className="text-xs font-semibold text-white/50">{displayOrderId}</span>
            </div>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Wallet size={14} className="text-market-green" />
                Payout: ₦4,500
              </div>
              <div className="flex items-center gap-2">
                <PackageCheck size={14} className="text-market-green" />
                Items: 8 · Grocery pickup
              </div>
              <div className="flex items-center gap-2">
                <Navigation size={14} className="text-market-green" />
                Route: Shoprite → Eko Atlantic
              </div>
            </div>
            <Button theme="green" className="mt-5 w-full" onClick={() => navigate('/runner/active')}>
              Open active errand
            </Button>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-4">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                alt="Customer"
                className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Customer</p>
                <p className="text-lg font-bold text-white">Sarah Daniels</p>
                <p className="text-xs text-slate-400">+234 801 234 5678</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button variant="outline" className="w-full gap-2">
                <Phone size={16} className="text-white/70" /> Call
              </Button>
              <Button theme="green" className="w-full" onClick={() => navigate('/runner/support')}>
                Get help
              </Button>
            </div>
          </section>
        </aside>
      </main>

      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-3xl -translate-x-1/2 border-t border-white/5 bg-[#0d1117]/95 p-4 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#111722] px-4 py-2">
          <button className="text-white/60 hover:text-white">
            <Paperclip size={18} />
          </button>
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type a message..."
            className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
          <button className="text-market-green hover:text-white">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
