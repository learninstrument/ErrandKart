import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, PhoneCall, MessageCircle, ShieldCheck, AlertTriangle, Wallet, Clock, HeadphonesIcon } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { RunnerBottomNav } from './RunnerBottomNav';
import { ThemeSwitcher } from '../../components/UI/ThemeSwitcher';

const FAQS = [
  {
    id: 1,
    title: 'Payout not received',
    description: 'Transfers can take up to 10 minutes. Check your bank details in your profile settings.',
    icon: <Wallet size={18} />,
    accent: 'green',
  },
  {
    id: 2,
    title: 'Verification pending',
    description: 'KYC verification is reviewed within 24 hours. You\'ll receive a notification once approved.',
    icon: <ShieldCheck size={18} />,
    accent: 'green',
  },
  {
    id: 3,
    title: 'Customer dispute',
    description: 'Submit photos of receipts and item list to resolve disputes quickly. Our team reviews within 2 hours.',
    icon: <AlertTriangle size={18} />,
    accent: 'orange',
  },
];

const CONTACT_CHANNELS = [
  { label: 'Live chat', icon: <MessageCircle size={18} />, description: 'Avg. 2 min reply' },
  { label: 'Email', icon: <Mail size={18} />, description: 'support@errandkart.ng' },
  { label: 'Call', icon: <PhoneCall size={18} />, description: '0800-ERRAND' },
];

export const RunnerSupport: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full flex-col bg-white dark:bg-[#000000] text-black dark:text-white transition-colors duration-300">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/85 dark:bg-[#000000]/85 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all -ml-1">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-extrabold tracking-tight text-black dark:text-white">Help Center</h2>
        <ThemeSwitcher />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 lg:grid lg:items-start lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:px-10 lg:pb-10 animate-fade-in-up">
        <div className="flex flex-col gap-6">

          {/* Contact Section */}
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-market-green/10 text-market-green">
                <HeadphonesIcon size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">Contact Support</h3>
                <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">We're here to help 24/7</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {CONTACT_CHANNELS.map(ch => (
                <button key={ch.label} className="flex flex-col items-center gap-2 rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-4 text-center transition-all hover:border-market-green/30 hover:bg-market-green/5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-market-green/10 text-market-green">
                    {ch.icon}
                  </div>
                  <span className="text-sm font-bold text-black dark:text-white">{ch.label}</span>
                  <span className="text-[10px] text-black/40 dark:text-white/40">{ch.description}</span>
                </button>
              ))}
            </div>
          </section>

          {/* FAQ Items */}
          <section className="flex flex-col gap-4">
            <h3 className="px-1 text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">Common Issues</h3>
            {FAQS.map(item => (
              <div key={item.id} className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-xl backdrop-blur-md transition-all hover:border-black/10 dark:hover:border-white/10">
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${item.accent === 'green' ? 'bg-market-green/10 text-market-green' : 'bg-kart-orange/10 text-kart-orange'}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-black dark:text-white">{item.title}</h4>
                    <p className="mt-1.5 text-sm text-black/60 dark:text-white/60 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-6">
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-gradient-to-br from-market-green/10 to-transparent dark:from-market-green/5 dark:to-transparent p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <p className="text-xs font-bold uppercase tracking-widest text-market-green">Runner support</p>
            <h3 className="mt-2 text-xl font-black text-black dark:text-white">Fast payout support</h3>
            <p className="mt-2 text-sm text-black/60 dark:text-white/60 leading-relaxed">
              We resolve payout and verification issues quickly once details are confirmed.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Button theme="green" className="w-full gap-2 h-11" onClick={() => navigate('/runner/wallet')}>
                <Wallet size={16} /> Open wallet
              </Button>
              <Button variant="outline" className="w-full gap-2 h-11 border-black/10 dark:border-white/10" onClick={() => navigate('/runner/profile')}>
                <ShieldCheck size={16} /> Update verification
              </Button>
            </div>
          </section>

          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">Support SLA</h3>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Payout checks', value: '~10 min', icon: <Wallet size={14} /> },
                { label: 'KYC verification', value: '24 hrs', icon: <ShieldCheck size={14} /> },
                { label: 'Dispute resolution', value: '2 hrs', icon: <Clock size={14} /> },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-black/70 dark:text-white/70">
                    <span className="text-black/40 dark:text-white/40">{item.icon}</span>
                    {item.label}
                  </div>
                  <span className="text-xs font-black text-market-green">{item.value}</span>
                </div>
              ))}
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
