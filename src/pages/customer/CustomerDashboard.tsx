import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, Plus, ShoppingBasket, Pill, Wallet, Sparkles } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { Button } from '../../components/UI/Button';

export const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const userErrands = [
    {
      id: 1,
      title: 'Grocery Pickup at Whole Foods',
      price: '₦4,500',
      location: 'Lekki Phase 1',
      time: 'In Progress',
      status: 'active',
      icon: <ShoppingBasket size={24} />,
    },
    {
      id: 2,
      title: 'Pharmacy Run for Medication',
      price: '₦2,000',
      location: 'Victoria Island',
      time: 'Yesterday',
      status: 'completed',
      icon: <Pill size={24} />,
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:px-10">
        <div className="flex items-center gap-10">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-kart-orange text-xs font-black text-white">
                K
              </div>
              <h1 className="text-xl font-black tracking-tight text-white">
                Errand<span className="text-kart-orange">Kart</span>
              </h1>
            </div>

            <div className="hidden items-center gap-4 md:flex">
              <Button onClick={() => navigate('/customer/post-errand')} className="gap-2">
                <Plus size={17} /> Post Errand
              </Button>
              <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 font-bold text-white">
                SD
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 md:px-10 md:pb-10">
        <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111722] via-[#121826] to-[#0d1117] p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.45)] md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/50">Control center</p>
              <h2 className="mb-1 text-3xl font-black tracking-tight">Welcome back, Sarah</h2>
              <p className="text-sm text-white/70">Book fast errands, track runner movement, and stay in charge.</p>
            </div>
            <Button onClick={() => navigate('/customer/post-errand')} className="gap-2 md:hidden">
              <Plus size={17} /> Post Errand
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Active', value: '1', highlight: true },
            { label: 'Completed', value: '12' },
            { label: 'Wallet', value: '₦32k' },
            { label: 'Avg ETA', value: '18m' },
          ].map((stat, index) => (
            <div
              key={index}
              className={`rounded-2xl border ${stat.highlight ? 'border-kart-orange/40' : 'border-white/10'} bg-[#111722] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.35)]`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-black text-white">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-96">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search errands..."
                className="w-full rounded-2xl border border-[#253043] bg-[#0f141f] py-3 pl-11 pr-4 text-sm text-white shadow-[0_10px_24px_rgba(0,0,0,0.25)] outline-none transition-all placeholder:text-slate-500 focus:border-kart-orange focus:ring-4 focus:ring-kart-orange/20"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/customer/wallet')}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 hover:text-white"
              >
                <Wallet size={16} /> Wallet
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl border border-kart-orange/40 bg-kart-orange/15 px-4 py-3 text-sm font-semibold text-kart-orange">
                <Sparkles size={16} /> Priority
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-white">Recent Errands</h3>
            <button onClick={() => navigate('/customer/orders')} className="text-sm font-bold text-kart-orange hover:underline">
              View All
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {userErrands.map(errand => (
              <div
                key={errand.id}
                onClick={() => navigate('/customer/track')}
                className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-[#111722] p-4 shadow-[0_14px_34px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 md:p-5"
              >
                <div className="flex w-full items-center gap-4 md:w-auto md:gap-5">
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl transition-colors md:h-14 md:w-14 ${
                      errand.status === 'active'
                        ? 'bg-kart-orange/15 text-kart-orange group-hover:bg-kart-orange group-hover:text-white'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {errand.icon}
                  </div>
                  <div>
                    <h4 className="mb-1 text-base font-bold text-white md:text-lg">{errand.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 md:gap-3 md:text-sm">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} className="text-slate-500" /> {errand.location}
                      </span>
                      <span className="hidden text-white/15 md:inline">•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} className="text-slate-500" />
                        {errand.status === 'active' ? (
                          <span className="font-medium text-kart-orange">{errand.time}</span>
                        ) : (
                          errand.time
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hidden min-w-[100px] flex-col items-end justify-center md:flex">
                  <span className="text-lg font-bold text-white">{errand.price}</span>
                  {errand.status === 'active' && (
                    <span className="mt-1 rounded-md bg-kart-orange/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-kart-orange">
                      Active
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="md:hidden">
        <BottomNav activeTab="home" />
      </div>
    </div>
  );
};
