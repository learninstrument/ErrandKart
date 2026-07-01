import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, BadgeCheck, Navigation, PackageCheck, AlertCircle } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { clearSession } from '../../utils/auth';

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-2xl bg-black/5 dark:bg-white/5 ${className}`} />
);

export const RunnerErrandDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errand, setErrand] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState('');
  const apiBaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL ?? 'http://localhost:4000');

  useEffect(() => {
    if (!id) return;
    fetch(`${apiBaseUrl}/api/errands/${id}`, { method: 'GET', credentials: 'include' })
      .then(res => {
        if (res.status === 401) { clearSession(); navigate('/login'); throw new Error('Session expired'); }
        return res.json();
      })
      .then(data => { if (data.errand) setErrand(data.errand); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id, apiBaseUrl, navigate]);

  const handleAccept = async () => {
    setIsAccepting(true);
    setError('');
    try {
      const res = await fetch(`${apiBaseUrl}/api/errands/${id}/accept`, { method: 'PATCH', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to accept errand.');
      navigate('/runner/active');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAccepting(false);
    }
  };

  const checklistItems = useMemo(() => {
    return errand?.description?.split('\n').filter((item: string) => item.trim() !== '') || ['No details provided.'];
  }, [errand]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-white dark:bg-[#000000] text-black dark:text-white transition-colors duration-300">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/85 dark:bg-[#000000]/85 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all -ml-1">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-extrabold tracking-tight text-black dark:text-white">Errand Details</h2>
        <div className="w-10" />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 md:px-10 md:pb-10 animate-fade-in-up">
        {isLoading ? (
          <>
            <SkeletonBlock className="h-44" />
            <SkeletonBlock className="h-32" />
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-14" />
          </>
        ) : !errand ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <AlertCircle size={28} />
            </div>
            <p className="text-lg font-bold text-black dark:text-white">Errand not found</p>
            <p className="text-sm text-black/50 dark:text-white/50">This errand may have been taken or removed.</p>
            <Button variant="outline" className="border-black/10 dark:border-white/10" onClick={() => navigate('/runner/dashboard')}>
              Back to dashboard
            </Button>
          </div>
        ) : (
          <>
            {/* Hero Card */}
            <section className="rounded-3xl border border-market-green/20 bg-gradient-to-br from-market-green/10 via-market-green/5 to-transparent dark:from-[#0e1a14] dark:via-[#101f18] dark:to-[#050505] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50">
                    Order #{errand.id.split('-')[0].toUpperCase()}
                  </p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight text-black dark:text-white">{errand.title}</h3>
                  <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 rounded-full border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-1.5 text-black/70 dark:text-white/70 backdrop-blur-sm">
                      <MapPin size={12} className="text-market-green" /> {errand.pickup_address || 'Pickup location'}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-1.5 text-black/70 dark:text-white/70 backdrop-blur-sm">
                      <Clock size={12} className="text-market-green" /> Nearby
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-1.5 text-black/70 dark:text-white/70 backdrop-blur-sm">
                      <PackageCheck size={12} className="text-market-green" /> {checklistItems.length} items
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl border border-market-green/30 bg-market-green/10 dark:bg-market-green/15 px-6 py-5 text-center min-w-[120px]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-market-green">Payout</p>
                  <p className="mt-1.5 text-2xl font-black text-black dark:text-white">₦{Number(errand.budget_customer_fee).toLocaleString()}</p>
                </div>
              </div>
            </section>

            {/* Customer Notes */}
            <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
              <h3 className="mb-3 text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">Customer Notes</h3>
              <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
                {errand.description || 'No specific instructions provided.'}
              </p>
            </section>

            {/* Checklist */}
            <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
              <h3 className="mb-4 text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">Item Checklist</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {checklistItems.map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-3.5 text-sm font-semibold text-black/80 dark:text-white/80 transition-colors hover:bg-black/10 dark:hover:bg-white/10">
                    <PackageCheck size={15} className="flex-shrink-0 text-market-green" />
                    {item}
                  </div>
                ))}
              </div>
            </section>

            {/* Route Preview */}
            <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
              <h3 className="mb-4 text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">Route Preview</h3>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-5 py-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Pickup</p>
                  <p className="mt-1 text-sm font-bold text-black dark:text-white">{errand.pickup_address || '—'}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-market-green/10 text-market-green">
                  <Navigation size={16} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Dropoff</p>
                  <p className="mt-1 text-sm font-bold text-black dark:text-white">{errand.dropoff_address || '—'}</p>
                </div>
              </div>
            </section>

            {error && (
              <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3.5 text-sm font-semibold text-red-500 dark:text-red-400">
                <AlertCircle size={16} className="flex-shrink-0" /> {error}
              </div>
            )}

            {/* Actions */}
            <section className="flex flex-col gap-3 md:flex-row">
              <Button variant="outline" className="w-full h-14 border-black/10 dark:border-white/10 gap-2" onClick={() => navigate(-1)}>
                <BadgeCheck size={16} /> Decline
              </Button>
              <Button theme="green" className="w-full h-14 shadow-[0_4px_20px_rgba(46,139,87,0.2)] gap-2" onClick={handleAccept} disabled={isAccepting}>
                {isAccepting ? 'Accepting...' : 'Accept Errand'}
              </Button>
            </section>
          </>
        )}
      </main>
    </div>
  );
};
