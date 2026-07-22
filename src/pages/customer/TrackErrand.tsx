import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MessageSquare, CheckCircle, Navigation, MapPin, Package } from 'lucide-react';
import { motion } from 'framer-motion';

import { clearSession } from '../../utils/auth';

export const TrackErrand: React.FC = () => {
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const apiBaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL ?? 'http://localhost:4000');

  const [isLoading, setIsLoading] = useState(true);

  // 1. Find the active order on page load
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
        const activeStatuses = ['pending', 'active', 'shopping', 'en_route', 'arrived', 'heading_to_pickup', 'arrived_at_pickup', 'picked_up', 'heading_to_dropoff', 'arrived_at_dropoff'];
        const active = data?.errands?.find((o: any) => activeStatuses.includes(o.status));
        if (active) {
          setOrder(active);
          setActiveOrderId(active.id);
        } else {
          setOrder(null);
          setActiveOrderId(null);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [apiBaseUrl, navigate]);

  // 2. Poll the active order every 5 seconds
  useEffect(() => {
    if (!activeOrderId) return;
    if (order?.status === 'completed' || order?.status === 'cancelled') return;

    const pollOrder = () => {
      fetch(`${apiBaseUrl}/api/errands/${activeOrderId}`, { method: 'GET', credentials: 'include' })
        .then(res => res.json())
        .then(data => { if (data.errand) setOrder(data.errand); })
        .catch(console.error);
    };

    const interval = setInterval(pollOrder, 5000);
    return () => clearInterval(interval);
  }, [activeOrderId, order?.status, apiBaseUrl]);

  const status = order?.status || 'pending';
  const displayOrderId = order && order.id ? `EK-${String(order.id).split('-')[0].toUpperCase()}` : '...';

  const steps = [
    { title: 'Order Posted', subtitle: 'Request sent to ErrandKart', completed: true, active: status === 'pending' },
    { title: 'Runner Assigned', subtitle: order?.runner_id ? 'Runner accepted your errand' : 'Matching with a runner...', completed: !!order?.runner_id || status === 'completed', active: !!order?.runner_id && status === 'active' },
    { title: 'Heading to Pickup', subtitle: etaLeg1 || 'Heading to market', completed: ['arrived_at_pickup', 'picked_up', 'heading_to_dropoff', 'arrived_at_dropoff', 'completed'].includes(status), active: status === 'heading_to_pickup' },
    { title: 'Arrived at Pickup', subtitle: 'Runner is at the market', completed: ['picked_up', 'heading_to_dropoff', 'arrived_at_dropoff', 'completed'].includes(status), active: status === 'arrived_at_pickup' },
    { title: 'Items Picked Up', subtitle: 'Runner got your items', completed: ['heading_to_dropoff', 'arrived_at_dropoff', 'completed'].includes(status), active: status === 'picked_up' },
    { title: 'Heading to Drop-off', subtitle: etaLeg2 || 'On the way to you', completed: ['arrived_at_dropoff', 'completed'].includes(status), active: status === 'heading_to_dropoff' },
    { title: 'Arrived at Drop-off', subtitle: 'Runner has arrived', completed: status === 'completed', active: status === 'arrived_at_dropoff' },
    { title: 'Completed', subtitle: 'Errand delivered successfully ✓', completed: status === 'completed', active: status === 'completed' },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[100dvh] w-full flex-col items-center justify-center bg-white dark:bg-black text-black dark:text-white">
        <div className="w-16 h-16 mb-4 animate-spin rounded-full border-4 border-black/10 border-t-kart-orange" />
        <h2 className="text-xl font-bold">Loading your errand...</h2>
      </div>
    );
  }

  // No active order
  if (!order) {
    return (
      <div className="flex h-[100dvh] w-full flex-col items-center justify-center p-5 text-center bg-white dark:bg-black text-black dark:text-white">
        <header className="absolute top-0 left-0 w-full z-20 flex items-center px-5 pt-6 pb-4">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
            <ArrowLeft size={20} className="text-[#FF6600]" />
          </button>
        </header>
        <div className="w-24 h-24 mb-6 rounded-full bg-kart-orange/10 flex items-center justify-center border border-kart-orange/20">
          <Navigation size={40} className="text-kart-orange opacity-50" />
        </div>
        <h2 className="text-2xl font-black mb-2">No Active Errands</h2>
        <p className="text-black/50 dark:text-white/50 mb-8 max-w-sm">
          You don't have any active errands right now. Once you post an errand, you can track it here.
        </p>
        <button
          onClick={() => navigate('/customer/post-errand')}
          className="bg-kart-orange text-white font-bold py-3.5 px-8 rounded-full shadow-[0_4px_15px_rgba(255,102,0,0.3)] hover:scale-105 transition-transform"
        >
          Post an Errand
        </button>
      </div>
    );
  }

  // Cancelled
  if (status === 'cancelled') {
    return (
      <div className="flex h-[100dvh] w-full flex-col items-center justify-center p-5 text-center bg-white dark:bg-black text-black dark:text-white">
        <header className="absolute top-0 left-0 w-full z-20 flex items-center px-5 pt-6 pb-4">
          <button onClick={() => navigate('/customer/dashboard')} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 transition-colors">
            <ArrowLeft size={20} className="text-red-500" />
          </button>
        </header>
        <div className="w-24 h-24 mb-6 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <CheckCircle size={40} className="text-red-500 opacity-50" />
        </div>
        <h2 className="text-2xl font-black mb-2 text-red-500">Order Cancelled</h2>
        <p className="text-black/50 dark:text-white/50 mb-8 max-w-sm">This errand has been cancelled.</p>
        <button onClick={() => navigate('/customer/dashboard')} className="bg-red-500 text-white font-bold py-3.5 px-8 rounded-full">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-white dark:bg-black text-black dark:text-white overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-5 pt-6 pb-4 bg-white/85 dark:bg-black/85 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
          <ArrowLeft size={20} className="text-[#FF6600]" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-base font-black text-black dark:text-white">Track Errand</h1>
          <p className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest">{displayOrderId}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/customer/chat/${displayOrderId}`)}
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-[#FF6600] hover:bg-black/10 transition-colors"
          >
            <MessageSquare size={18} />
          </button>
          <button className="w-10 h-10 rounded-full bg-[#FF6600] text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(255,102,0,0.3)]">
            <Phone size={18} />
          </button>
        </div>
      </header>

      {/* Runner Card */}
      <div className="px-5 py-4 flex items-center gap-4 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]">
        <div className="relative">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order?.runner?.full_name || 'Pending'}`}
            alt="Runner"
            className="w-14 h-14 rounded-full object-cover border-2 border-[#FF6600]"
          />
          {order?.runner_id && (
            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#0A0A0A] rounded-full p-0.5">
              <div className="bg-market-green text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">⭐ 4.9</div>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-base font-bold text-black dark:text-white">{order?.runner?.full_name || 'Searching for runner...'}</h2>
          <p className="text-sm text-black/50 dark:text-white/50">
            {order?.runner?.vehicle_type ? `🚙 ${order.runner.vehicle_type}` : '🛵 Motorbike'}
          </p>
        </div>
        {/* Live status pulse */}
        <div className="flex items-center gap-1.5 bg-kart-orange/10 border border-kart-orange/20 px-3 py-1.5 rounded-full">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6600] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF6600]" />
          </span>
          <span className="text-[10px] font-bold text-[#FF6600] uppercase tracking-wider capitalize">{status.replace(/_/g, ' ')}</span>
        </div>
      </div>

      {/* Errand Info */}
      <div className="px-5 py-4 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
        <h3 className="font-bold text-black dark:text-white mb-2">{order?.title}</h3>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
            <Package size={14} className="text-black/40 dark:text-white/40 flex-shrink-0" />
            <span className="font-medium">{order?.pickup_address || 'Market pickup'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
            <MapPin size={14} className="text-kart-orange flex-shrink-0" />
            <span className="font-medium">{order?.dropoff_address || 'Your location'}</span>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-5">Delivery Timeline</h4>
        <div className="relative pl-14 space-y-7 before:content-[''] before:absolute before:left-[27px] before:top-2 before:bottom-4 before:w-[2px] before:bg-black/10 before:dark:bg-white/10">
          {steps.map((step, index) => {
            const isCompleted = step.completed && !step.active;
            const isActive = step.active;
            return (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="absolute -left-[43px] w-8 h-8 flex items-center justify-center bg-white dark:bg-black rounded-full z-10">
                  {isActive ? (
                    <div className="w-3 h-3 rounded-full bg-[#FF6600] shadow-[0_0_10px_rgba(255,102,0,0.8)]" />
                  ) : isCompleted ? (
                    <CheckCircle size={18} className="text-market-green" strokeWidth={3} />
                  ) : (
                    <div className="w-2 h-2 rounded-full border-2 border-black/20 dark:border-white/20 bg-transparent" />
                  )}
                </div>
                <div className={`flex justify-between items-start gap-3 ${!isActive && !isCompleted ? 'opacity-40' : ''}`}>
                  <div className="flex-1">
                    <h3 className={`text-[15px] font-bold leading-tight ${isActive ? 'text-kart-orange' : isCompleted ? 'text-market-green' : 'text-black dark:text-white'}`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm mt-1 leading-snug ${isActive ? 'text-black/70 dark:text-white/70' : isCompleted ? 'text-black/50 dark:text-white/50' : 'text-black/30 dark:text-white/30'}`}>
                      {step.subtitle}
                    </p>
                  </div>
                  {isActive && <span className="text-xs font-bold text-kart-orange shrink-0 bg-kart-orange/10 px-2.5 py-1 rounded-lg">Now</span>}
                  {isCompleted && <span className="text-xs font-bold text-market-green shrink-0 bg-market-green/10 px-2.5 py-1 rounded-lg">Done</span>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="px-5 pt-4 pb-8 border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A] flex flex-col gap-3">
        {status !== 'completed' && status !== 'cancelled' && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to cancel this errand?')) {
                fetch(`${apiBaseUrl}/api/errands/${order?.id}/status`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ status: 'cancelled' }),
                }).then(() => window.location.reload());
              }
            }}
            className="w-full bg-transparent border-2 border-red-500/30 text-red-500 text-sm font-bold py-3.5 rounded-xl hover:bg-red-500/5 transition-colors"
          >
            Cancel Order
          </button>
        )}
        {status === 'completed' && (
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="w-full bg-market-green text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity shadow-[0_4px_15px_rgba(46,139,87,0.3)]"
          >
            ✓ Done — Back to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};
