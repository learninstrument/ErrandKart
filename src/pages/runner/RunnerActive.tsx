import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Phone, MessageSquare, Upload } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { RunnerBottomNav } from './RunnerBottomNav';

const ITEM_LIST = [
  { id: 1, name: '2x Whole wheat bread' },
  { id: 2, name: '1x Almond milk' },
  { id: 3, name: '3x Eggs (medium)' },
  { id: 4, name: '1x Detergent' },
];

const STATUS_STEPS = ['Start Shopping', 'En Route', 'Arrived'];

export const RunnerActive: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [receiptSelected, setReceiptSelected] = useState(false);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setCheckedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/60 transition-colors hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-white">Active Errand</h2>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 md:px-10 md:pb-10">
        <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0e1a14] via-[#101f18] to-[#0d1117] p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">Order #EK-4920</p>
          <h3 className="mt-2 text-2xl font-black">Grocery Pickup · Lekki</h3>
          <p className="mt-2 text-sm text-white/70">Budget payout ₦4,500 · Service fee ₦700</p>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">STATUS</h3>
          <div className="flex flex-wrap gap-2">
            {STATUS_STEPS.map((step, index) => (
              <button
                key={step}
                onClick={() => setCurrentStep(index)}
                className={`rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                  currentStep === index
                    ? 'border-market-green/40 bg-market-green/15 text-market-green'
                    : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                {step}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">ITEM CHECKLIST</h3>
          <div className="space-y-3">
            {ITEM_LIST.map(item => {
              const checked = checkedItems.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3 text-left text-sm text-white transition-colors hover:border-white/20"
                >
                  <span className={`${checked ? 'text-white/50 line-through' : 'text-white'}`}>{item.name}</span>
                  <CheckCircle2 className={checked ? 'text-market-green' : 'text-white/20'} size={18} />
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">CUSTOMER</h3>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-bold text-white">Sarah Daniels</p>
              <p className="text-sm text-slate-400">+234 801 234 5678</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Phone size={16} className="text-white/80" /> Call
              </Button>
              <Button theme="green" className="gap-2">
                <MessageSquare size={16} /> Chat
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">PROOF OF PURCHASE</h3>
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3 text-sm text-white/70">
            <span>{receiptSelected ? 'Receipt uploaded' : 'Upload receipt photo to complete'}</span>
            <span className="flex items-center gap-2 text-market-green">
              <Upload size={16} /> Upload
            </span>
            <input
              type="file"
              className="hidden"
              onChange={(event) => setReceiptSelected(!!event.target.files?.length)}
            />
          </label>
          <Button
            theme="green"
            className="mt-4 w-full"
            disabled={!receiptSelected}
          >
            Mark Errand Complete
          </Button>
        </section>
      </main>

      <div className="md:hidden">
        <RunnerBottomNav activeTab="active" />
      </div>
    </div>
  );
};
