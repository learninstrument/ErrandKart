import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Banknote, TrendingUp, LifeBuoy, User, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { RunnerBottomNav } from '../runner/RunnerBottomNav';

type Transaction = {
  id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'escrow_hold' | 'escrow_release';
  reference: string | null;
  created_at: string;
};

export const RunnerWallet: React.FC = () => {
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL ?? 'http://localhost:4000');

  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');

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

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount < 100) {
      setWithdrawError('Minimum withdrawal is ₦100');
      return;
    }
    if (walletBalance !== null && amount > walletBalance) {
      setWithdrawError('Insufficient balance');
      return;
    }

    setIsWithdrawing(true);
    setWithdrawError('');
    setWithdrawSuccess('');

    try {
      const res = await fetch(`${apiBaseUrl}/api/wallet/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Withdrawal failed');

      if (data.status === 'duplicate') {
        setWithdrawError('This withdrawal was already processed.');
      } else {
        setWalletBalance(data.wallet_balance ?? (walletBalance! - amount));
        setWithdrawSuccess(`₦${amount.toLocaleString()} withdrawal initiated! Check your bank.`);
        setWithdrawAmount('');
        // Refresh transactions
        fetch(`${apiBaseUrl}/api/wallet/transactions`, { credentials: 'include' })
          .then(res => res.json())
          .then(data => setTransactions(data.transactions ?? []))
          .catch(() => {});
      }
    } catch (err: any) {
      setWithdrawError(err.message || 'Withdrawal failed');
    } finally {
      setIsWithdrawing(false);
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
      case 'deposit': return 'Wallet Funded';
      case 'withdrawal': return 'Withdrawal';
      case 'escrow_hold': return 'Escrow Hold';
      case 'escrow_release': return 'Errand Payout';
      default: return type;
    }
  };

  const txIsCredit = (type: string) => type === 'deposit' || type === 'escrow_release';

  // This week's earnings
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);

  const weeklyEarnings = transactions
    .filter(tx => tx.type === 'escrow_release' && new Date(tx.created_at) >= thisWeekStart)
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

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
          {/* Balance Card */}
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-gradient-to-br from-black/5 via-black/10 to-black/5 dark:from-[#0A0A0A] dark:via-[#111111] dark:to-[#050505] p-6 text-black dark:text-white shadow-[0_24px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50">Available for Withdrawal</p>
                <h3 className="mt-3 text-3xl font-black tracking-tighter text-black dark:text-white">
                  {walletBalance !== null ? `₦${walletBalance.toLocaleString()}` : '...'}
                </h3>
                <p className="mt-2 text-sm font-semibold text-black/60 dark:text-white/70">Withdraw anytime to your bank account.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button theme="green" className="gap-2 shadow-[0_4px_15px_rgba(46,139,87,0.2)]" onClick={() => setShowWithdraw(!showWithdraw)}>
                  <Banknote size={16} /> Withdraw
                </Button>
                <Button variant="outline" className="gap-2 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/runner/earnings')}>
                  View analytics
                </Button>
              </div>
            </div>

            {/* Withdraw Form */}
            {showWithdraw && (
              <div className="mt-5 pt-5 border-t border-black/10 dark:border-white/10">
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount (₦)"
                    className="flex-1 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/40 px-4 py-3 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-none focus:border-market-green/40"
                  />
                  <Button
                    theme="green"
                    className="px-6"
                    onClick={handleWithdraw}
                    disabled={isWithdrawing}
                  >
                    {isWithdrawing ? <Loader2 size={16} className="animate-spin" /> : 'Send'}
                  </Button>
                </div>
                {withdrawError && <p className="text-xs text-red-500 font-bold mt-2">{withdrawError}</p>}
                {withdrawSuccess && <p className="text-xs text-market-green font-bold mt-2">{withdrawSuccess}</p>}
              </div>
            )}
          </section>

          {/* Quick Stats */}
          <section className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-market-green/15 text-market-green shadow-inner">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/60">This Week</p>
                  <p className="text-base font-black text-black dark:text-white">₦{weeklyEarnings.toLocaleString()}</p>
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
                  <p className="text-sm font-bold text-black dark:text-white">Via Profile Settings</p>
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

          {/* Transactions */}
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <h3 className="mb-4 text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">TRANSACTIONS</h3>
            {transactions.length === 0 ? (
              <p className="text-sm text-black/40 dark:text-white/40 text-center py-8">No transactions yet. Complete errands to earn!</p>
            ) : (
              <div className="space-y-3">
                {transactions.map(tx => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-[#121212] px-4 py-3.5 transition-colors hover:border-black/10 dark:hover:border-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-[14px] shadow-inner ${
                          txIsCredit(tx.type) ? 'bg-market-green/15 text-market-green' :
                          tx.type === 'escrow_hold' ? 'bg-kart-orange/15 text-kart-orange' :
                          'bg-red-500/15 text-red-500 dark:text-red-400'
                        }`}
                      >
                        {tx.type === 'escrow_hold' ? <Lock size={20} /> :
                         tx.type === 'escrow_release' ? <ShieldCheck size={20} /> :
                         txIsCredit(tx.type) ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-black dark:text-white">{txLabel(tx.type)}</p>
                        <p className="text-xs font-semibold text-black/50 dark:text-white/50">{formatDate(tx.created_at)}</p>
                        <p className="text-[10px] text-black/40 dark:text-white/40 mt-0.5 font-mono">
                          ID: {tx.reference || tx.id.split('-')[0].toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <span className={`text-base font-black ${txIsCredit(tx.type) ? 'text-market-green' : tx.type === 'escrow_hold' ? 'text-kart-orange' : 'text-red-500 dark:text-red-400'}`}>
                      {txIsCredit(tx.type) ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden flex-col gap-6 lg:flex">
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">PAYOUT ACTIONS</h3>
            <div className="mt-4 flex flex-col gap-3">
              <Button theme="green" className="w-full gap-2 shadow-[0_4px_15px_rgba(46,139,87,0.2)]" onClick={() => setShowWithdraw(!showWithdraw)}>
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
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">EARNINGS OVERVIEW</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-[#121212] px-4 py-3.5 font-semibold text-black/70 dark:text-white/70">
                <span>This week</span>
                <span className="font-black text-black dark:text-white">₦{weeklyEarnings.toLocaleString()}</span>
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
