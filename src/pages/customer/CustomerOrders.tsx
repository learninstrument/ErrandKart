import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Receipt, Clock } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { BottomNav } from './BottomNav';

type OrderStatus = 'active' | 'completed' | 'cancelled';

const ORDERS = [
  {
    id: 'EK-4920',
    title: 'Grocery Pickup',
    location: 'Lekki Phase 1',
    date: 'Today · 10:14 AM',
    status: 'active' as OrderStatus,
    fee: '₦4,500',
  },
  {
    id: 'EK-4811',
    title: 'Pharmacy Run',
    location: 'Victoria Island',
    date: 'Yesterday · 4:32 PM',
    status: 'completed' as OrderStatus,
    fee: '₦2,700',
    serviceFee: '₦500',
    itemsCost: '₦2,200',
    receiptUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=60',
  },
  {
    id: 'EK-4722',
    title: 'Laundry Pickup',
    location: 'Ikoyi',
    date: 'Apr 14 · 1:05 PM',
    status: 'cancelled' as OrderStatus,
    fee: '₦1,800',
  },
];

export const CustomerOrders: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<OrderStatus>('active');

  const orderStats = useMemo(
    () =>
      ORDERS.reduce(
        (acc, order) => {
          acc[order.status] += 1;
          return acc;
        },
        { active: 0, completed: 0, cancelled: 0 } as Record<OrderStatus, number>
      ),
    []
  );

  const activeOrder = ORDERS.find(order => order.status === 'active') ?? null;

  const filteredOrders = useMemo(
    () => ORDERS.filter(order => order.status === filter),
    [filter]
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/60 transition-colors hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-white">Activity</h2>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 md:grid md:grid-cols-[1.15fr_0.85fr] md:gap-8 md:px-10 md:pb-10">
        <div className="flex flex-col gap-6">
          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="grid grid-cols-3 gap-2">
              {(['active', 'completed', 'cancelled'] as OrderStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                    filter === status
                      ? 'border-kart-orange/40 bg-kart-orange/15 text-kart-orange'
                      : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            {filteredOrders.map(order => (
              <div
                key={order.id}
                onClick={() => navigate(`/customer/orders/${order.id}`)}
                className="rounded-[28px] border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)] cursor-pointer transition-all hover:border-white/20"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{order.id}</p>
                    <h3 className="mt-2 text-xl font-black text-white">{order.title}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} className="text-slate-500" /> {order.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} className="text-slate-500" /> {order.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                      {order.status}
                    </span>
                    <span className="text-lg font-black text-white">{order.fee}</span>
                  </div>
                </div>

                {order.status === 'active' && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate('/customer/track');
                      }}
                      className="gap-2"
                    >
                      Track Errand
                    </Button>
                    <Button
                      variant="outline"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/customer/chat/${order.id}`);
                      }}
                    >
                      Contact Runner
                    </Button>
                  </div>
                )}

                {order.status === 'completed' && (
                  <div className="mt-5 grid gap-4 md:grid-cols-[1.2fr_1fr]">
                    <div className="rounded-2xl border border-white/10 bg-[#0f141f] p-4">
                      <div className="flex items-center gap-2 text-white/70">
                        <Receipt size={16} />
                        <p className="text-xs font-semibold uppercase tracking-[0.2em]">Receipt breakdown</p>
                      </div>
                      <div className="mt-3 space-y-2 text-sm text-white/70">
                        <div className="flex items-center justify-between">
                          <span>Service fee</span>
                          <span className="font-semibold text-white">{order.serviceFee}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Items cost</span>
                          <span className="font-semibold text-white">{order.itemsCost}</span>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f141f]">
                      <img src={order.receiptUrl} alt="Receipt" className="h-36 w-full object-cover" />
                      <div className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                        Proof of purchase
                      </div>
                    </div>
                  </div>
                )}

                {order.status === 'cancelled' && (
                  <div className="mt-4 text-sm text-white/60">
                    This errand was cancelled. No charges were applied.
                  </div>
                )}
              </div>
            ))}
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:hidden">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">ORDER OVERVIEW</h3>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {([
                { label: 'Active', value: orderStats.active },
                { label: 'Completed', value: orderStats.completed },
                { label: 'Cancelled', value: orderStats.cancelled },
              ] as const).map(stat => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-[#0f141f] px-3 py-4 text-center"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">{stat.label}</p>
                  <p className="mt-2 text-lg font-black text-white">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 text-sm text-white/70">
              {activeOrder
                ? `Active order ${activeOrder.id} is in progress.`
                : 'No active errands right now.'}
            </div>
            <Button
              className="mt-5 w-full"
              onClick={() => navigate(activeOrder ? '/customer/track' : '/customer/post-errand')}
            >
              {activeOrder ? 'Track active errand' : 'Post a new errand'}
            </Button>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 text-sm text-white/70 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:hidden">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">PAYMENTS</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
                <span>Wallet balance</span>
                <span className="font-semibold text-white">₦48,200</span>
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate('/customer/wallet')}>
                Open wallet
              </Button>
            </div>
          </section>
        </div>

        <aside className="hidden flex-col gap-6 md:flex">
          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">ORDER OVERVIEW</h3>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {([
                { label: 'Active', value: orderStats.active },
                { label: 'Completed', value: orderStats.completed },
                { label: 'Cancelled', value: orderStats.cancelled },
              ] as const).map(stat => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-[#0f141f] px-3 py-4 text-center"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">{stat.label}</p>
                  <p className="mt-2 text-lg font-black text-white">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 text-sm text-white/70">
              {activeOrder
                ? `Active order ${activeOrder.id} is in progress.`
                : 'No active errands right now.'}
            </div>
            <Button
              className="mt-5 w-full"
              onClick={() => navigate(activeOrder ? '/customer/track' : '/customer/post-errand')}
            >
              {activeOrder ? 'Track active errand' : 'Post a new errand'}
            </Button>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 text-sm text-white/70 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">PAYMENTS</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3">
                <span>Wallet balance</span>
                <span className="font-semibold text-white">₦48,200</span>
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate('/customer/wallet')}>
                Open wallet
              </Button>
            </div>
          </section>
        </aside>
      </main>

      <div className="md:hidden">
        <BottomNav activeTab="orders" />
      </div>
    </div>
  );
};
