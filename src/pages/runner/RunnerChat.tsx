import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, Send, Paperclip, MapPin } from 'lucide-react';
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

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/60 transition-colors hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-black text-white">Customer Chat</h2>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">Order {orderId}</p>
        </div>
        <Button variant="outline" className="gap-2 text-xs">
          <Phone size={14} className="text-white/70" /> Call
        </Button>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 pb-28 pt-6 md:px-10 md:pb-10">
        <div className="rounded-[24px] border border-white/10 bg-[#111722] p-4 text-xs text-white/60">
          <div className="flex items-center gap-2 text-white/70">
            <MapPin size={14} className="text-market-green" />
            Delivering to Lekki Phase 1 · 3.5 km away
          </div>
        </div>

        <div className="flex flex-col gap-3">
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
      </main>

      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-3xl -translate-x-1/2 border-t border-white/5 bg-[#0d1117]/95 p-4 backdrop-blur-md md:p-6">
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
