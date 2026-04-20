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
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/60 transition-colors hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-white">Wallet</h2>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 md:grid md:grid-cols-[1.15fr_0.85fr] md:gap-8 md:px-10 md:pb-10">
        <div className="flex flex-col gap-6">
          <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111722] via-[#121826] to-[#0d1117] p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">Available Balance</p>
                <h3 className="mt-3 text-3xl font-black">₦48,200</h3>
                <p className="mt-2 text-sm text-white/70">Top up to start new errands instantly.</p>
              </div>
              <Button className="gap-2">
                <Plus size={16} /> Top Up Wallet
              </Button>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kart-orange/15 text-kart-orange">
                  <CreditCard size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Funding method</p>
                  <p className="text-sm font-bold text-white">Paystack Checkout</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-market-green/15 text-market-green">
                  <ArrowUpRight size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Escrow</p>
                  <p className="text-sm font-bold text-white">₦6,500 pending</p>
                </div>
              </div>
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

          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:hidden">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">WALLET ACTIONS</h3>
            <div className="mt-4 flex flex-col gap-3">
              <Button className="w-full gap-2">
                <Plus size={16} /> Top up wallet
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/customer/orders')}>
                <FileText size={16} className="text-white/70" /> View activity
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/customer/support')}>
                <LifeBuoy size={16} className="text-white/70" /> Contact support
              </Button>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 text-sm text-white/70 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:hidden">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">SPENDING SNAPSHOT</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
                <span>This month</span>
                <span className="font-semibold text-white">₦12,700</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
                <span>Pending escrow</span>
                <span className="font-semibold text-white">₦6,500</span>
              </div>
            </div>
            <Button variant="outline" className="mt-4 w-full gap-2" onClick={() => navigate('/customer/track')}>
              <MapPin size={16} className="text-kart-orange" /> Track active errand
            </Button>
          </section>
        </div>

        <aside className="hidden flex-col gap-6 md:flex">
          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">WALLET ACTIONS</h3>
            <div className="mt-4 flex flex-col gap-3">
              <Button className="w-full gap-2">
                <Plus size={16} /> Top up wallet
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/customer/orders')}>
                <FileText size={16} className="text-white/70" /> View activity
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/customer/support')}>
                <LifeBuoy size={16} className="text-white/70" /> Contact support
              </Button>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 text-sm text-white/70 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">SPENDING SNAPSHOT</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
                <span>This month</span>
                <span className="font-semibold text-white">₦12,700</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
                <span>Pending escrow</span>
                <span className="font-semibold text-white">₦6,500</span>
              </div>
            </div>
            <Button variant="outline" className="mt-4 w-full gap-2" onClick={() => navigate('/customer/track')}>
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
