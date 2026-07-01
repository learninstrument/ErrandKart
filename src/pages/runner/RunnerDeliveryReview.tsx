import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, FileImage, MapPin, Receipt, Upload, Wallet, AlertCircle } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { clearSession } from '../../utils/auth';

export const RunnerDeliveryReview: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [errand, setErrand] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const apiBaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL ?? 'http://localhost:4000');

  useEffect(() => {
    if (!orderId) return;
    fetch(`${apiBaseUrl}/api/errands/${orderId}`, { method: 'GET', credentials: 'include' })
      .then(res => {
        if (res.status === 401) {
          clearSession();
          navigate('/login');
          throw new Error('Session expired');
        }
        return res.json();
      })
      .then(data => {
        if (data.errand) setErrand(data.errand);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [orderId, apiBaseUrl, navigate]);

  const checklistItems = useMemo(() => {
    return errand?.description?.split('\n').filter((item: string) => item.trim() !== '') || [];
  }, [errand]);

  const handleSubmit = async () => {
    if (!orderId) return;
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${apiBaseUrl}/api/errands/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: 'completed',
          // Pass a mock receipt URL for demo/completion tracking purposes
          proof_of_purchase_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=60',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to complete errand');

      navigate('/runner/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-white dark:bg-[#000000] text-black dark:text-white transition-colors duration-300">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/85 dark:bg-[#000000]/85 px-6 py-4 backdrop-blur-md">
          <div className="h-10 w-10 rounded-full bg-black/5 dark:bg-white/5 animate-pulse" />
          <div className="h-5 w-32 rounded-lg bg-black/5 dark:bg-white/5 animate-pulse" />
          <div className="w-10" />
        </header>
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 pb-20 pt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-3xl bg-black/5 dark:bg-white/5" style={{ height: i === 0 ? '160px' : '100px' }} />
          ))}
        </main>
      </div>
    );
  }

  if (!errand) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white dark:bg-[#000000] text-black dark:text-white px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <AlertCircle size={28} />
        </div>
        <p className="text-lg font-bold">Errand not found</p>
        <p className="text-sm text-black/50 dark:text-white/50">This errand may have been completed or removed.</p>
        <button onClick={() => navigate('/runner/dashboard')} className="mt-2 text-sm font-bold text-market-green hover:underline">Back to dashboard</button>
      </div>
    );
  }

  const orderDisplayId = `EK-${errand.id.split('-')[0].toUpperCase()}`;

  return (
    <div className="flex min-h-screen w-full flex-col bg-white dark:bg-[#000000] text-black dark:text-white transition-colors duration-300">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/85 dark:bg-[#000000]/85 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-black/60 dark:text-white/60 transition-colors hover:text-black dark:hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-extrabold tracking-tight text-black dark:text-white">Delivery Review</h2>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 pb-20 pt-6 md:px-10 md:pb-10 animate-fade-in-up">
        <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-gradient-to-br from-market-green/10 via-black/5 dark:via-white/5 to-transparent dark:from-[#0e1a14] dark:via-[#101f18] dark:to-[#050505] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50">Order #{orderDisplayId}</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-black dark:text-white">{errand.title}</h3>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-black/70 dark:text-white/70">
                <span className="flex items-center gap-1.5 rounded-full border border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/50 px-3 py-1.5 backdrop-blur-md">
                  <MapPin size={14} className="text-market-green" /> {errand.pickup_address}
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/50 px-3 py-1.5 backdrop-blur-md">
                  <Wallet size={14} className="text-market-green" /> ₦{Number(errand.budget_customer_fee).toLocaleString()} payout
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-market-green/20 bg-market-green/10 dark:bg-market-green/15 px-6 py-5 text-center shadow-inner">
              <p className="text-[10px] font-bold uppercase tracking-widest text-market-green/70 dark:text-market-green">Customer</p>
              <p className="mt-1 text-lg font-black text-black dark:text-white">{errand.customer?.full_name || 'Customer'}</p>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500 dark:text-red-400">
            {error}
          </div>
        )}

        <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
          <h3 className="mb-4 text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">ITEM SUMMARY</h3>
          {checklistItems.length === 0 ? (
            <p className="text-sm font-medium text-black/50 dark:text-white/50">No items specified.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {checklistItems.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-3.5 text-sm font-semibold text-black/80 dark:text-white/80 transition-colors hover:bg-black/10 dark:hover:bg-white/10">
                  <CheckCircle2 size={16} className="mr-3 flex-shrink-0 text-market-green" />
                  {item}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kart-orange/10 text-kart-orange">
                <Receipt size={18} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50">Receipt upload</p>
            </div>
            <label className="mt-4 flex cursor-pointer items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-4 text-sm font-semibold text-black/70 dark:text-white/70 transition-colors hover:border-black/10 dark:hover:border-white/20">
              <span>Receipt image attached</span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-market-green">
                <Upload size={14} /> Replace
              </span>
              <input type="file" className="hidden" />
            </label>
          </div>

          <div className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-market-green/10 text-market-green">
                <FileImage size={18} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50">Proof of delivery</p>
            </div>
            <label className="mt-4 flex cursor-pointer items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-4 text-sm font-semibold text-black/70 dark:text-white/70 transition-colors hover:border-black/10 dark:hover:border-white/20">
              <span>Delivery photo attached</span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-market-green">
                <Upload size={14} /> Replace
              </span>
              <input type="file" className="hidden" />
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-5 text-sm font-medium text-black/60 dark:text-white/60 text-center shadow-inner">
          Confirm the receipt and delivery proof are clear before final submission. Once submitted, the payout is moved to pending escrow release.
        </section>

        <section className="flex flex-col gap-3 md:flex-row mt-4">
          <Button variant="outline" className="w-full h-14 border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate('/runner/dashboard')}>
            Cancel
          </Button>
          <Button theme="green" className="w-full h-14 shadow-[0_4px_20px_rgba(46,139,87,0.2)]" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit for review'}
          </Button>
        </section>
      </main>
    </div>
  );
};
