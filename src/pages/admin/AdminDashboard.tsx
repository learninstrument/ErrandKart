import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CreditCard, Users, ClipboardCheck, Bell, ArrowUpRight } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { AdminLayout } from './AdminLayout';

const FEED = [
  { id: 1, title: 'New customer registration', detail: 'Sarah Daniels verified email', time: '2 mins ago' },
  { id: 2, title: 'Runner payout processed', detail: '₦10,000 sent to Michael B.', time: '10 mins ago' },
  { id: 3, title: 'Errand completed', detail: 'Order EK-4920 marked delivered', time: '22 mins ago' },
  { id: 4, title: 'Dispute opened', detail: 'Order EK-4811 flagged by customer', time: '45 mins ago' },
];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [paymentSeries, setPaymentSeries] = useState([2.1, 2.3, 2.5, 2.7, 2.4, 2.6, 2.8, 2.9, 2.7, 3.0, 3.1, 3.0]);
  const [userSeries, setUserSeries] = useState([12340, 12362, 12388, 12405, 12420, 12438, 12456, 12470, 12482, 12496, 12508, 12522]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPaymentSeries(prev => {
        const last = prev[prev.length - 1] ?? 2.8;
        const next = Math.max(1.6, Number((last + (Math.random() * 0.35 - 0.18)).toFixed(2)));
        return [...prev.slice(1), next];
      });
      setUserSeries(prev => {
        const last = prev[prev.length - 1] ?? 12500;
        const next = Math.max(12000, last + Math.floor(Math.random() * 9));
        return [...prev.slice(1), next];
      });
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  const paymentTotal = paymentSeries[paymentSeries.length - 1];
  const usersTotal = userSeries[userSeries.length - 1];
  const stats = [
    { label: 'Total Users', value: usersTotal.toLocaleString(), icon: <Users size={18} />, tone: 'text-kart-orange' },
    { label: 'Active Errands', value: '148', icon: <Activity size={18} />, tone: 'text-market-green' },
    { label: 'Payments Today', value: `₦${paymentTotal.toFixed(2)}M`, icon: <CreditCard size={18} />, tone: 'text-kart-orange' },
    { label: 'Pending Reviews', value: '36', icon: <ClipboardCheck size={18} />, tone: 'text-market-green' },
  ];

  const paymentPath = useMemo(() => {
    const width = 320;
    const height = 120;
    const padding = 12;
    const min = Math.min(...paymentSeries);
    const max = Math.max(...paymentSeries);
    const range = Math.max(max - min, 0.1);
    const step = (width - padding * 2) / (paymentSeries.length - 1);
    return paymentSeries
      .map((val, index) => {
        const x = padding + index * step;
        const y = height - padding - ((val - min) / range) * (height - padding * 2);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [paymentSeries]);

  const userMax = useMemo(() => Math.max(...userSeries), [userSeries]);

  return (
    <AdminLayout title="Admin Dashboard" active="dashboard">
      <section className="grid gap-4 md:grid-cols-4">
        {stats.map(stat => (
          <div
            key={stat.label}
            className="rounded-[24px] border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ${stat.tone}`}>
              {stat.icon}
            </div>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">{stat.label}</p>
            <p className="mt-2 text-2xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Real-time payments</p>
              <p className="mt-2 text-xl font-black text-white">₦{paymentTotal.toFixed(2)}M</p>
            </div>
            <span className="rounded-full border border-market-green/30 bg-market-green/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-market-green">
              Live
            </span>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0f141f] p-4">
            <svg viewBox="0 0 320 120" className="h-32 w-full">
              <path d={paymentPath} fill="none" stroke="#FF6600" strokeWidth="3" />
              <path
                d={`${paymentPath} L 308 108 L 12 108 Z`}
                fill="url(#paymentGradient)"
                opacity="0.2"
              />
              <defs>
                <linearGradient id="paymentGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#FF6600" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-white/50">
            <span>Last 60 mins</span>
            <span>Updated just now</span>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Active users</p>
              <p className="mt-2 text-xl font-black text-white">{usersTotal.toLocaleString()}</p>
            </div>
            <span className="rounded-full border border-kart-orange/30 bg-kart-orange/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-kart-orange">
              Live
            </span>
          </div>
          <div className="mt-4 grid grid-cols-12 items-end gap-2 rounded-2xl border border-white/10 bg-[#0f141f] p-4">
            {userSeries.map((value, index) => (
              <div key={`${value}-${index}`} className="flex h-24 items-end">
                <div
                  className="w-full rounded-full bg-market-green"
                  style={{ height: `${(value / userMax) * 100}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-white/50">
            <span>Last 12 intervals</span>
            <span>Auto-refreshing</span>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">LIVE ACTIVITY</h3>
            <Button variant="outline" className="gap-2 text-xs" onClick={() => navigate('/admin/activity')}>
              View all
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {FEED.map(item => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-[#0f141f] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">{item.time}</span>
                </div>
                <p className="mt-2 text-sm text-white/60">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kart-orange/15 text-kart-orange">
                <Bell size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Alerts</p>
                <p className="text-lg font-bold text-white">3 critical issues</p>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
                <span>Payment failures</span>
                <span className="font-semibold text-white">7</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
                <span>Pending disputes</span>
                <span className="font-semibold text-white">4</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
                <span>KYC reviews</span>
                <span className="font-semibold text-white">21</span>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">QUICK ACTIONS</h3>
            <div className="mt-4 flex flex-col gap-3">
              <Button className="w-full gap-2" onClick={() => navigate('/admin/activity')}>
                <Activity size={16} /> Review activity log
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/admin/admins')}>
                <Users size={16} className="text-white/70" /> Manage admin access
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <ArrowUpRight size={16} className="text-white/70" /> Export reports
              </Button>
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};
