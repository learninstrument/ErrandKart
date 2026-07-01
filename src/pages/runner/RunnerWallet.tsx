import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Wallet, Banknote, TrendingUp, LifeBuoy, User } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { RunnerBottomNav } from './RunnerBottomNav';

export const RunnerWallet: React.FC = () => {
  const navigate = useNavigate();

  const transactions = [
    { id: 1, title: 'Errand Payout', date: 'Today · 1:24 PM', amount: '+₦3,800', type: 'credit' },
    { id: 2, title: 'Withdrawal', date: 'Apr 16 · 9:40 AM', amount: '-₦10,000', type: 'debit' },
    { id: 3, title: 'Errand Payout', date: 'Apr 15 · 7:12 PM', amount: '+₦5,200', type: 'credit' },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-white dark:bg-[#000000] text-black dark:text-white transition-colors duration-300">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/85 dark:bg-[#000000]/85 px-6 py-4 backdrop-blur-md lg:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-black/60 dark:text-white/60 transition-colors hover:text-black dark:hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-extrabold tracking-tight text-black dark:text-white">Runner Wallet</h2>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:px-10 lg:pb-10 animate-fade-in-up">
        <div className="flex flex-col gap-6">
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-gradient-to-br from-black/5 via-black/10 to-black/5 dark:from-[#0A0A0A] dark:via-[#111111] dark:to-[#050505] p-6 text-black dark:text-white shadow-[0_24px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50">Available for Withdrawal</p>
                <h3 className="mt-3 text-3xl font-black tracking-tighter text-black dark:text-white">₦26,400</h3>
                <p className="mt-2 text-sm font-semibold text-black/60 dark:text-white/70">Withdraw anytime to your bank account.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button theme="green" className="gap-2 shadow-[0_4px_15px_rgba(46,139,87,0.2)]">
                  <Banknote size={16} /> Withdraw
                </Button>
                <Button variant="outline" className="gap-2 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/runner/earnings')}>
                  View analytics
                </Button>
              </div>
            </div>
          </section>

          <section className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-market-green/15 text-market-green shadow-inner">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/60">Pending Escrow</p>
                  <p className="text-base font-black text-black dark:text-white">₦7,500</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-black/5 dark:bg-white/10 text-black/70 dark:text-white shadow-inner">
                  <Banknote size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/60">Payout Account</p>
                  <p className="text-sm font-bold text-black dark:text-white">GTBank · 0123456789</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/runner/profile')}
                className="mt-4 text-[10px] font-black uppercase tracking-wider text-market-green hover:underline"
              >
                Update in profile
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <h3 className="mb-4 text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">TRANSACTIONS</h3>
            <div className="space-y-3">
              {transactions.map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-[#121212] px-4 py-3.5 transition-colors hover:border-black/10 dark:hover:border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-[14px] shadow-inner ${
                        tx.type === 'credit' ? 'bg-market-green/15 text-market-green' : 'bg-red-500/15 text-red-500 dark:text-red-400'
                      }`}
                    >
                      {tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black dark:text-white">{tx.title}</p>
                      <p className="text-xs font-semibold text-black/50 dark:text-white/50">{tx.date}</p>
                    </div>
                  </div>
                  <span className={`text-base font-black ${tx.type === 'credit' ? 'text-market-green' : 'text-red-500 dark:text-red-400'}`}>
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-md lg:hidden">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">PAYOUT ACTIONS</h3>
            <div className="mt-4 flex flex-col gap-3">
              <Button theme="green" className="w-full gap-2 shadow-[0_4px_15px_rgba(46,139,87,0.2)]">
                <Banknote size={16} /> Withdraw earnings
              </Button>
              <Button variant="outline" className="w-full gap-2 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/runner/earnings')}>
                <TrendingUp size={16} className="text-black/50 dark:text-white/50" /> View analytics
              </Button>
              <Button variant="outline" className="w-full gap-2 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/runner/profile')}>
                <User size={16} className="text-black/50 dark:text-white/50" /> Update payout info
              </Button>
            </div>
          </section>

          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 text-sm text-black/70 dark:text-white/70 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-md lg:hidden">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">PAYOUT STATUS</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-[#121212] px-4 py-3.5 font-semibold text-black/70 dark:text-white/70">
                <span>Pending escrow</span>
                <span className="font-black text-black dark:text-white">₦7,500</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-[#121212] px-4 py-3.5 font-semibold text-black/70 dark:text-white/70">
                <span>Next payout</span>
                <span className="font-black text-black dark:text-white">Today</span>
              </div>
            </div>
            <Button variant="outline" className="mt-4 w-full gap-2 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/runner/support')}>
              <LifeBuoy size={16} className="text-market-green" /> Contact support
            </Button>
          </section>
        </div>

        <aside className="hidden flex-col gap-6 lg:flex">
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">PAYOUT ACTIONS</h3>
            <div className="mt-4 flex flex-col gap-3">
              <Button theme="green" className="w-full gap-2 shadow-[0_4px_15px_rgba(46,139,87,0.2)]">
                <Banknote size={16} /> Withdraw earnings
              </Button>
              <Button variant="outline" className="w-full gap-2 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/runner/earnings')}>
                <TrendingUp size={16} className="text-black/50 dark:text-white/50" /> View analytics
              </Button>
              <Button variant="outline" className="w-full gap-2 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/runner/profile')}>
                <User size={16} className="text-black/50 dark:text-white/50" /> Update payout info
              </Button>
            </div>
          </section>

          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 text-sm text-black/70 dark:text-white/70 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">PAYOUT STATUS</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-[#121212] px-4 py-3.5 font-semibold text-black/70 dark:text-white/70">
                <span>Pending escrow</span>
                <span className="font-black text-black dark:text-white">₦7,500</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-[#121212] px-4 py-3.5 font-semibold text-black/70 dark:text-white/70">
                <span>Next payout</span>
                <span className="font-black text-black dark:text-white">Today</span>
              </div>
            </div>
            <Button variant="outline" className="mt-4 w-full gap-2 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/runner/support')}>
              <LifeBuoy size={16} className="text-market-green" /> Contact support
            </Button>
          </section>
        </aside>
      </main>

      <div className="lg:hidden">
        <RunnerBottomNav activeTab="wallet" />
      </div>
    </div>
  );
};
