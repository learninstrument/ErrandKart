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

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 md:grid md:grid-cols-[1.15fr_0.85fr] md:gap-8 md:px-10 md:pb-10">
        <div className="flex flex-col gap-6">
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

          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Runner help</p>
            <h3 className="mt-3 text-xl font-black text-white">Fast payout support</h3>
            <p className="mt-2 text-sm text-white/70">
              We can resolve payout and verification issues quickly once details are confirmed.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Button theme="green" className="w-full gap-2" onClick={() => navigate('/runner/wallet')}>
                <Wallet size={16} /> Open wallet
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/runner/profile')}>
                <ShieldCheck size={16} className="text-white/70" /> Update verification
              </Button>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 text-sm text-white/70 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:hidden">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">SUPPORT STATUS</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
                <span>Payout checks</span>
                <span className="font-semibold text-white">10 min</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
                <span>Verification review</span>
                <span className="font-semibold text-white">24 hrs</span>
              </div>
            </div>
          </section>
        </div>

        <aside className="hidden flex-col gap-6 md:flex">
          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Runner help</p>
            <h3 className="mt-3 text-xl font-black text-white">Fast payout support</h3>
            <p className="mt-2 text-sm text-white/70">
              We can resolve payout and verification issues quickly once details are confirmed.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Button theme="green" className="w-full gap-2" onClick={() => navigate('/runner/wallet')}>
                <Wallet size={16} /> Open wallet
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/runner/profile')}>
                <ShieldCheck size={16} className="text-white/70" /> Update verification
              </Button>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 text-sm text-white/70 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">SUPPORT STATUS</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
                <span>Payout checks</span>
                <span className="font-semibold text-white">10 min</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
                <span>Verification review</span>
                <span className="font-semibold text-white">24 hrs</span>
              </div>
            </div>
          </section>
        </aside>
      </main>

      <div className="md:hidden">
        <RunnerBottomNav activeTab="profile" />
      </div>
    </div>
  );
};
