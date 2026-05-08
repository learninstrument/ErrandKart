import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as L from 'leaflet';
import { Phone, Navigation, MapPin, Wallet, Timer } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { ADMIN_ACTIVE_ERRANDS } from './adminData';
import type { ActiveErrandTrack } from './adminData';

export const AdminTracking: React.FC = () => {
  const [errands, setErrands] = useState<ActiveErrandTrack[]>(ADMIN_ACTIVE_ERRANDS);
  const [selectedOrderId, setSelectedOrderId] = useState(ADMIN_ACTIVE_ERRANDS[0]?.orderId ?? '');
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropoffMarkerRef = useRef<L.Marker | null>(null);
  const runnerMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const selectedErrand = useMemo(
    () => errands.find(item => item.orderId === selectedOrderId) ?? errands[0] ?? null,
    [errands, selectedOrderId]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setErrands(prev =>
        prev.map(errand => {
          const [currLat, currLng] = errand.currentLocation;
          const [targetLat, targetLng] = errand.dropoffLocation;
          const stepLat = (targetLat - currLat) * 0.08;
          const stepLng = (targetLng - currLng) * 0.08;
          const nextLat = currLat + stepLat;
          const nextLng = currLng + stepLng;
          const distanceLeft = Math.abs(targetLat - nextLat) + Math.abs(targetLng - nextLng);

          return {
            ...errand,
            currentLocation: [nextLat, nextLng],
            etaMinutes: Math.max(2, errand.etaMinutes - (distanceLeft < 0.0025 ? 1 : 0)),
            status: distanceLeft < 0.002 ? 'arrived' : distanceLeft < 0.01 ? 'en-route' : 'shopping',
          };
        })
      );
    }, 3500);

    return () => clearInterval(timer);
  }, []);

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
        html: `<div style="width:28px;height:28px;border-radius:12px;background:#FF6600;color:#ffffff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(255,102,0,0.45);">R</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }),
    []
  );

  useEffect(() => {
    if (!selectedErrand || !mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(selectedErrand.currentLocation, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const pickupMarker = L.marker(selectedErrand.pickupLocation, { icon: pickupIcon }).addTo(map);
    const dropoffMarker = L.marker(selectedErrand.dropoffLocation, { icon: dropoffIcon }).addTo(map);
    const runnerMarker = L.marker(selectedErrand.currentLocation, { icon: runnerIcon }).addTo(map);
    const routeLine = L.polyline(
      [selectedErrand.pickupLocation, selectedErrand.currentLocation, selectedErrand.dropoffLocation],
      { color: '#FF6600', weight: 3, dashArray: '8 10' }
    ).addTo(map);

    map.fitBounds([selectedErrand.pickupLocation, selectedErrand.dropoffLocation], { padding: [50, 50] });

    mapRef.current = map;
    pickupMarkerRef.current = pickupMarker;
    dropoffMarkerRef.current = dropoffMarker;
    runnerMarkerRef.current = runnerMarker;
    routeLineRef.current = routeLine;

    return () => {
      map.remove();
      mapRef.current = null;
      pickupMarkerRef.current = null;
      dropoffMarkerRef.current = null;
      runnerMarkerRef.current = null;
      routeLineRef.current = null;
    };
  }, [selectedErrand, pickupIcon, dropoffIcon, runnerIcon]);

  useEffect(() => {
    if (!selectedErrand || !mapRef.current || !pickupMarkerRef.current || !dropoffMarkerRef.current || !runnerMarkerRef.current || !routeLineRef.current) {
      return;
    }

    pickupMarkerRef.current.setLatLng(selectedErrand.pickupLocation);
    dropoffMarkerRef.current.setLatLng(selectedErrand.dropoffLocation);
    runnerMarkerRef.current.setLatLng(selectedErrand.currentLocation);
    routeLineRef.current.setLatLngs([
      selectedErrand.pickupLocation,
      selectedErrand.currentLocation,
      selectedErrand.dropoffLocation,
    ]);
    mapRef.current.panTo(selectedErrand.currentLocation, { animate: true });
  }, [selectedErrand]);

  return (
    <AdminLayout title="Live Errand Tracking" active="tracking">
      {!selectedErrand ? (
        <div className="rounded-[24px] border border-white/10 bg-[#111722] p-6 text-white/70">
          No active errands to track.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-[28px] border border-white/10 bg-[#111722] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:p-6">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Tracking Order</p>
                <h3 className="mt-1 text-xl font-black text-white">{selectedErrand.orderId}</h3>
              </div>
              <span className="rounded-full border border-kart-orange/40 bg-kart-orange/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-kart-orange">
                Live feed
              </span>
            </div>

            <div className="h-[48vh] overflow-hidden rounded-2xl border border-white/10 bg-[#0f141f] md:h-[62vh]">
              <div ref={mapContainerRef} className="h-full w-full" />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <Timer size={14} className="text-kart-orange" />
                  ETA
                </div>
                <p className="mt-1 text-lg font-black text-white">{selectedErrand.etaMinutes} min</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <Wallet size={14} className="text-kart-orange" />
                  Runner payout
                </div>
                <p className="mt-1 text-lg font-black text-white">{selectedErrand.payout}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0f141f] px-4 py-3 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <Navigation size={14} className="text-market-green" />
                  Status
                </div>
                <p className="mt-1 text-lg font-black text-white">{selectedErrand.status}</p>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            {errands.map(errand => (
              <button
                key={errand.orderId}
                onClick={() => setSelectedOrderId(errand.orderId)}
                className={`rounded-2xl border p-4 text-left shadow-[0_14px_34px_rgba(0,0,0,0.35)] ${
                  selectedOrderId === errand.orderId
                    ? 'border-kart-orange/40 bg-kart-orange/10'
                    : 'border-white/10 bg-[#111722]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-black text-white">{errand.orderId}</p>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">{errand.status}</span>
                </div>

                <div className="mt-3 space-y-2 text-xs text-white/65">
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-kart-orange" />
                    {errand.pickupAddress}
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation size={13} className="text-market-green" />
                    {errand.dropoffAddress}
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0f141f] px-3 py-2">
                    <span>Runner: {errand.runnerName}</span>
                    <span>{errand.etaMinutes} min</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0f141f] px-3 py-2">
                    <span className="flex items-center gap-1"><Phone size={12} /> {errand.runnerPhone}</span>
                    <span>{errand.payout}</span>
                  </div>
                </div>
              </button>
            ))}
          </section>
        </div>
      )}
    </AdminLayout>
  );
};
