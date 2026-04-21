import React, { useMemo, useState } from 'react';
import { AdminLayout } from './AdminLayout';

type ActivityType = 'auth' | 'payment' | 'errand' | 'support' | 'admin';

const ACTIVITIES = [
  { id: 1, type: 'auth', actor: 'Sarah Daniels', action: 'Registered account', time: '2 mins ago' },
  { id: 2, type: 'payment', actor: 'Michael B.', action: 'Payout processed ₦10,000', time: '8 mins ago' },
  { id: 3, type: 'errand', actor: 'EK-4920', action: 'Errand completed by runner', time: '15 mins ago' },
  { id: 4, type: 'support', actor: 'Support', action: 'Dispute opened for EK-4811', time: '42 mins ago' },
  { id: 5, type: 'admin', actor: 'Super Admin', action: 'Created admin account for Ops', time: '1 hr ago' },
  { id: 6, type: 'payment', actor: 'Sarah Daniels', action: 'Wallet top up ₦15,000', time: '2 hrs ago' },
];

export const AdminActivity: React.FC = () => {
  const [filter, setFilter] = useState<ActivityType | 'all'>('all');

  const filtered = useMemo(
    () => (filter === 'all' ? ACTIVITIES : ACTIVITIES.filter(item => item.type === filter)),
    [filter]
  );

  return (
    <AdminLayout title="Activity Log" active="activity">
      <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
        <div className="flex flex-wrap gap-2">
          {(['all', 'auth', 'payment', 'errand', 'support', 'admin'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                filter === type
                  ? 'border-kart-orange/40 bg-kart-orange/15 text-kart-orange'
                  : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              {type === 'all' ? 'All activity' : type}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 space-y-3">
        {filtered.map(item => (
          <div
            key={item.id}
            className="rounded-[24px] border border-white/10 bg-[#111722] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.35)]"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">{item.type}</p>
                <p className="mt-2 text-base font-bold text-white">{item.action}</p>
                <p className="mt-1 text-sm text-white/60">Actor: {item.actor}</p>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">{item.time}</span>
            </div>
          </div>
        ))}
      </section>
    </AdminLayout>
  );
};
