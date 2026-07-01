import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, PhoneCall, MessageCircle, CreditCard, Package, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { BottomNav } from './BottomNav';

const FAQS = [
  {
    id: 1,
    title: 'Payment failed or pending',
    description: 'Retry your payment or switch cards. Pending payments clear in 5-10 minutes.',
    icon: <CreditCard size={18} />,
  },
  {
    id: 2,
    title: 'Order delayed',
    description: 'Check your runner’s live status or send a quick chat for an ETA update.',
    icon: <Package size={18} />,
  },
  {
    id: 3,
    title: 'Refund or dispute',
    description: 'We review disputes within 24 hours. Submit your order ID to start.',
    icon: <AlertTriangle size={18} />,
  },
];

export const CustomerSupport: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full flex-col bg-white dark:bg-[#000000] text-black dark:text-white transition-colors duration-300">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/85 dark:bg-[#000000]/85 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-black/60 dark:text-white/60 transition-colors hover:text-black dark:hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-extrabold tracking-tight text-black dark:text-white">Help Center</h2>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 lg:grid lg:items-start lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:px-10 lg:pb-10 animate-fade-in-up">
        <div className="flex flex-col gap-6">
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-kart-orange/5 blur-3xl"></div>
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">CONTACT SUPPORT</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3 relative z-10">
              <Button variant="outline" className="gap-2 h-12 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5">
                <MessageCircle size={16} className="text-black/50 dark:text-white/50" /> Live chat
              </Button>
              <Button variant="outline" className="gap-2 h-12 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5">
                <Mail size={16} className="text-black/50 dark:text-white/50" /> Email us
              </Button>
              <Button variant="outline" className="gap-2 h-12 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5">
                <PhoneCall size={16} className="text-black/50 dark:text-white/50" /> Call support
              </Button>
            </div>
          </section>

          <section className="grid gap-3">
            {FAQS.map(item => (
              <div
                key={item.id}
                className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md transition-all hover:scale-[1.01]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-kart-orange/10 text-kart-orange">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-black dark:text-white">{item.title}</h4>
                    <p className="mt-1 text-sm text-black/60 dark:text-white/60">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md lg:hidden">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50">Need help now?</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-black dark:text-white">We reply fast</h3>
            <p className="mt-2 text-sm text-black/60 dark:text-white/60">
              Most requests are resolved in under 10 minutes during business hours.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Button className="w-full gap-2 h-12 font-bold shadow-[0_4px_20px_rgba(255,102,0,0.2)]" onClick={() => navigate('/customer/track')}>
                <Package size={16} className="text-white" /> View live errand
              </Button>
              <Button variant="outline" className="w-full gap-2 h-12 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/customer/orders')}>
                <CreditCard size={16} className="text-black/50 dark:text-white/50" /> View activity
              </Button>
            </div>
          </section>

          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md lg:hidden">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">SUPPORT STATUS</h3>
            <div className="mt-4 space-y-3 text-sm text-black/70 dark:text-white/70">
              <div className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-3.5">
                <span>Avg response</span>
                <span className="font-bold text-black dark:text-white">2 min</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-3.5">
                <span>Dispute review</span>
                <span className="font-bold text-black dark:text-white">24 hrs</span>
              </div>
            </div>
          </section>
        </div>

        <aside className="hidden flex-col gap-6 lg:flex sticky top-24">
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50">Need help now?</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-black dark:text-white">We reply fast</h3>
            <p className="mt-2 text-sm text-black/60 dark:text-white/60">
              Most requests are resolved in under 10 minutes during business hours.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Button className="w-full gap-2 h-12 font-bold shadow-[0_4px_20px_rgba(255,102,0,0.2)]" onClick={() => navigate('/customer/track')}>
                <Package size={16} className="text-white" /> View live errand
              </Button>
              <Button variant="outline" className="w-full gap-2 h-12 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/customer/orders')}>
                <CreditCard size={16} className="text-black/50 dark:text-white/50" /> View activity
              </Button>
            </div>
          </section>

          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">SUPPORT STATUS</h3>
            <div className="mt-4 space-y-3 text-sm text-black/70 dark:text-white/70">
              <div className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-3.5">
                <span>Avg response</span>
                <span className="font-bold text-black dark:text-white">2 min</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-3.5">
                <span>Dispute review</span>
                <span className="font-bold text-black dark:text-white">24 hrs</span>
              </div>
            </div>
          </section>
        </aside>
      </main>

      <div className="md:hidden">
        <BottomNav activeTab="profile" />
      </div>
    </div>
  );
};
