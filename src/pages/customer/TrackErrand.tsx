import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MessageSquare, CheckCircle, Circle, Navigation } from 'lucide-react';
import * as L from 'leaflet';
import { Button } from '../../components/UI/Button';

export const TrackErrand: React.FC = () => {
  const navigate = useNavigate();
  const pickupLocation: [number, number] = [6.4474, 3.4558];
  const dropoffLocation: [number, number] = [6.4281, 3.4219];
  const [runnerLocation, setRunnerLocation] = useState<[number, number]>([6.4408, 3.4469]);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const runnerMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const steps = [
    { title: 'Errand Posted', subtitle: 'Request sent to ErrandKart', completed: true },
    { title: 'Runner Assigned', subtitle: 'Michael B. accepted your errand', completed: true },
    { title: 'On the way', subtitle: 'Runner is heading to pickup', completed: true, active: true },
    { title: 'Completed', subtitle: 'Awaiting drop-off', completed: false },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setRunnerLocation(prev => {
        const nextLat = prev[0] - 0.00055;
        const nextLng = prev[1] - 0.0007;
        const reached = nextLat <= dropoffLocation[0] && nextLng <= dropoffLocation[1];
        return reached ? dropoffLocation : [nextLat, nextLng];
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [dropoffLocation]);

  const pickupIcon = useMemo(
    () =>
      L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;border-radius:999px;background:#ffffff;border:3px solid #FF6600;box-shadow:0 0 0 6px rgba(255,102,0,0.18);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
    []
  );

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
        html: `<div style="width:26px;height:26px;border-radius:12px;background:#FF6600;color:#ffffff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(255,102,0,0.45);">R</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      }),
    []
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(runnerLocation, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    L.marker(pickupLocation, { icon: pickupIcon }).addTo(map);
    L.marker(dropoffLocation, { icon: dropoffIcon }).addTo(map);

    const runnerMarker = L.marker(runnerLocation, { icon: runnerIcon }).addTo(map);
    runnerMarkerRef.current = runnerMarker;

    const routeLine = L.polyline([pickupLocation, runnerLocation, dropoffLocation], {
      color: '#FF6600',
      weight: 3,
      dashArray: '8 10',
    }).addTo(map);
    routeLineRef.current = routeLine;

    map.fitBounds([pickupLocation, dropoffLocation], { padding: [60, 60] });
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [pickupLocation, dropoffLocation, pickupIcon, dropoffIcon, runnerIcon, runnerLocation]);

  useEffect(() => {
    if (!mapRef.current || !runnerMarkerRef.current || !routeLineRef.current) return;
    runnerMarkerRef.current.setLatLng(runnerLocation);
    routeLineRef.current.setLatLngs([pickupLocation, runnerLocation, dropoffLocation]);
  }, [runnerLocation, pickupLocation, dropoffLocation]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <header className="sticky top-0 z-30 hidden border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:block md:px-10">
        <div className="flex items-center gap-10">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex cursor-pointer items-center gap-2" onClick={() => navigate('/customer/dashboard')}>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-kart-orange text-xs font-black text-white">
                K
              </div>
              <h1 className="text-xl font-black tracking-tight text-white">
                Errand<span className="text-kart-orange">Kart</span>
              </h1>
            </div>
            <div className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 font-bold text-white md:flex">
              SD
            </div>
          </div>
        </div>
      </header>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md md:hidden">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/60 transition-colors hover:text-kart-orange">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-white">Errand Status</h2>
        <div className="w-8"></div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6 pb-10 md:flex-row md:p-10">
        <div className="flex w-full flex-col md:w-2/3">
          <div className="z-10 flex items-center justify-between rounded-t-[28px] border border-b-0 border-white/10 bg-[#111722] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:p-8">
            <div>
              <h3 className="mb-1 text-xl font-black text-white md:text-2xl">Grocery Pickup</h3>
              <p className="text-sm font-medium text-slate-400">Order #EK-4920</p>
            </div>
            <span className="rounded-full border border-kart-orange/40 bg-kart-orange/15 px-4 py-2 text-xs font-bold uppercase tracking-wide text-kart-orange md:text-sm">
              In Progress
            </span>
          </div>

          <div className="relative h-[42vh] w-full overflow-hidden rounded-b-[28px] border border-white/10 bg-[#0f141f] md:h-[64vh]">
            <div ref={mapContainerRef} className="h-full w-full" />
            <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-[#111722]/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              <Navigation size={14} className="text-kart-orange" /> Live
            </div>
          </div>
        </div>

        <aside className="-mt-6 z-20 flex w-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#111722] shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:mt-0 md:w-1/3">
          <div className="flex-1 p-6 md:p-8">
            <h4 className="mb-6 text-lg font-bold text-white">Activity History</h4>
            <div className="relative space-y-8 pl-2">
              <div className="absolute bottom-6 left-[15px] top-2 w-0.5 bg-white/10"></div>
              {steps.map((step, index) => (
                <div key={index} className="flex gap-6 relative z-10">
                  <div className="flex-shrink-0 bg-[#111722]">
                    {step.completed ? (
                      <CheckCircle size={24} className="fill-kart-orange/20 text-kart-orange" />
                    ) : (
                      <Circle size={24} className="text-white/20" />
                    )}
                  </div>
                  <div className="-mt-1">
                    <h5 className={`font-bold ${step.active ? 'text-kart-orange' : step.completed ? 'text-white' : 'text-white/40'}`}>
                      {step.title}
                    </h5>
                    <p className={`mt-1 text-xs ${step.active ? 'text-white/70 font-medium' : 'text-slate-400'}`}>{step.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#0f141f] p-6 pb-10 md:p-8 md:pb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
                  alt="Runner"
                  className="h-14 w-14 rounded-2xl border-2 border-white/10 bg-white/5 shadow-sm"
                />
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Runner</p>
                  <h4 className="text-lg font-black leading-tight text-white">Michael B.</h4>
                  <div className="mt-1 flex items-center text-xs font-medium text-slate-400">⭐ 4.9 (120 trips)</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth className="gap-2 py-3">
                <Phone size={18} className="text-white/80" /> Call
              </Button>
              <Button theme="green" fullWidth className="gap-2 py-3">
                <MessageSquare size={18} /> Chat
              </Button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};