import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar, Target, Wallet } from 'lucide-react';

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

export const RunnerEarnings: React.FC = () => {
  const navigate = useNavigate();
  const maxWeekly = Math.max(...WEEKLY.map(item => item.amount));
  const maxMonthly = Math.max(...MONTHLY.map(item => item.amount));

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/60 transition-colors hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-white">Earnings Analytics</h2>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 pb-20 pt-6 md:px-10 md:pb-10">
        <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0e1a14] via-[#101f18] to-[#0d1117] p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">Total earnings</p>
              <h3 className="mt-3 text-3xl font-black">₦134,500</h3>
              <p className="mt-2 text-sm text-white/70">+12% compared to last month</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-market-green/40 bg-market-green/15 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-market-green">Trips</p>
                <p className="mt-2 text-xl font-black text-white">48</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Avg / trip</p>
                <p className="mt-2 text-xl font-black text-white">₦2,800</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'This week', value: '₦42,300', icon: <Calendar size={18} /> },
            { label: 'Top day', value: '₦9,600', icon: <TrendingUp size={18} /> },
            { label: 'Goal progress', value: '74%', icon: <Target size={18} /> },
          ].map((item, index) => (
            <div key={index} className="rounded-[24px] border border-white/10 bg-[#111722] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-3 text-white/70">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-market-green/15 text-market-green">
                  {item.icon}
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">{item.label}</p>
              </div>
              <p className="mt-3 text-2xl font-black text-white">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">WEEKLY PERFORMANCE</h3>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Wallet size={14} /> NGN
            </div>
          </div>
          <div className="grid grid-cols-7 gap-3">
            {WEEKLY.map(day => (
              <div key={day.day} className="flex flex-col items-center gap-2">
                <div className="relative h-28 w-4 rounded-full bg-white/5">
                  <div
                    className="absolute bottom-0 w-full rounded-full bg-market-green"
                    style={{ height: `${(day.amount / maxWeekly) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                  {day.day}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">MONTHLY SUMMARY</h3>
          <div className="space-y-3">
            {MONTHLY.map(week => (
              <div key={week.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
                <span className="text-sm font-semibold text-white">{week.label}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-40 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-market-green"
                      style={{ width: `${(week.amount / maxMonthly) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-white">₦{week.amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
