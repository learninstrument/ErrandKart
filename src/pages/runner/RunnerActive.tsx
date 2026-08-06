import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Phone, MessageSquare, Upload, Store, User, MapPin, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/UI/Button';
import { clearSession } from '../../utils/auth';
import { PaySellerModal } from '../../components/Runner/PaySellerModal';

const STATUS_STEPS = ['Heading to Pickup', 'At Market', 'Items Purchased', 'Heading to Drop-off', 'Delivered'];

export const RunnerActive: React.FC = () => {
  const navigate = useNavigate();

  const [errand, setErrand] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [receiptSelected, setReceiptSelected] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  const apiBaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL ?? 'http://localhost:4000');

  // Load active errand
  useEffect(() => {
    fetch(`${apiBaseUrl}/api/errands`, { method: 'GET', credentials: 'include' })
      .then(res => {
        if (res.status === 401) {
          clearSession();
          navigate('/login');
          throw new Error('Session expired');
        }
        return res.json();
      })
      .then(data => {
        if (data.errands) {
          const activeStatuses = ['active', 'shopping', 'en_route', 'arrived', 'heading_to_pickup', 'arrived_at_pickup', 'picked_up', 'heading_to_dropoff', 'arrived_at_dropoff'];
          const active = data.errands.find((e: any) => activeStatuses.includes(e.status));
          if (active) setErrand(active);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [apiBaseUrl, navigate]);

  // Poll for status updates
  useEffect(() => {
    if (!errand?.id) return;
    if (['completed', 'cancelled'].includes(errand.status)) return;

    const poll = () => {
      fetch(`${apiBaseUrl}/api/errands/${errand.id}`, { method: 'GET', credentials: 'include' })
        .then(res => res.json())
        .then(data => { if (data.errand) setErrand(data.errand); })
        .catch(console.error);
    };

    const interval = setInterval(poll, 7000);
    return () => clearInterval(interval);
  }, [errand?.id, errand?.status, apiBaseUrl]);

  const getStepIndex = (status: string) => {
    if (status === 'heading_to_pickup') return 0;
    if (status === 'at_market' || status === 'item_funds_requested' || status === 'item_funds_released') return 1;
    if (status === 'items_purchased') return 2;
    if (status === 'heading_to_dropoff' || status === 'arrived_at_dropoff') return 3;
    if (status === 'delivered' || status === 'completed') return 4;
    return -1;
  };

  const currentStep = errand ? getStepIndex(errand.status) : -1;

  const handleStepClick = async (stepIndex: number) => {
    if (!errand) return;
    if (stepIndex !== currentStep + 1) return;

    let nextStatus = '';
    if (stepIndex === 0) nextStatus = 'heading_to_pickup';
    else if (stepIndex === 1) nextStatus = 'at_market';
    else if (stepIndex === 2) nextStatus = 'items_purchased'; // Usually triggered by CTA, but left here for manual override
    else if (stepIndex === 3) nextStatus = 'heading_to_dropoff';
    else if (stepIndex === 4) nextStatus = 'delivered';

    if (!nextStatus) return;
    setError('');

    try {
      const res = await fetch(`${apiBaseUrl}/api/errands/${errand.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status');
      setErrand(data.errand);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const checklistItems = useMemo(() => {
    return errand?.description?.split('\n').filter((item: string) => item.trim() !== '') || [];
  }, [errand]);

  const toggleItem = (itemText: string) => {
    setCheckedItems(prev =>
      prev.includes(itemText) ? prev.filter(item => item !== itemText) : [...prev, itemText]
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black text-black dark:text-white">
        <div className="w-12 h-12 animate-spin rounded-full border-4 border-black/10 border-t-market-green" />
      </div>
    );
  }

  if (!errand) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black p-6 text-center text-black dark:text-white">
        <h3 className="text-xl font-black mb-2">No Active Gigs</h3>
        <p className="text-sm text-black/60 dark:text-white/60 mb-6 max-w-sm">
          You don't have any active errands right now. Go to the radar to accept available gigs.
        </p>
        <Button theme="green" onClick={() => navigate('/runner/dashboard')}>Open Gig Radar</Button>
      </div>
    );
  }

  const orderDisplayId = errand.id ? `EK-${String(errand.id).split('-')[0].toUpperCase()}` : '...';

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-white dark:bg-black text-black dark:text-white overflow-hidden">
      
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-5 pt-6 pb-4 bg-white/85 dark:bg-black/85 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <button onClick={() => navigate('/runner/dashboard')} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
          <ArrowLeft size={20} className="text-market-green" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-base font-black text-black dark:text-white">Active Gig</h1>
          <p className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest">{orderDisplayId}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/runner/chat/${errand.id}`)}
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-market-green hover:bg-black/10 transition-colors"
          >
            <MessageSquare size={18} />
          </button>
          <button
            onClick={() => window.location.href = `tel:${errand.customer?.phone_number || ''}`}
            className="w-10 h-10 rounded-full bg-market-green text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(46,139,87,0.3)]"
          >
            <Phone size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">

        {/* Errand Summary */}
        <div className="px-5 py-4 border-b border-black/5 dark:border-white/5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/40 dark:text-white/40 mb-1">Order #{orderDisplayId}</p>
          <h2 className="text-xl font-black text-black dark:text-white mb-1">{errand.title}</h2>
          <p className="text-sm font-bold text-market-green">
            Payout: ₦{Number(errand.budget_service_fee || 700).toLocaleString()}
          </p>
        </div>

        {/* Route Summary */}
        <div className="px-5 py-4 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                <Package size={14} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40">Pickup</p>
                <p className="text-sm font-bold text-black dark:text-white">{errand.pickup_address || 'Market / Pickup Location'}</p>
              </div>
            </div>
            <div className="ml-4 w-[2px] h-4 bg-black/10 dark:bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-kart-orange flex items-center justify-center flex-shrink-0">
                <MapPin size={14} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40">Drop-off</p>
                <p className="text-sm font-bold text-black dark:text-white">{errand.dropoff_address || 'Customer Location'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="px-5 py-4 border-b border-black/5 dark:border-white/5">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">Customer</h4>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-black/40 dark:text-white/40">
              <User size={20} />
            </div>
            <div>
              <p className="font-bold text-black dark:text-white">{errand.customer?.full_name || 'Customer'}</p>
              <p className="text-xs text-black/40 dark:text-white/40">{errand.customer?.phone_number || 'No contact'}</p>
            </div>
          </div>
          {errand.fulfillment_mode === 'supermarket-dispatch' && errand.supermarket_name && (
            <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-2">Supermarket</h4>
              <p className="flex items-center gap-2 text-sm font-bold text-black dark:text-white">
                <Store size={14} className="text-kart-orange" /> {errand.supermarket_name}
              </p>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="px-5 py-5">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-4">Delivery Progress</h4>
          <div className="space-y-4 relative before:content-[''] before:absolute before:left-3 before:top-4 before:bottom-4 before:w-[2px] before:bg-black/10 before:dark:bg-white/10">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = currentStep > idx || errand.status === 'completed';
              const isActive = currentStep === idx && errand.status !== 'completed';
              const canClick = idx === currentStep + 1;

              return (
                <motion.div
                  key={step}
                  className={`relative flex items-center gap-4 ${canClick ? 'cursor-pointer' : ''}`}
                  onClick={() => canClick && handleStepClick(idx)}
                  whileTap={canClick ? { scale: 0.98 } : {}}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${
                    isCompleted ? 'bg-market-green text-white' :
                    isActive ? 'bg-kart-orange text-white shadow-[0_0_10px_rgba(255,102,0,0.5)]' :
                    canClick ? 'bg-black/10 dark:bg-white/10 text-black/40 dark:text-white/40 border border-black/20 dark:border-white/20' :
                    'bg-white dark:bg-black border border-black/20 dark:border-white/20 text-black/20 dark:text-white/20'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={14} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-bold ${isActive ? 'text-kart-orange' : isCompleted ? 'text-market-green' : canClick ? 'text-black dark:text-white' : 'text-black/30 dark:text-white/30'}`}>
                      {step}
                    </h4>
                    {canClick && <p className="text-[10px] text-market-green/70 uppercase tracking-widest mt-0.5">Tap to mark as active</p>}
                  </div>
                  {isActive && <span className="text-[10px] font-bold text-kart-orange bg-kart-orange/10 px-2 py-0.5 rounded-md">Active</span>}
                  {isCompleted && <span className="text-[10px] font-bold text-market-green bg-market-green/10 px-2 py-0.5 rounded-md">Done</span>}
                </motion.div>
              );
            })}
          </div>
          {error && <p className="text-red-500 text-xs font-bold mt-4">{error}</p>}
        </div>

        {/* Shopping Checklist */}
        {(errand.status === 'shopping' || errand.status === 'active') && checklistItems.length > 0 && (
          <div className="px-5 pb-5">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-4">Shopping List</h4>
            <div className="space-y-2">
              {checklistItems.map((item: string, idx: number) => {
                const checked = checkedItems.includes(item);
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${checked ? 'bg-market-green/10 border-market-green/30 opacity-60' : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-black/20'}`}
                    onClick={() => toggleItem(item)}
                  >
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border-2 ${checked ? 'bg-market-green border-market-green text-white' : 'border-black/30 dark:border-white/30 text-transparent'}`}>
                      <CheckCircle2 size={12} strokeWidth={3} />
                    </div>
                    <p className={`text-sm font-medium flex-1 ${checked ? 'text-black/50 dark:text-white/50 line-through' : 'text-black dark:text-white'}`}>{item}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Receipt Upload */}
        {(errand.status === 'shopping' || currentStep >= 1) && (
          <div className="px-5 pb-6">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">Receipt / Proof</h4>
            <Button
              variant="outline"
              className={`w-full py-4 rounded-xl border-dashed border-2 flex items-center justify-center gap-2 ${receiptSelected ? 'border-market-green/50 text-market-green bg-market-green/10' : 'border-black/20 dark:border-white/20 text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'}`}
              onClick={() => setReceiptSelected(!receiptSelected)}
            >
              {receiptSelected ? <CheckCircle2 size={18} /> : <Upload size={18} />}
              {receiptSelected ? 'Receipt Uploaded ✓' : 'Upload Receipt Photo'}
            </Button>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pt-4 pb-8 border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]">
        {errand.status === 'at_market' && Number(errand.budget_item_cost) > 0 && (
          <Button theme="orange" className="w-full py-4 rounded-xl" onClick={() => setIsPayModalOpen(true)}>
            Request Item Funds (₦{Number(errand.budget_item_cost).toLocaleString()})
          </Button>
        )}
        
        {errand.status === 'item_funds_requested' && (
          <Button theme="gray" className="w-full py-4 rounded-xl" disabled>
            Waiting for Customer Approval...
          </Button>
        )}

        {errand.status === 'item_funds_released' && (
          <Button theme="green" className="w-full py-4 rounded-xl" onClick={() => handleStepClick(2)}>
            Funds Sent to Seller! Mark as Purchased
          </Button>
        )}

        {errand.status === 'completed' && (
          <Button theme="green" className="w-full py-4 rounded-xl" onClick={() => navigate(`/runner/delivery-review/${errand.id}`)}>
            Complete & Get Paid 🎉
          </Button>
        )}
      </div>

      <PaySellerModal 
        isOpen={isPayModalOpen} 
        onClose={() => setIsPayModalOpen(false)}
        apiBaseUrl={apiBaseUrl}
        errandId={errand.id}
        onSuccess={(updated) => {
          setErrand(updated);
          setIsPayModalOpen(false);
        }}
      />
    </div>
  );
};
