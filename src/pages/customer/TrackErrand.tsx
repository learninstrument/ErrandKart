import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MessageSquare, CheckCircle, Navigation } from 'lucide-react';
import * as L from 'leaflet';
import { motion, useAnimation } from 'framer-motion';

import { clearSession } from '../../utils/auth';

export const TrackErrand: React.FC = () => {
  const navigate = useNavigate();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const runnerMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const [order, setOrder] = useState<any>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const apiBaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL ?? 'http://localhost:4000');

  // Dynamic Coordinates from the Database (with Lagos fallbacks so map doesn't crash while loading)
  const pickupLocation = useMemo<[number, number]>(() => [Number(order?.pickup_lat || 6.4474), Number(order?.pickup_lng || 3.4558)], [order?.pickup_lat, order?.pickup_lng]);
  const dropoffLocation = useMemo<[number, number]>(() => [Number(order?.dropoff_lat || 6.4281), Number(order?.dropoff_lng || 3.4219)], [order?.dropoff_lat, order?.dropoff_lng]);
  const [runnerLocation, setRunnerLocation] = useState<[number, number]>([6.4408, 3.4469]);

  const [isLoading, setIsLoading] = useState(true);

  // 1. SMART POLLING ENGINE: Find the active order ONCE on page load
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
        const active = data?.errands?.find((o: any) => o.status === 'active' || o.status === 'pending') || data?.errands?.[0];
        if (active) {
          setOrder(active);
          setActiveOrderId(active.id);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [apiBaseUrl, navigate]);

  // 2. SMART POLLING ENGINE: Fetch ONLY the active order row. STOP fetching if completed!
  useEffect(() => {
    if (!activeOrderId) return;
    if (order?.status === 'completed' || order?.status === 'cancelled') return; // Engine Shutoff

    const pollOrder = () => {
      fetch(`${apiBaseUrl}/api/errands/${activeOrderId}`, { method: 'GET', credentials: 'include' })
        .then(res => res.json())
        .then(data => { if (data.errand) setOrder(data.errand); })
        .catch(console.error);
    };

    const interval = setInterval(pollOrder, 5000);
    return () => clearInterval(interval);
  }, [activeOrderId, order?.status, apiBaseUrl]);

  // 3. Sync the Runner Marker to the Database Coordinates
  useEffect(() => {
    if (order?.runner_lat && order?.runner_lng) {
      setRunnerLocation([Number(order.runner_lat), Number(order.runner_lng)]);
    } else if (order?.pickup_lat && order?.pickup_lng) {
      setRunnerLocation([Number(order.pickup_lat), Number(order.pickup_lng)]);
    }
  }, [order?.runner_lat, order?.runner_lng, order?.pickup_lat, order?.pickup_lng]);

  const status = order?.status || 'pending';
  const displayOrderId = order && order.id ? `EK-${String(order.id).split('-')[0].toUpperCase()}` : '...';


  const steps = [
    { title: 'Order Posted', subtitle: 'Request sent to ErrandKart', completed: true, active: status === 'pending' },
    { title: 'Runner Assigned', subtitle: order?.runner_id ? 'Runner accepted your errand' : 'Matching with a runner...', completed: !!order?.runner_id || status === 'completed', active: !!order?.runner_id && status === 'active' },
    { title: 'Heading to Store', subtitle: 'Est. arrival in 5 mins', completed: status === 'completed', active: status === 'active' },
    { title: 'Drop-off', subtitle: 'Awaiting drop-off', completed: status === 'completed', active: status === 'completed' },
  ];

  const pickupIcon = useMemo(
    () =>
      L.divIcon({
        className: '',
        html: `<div style="width:16px;height:16px;border-radius:999px;background:#ff6600;box-shadow:0 0 10px rgba(255,102,0,0.5);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }),
    []
  );

  const dropoffIcon = useMemo(
    () =>
      L.divIcon({
        className: '',
        html: `<div style="width:16px;height:16px;border-radius:999px;background:#2E8B57;box-shadow:0 0 10px rgba(46,139,87,0.5);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }),
    []
  );

  const runnerIcon = useMemo(
    () =>
      L.divIcon({
        className: '',
        html: `<div style="width:32px;height:32px;border-radius:16px;background:#2E8B57;color:#ffffff;font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 0 15px rgba(46,139,87,0.6); border: 2px solid #000000;"><span class="material-symbols-outlined" style="font-size:18px;">moped</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
    []
  );

  useEffect(() => {
    if (!order || !mapContainerRef.current || mapRef.current) return;

    // Use dark style if available, otherwise default to OSM
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(runnerLocation, 13);

    // Standard OSM with CSS dark filter applied
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    L.marker(pickupLocation, { icon: pickupIcon }).addTo(map);
    L.marker(dropoffLocation, { icon: dropoffIcon }).addTo(map);

    const runnerMarker = L.marker(runnerLocation, { icon: runnerIcon }).addTo(map);
    runnerMarkerRef.current = runnerMarker;

    const routeLine = L.polyline([pickupLocation, runnerLocation, dropoffLocation], {
      color: '#FF6600',
      weight: 4,
      dashArray: '8 10',
    }).addTo(map);
    routeLineRef.current = routeLine;

    map.fitBounds([pickupLocation, dropoffLocation], { padding: [60, 60] });
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
     
  }, [!!order]);

  useEffect(() => {
    if (!mapRef.current || !runnerMarkerRef.current || !routeLineRef.current) return;
    runnerMarkerRef.current.setLatLng(runnerLocation);
    routeLineRef.current.setLatLngs([pickupLocation, runnerLocation, dropoffLocation]);
  }, [runnerLocation, pickupLocation, dropoffLocation]);

  const StatusAndDetails = () => (
    <div className="flex flex-col h-full w-full">
      {/* Desktop Brand Header */}
      <div className="hidden lg:flex px-5 pb-6 items-center gap-2 border-b border-black/5 dark:border-white/5">
        <h1 className="text-3xl font-black text-kart-orange tracking-tight">ErrandKart</h1>
        <span className="px-2.5 py-0.5 rounded-full bg-market-green/20 text-market-green text-[10px] font-bold uppercase tracking-wider border border-market-green/30">Live Track</span>
      </div>

      {/* Runner Details Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order?.runner?.full_name || 'Pending'}`}
              alt="Runner"
              className="w-14 h-14 rounded-full object-cover border-2 border-[#FF6600]"
            />
            {order?.runner_id && (
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#1d100a] rounded-full p-0.5">
                <div className="bg-market-green text-white dark:text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                  ⭐ 4.9
                </div>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-black dark:text-white">{order?.runner?.full_name || 'Searching...'}</h2>
            <p className="text-sm text-black/60 dark:text-white/60 flex items-center gap-1 capitalize">
              {order?.runner?.vehicle_type ? `🚙 ${order.runner.vehicle_type}` : '🛵 Motorbike'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-[#FF6600] hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-sm" onClick={() => navigate(`/customer/chat/${displayOrderId}`)}>
            <MessageSquare size={20} />
          </button>
          <button className="w-12 h-12 rounded-full bg-[#FF6600] text-white dark:text-black flex items-center justify-center hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(255,102,0,0.3)]">
            <Phone size={20} />
          </button>
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="px-5 py-4 flex-grow overflow-y-auto custom-scrollbar">
        <div className="relative pl-14 space-y-8 before:content-[''] before:absolute before:left-[27px] before:top-2 before:bottom-4 before:w-[2px] before:bg-black/10 before:dark:bg-white/10">
          {steps.map((step, index) => {
            const isCompleted = step.completed && !step.active;
            const isActive = step.active;
            
            return (
              <div key={index} className="relative">
                <div className="absolute -left-[43px] w-8 h-8 flex items-center justify-center bg-white dark:bg-[#0A0A0A] rounded-full z-10">
                  {isActive ? (
                    <div className="w-3 h-3 rounded-full bg-[#FF6600] shadow-[0_0_10px_rgba(255,102,0,0.8)]"></div>
                  ) : isCompleted ? (
                    <CheckCircle size={18} className="text-market-green" strokeWidth={3} />
                  ) : (
                    <div className="w-2 h-2 rounded-full border-2 border-black/20 dark:border-white/20 bg-transparent"></div>
                  )}
                </div>
                <div className={`flex justify-between items-start gap-3 ${!isActive && !isCompleted ? 'opacity-50' : ''}`}>
                  <div className="flex-1">
                    <h3 className={`text-[16px] font-bold leading-tight ${isActive ? 'text-kart-orange' : isCompleted ? 'text-market-green' : 'text-black dark:text-white'}`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm mt-1.5 leading-snug ${isActive ? 'text-black/80 dark:text-white/80' : isCompleted ? 'text-black/60 dark:text-white/60' : 'text-black/40 dark:text-white/40'}`}>
                      {step.subtitle}
                    </p>
                  </div>
                  {isActive && <span className="text-xs font-bold text-kart-orange shrink-0 bg-kart-orange/10 px-2 py-1 rounded-md">Now</span>}
                  {isCompleted && <span className="text-xs font-bold text-market-green shrink-0 bg-market-green/10 px-2 py-1 rounded-md">Done</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Area */}
      <div className="px-5 pt-2 mt-auto mb-4 flex flex-col gap-3">
        <button className="w-full bg-kart-orange text-white dark:text-black text-[16px] font-bold py-4 rounded-xl hover:bg-kart-orangeHover transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,102,0,0.25)]">
          View Order Details
        </button>
        {status !== 'completed' && status !== 'cancelled' && (
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to cancel this errand?")) {
                fetch(`${apiBaseUrl}/api/errands/${order?.id}/status`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ status: 'cancelled' }),
                }).then(() => window.location.reload());
              }
            }}
            className="w-full bg-transparent border-2 border-red-500/50 text-red-500 text-[16px] font-bold py-4 rounded-xl hover:bg-red-500/10 transition-colors flex items-center justify-center"
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );

  const MobileBottomSheet = () => {
    return (
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 500 }}
        dragElastic={0.1}
        initial={{ y: "40%" }}
        className="absolute bottom-0 left-0 z-40 flex h-[75%] w-full flex-col rounded-t-[2rem] bg-white/95 dark:bg-[#0A0A0A]/95 pb-10 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.6)] backdrop-blur-3xl lg:hidden"
      >
        <div className="flex w-full justify-center pb-3 pt-4 cursor-grab active:cursor-grabbing">
          <div className="h-1.5 w-12 rounded-full bg-black/20 dark:bg-white/20" />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden pt-2">
          <StatusAndDetails />
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-white dark:bg-black text-black dark:text-white selection:bg-kart-orange selection:text-white transition-colors duration-300">
      
      {!isLoading && !order ? (
        <div className="flex h-full w-full flex-col items-center justify-center p-5 text-center">
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
            You don't have any active errands right now. Once you post an errand, you can track it here in real-time.
          </p>
          <button 
            onClick={() => navigate('/customer/post-errand')}
            className="bg-kart-orange text-white font-bold py-3.5 px-8 rounded-full shadow-[0_4px_15px_rgba(255,102,0,0.3)] hover:scale-105 transition-transform"
          >
            Post an Errand
          </button>
        </div>
      ) : (
      <>
        {/* Center Map */}
      <main className="relative flex-1">
        <div className="relative h-full w-full bg-white dark:bg-black">
          {/* Real Leaflet Map Container */}
          <div ref={mapContainerRef} className="h-full w-full z-0" />
          
          {/* Ambient map glow overlay to blend with theme */}
          <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_100px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] bg-white/10 dark:bg-black/20" />
          
          {/* Mobile Header Over Map */}
          <header className="absolute top-0 left-0 w-full z-20 flex items-center justify-between px-5 pt-6 pb-4 bg-gradient-to-b from-white/90 dark:from-[#0A0A0A]/80 to-transparent backdrop-blur-xl pointer-events-none">
            <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors pointer-events-auto">
              <ArrowLeft size={20} className="text-[#FF6600]" />
            </button>
            <h1 className="text-2xl font-black text-[#FF6600] tracking-tight">ErrandKart</h1>
            <div className="w-10" />
          </header>

          {/* Floating Action Buttons */}
          <div className="absolute top-24 right-5 flex flex-col gap-2 z-20">
            <button className="w-10 h-10 rounded-full bg-white/80 dark:bg-white/10 shadow-lg flex items-center justify-center border border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-white/20 transition-colors backdrop-blur-sm">
              <Navigation size={18} className="text-black dark:text-white" />
            </button>
          </div>

          {/* Status Chip Floating */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-[#FF6600]/10 border border-[#FF6600]/30 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(255,102,0,0.15)]">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6600] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF6600]"></span>
              </span>
              <span className="text-xs font-bold text-[#FF6600] tracking-wide">En Route</span>
            </div>
          </div>
        </div>
        {/* Mobile Bottom Sheet */}
        <MobileBottomSheet />
      </main>

        {/* Desktop Sidebar (Right Panel) */}
        <aside className="hidden lg:flex lg:w-[35%] lg:min-w-[380px] lg:max-w-[420px] h-full flex-col border-l border-black/10 dark:border-white/10 bg-white dark:bg-[#0A0A0A] overflow-y-auto shadow-2xl z-30 pt-10">
          <StatusAndDetails />
        </aside>
      </>
      )}
    </div>
  );
};
