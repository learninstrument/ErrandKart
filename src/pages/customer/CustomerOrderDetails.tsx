import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, PackageCheck, Receipt, MessageSquare } from 'lucide-react';
import { Button } from '../../components/UI/Button';

const ORDER_DETAILS: Record<string, {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'cancelled';
  location: string;
  date: string;
  payout: string;
  items: string[];
  runner: string;
  serviceFee?: string;
  itemsCost?: string;
  receiptUrl?: string;
}> = {
  'EK-4920': {
    id: 'EK-4920',
    title: 'Grocery Pickup',
    status: 'active',
    location: 'Lekki Phase 1',
    date: 'Today · 10:14 AM',
    payout: '₦4,500',
    items: ['2x Whole wheat bread', '1x Almond milk', '3x Eggs (medium)', '1x Detergent'],
    runner: 'Michael B.',
  },
  'EK-4811': {
    id: 'EK-4811',
    title: 'Pharmacy Run',
    status: 'completed',
    location: 'Victoria Island',
    date: 'Yesterday · 4:32 PM',
    payout: '₦2,700',
    items: ['Pain relief tablets', 'Vitamin C', 'Cough syrup'],
    runner: 'Michael B.',
    serviceFee: '₦500',
    itemsCost: '₦2,200',
    receiptUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=60',
  },
  'EK-4722': {
    id: 'EK-4722',
    title: 'Laundry Pickup',
    status: 'cancelled',
    location: 'Ikoyi',
    date: 'Apr 14 · 1:05 PM',
    payout: '₦1,800',
    items: ['Laundry basket', 'Dry cleaning'],
    runner: '—',
  },
};

export const CustomerOrderDetails: React.FC = () => {
  const navigate = useNavigate();
  const { orderId = '' } = useParams();
  const order = ORDER_DETAILS[orderId] ?? null;

  if (!order) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center text-white/70">
        Order not found.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/60 transition-colors hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-white">Order Details</h2>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 pb-20 pt-6 md:px-10 md:pb-10">
        <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111722] via-[#121826] to-[#0d1117] p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">{order.id}</p>
              <h3 className="mt-2 text-2xl font-black">{order.title}</h3>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/70">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-kart-orange" /> {order.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-kart-orange" /> {order.date}
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-kart-orange/30 bg-kart-orange/15 px-5 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kart-orange">Total</p>
              <p className="mt-2 text-2xl font-black text-white">{order.payout}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">ITEM LIST</h3>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{order.items.length} items</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {order.items.map(item => (
              <div key={item} className="rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3 text-sm text-white/80">
                <PackageCheck size={14} className="mr-2 inline text-kart-orange" />
                {item}
              </div>
            ))}
          </div>
        </section>

        {order.status === 'completed' && (
          <section className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
            <div className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
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
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#111722] shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
              {order.receiptUrl && (
                <img src={order.receiptUrl} alt="Receipt" className="h-44 w-full object-cover" />
              )}
              <div className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                Proof of purchase
              </div>
            </div>
          </section>
        )}

        {order.status === 'cancelled' && (
          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 text-sm text-white/60 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            This errand was cancelled. No charges were applied.
          </section>
        )}

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Runner</p>
              <p className="text-lg font-bold text-white">{order.runner}</p>
            </div>
            <div className="flex gap-2">
              {order.status === 'active' && (
                <Button onClick={() => navigate('/customer/track')} className="gap-2">
                  Track Errand
                </Button>
              )}
              <Button variant="outline" className="gap-2" onClick={() => navigate(`/customer/chat/${order.id}`)}>
                <MessageSquare size={16} className="text-white/70" /> Chat
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
