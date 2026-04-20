import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Clock,
  SlidersHorizontal,
  ShoppingBasket,
  Pill,
  Shirt,
  Wallet,
  Bolt,
  PackageCheck,
  CheckSquare,
  TrendingUp,
  LifeBuoy,
} from 'lucide-react';
import { RunnerBottomNav } from './RunnerBottomNav';
import { Button } from '../../components/UI/Button';

export const RunnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const availableErrands = [
    {
      id: 1,
      title: 'Grocery Pickup at Whole Foods',
      price: '₦4,500',
      location: 'Lekki Phase 1',
      time: '20 mins ago',
      distance: '1.2 km away',
      items: '8 items',
      icon: <ShoppingBasket size={24} />,
    },
    {
      id: 2,
      title: 'Pharmacy Run for Medication',
      price: '₦2,000',
      location: 'Victoria Island',
      time: '1 hour ago',
      distance: '3.5 km away',
      items: '4 items',
      icon: <Pill size={24} />,
    },
    {
      id: 3,
      title: 'Dry Cleaning Pickup',
      price: '₦1,500',
      location: 'Ikoyi',
      time: '2 hours ago',
      distance: '4.0 km away',
      items: '3 items',
      icon: <Shirt size={24} />,
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:px-10">
        <div className="flex items-center gap-10">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-market-green text-xs font-black text-white">
                K
              </div>
              <h1 className="text-xl font-black tracking-tight text-white">
                Errand<span className="text-market-green">Kart</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-2 md:flex">
                <span className="h-2 w-2 animate-pulse rounded-full bg-market-green"></span>
                <span className="text-sm font-semibold text-white/70">Online</span>
              </div>
              <div className="hidden md:block">
                <Button variant="outline" className="gap-2" onClick={() => navigate('/runner/active')}>
                  <CheckSquare size={16} /> Activity
                </Button>
              </div>
              <button
                onClick={() => navigate('/runner/profile')}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-white/80 transition-colors hover:text-white"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 font-bold text-white">
                  MB
                </div>
                <div className="hidden flex-col md:flex">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">Profile</span>
                  <span className="text-sm font-bold text-white">Michael B.</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 md:px-10 md:pb-10">
        <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0e1a14] via-[#101f18] to-[#0d1117] p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.45)] md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/50">Runner hub</p>
              <h2 className="mb-1 text-3xl font-black tracking-tight">Available Errands</h2>
              <p className="text-sm text-white/70">
                <span className="font-bold text-[#b2ffd2]">{availableErrands.length} opportunities</span> near you right now.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Open jobs', value: '17', highlight: true },
            { label: 'Completed', value: '43' },
            { label: 'Earnings', value: '₦84k' },
            { label: 'Acceptance', value: '96%' },
          ].map((stat, index) => (
            <div
              key={index}
              className={`rounded-2xl border ${stat.highlight ? 'border-market-green/40' : 'border-white/10'} bg-[#111722] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.35)]`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-black text-white">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:p-6">
          <div className="mb-4 flex items-center justify-between px-1">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/60">Quick Actions</h3>
            <span className="text-xs font-semibold text-white/40">Your essentials</span>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {[
              {
                label: 'Go Active',
                description: 'Resume current errand',
                icon: <CheckSquare size={18} />,
                href: '/runner/active',
              },
              {
                label: 'Wallet',
                description: 'Withdraw earnings',
                icon: <Wallet size={18} />,
                href: '/runner/wallet',
              },
              {
                label: 'Earnings',
                description: 'View performance',
                icon: <TrendingUp size={18} />,
                href: '/runner/earnings',
              },
              {
                label: 'Support',
                description: 'Get quick help',
                icon: <LifeBuoy size={18} />,
                href: '/runner/support',
              },
            ].map(action => (
              <button
                key={action.label}
                onClick={() => navigate(action.href)}
                className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0f141f] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-white/20"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-market-green/15 text-market-green group-hover:bg-market-green group-hover:text-white">
                  {action.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{action.label}</p>
                  <p className="mt-1 text-xs text-white/50">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-96">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search gigs near you..."
                className="w-full rounded-2xl border border-[#253043] bg-[#0f141f] py-3 pl-11 pr-4 text-sm text-white shadow-[0_10px_24px_rgba(0,0,0,0.25)] outline-none transition-all placeholder:text-slate-500 focus:border-market-green focus:ring-4 focus:ring-market-green/20"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/runner/wallet')}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 hover:text-white"
              >
                <Wallet size={16} /> Wallet
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl border border-market-green/40 bg-market-green/15 px-4 py-3 text-sm font-semibold text-market-green">
                <Bolt size={16} /> Boost
              </button>
              <button className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/70 hover:text-white">
                <SlidersHorizontal size={18} />
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 px-1">
            <h3 className="text-lg font-bold text-white">Errand Feed</h3>
          </div>

          <div className="flex flex-col gap-3">
            {availableErrands.map(errand => (
              <div
                key={errand.id}
                onClick={() => navigate(`/runner/errand/${errand.id}`)}
                className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-[#111722] p-4 shadow-[0_14px_34px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 md:p-5"
              >
                <div className="flex w-full items-center gap-4 md:w-auto md:gap-5">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-market-green/15 text-market-green transition-colors group-hover:bg-market-green group-hover:text-white md:h-14 md:w-14">
                    {errand.icon}
                  </div>
                  <div>
                    <h4 className="mb-1 text-base font-bold text-white md:text-lg">{errand.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 md:gap-3 md:text-sm">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} className="text-slate-500" /> {errand.location}
                      </span>
                      <span className="hidden text-white/15 md:inline">•</span>
                      <span className="font-semibold text-market-green">{errand.distance}</span>
                      <span className="hidden text-white/15 md:inline">•</span>
                      <span className="flex items-center gap-1">
                        <PackageCheck size={14} className="text-slate-500" /> {errand.items}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hidden min-w-[100px] flex-col items-end justify-center md:flex">
                  <span className="text-lg font-bold text-white">{errand.price}</span>
                  <span className="mt-1 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    <Clock size={12} /> {errand.time}
                  </span>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/runner/errand/${errand.id}`);
                    }}
                    className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-market-green/40 bg-market-green/15 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-market-green"
                  >
                    View details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="md:hidden">
        <RunnerBottomNav activeTab="available" />
      </div>
    </div>
  );
};
