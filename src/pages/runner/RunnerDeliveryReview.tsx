import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, FileImage, MapPin, Receipt, Upload, Wallet } from 'lucide-react';
import { Button } from '../../components/UI/Button';

const ORDER_SUMMARY = {
  title: 'Grocery Pickup',
  payout: '₦4,500',
  customer: 'Sarah Daniels',
  location: 'Lekki Phase 1',
  items: ['2x Whole wheat bread', '1x Almond milk', '3x Eggs (medium)', '1x Detergent'],
};

export const RunnerDeliveryReview: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/60 transition-colors hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-white">Delivery Review</h2>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 pb-20 pt-6 md:px-10 md:pb-10">
        <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0e1a14] via-[#101f18] to-[#0d1117] p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">Order {orderId}</p>
              <h3 className="mt-2 text-2xl font-black">{ORDER_SUMMARY.title}</h3>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/70">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-market-green" /> {ORDER_SUMMARY.location}
                </span>
                <span className="flex items-center gap-1">
                  <Wallet size={14} className="text-market-green" /> {ORDER_SUMMARY.payout} payout
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-market-green/40 bg-market-green/15 px-5 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-market-green">Customer</p>
              <p className="mt-2 text-lg font-black text-white">{ORDER_SUMMARY.customer}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">ITEM SUMMARY</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {ORDER_SUMMARY.items.map(item => (
              <div key={item} className="rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3 text-sm text-white/80">
                <CheckCircle2 size={14} className="mr-2 inline text-market-green" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3 text-white/70">
              <Receipt size={18} />
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Receipt upload</p>
            </div>
            <label className="mt-4 flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3 text-sm text-white/70">
              <span>Receipt image attached</span>
              <span className="flex items-center gap-2 text-market-green">
                <Upload size={16} /> Replace
              </span>
              <input type="file" className="hidden" />
            </label>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3 text-white/70">
              <FileImage size={18} />
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Proof of delivery</p>
            </div>
            <label className="mt-4 flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3 text-sm text-white/70">
              <span>Delivery photo attached</span>
              <span className="flex items-center gap-2 text-market-green">
                <Upload size={16} /> Replace
              </span>
              <input type="file" className="hidden" />
            </label>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 text-sm text-white/60 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          Confirm the receipt and delivery proof are clear before final submission. Once submitted, the
          payout is moved to pending escrow release.
        </section>

        <section className="flex flex-col gap-3 md:flex-row">
          <Button variant="outline" className="w-full">
            Save draft
          </Button>
          <Button theme="green" className="w-full" onClick={() => navigate('/runner/dashboard')}>
            Submit for review
          </Button>
        </section>
      </main>
    </div>
  );
};
