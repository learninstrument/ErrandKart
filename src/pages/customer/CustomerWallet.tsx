import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, ArrowUpRight, ArrowDownLeft, Plus, FileText, LifeBuoy, MapPin } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { BottomNav } from './BottomNav';

export const CustomerWallet: React.FC = () => {
  const navigate = useNavigate();

  const transactions = [
    { id: 1, title: 'Wallet Top Up', date: 'Today · 11:20 AM', amount: '+₦15,000', type: 'credit' },
    { id: 2, title: 'Errand Payment', date: 'Yesterday · 6:12 PM', amount: '-₦4,500', type: 'debit' },
    { id: 3, title: 'Wallet Top Up', date: 'Apr 15 · 2:05 PM', amount: '+₦10,000', type: 'credit' },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-white dark:bg-[#000000] text-black dark:text-white transition-colors duration-300">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/85 dark:bg-[#000000]/85 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-black/60 dark:text-white/60 transition-colors hover:text-black dark:hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-extrabold tracking-tight text-black dark:text-white">Wallet</h2>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 lg:grid lg:items-start lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:px-10 lg:pb-10 animate-fade-in-up">
        <div className="flex flex-col gap-6">
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-[#0A0A0A] p-6 text-black dark:text-white shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)] relative overflow-hidden">
            {/* Subtle background glow effect */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-kart-orange/10 blur-3xl"></div>
            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-black/50 dark:text-white/50">Available Balance</p>
                <h3 className="mt-2 text-4xl font-black tracking-tight text-black dark:text-white">₦48,200</h3>
                <p className="mt-2 text-sm text-black/70 dark:text-white/70">Top up to start new errands instantly.</p>
              </div>
              <Button className="gap-2 h-12 px-6 shadow-[0_4px_20px_rgba(255,102,0,0.2)]">
                <Plus size={16} /> Top Up Wallet
              </Button>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-2">
            <div className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-kart-orange/10 text-kart-orange">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50">Funding method</p>
                  <p className="text-sm font-bold text-black dark:text-white mt-0.5">Paystack Checkout</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-market-green/10 text-market-green">
                  <ArrowUpRight size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50">Escrow</p>
                  <p className="text-sm font-bold text-black dark:text-white mt-0.5">₦6,500 pending</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <h3 className="mb-4 text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">TRANSACTIONS</h3>
            <div className="space-y-3">
              {transactions.map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-4 transition-all hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        tx.type === 'credit' ? 'bg-market-green/10 text-market-green' : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black dark:text-white">{tx.title}</p>
                      <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">{tx.date}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${tx.type === 'credit' ? 'text-market-green' : 'text-red-500'}`}>
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md lg:hidden">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">WALLET ACTIONS</h3>
            <div className="mt-4 flex flex-col gap-3">
              <Button className="w-full gap-2 h-12 font-bold shadow-[0_4px_20px_rgba(255,102,0,0.2)]">
                <Plus size={16} /> Top up wallet
              </Button>
              <Button variant="outline" className="w-full gap-2 h-12 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/customer/orders')}>
                <FileText size={16} className="text-black/50 dark:text-white/50" /> View activity
              </Button>
              <Button variant="outline" className="w-full gap-2 h-12 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/customer/support')}>
                <LifeBuoy size={16} className="text-black/50 dark:text-white/50" /> Contact support
              </Button>
            </div>
          </section>

          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md lg:hidden">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">SPENDING SNAPSHOT</h3>
            <div className="mt-4 space-y-3 text-sm text-black/70 dark:text-white/70">
              <div className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-3.5">
                <span>This month</span>
                <span className="font-bold text-black dark:text-white">₦12,700</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-3.5">
                <span>Pending escrow</span>
                <span className="font-bold text-black dark:text-white">₦6,500</span>
              </div>
            </div>
            <Button variant="outline" className="mt-4 w-full gap-2 h-12 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/customer/track')}>
              <MapPin size={16} className="text-kart-orange" /> Track active errand
            </Button>
          </section>
        </div>

        <aside className="hidden flex-col gap-6 lg:flex sticky top-24">
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">WALLET ACTIONS</h3>
            <div className="mt-4 flex flex-col gap-3">
              <Button className="w-full gap-2 h-12 font-bold shadow-[0_4px_20px_rgba(255,102,0,0.2)]">
                <Plus size={16} /> Top up wallet
              </Button>
              <Button variant="outline" className="w-full gap-2 h-12 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/customer/orders')}>
                <FileText size={16} className="text-black/50 dark:text-white/50" /> View activity
              </Button>
              <Button variant="outline" className="w-full gap-2 h-12 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/customer/support')}>
                <LifeBuoy size={16} className="text-black/50 dark:text-white/50" /> Contact support
              </Button>
            </div>
          </section>

          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">SPENDING SNAPSHOT</h3>
            <div className="mt-4 space-y-3 text-sm text-black/70 dark:text-white/70">
              <div className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-3.5">
                <span>This month</span>
                <span className="font-bold text-black dark:text-white">₦12,700</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-3.5">
                <span>Pending escrow</span>
                <span className="font-bold text-black dark:text-white">₦6,500</span>
              </div>
            </div>
            <Button variant="outline" className="mt-4 w-full gap-2 h-12 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/customer/track')}>
              <MapPin size={16} className="text-kart-orange" /> Track active errand
            </Button>
          </section>
        </aside>
      </main>

      <div className="md:hidden">
        <BottomNav activeTab="wallet" />
      </div>
    </div>
  );
};
