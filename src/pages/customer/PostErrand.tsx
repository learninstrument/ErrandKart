import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBasket, ShoppingCart, PackageCheck, MapPin, Home } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { TextArea } from '../../components/UI/TextArea';

export const PostErrand: React.FC = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('Purchase');

  const categories = [
    { id: 'Market', label: 'Market Run', icon: <ShoppingBasket size={16} /> },
    { id: 'Purchase', label: 'Purchase', icon: <ShoppingCart size={16} /> },
    { id: 'Service', label: 'Service', icon: <PackageCheck size={16} /> },
  ];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/90 p-6 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-white">Post New Errand</h2>
        <div className="w-8" />
      </header>

      <main className="p-6 pb-36 md:p-8">
        <div className="mb-6 rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111722] via-[#121826] to-[#0d1117] p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/60">Create request</p>
          <h3 className="mb-1 text-2xl font-black">Describe your errand clearly</h3>
          <p className="text-sm text-white/70">Set details, pickup & delivery points, and runner fee.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.25fr_0.75fr]">
          <div className="flex flex-col gap-5">
            <section className="rounded-[28px] border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:p-6">
              <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">ERRAND DETAILS</h3>
              <Input label="Title" placeholder="e.g., Pickup groceries from Shoprite" />
              <TextArea
                label="Description"
                placeholder="Share item list, preferred brand, quantity, and instructions..."
                rows={4}
              />

              <div>
                <label className="mb-2 ml-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-2 py-3 text-xs font-semibold transition-all ${
                        category === cat.id
                          ? 'border-kart-orange bg-kart-orange/15 text-kart-orange'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      {cat.icon}
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:p-6">
              <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">LOCATIONS</h3>
              <Input label="Pickup Location" placeholder="Where should the runner go?" icon={<MapPin size={18} />} />
              <Input label="Delivery Location" placeholder="Enter delivery address" icon={<Home size={18} />} />

              <label className="ml-1 flex items-center gap-2 text-sm text-slate-400">
                <input type="checkbox" id="saveLoc" className="h-4 w-4 rounded accent-kart-orange" />
                Must have a cooler bag / insulation
              </label>
            </section>
          </div>

          <div className="flex flex-col gap-5">
            <section className="rounded-[28px] border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:p-6">
              <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">BUDGET</h3>
              <p className="mb-2 ml-1 text-xs text-slate-400">How much are you paying the runner for this errand?</p>

              <div className="relative mb-2">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-white">₦</div>
                <input
                  type="number"
                  className="w-full rounded-2xl border border-[#253043] bg-[#0f141f] py-4 pl-10 pr-4 text-2xl font-black text-white shadow-[0_10px_24px_rgba(0,0,0,0.25)] outline-none transition-all placeholder:text-slate-500 focus:border-kart-orange focus:ring-4 focus:ring-kart-orange/20"
                  placeholder="0.00"
                />
              </div>
            </section>

            <section className="hidden rounded-[28px] border border-white/10 bg-[#111722] p-5 text-sm text-white/70 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:block md:p-6">
              <h3 className="mb-3 text-sm font-black tracking-[0.2em] text-white/70">SUMMARY</h3>
              <p className="text-sm text-white/70">
                Review your details, then continue to checkout to confirm pricing and priority options.
              </p>
              <Button fullWidth className="mt-5" onClick={() => navigate('/customer/checkout')}>
                Continue to Checkout
              </Button>
            </section>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-3xl -translate-x-1/2 border-t border-white/5 bg-[#0d1117]/95 p-5 backdrop-blur-md md:hidden">
        <Button fullWidth onClick={() => navigate('/customer/checkout')}>
          Continue to Checkout
        </Button>
      </div>
    </div>
  );
};
