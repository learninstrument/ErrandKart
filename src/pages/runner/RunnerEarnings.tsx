import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar, Target, Wallet, ChevronRight } from 'lucide-react';
import { ThemeSwitcher } from '../../components/UI/ThemeSwitcher';

const WEEKLY = [
  { day: 'Mon', amount: 4200 },
  { day: 'Tue', amount: 6800 },
  { day: 'Wed', amount: 5200 },
  { day: 'Thu', amount: 8900 },
  { day: 'Fri', amount: 7400 },
  { day: 'Sat', amount: 9600 },
  { day: 'Sun', amount: 5800 },
];

const MONTHLY = [
  { label: 'Week 1', amount: 24000 },
  { label: 'Week 2', amount: 31500 },
  { label: 'Week 3', amount: 28750 },
  { label: 'Week 4', amount: 34400 },
];

const TRANSACTIONS = [
  { label: 'Grocery run – Lekki', amount: 3200, date: 'Today 10:45 AM' },
  { label: 'Pharmacy pickup – VI', amount: 2800, date: 'Today 8:30 AM' },
  { label: 'Restaurant delivery – Ajah', amount: 4100, date: 'Yesterday 7:14 PM' },
  { label: 'Office supplies – Yaba', amount: 1900, date: 'Yesterday 2:00 PM' },
];

export const RunnerEarnings: React.FC = () => {
  const navigate = useNavigate();
  const maxWeekly = Math.max(...WEEKLY.map(item => item.amount));
  const maxMonthly = Math.max(...MONTHLY.map(item => item.amount));
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');

  return (
    <div className="flex min-h-screen w-full flex-col bg-white dark:bg-[#000000] text-black dark:text-white transition-colors duration-300">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/85 dark:bg-[#000000]/85 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all -ml-1">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-extrabold tracking-tight text-black dark:text-white">Earnings</h2>
        <ThemeSwitcher />
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 flex flex-col gap-6 px-6 pb-20 pt-6 md:px-10 md:pb-10 animate-fade-in-up">

        {/* Hero Total Card */}
        <section className="rounded-3xl border border-market-green/20 bg-gradient-to-br from-market-green/15 via-market-green/5 to-transparent dark:from-[#0e1a14] dark:via-[#101f18] dark:to-[#050505] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-black/50 dark:text-white/50">Total earnings · All time</p>
              <h3 className="mt-2 text-4xl font-black tracking-tight text-black dark:text-white">₦134,500</h3>
              <div className="mt-2 flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs font-bold text-market-green bg-market-green/10 px-2.5 py-1 rounded-full">
                  <TrendingUp size={12} /> +12% this month
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:flex md:gap-3">
              <div className="rounded-2xl border border-market-green/20 bg-market-green/10 dark:bg-market-green/15 px-5 py-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-market-green/70 dark:text-market-green">Trips</p>
                <p className="mt-1.5 text-2xl font-black text-black dark:text-white">48</p>
              </div>
              <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 px-5 py-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/50">Avg / trip</p>
                <p className="mt-1.5 text-2xl font-black text-black dark:text-white">₦2,800</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stat Cards */}
        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'This week', value: '₦42,300', icon: <Calendar size={18} />, delta: '+8%' },
            { label: 'Top day', value: '₦9,600', icon: <TrendingUp size={18} />, delta: 'Sat' },
            { label: 'Goal progress', value: '74%', icon: <Target size={18} />, delta: 'of ₦57k goal' },
          ].map((item, index) => (
            <div key={index} className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-market-green/10 text-market-green">
                  {item.icon}
                </div>
                <span className="text-[10px] font-bold text-black/40 dark:text-white/40">{item.delta}</span>
              </div>
              <p className="mt-3 text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40">{item.label}</p>
              <p className="mt-1 text-2xl font-black text-black dark:text-white">{item.value}</p>
            </div>
          ))}
        </section>

        {/* Chart */}
        <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">Performance</h3>
            <div className="flex gap-1 rounded-xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 p-1">
              {(['weekly', 'monthly'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all ${activeTab === tab ? 'bg-white dark:bg-[#1a1a1a] text-black dark:text-white shadow-sm' : 'text-black/40 dark:text-white/40'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'weekly' ? (
            <div className="flex items-end justify-between gap-2 h-36">
              {WEEKLY.map(day => (
                <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative w-full rounded-xl bg-black/5 dark:bg-white/5 overflow-hidden" style={{ height: '100px' }}>
                    <div
                      className="absolute bottom-0 w-full rounded-xl bg-market-green transition-all duration-500"
                      style={{ height: `${(day.amount / maxWeekly) * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">{day.day}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {MONTHLY.map(week => (
                <div key={week.label} className="flex items-center justify-between gap-4 rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-3.5">
                  <span className="text-sm font-semibold text-black dark:text-white w-16">{week.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div className="h-2 rounded-full bg-market-green transition-all duration-500" style={{ width: `${(week.amount / maxMonthly) * 100}%` }} />
                  </div>
                  <span className="text-sm font-bold text-black dark:text-white w-24 text-right">₦{week.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Transactions */}
        <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">Recent Transactions</h3>
            <button className="flex items-center gap-1 text-[11px] font-bold text-market-green hover:underline">
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {TRANSACTIONS.map((tx, i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-3.5 transition-all hover:bg-black/10 dark:hover:bg-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-market-green/10 text-market-green">
                    <Wallet size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black dark:text-white">{tx.label}</p>
                    <p className="text-[10px] text-black/40 dark:text-white/40">{tx.date}</p>
                  </div>
                </div>
                <span className="text-sm font-black text-market-green">+₦{tx.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
