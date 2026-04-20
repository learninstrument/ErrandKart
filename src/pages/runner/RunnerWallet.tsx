import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Wallet, Banknote } from 'lucide-react';
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
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/60 transition-colors hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-white">Runner Wallet</h2>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 md:px-10 md:pb-10">
        <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0e1a14] via-[#101f18] to-[#0d1117] p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">Available for Withdrawal</p>
              <h3 className="mt-3 text-3xl font-black">₦26,400</h3>
              <p className="mt-2 text-sm text-white/70">Withdraw anytime to your bank account.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button theme="green" className="gap-2">
                <Banknote size={16} /> Withdraw
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => navigate('/runner/earnings')}>
                View analytics
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-market-green/15 text-market-green">
                <Wallet size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Pending Escrow</p>
                <p className="text-sm font-bold text-white">₦7,500</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                <Banknote size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Payout Account</p>
                <p className="text-sm font-bold text-white">GTBank · 0123456789</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/runner/profile')}
              className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-market-green hover:underline"
            >
              Update in profile
            </button>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">TRANSACTIONS</h3>
          <div className="space-y-3">
            {transactions.map(tx => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      tx.type === 'credit' ? 'bg-market-green/15 text-market-green' : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {tx.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{tx.title}</p>
                    <p className="text-xs text-slate-400">{tx.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${tx.type === 'credit' ? 'text-market-green' : 'text-red-400'}`}>
                  {tx.amount}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="md:hidden">
        <RunnerBottomNav activeTab="wallet" />
      </div>
    </div>
  );
};
