import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, ArrowUpRight, ArrowDownLeft, Plus, FileText, LifeBuoy, MapPin, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { BottomNav } from '../customer/BottomNav';

type Transaction = {
  id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'escrow_hold' | 'escrow_release';
  reference: string | null;
  created_at: string;
};

export const CustomerWallet: React.FC = () => {
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL ?? 'http://localhost:4000');

  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpError, setTopUpError] = useState('');

  // Load Paystack Inline JS
  useEffect(() => {
    if (document.getElementById('paystack-script')) return;
    const script = document.createElement('script');
    script.id = 'paystack-script';
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // Fetch wallet balance & transactions
  useEffect(() => {
    fetch(`${apiBaseUrl}/api/wallet/balance`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setWalletBalance(data.wallet_balance ?? 0))
      .catch(() => setWalletBalance(0));

    fetch(`${apiBaseUrl}/api/wallet/transactions`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setTransactions(data.transactions ?? []))
      .catch(() => {});
  }, [apiBaseUrl]);

  const handleTopUp = async () => {
    const amount = Number(topUpAmount);
    if (!amount || amount < 100) {
      setTopUpError('Minimum top-up is ₦100');
      return;
    }
    setIsTopUpLoading(true);
    setTopUpError('');

    try {
      const res = await fetch(`${apiBaseUrl}/api/payments/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount,
          callback_url: `${window.location.origin}/customer/wallet`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to initialize payment');

      window.location.href = data.data.authorization_url;
    } catch (err: any) {
      setTopUpError(err.message || 'Failed to start top-up');
      setIsTopUpLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today · ${time}`;
    return `${d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })} · ${time}`;
  };

  const txLabel = (type: string) => {
    switch (type) {
      case 'deposit': return 'Wallet Top Up';
      case 'withdrawal': return 'Withdrawal';
      case 'escrow_hold': return 'Escrow Hold';
      case 'escrow_release': return 'Escrow Released';
      default: return type;
    }
  };

  const txIsCredit = (type: string) => type === 'deposit' || type === 'escrow_release';

  // Calculate pending escrow from transactions
  const pendingEscrow = transactions
    .filter(tx => tx.type === 'escrow_hold')
    .reduce((sum, tx) => sum + Number(tx.amount), 0)
    - transactions
    .filter(tx => tx.type === 'escrow_release')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

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
          {/* Balance Card */}
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-[#0A0A0A] p-6 text-black dark:text-white shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)] relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-kart-orange/10 blur-3xl"></div>
            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-black/50 dark:text-white/50">Available Balance</p>
                <h3 className="mt-2 text-4xl font-black tracking-tight text-black dark:text-white">
                  {walletBalance !== null ? `₦${walletBalance.toLocaleString()}` : '...'}
                </h3>
                <p className="mt-2 text-sm text-black/70 dark:text-white/70">Top up to start new errands instantly.</p>
              </div>
              <Button className="gap-2 h-12 px-6 shadow-[0_4px_20px_rgba(255,102,0,0.2)]" onClick={() => setShowTopUp(!showTopUp)}>
                <Plus size={16} /> Top Up Wallet
              </Button>
            </div>

            {/* Top Up Form */}
            {showTopUp && (
              <div className="mt-5 pt-5 border-t border-black/10 dark:border-white/10">
                <div className="flex gap-2 mb-2">
                  {[1000, 2000, 5000, 10000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setTopUpAmount(String(amt))}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        topUpAmount === String(amt)
                          ? 'bg-kart-orange/15 border-kart-orange/40 text-kart-orange'
                          : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:border-black/20'
                      }`}
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="Enter amount (₦)"
                    className="flex-1 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/40 px-4 py-3 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-none focus:border-kart-orange/40"
                  />
                  <Button
                    className="px-6"
                    onClick={handleTopUp}
                    disabled={isTopUpLoading}
                  >
                    {isTopUpLoading ? <Loader2 size={16} className="animate-spin" /> : 'Pay'}
                  </Button>
                </div>
                {topUpError && <p className="text-xs text-red-500 font-bold mt-2">{topUpError}</p>}
              </div>
            )}
          </section>

          {/* Quick Stats */}
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
                  <Lock size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50">Escrow</p>
                  <p className="text-sm font-bold text-black dark:text-white mt-0.5">
                    ₦{Math.max(0, pendingEscrow).toLocaleString()} held
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Transactions */}
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <h3 className="mb-4 text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">TRANSACTIONS</h3>
            {transactions.length === 0 ? (
              <p className="text-sm text-black/40 dark:text-white/40 text-center py-8">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.map(tx => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-4 transition-all hover:bg-black/10 dark:hover:bg-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                          txIsCredit(tx.type) ? 'bg-market-green/10 text-market-green' : tx.type === 'escrow_hold' ? 'bg-kart-orange/10 text-kart-orange' : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {tx.type === 'escrow_hold' ? <Lock size={20} /> :
                         tx.type === 'escrow_release' ? <ShieldCheck size={20} /> :
                         txIsCredit(tx.type) ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-black dark:text-white">{txLabel(tx.type)}</p>
                        <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">{formatDate(tx.created_at)}</p>
                        <p className="text-[10px] text-black/40 dark:text-white/40 mt-0.5 font-mono">
                          ID: {tx.reference || tx.id.split('-')[0].toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${txIsCredit(tx.type) ? 'text-market-green' : tx.type === 'escrow_hold' ? 'text-kart-orange' : 'text-red-500'}`}>
                      {txIsCredit(tx.type) ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden flex-col gap-6 lg:flex sticky top-24">
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">WALLET ACTIONS</h3>
            <div className="mt-4 flex flex-col gap-3">
              <Button className="w-full gap-2 h-12 font-bold shadow-[0_4px_20px_rgba(255,102,0,0.2)]" onClick={() => setShowTopUp(!showTopUp)}>
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
                <span>Pending escrow</span>
                <span className="font-bold text-black dark:text-white">₦{Math.max(0, pendingEscrow).toLocaleString()}</span>
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
