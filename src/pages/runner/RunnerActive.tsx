import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Phone, MessageSquare, Upload, Store, Navigation, MapPin, User } from 'lucide-react';
import * as L from 'leaflet';
import { motion, useAnimation } from 'framer-motion';
import { Button } from '../../components/UI/Button';
import { clearSession } from '../../utils/auth';

const STATUS_STEPS = ['Shopping', 'En Route', 'Arrived'];

export const RunnerActive: React.FC = () => {
  const navigate = useNavigate();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const runnerMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const [errand, setErrand] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [receiptSelected, setReceiptSelected] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [error, setError] = useState('');

  const apiBaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL ?? 'http://localhost:4000');

  // Fallback coordinates for map initialization
  const [runnerLocation, setRunnerLocation] = useState<[number, number]>([6.4408, 3.4469]);
  const dropoffLocation = useMemo<[number, number]>(() => [Number(errand?.dropoff_lat || 6.4281), Number(errand?.dropoff_lng || 3.4219)], [errand?.dropoff_lat, errand?.dropoff_lng]);

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
          const active = data.errands.find((e: any) =>
            ['active', 'shopping', 'en_route', 'arrived'].includes(e.status)
          );
          if (active) {
            setErrand(active);
            if (active.pickup_lat && active.pickup_lng) {
               setRunnerLocation([Number(active.pickup_lat), Number(active.pickup_lng)]);
            }
          }
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [apiBaseUrl, navigate]);

  // Geolocation watch stream
  useEffect(() => {
    if (!errand || !['shopping', 'en_route'].includes(errand.status)) return;
    if (!navigator.geolocation) return;

    const successCallback = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setRunnerLocation([latitude, longitude]);
      fetch(`${apiBaseUrl}/api/errands/${errand.id}/location`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ lat: latitude, lng: longitude }),
      }).catch(console.error);
    };

    const watchId = navigator.geolocation.watchPosition(successCallback, (err) => console.warn(err.message), {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [errand?.id, errand?.status, apiBaseUrl]);

  const getStepIndex = (status: string) => {
    if (status === 'shopping') return 0;
    if (status === 'en_route') return 1;
    if (status === 'arrived') return 2;
    return -1; // 'active' means they haven't started shopping
  };

  const currentStep = errand ? getStepIndex(errand.status) : -1;

  const handleStepClick = async (stepIndex: number) => {
    if (!errand) return;
    // Require sequential steps: Can only click the *next* logical step
    if (stepIndex !== currentStep + 1) return;

    let nextStatus = '';
    if (stepIndex === 0) nextStatus = 'shopping';
    else if (stepIndex === 1) nextStatus = 'en_route';
    else if (stepIndex === 2) nextStatus = 'arrived';

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

  // --- MAP LOGIC ---
  const dropoffIcon = useMemo(
    () =>
      L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;border-radius:999px;background:#ffffff;border:3px solid #2E8B57;box-shadow:0 0 0 6px rgba(46,139,87,0.18);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
    []
  );

  const runnerIcon = useMemo(
    () =>
      L.divIcon({
        className: '',
        html: `<div style="width:36px;height:36px;border-radius:999px;background:#2E8B57;color:#ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px rgba(46,139,87,0.6); border: 3px solid black;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      }),
    []
  );

  useEffect(() => {
    if (!errand || !mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(runnerLocation, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    L.marker(dropoffLocation, { icon: dropoffIcon }).addTo(map);

    const runnerMarker = L.marker(runnerLocation, { icon: runnerIcon }).addTo(map);
    runnerMarkerRef.current = runnerMarker;

    const routeLine = L.polyline([runnerLocation, dropoffLocation], {
      color: '#2E8B57',
      weight: 4,
      dashArray: '8 10',
    }).addTo(map);
    routeLineRef.current = routeLine;

    map.fitBounds([runnerLocation, dropoffLocation], { padding: [60, 60] });
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!errand]);

  useEffect(() => {
    if (!mapRef.current || !runnerMarkerRef.current || !routeLineRef.current) return;
    runnerMarkerRef.current.setLatLng(runnerLocation);
    routeLineRef.current.setLatLngs([runnerLocation, dropoffLocation]);
    // Optionally pan map to runner
    // mapRef.current.panTo(runnerLocation);
  }, [runnerLocation, dropoffLocation]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-black text-white">Loading radar...</div>;
  }

  if (!errand) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
        <h3 className="text-xl font-black mb-2">No Active Gigs</h3>
        <p className="text-sm text-white/60 mb-6 max-w-sm">
          You don't have any active errands right now. Go to the radar to accept available gigs.
        </p>
        <Button theme="green" onClick={() => navigate('/runner/dashboard')}>Open Gig Radar</Button>
      </div>
    );
  }

  const orderDisplayId = errand && errand.id ? `EK-${String(errand.id).split('-')[0].toUpperCase()}` : '...';

  const StatusAndChecklist = () => (
    <div className="flex flex-col h-full w-full">
      <div className="mb-6 flex gap-2">
        <Button variant="outline" className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold" onClick={() => navigate(`/runner/chat/${errand.id}`)}>
          <MessageSquare size={16} className="mr-2" /> Chat
        </Button>
        <Button theme="green" className="flex-1 py-3 rounded-xl shadow-[0_0_15px_rgba(46,139,87,0.3)] font-bold text-black" onClick={() => window.location.href = `tel:${errand.customer?.phone_number || ''}`}>
          <Phone size={16} className="mr-2" /> Call
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 mb-6">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 mb-4">Delivery Progress</h4>
        <div className="space-y-4 relative before:content-[''] before:absolute before:left-3 before:top-4 before:bottom-4 before:w-[2px] before:bg-white/10">
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = currentStep > idx || errand.status === 'completed';
            const isActive = currentStep === idx && errand.status !== 'completed';
            const canClick = idx === currentStep + 1;

            return (
              <div 
                key={step} 
                className={`relative flex items-center gap-4 ${canClick ? 'cursor-pointer hover:opacity-80' : ''}`}
                onClick={() => canClick && handleStepClick(idx)}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${isCompleted ? 'bg-market-green text-black' : isActive ? 'bg-kart-orange text-black shadow-[0_0_10px_rgba(255,102,0,0.5)]' : canClick ? 'bg-white/10 text-white/40 border border-white/20 hover:border-market-green/50 hover:text-market-green transition-colors' : 'bg-[#0A0A0A] border border-white/20 text-white/20'}`}>
                  {isCompleted ? <CheckCircle2 size={14} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${isActive ? 'text-kart-orange' : isCompleted ? 'text-market-green' : canClick ? 'text-white' : 'text-white/40'}`}>
                    {step}
                  </h4>
                  {canClick && <p className="text-[10px] text-market-green/70 uppercase tracking-widest mt-0.5">Tap to mark active</p>}
                </div>
              </div>
            );
          })}
        </div>
        {error && <p className="text-red-500 text-xs font-bold mt-4 px-2">{error}</p>}
      </div>

      {/* Shopping Checklist */}
      {(errand.status === 'shopping' || errand.status === 'active') && checklistItems.length > 0 && (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 mb-6 flex-1 overflow-y-auto custom-scrollbar">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 mb-4">Shopping List</h4>
          <div className="space-y-3">
            {checklistItems.map((item: string, idx: number) => {
              const checked = checkedItems.includes(item);
              return (
                <div 
                  key={idx} 
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checked ? 'bg-market-green/10 border-market-green/30 opacity-60' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                  onClick={() => toggleItem(item)}
                >
                  <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border-2 ${checked ? 'bg-market-green border-market-green text-black' : 'border-white/30 text-transparent'}`}>
                    <CheckCircle2 size={12} strokeWidth={3} />
                  </div>
                  <p className={`text-sm font-medium ${checked ? 'text-white/60 line-through' : 'text-white'}`}>{item}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Receipt Upload */}
      {(errand.status === 'shopping' || currentStep >= 1) && (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 mb-4 mt-auto">
           <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 mb-3">Receipt / Proof</h4>
           <Button variant="outline" className={`w-full py-4 rounded-xl border-dashed border-2 flex items-center justify-center gap-2 ${receiptSelected ? 'border-market-green/50 text-market-green bg-market-green/10' : 'border-white/20 text-white/60 hover:bg-white/5'}`} onClick={() => setReceiptSelected(!receiptSelected)}>
              {receiptSelected ? <CheckCircle2 size={18} /> : <Upload size={18} />}
              {receiptSelected ? 'Receipt Uploaded' : 'Upload Receipt Photo'}
           </Button>
        </div>
      )}
    </div>
  );

  const MobileBottomSheet = () => {
    const controls = useAnimation();
    const [isExpanded, setIsExpanded] = useState(false);

    // Initial state: collapse the sheet to show the map
    useEffect(() => {
      controls.start({ y: "60%" });
    }, [controls]);

    const handleDragEnd = (_event: any, info: any) => {
      // Swipe down
      if (info.offset.y > 50 || info.velocity.y > 500) {
        controls.start({ y: "60%" });
        setIsExpanded(false);
      } 
      // Swipe up
      else if (info.offset.y < -50 || info.velocity.y < -500) {
        controls.start({ y: "0%" });
        setIsExpanded(true);
      } else {
        // Snap back to nearest
        controls.start({ y: isExpanded ? "0%" : "60%" });
      }
    };

    return (
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 400 }}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ y: "60%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute bottom-0 left-0 z-40 flex h-[75%] w-full flex-col rounded-t-[2rem] bg-[#0A0A0A]/95 pb-10 shadow-[0_-20px_50px_rgba(0,0,0,0.6)] backdrop-blur-3xl lg:hidden"
      >
        <div className="flex w-full justify-center pb-3 pt-4 cursor-grab active:cursor-grabbing">
          <div className="h-1.5 w-12 rounded-full bg-white/20" />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden px-5 pt-2">
          <div className="mb-4">
             <h3 className="text-xl font-black text-white">{errand.title}</h3>
             <p className="text-sm font-bold text-market-green mt-1">Payout: ₦{Number(errand.budget_service_fee || 700).toLocaleString()}</p>
          </div>
          <StatusAndChecklist />
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-black text-white selection:bg-market-green selection:text-white">
      <aside className="hidden lg:flex lg:w-[25%] lg:min-w-[300px] lg:max-w-[340px] h-full flex-col border-r border-white/10 bg-black p-0 overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="p-8 pb-4 border-b border-white/5">
          <button onClick={() => navigate('/runner/dashboard')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 text-sm font-bold">
            <ArrowLeft size={16} /> Radar View
          </button>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tighter text-white">Active Gig</h2>
          </div>
        </div>

        <div className="p-8 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50 mb-2">Order #{orderDisplayId}</p>
          <h3 className="text-2xl font-black text-white leading-tight">{errand.title}</h3>
          <p className="mt-3 text-sm text-white/70">
            Customer Budget: ₦{Number(errand.budget_customer_fee).toLocaleString()}<br/>
            Payout: <span className="text-market-green font-bold text-lg">₦{Number(errand.budget_service_fee || 700).toLocaleString()}</span>
          </p>
        </div>

        {/* Customer Info */}
        <div className="p-8 border-t border-white/5 flex-1">
          <h4 className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">Dropoff Customer</h4>
          <div className="flex items-center gap-4 mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/50">
              <User size={24} />
            </div>
            <div>
              <p className="text-base font-bold text-white">{errand.customer?.full_name || 'Customer'}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">{errand.customer?.phone_number || 'No contact provided'}</p>
            </div>
          </div>
          
          {/* Supermarket info if applicable */}
          {errand.fulfillment_mode === 'supermarket-dispatch' && errand.supermarket_name && (
            <div className="mt-8 pt-8 border-t border-white/5">
              <h4 className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">Pickup Location</h4>
              <p className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                  <Store size={14} className="text-kart-orange" /> {errand.supermarket_name}
              </p>
              {errand.supermarket_contact && (
                  <p className="text-[11px] text-white/60 mb-3">Contact: {errand.supermarket_contact}</p>
              )}
              {errand.supermarket_order_ref && (
                  <p className="text-[11px] text-white/50 mb-3">Ref: <span className="text-white font-bold">{errand.supermarket_order_ref}</span></p>
              )}
            </div>
          )}
        </div>
      </aside>

      <main className="relative flex-1">
        <div className="relative h-full w-full bg-black">
          {/* Real Leaflet Map Container */}
          <div ref={mapContainerRef} className="h-full w-full z-0" />
          
          <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_100px_rgba(0,0,0,1)] bg-black/40" />
          
          {/* Mobile Header Over Map */}
          <header className="absolute top-0 left-0 w-full z-20 flex items-center justify-between px-5 pt-6 pb-4 bg-gradient-to-b from-[#0A0A0A]/80 to-transparent backdrop-blur-xl pointer-events-none lg:hidden">
            <button onClick={() => navigate('/runner/dashboard')} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1c2026] hover:bg-[#262a31] transition-colors pointer-events-auto">
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div className="flex items-center gap-2 rounded-full border border-market-green/30 bg-market-green/10 px-4 py-2 backdrop-blur-md pointer-events-auto shadow-[0_0_20px_rgba(46,139,87,0.2)]">
              <Navigation size={12} className="text-market-green fill-market-green animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-market-green">Navigating</span>
            </div>
            <div className="w-10"></div>
          </header>
          
          {/* Floating Location Button */}
          <div className="absolute top-24 right-5 flex flex-col gap-2 z-20 lg:hidden">
            <button className="w-10 h-10 rounded-full bg-[#1c2026] shadow-lg flex items-center justify-center border border-white/10 hover:bg-[#262a31] transition-colors pointer-events-auto" onClick={() => mapRef.current?.panTo(runnerLocation)}>
              <MapPin size={18} className="text-white" />
            </button>
          </div>
        </div>

        <MobileBottomSheet />
      </main>

      <aside className="hidden lg:flex lg:w-[35%] lg:min-w-[380px] lg:max-w-[420px] h-full flex-col border-l border-white/10 bg-[#0A0A0A] p-8 overflow-y-auto shadow-2xl z-30">
        <StatusAndChecklist />
      </aside>
    </div>
  );
};
