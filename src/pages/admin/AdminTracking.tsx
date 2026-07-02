import React, { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Phone, Navigation, MapPin, Wallet, Timer, Store } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import type { ActiveErrandTrack } from './adminData';
import { buildAuthHeaders } from '../../utils/auth';

export const AdminTracking: React.FC = () => {
  const [errands, setErrands] = useState<ActiveErrandTrack[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const apiBaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL ?? 'http://localhost:4000');
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const pickupMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const dropoffMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const runnerMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const selectedErrand = useMemo(
    () => errands.find(item => item.orderId === selectedOrderId) ?? errands[0] ?? null,
    [errands, selectedOrderId]
  );

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const loadErrands = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetch(`${apiBaseUrl}/api/admin/tracking/active`, {
          signal: controller.signal,
          headers: buildAuthHeaders(),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message ?? 'Failed to load active errands');
        }
        const items = Array.isArray(data) ? data : (data.errands ?? []);
        const mapped = items.map(mapErrand).filter(Boolean) as ActiveErrandTrack[];
        if (mounted) {
          setErrands(mapped);
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        const message = error instanceof Error ? error.message : 'Failed to load active errands';
        if (mounted) {
          setErrorMessage(message);
          setErrands([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadErrands();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [apiBaseUrl]);

  useEffect(() => {
    if (errands.length && !selectedOrderId) {
      setSelectedOrderId(errands[0].orderId);
    }
  }, [errands, selectedOrderId]);

  useEffect(() => {
    if (!selectedErrand || !mapContainerRef.current || mapRef.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: `https://api.mapbox.com/styles/v1/mapbox/dark-v11?access_token=${token}`,
      center: [selectedErrand.currentLocation[1], selectedErrand.currentLocation[0]],
      zoom: 13,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on('load', () => {
      // Add Route Line
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [selectedErrand.pickupLocation[1], selectedErrand.pickupLocation[0]],
              [selectedErrand.currentLocation[1], selectedErrand.currentLocation[0]],
              [selectedErrand.dropoffLocation[1], selectedErrand.dropoffLocation[0]]
            ]
          }
        }
      });

      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#FF6600',
          'line-width': 3,
          'line-dasharray': [2, 2]
        }
      });

      const pEl = document.createElement('div');
      pEl.innerHTML = `<div style="width:14px;height:14px;border-radius:999px;background:#ffffff;border:3px solid #FF6600;box-shadow:0 0 0 6px rgba(255,102,0,0.18);"></div>`;
      const pickupMarker = new mapboxgl.Marker({ element: pEl })
        .setLngLat([selectedErrand.pickupLocation[1], selectedErrand.pickupLocation[0]])
        .addTo(map);

      const dEl = document.createElement('div');
      dEl.innerHTML = `<div style="width:14px;height:14px;border-radius:999px;background:#ffffff;border:3px solid #2E8B57;box-shadow:0 0 0 6px rgba(46,139,87,0.18);"></div>`;
      const dropoffMarker = new mapboxgl.Marker({ element: dEl })
        .setLngLat([selectedErrand.dropoffLocation[1], selectedErrand.dropoffLocation[0]])
        .addTo(map);

      const rEl = document.createElement('div');
      rEl.innerHTML = `<div style="width:28px;height:28px;border-radius:12px;background:#FF6600;color:#ffffff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(255,102,0,0.45);">R</div>`;
      const runnerMarker = new mapboxgl.Marker({ element: rEl })
        .setLngLat([selectedErrand.currentLocation[1], selectedErrand.currentLocation[0]])
        .addTo(map);

      pickupMarkerRef.current = pickupMarker;
      dropoffMarkerRef.current = dropoffMarker;
      runnerMarkerRef.current = runnerMarker;

      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([selectedErrand.pickupLocation[1], selectedErrand.pickupLocation[0]]);
      bounds.extend([selectedErrand.dropoffLocation[1], selectedErrand.dropoffLocation[0]]);
      map.fitBounds(bounds, { padding: 50 });
    });

    return () => {
      map.remove();
      mapRef.current = null;
      pickupMarkerRef.current = null;
      dropoffMarkerRef.current = null;
      runnerMarkerRef.current = null;
    };
  }, [selectedErrand]);

  useEffect(() => {
    if (!selectedErrand || !mapRef.current || !pickupMarkerRef.current || !dropoffMarkerRef.current || !runnerMarkerRef.current) {
      return;
    }

    pickupMarkerRef.current.setLngLat([selectedErrand.pickupLocation[1], selectedErrand.pickupLocation[0]]);
    dropoffMarkerRef.current.setLngLat([selectedErrand.dropoffLocation[1], selectedErrand.dropoffLocation[0]]);
    runnerMarkerRef.current.setLngLat([selectedErrand.currentLocation[1], selectedErrand.currentLocation[0]]);

    const map = mapRef.current;
    if (map.isStyleLoaded() && map.getSource('route')) {
      const source = map.getSource('route') as mapboxgl.GeoJSONSource;
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [selectedErrand.pickupLocation[1], selectedErrand.pickupLocation[0]],
            [selectedErrand.currentLocation[1], selectedErrand.currentLocation[0]],
            [selectedErrand.dropoffLocation[1], selectedErrand.dropoffLocation[0]]
          ]
        }
      });
    }
    map.panTo([selectedErrand.currentLocation[1], selectedErrand.currentLocation[0]], { animate: true });
  }, [selectedErrand]);

  return (
    <AdminLayout title="Live Errand Tracking" active="tracking">
      {isLoading ? (
        <div className="rounded-[24px] border border-white/10 bg-[#0A0A0A] p-6 text-white/70">
          Loading active errands...
        </div>
      ) : errorMessage ? (
        <div className="rounded-[24px] border border-red-500/40 bg-red-500/10 p-6 text-red-200">
          {errorMessage}
        </div>
      ) : !selectedErrand ? (
        <div className="rounded-[24px] border border-white/10 bg-[#0A0A0A] p-6 text-white/70">
          No active errands to track.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-[28px] border border-white/10 bg-[#0A0A0A] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:p-6">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Tracking Order</p>
                <h3 className="mt-1 text-xl font-black text-white">{selectedErrand.orderId}</h3>
                <p className="mt-1 text-xs text-white/60">
                  Source: {selectedErrand.source === 'supermarket-dispatch' ? 'Supermarket dispatch' : 'Customer direct'}
                </p>
              </div>
              <span className="rounded-full border border-kart-orange/40 bg-kart-orange/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-kart-orange">
                Live feed
              </span>
            </div>

            <div className="h-[48vh] overflow-hidden rounded-2xl border border-white/10 bg-[#121212] md:h-[62vh]">
              <div ref={mapContainerRef} className="h-full w-full" />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-[#121212] px-4 py-3 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <Timer size={14} className="text-kart-orange" />
                  ETA
                </div>
                <p className="mt-1 text-lg font-black text-white">{selectedErrand.etaMinutes} min</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#121212] px-4 py-3 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <Wallet size={14} className="text-kart-orange" />
                  Runner payout
                </div>
                <p className="mt-1 text-lg font-black text-white">{selectedErrand.payout}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#121212] px-4 py-3 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <Store size={14} className="text-kart-orange" />
                  Dispatch source
                </div>
                <p className="mt-1 text-lg font-black text-white">
                  {selectedErrand.source === 'supermarket-dispatch' ? 'Supermarket' : 'Customer'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#121212] px-4 py-3 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <Navigation size={14} className="text-market-green" />
                  Status
                </div>
                <p className="mt-1 text-lg font-black text-white">{selectedErrand.status}</p>
              </div>
            </div>

            {selectedErrand.source === 'supermarket-dispatch' && (
              <div className="mt-3 rounded-2xl border border-white/10 bg-[#121212] px-4 py-3 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <Store size={14} className="text-kart-orange" />
                  Supermarket contact
                </div>
                <p className="mt-1 text-white">
                  {selectedErrand.supermarketName ?? 'Supermarket'} · {selectedErrand.supermarketContact ?? 'N/A'}
                </p>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-4">
            {errands.map(errand => (
              <button
                key={errand.orderId}
                onClick={() => setSelectedOrderId(errand.orderId)}
                className={`rounded-2xl border p-4 text-left shadow-[0_14px_34px_rgba(0,0,0,0.35)] ${
                  selectedOrderId === errand.orderId
                    ? 'border-kart-orange/40 bg-kart-orange/10'
                    : 'border-white/10 bg-[#0A0A0A]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-black text-white">{errand.orderId}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">{errand.status}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/65">
                      {errand.source === 'supermarket-dispatch' ? 'supermarket' : 'customer'}
                    </span>
                  </div>
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
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#121212] px-3 py-2">
                    <span>Runner: {errand.runnerName}</span>
                    <span>{errand.etaMinutes} min</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#121212] px-3 py-2">
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

type ActiveErrandApi = {
  id: string;
  customer_id: string | null;
  runner_id: string | null;
  dispatch_source: ActiveErrandTrack['source'];
  status: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  pickup_address: string | null;
  dropoff_address: string | null;
  budget_service_fee: number | null;
  customer?: { id: string; full_name: string | null; phone_number: string | null } | null;
  runner?: { id: string; full_name: string | null; phone_number: string | null } | null;
  supermarket?: { id: string; business_name: string | null; phone: string | null } | null;
};

const mapStatus = (status: string): ActiveErrandTrack['status'] => {
  if (status === 'arrived') return 'arrived';
  if (status === 'en_route') return 'en-route';
  return 'shopping';
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
};

const mapErrand = (order: ActiveErrandApi): ActiveErrandTrack | null => {
  if (
    order.pickup_lat == null ||
    order.pickup_lng == null ||
    order.dropoff_lat == null ||
    order.dropoff_lng == null
  ) {
    return null;
  }

  return {
    orderId: order.id,
    source: order.dispatch_source ?? 'customer-direct',
    customerUserId: order.customer_id ?? '',
    runnerUserId: order.runner_id ?? '',
    customerName: order.customer?.full_name ?? 'Customer',
    runnerName: order.runner?.full_name ?? 'Runner',
    customerPhone: order.customer?.phone_number ?? 'N/A',
    runnerPhone: order.runner?.phone_number ?? 'N/A',
    status: mapStatus(order.status),
    etaMinutes: 15,
    payout: formatCurrency(Number(order.budget_service_fee ?? 0)),
    pickupAddress: order.pickup_address ?? 'Pickup location',
    dropoffAddress: order.dropoff_address ?? 'Dropoff location',
    pickupLocation: [order.pickup_lat, order.pickup_lng],
    dropoffLocation: [order.dropoff_lat, order.dropoff_lng],
    currentLocation: [order.pickup_lat, order.pickup_lng],
    supermarketName: order.supermarket?.business_name ?? undefined,
    supermarketContact: order.supermarket?.phone ?? undefined,
  };
};


