import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, PhoneCall, MessageCircle, ShieldCheck, AlertTriangle, Wallet } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { RunnerBottomNav } from './RunnerBottomNav';

const FAQS = [
  {
    id: 1,
    title: 'Payout not received',
    description: 'Transfers can take up to 10 minutes. Check your bank details in profile.',
    icon: <Wallet size={18} />,
  },
  {
    id: 2,
    title: 'Verification pending',
    description: 'KYC verification is reviewed within 24 hours.',
    icon: <ShieldCheck size={18} />,
  },
  {
    id: 3,
    title: 'Customer dispute',
    description: 'Submit photos of receipts and item list to resolve disputes quickly.',
    icon: <AlertTriangle size={18} />,
  },
];

export const RunnerSupport: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/60 transition-colors hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-white">Help Center</h2>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 md:px-10 md:pb-10">
        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <h3 className="text-sm font-black tracking-[0.2em] text-white/70">CONTACT SUPPORT</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Button variant="outline" className="gap-2">
              <MessageCircle size={16} className="text-white/70" /> Live chat
            </Button>
            <Button variant="outline" className="gap-2">
              <Mail size={16} className="text-white/70" /> Email us
            </Button>
            <Button variant="outline" className="gap-2">
              <PhoneCall size={16} className="text-white/70" /> Call support
            </Button>
          </div>
        </section>

        <section className="grid gap-3">
          {FAQS.map(item => (
            <div
              key={item.id}
              className="rounded-[24px] border border-white/10 bg-[#111722] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.35)]"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-market-green/15 text-market-green">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      <div className="md:hidden">
        <RunnerBottomNav activeTab="profile" />
      </div>
    </div>
  );
};
