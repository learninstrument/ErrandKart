import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MessageSquare, CheckCircle, Navigation } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { motion } from 'framer-motion';
import * as turf from '@turf/turf';

import { clearSession } from '../../utils/auth';
import { animateMarkerTo } from '../../utils/markerAnimation';

export const TrackErrand: React.FC = () => {
  const navigate = useNavigate();
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const runnerMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const [order, setOrder] = useState<any>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const apiBaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL ?? 'http://localhost:4000');

  // Dynamic Coordinates from the Database (Explicitly check for presence to avoid silent fallbacks)
  const hasPickup = order?.pickup_lat != null && order?.pickup_lng != null;
  const hasDropoff = order?.dropoff_lat != null && order?.dropoff_lng != null;

  const pickupLocation = useMemo<[number, number] | null>(() => 
    hasPickup ? [Number(order.pickup_lat), Number(order.pickup_lng)] : null, 
    [order?.pickup_lat, order?.pickup_lng]
  );
  const dropoffLocation = useMemo<[number, number] | null>(() => 
    hasDropoff ? [Number(order.dropoff_lat), Number(order.dropoff_lng)] : null, 
    [order?.dropoff_lat, order?.dropoff_lng]
  );
  
  // Initialize runnerLocation to null instead of Lagos. We will sync it below.
  const [runnerLocation, setRunnerLocation] = useState<[number, number] | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [etaLeg1, setEtaLeg1] = useState<string>('');
  const [etaLeg2, setEtaLeg2] = useState<string>('');
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);

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
      // If runner hasn't sent location yet, just place them at the pickup point
      setRunnerLocation([Number(order.pickup_lat), Number(order.pickup_lng)]);
    }
  }, [order?.runner_lat, order?.runner_lng, order?.pickup_lat, order?.pickup_lng]);

  const status = order?.status || 'pending';
  const displayOrderId = order && order.id ? `EK-${String(order.id).split('-')[0].toUpperCase()}` : '...';

  const isPostPickup = ['picked_up', 'heading_to_dropoff', 'arrived_at_dropoff', 'completed'].includes(status);

  const steps = [
    { title: 'Order Posted', subtitle: 'Request sent to ErrandKart', completed: true, active: status === 'pending' },
    { title: 'Runner Assigned', subtitle: order?.runner_id ? 'Runner accepted your errand' : 'Matching with a runner...', completed: !!order?.runner_id || status === 'completed', active: !!order?.runner_id && status === 'active' },
    { title: 'Heading to Pickup', subtitle: etaLeg1 || 'Heading to market', completed: ['arrived_at_pickup', 'picked_up', 'heading_to_dropoff', 'arrived_at_dropoff', 'completed'].includes(status), active: status === 'heading_to_pickup' },
    { title: 'Arrived at Pickup', subtitle: 'Runner is at the market', completed: ['picked_up', 'heading_to_dropoff', 'arrived_at_dropoff', 'completed'].includes(status), active: status === 'arrived_at_pickup' },
    { title: 'Items Picked Up', subtitle: 'Runner got your items', completed: ['heading_to_dropoff', 'arrived_at_dropoff', 'completed'].includes(status), active: status === 'picked_up' },
    { title: 'Heading to Drop-off', subtitle: etaLeg2 || 'On the way to you', completed: ['arrived_at_dropoff', 'completed'].includes(status), active: status === 'heading_to_dropoff' },
    { title: 'Arrived at Drop-off', subtitle: 'Runner has arrived', completed: status === 'completed', active: status === 'arrived_at_dropoff' },
    { title: 'Completed', subtitle: 'Errand delivered successfully', completed: status === 'completed', active: status === 'completed' },
  ];



  useEffect(() => {
    if (!order || !mapContainerRef.current || mapRef.current || !pickupLocation || !dropoffLocation) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    mapboxgl.accessToken = token || '';
    const initialStyle = 'mapbox://styles/mapbox/standard';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: runnerLocation ? [runnerLocation[1], runnerLocation[0]] : [pickupLocation[1], pickupLocation[0]], // [lng, lat]
      zoom: 13,
      pitch: 60,
      bearing: -17.6,
      attributionControl: false,
    });

    mapRef.current = map;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkNow = document.documentElement.classList.contains('dark');
          try {
            map.setConfigProperty('basemap', 'lightPreset', isDarkNow ? 'night' : 'day');
          } catch (e) {
            console.warn('Could not set lightPreset', e);
          }
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });

    // 2. Add Pickup Marker (Market - Black/White)
    const pEl = document.createElement('div');
    pEl.id = 'pickup-marker-el';
    pEl.innerHTML = `<div style="width:36px;height:36px;border-radius:18px;background:#000000;display:flex;align-items:center;justify-content:center;box-shadow:0 0 15px rgba(0,0,0,0.4);border:3px solid white; transition: opacity 0.5s;" id="pickup-marker-inner"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></div>`;
    new mapboxgl.Marker({ element: pEl })
      .setLngLat([pickupLocation[1], pickupLocation[0]])
      .addTo(map);

    // 3. Add Dropoff Marker (Customer - Orange)
    const dEl = document.createElement('div');
    dEl.innerHTML = `<div style="width:36px;height:36px;border-radius:18px;background:#FF6600;display:flex;align-items:center;justify-content:center;box-shadow:0 0 15px rgba(255,102,0,0.6);border:3px solid white;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`;
    new mapboxgl.Marker({ element: dEl })
      .setLngLat([dropoffLocation[1], dropoffLocation[0]])
      .addTo(map);

    // 4. Create Runner Marker. Do NOT add to map until we have GPS to avoid hiding the market marker.
    const rEl = document.createElement('div');
    rEl.innerHTML = `<div style="width:36px;height:36px;border-radius:18px;background:#2E8B57;display:flex;align-items:center;justify-content:center;box-shadow:0 0 15px rgba(46,139,87,0.6); border: 2px solid #ffffff; font-size: 20px;">🚶</div>`;
    runnerMarkerRef.current = new mapboxgl.Marker({ element: rEl });
    if (runnerLocation) {
      runnerMarkerRef.current.setLngLat([runnerLocation[1], runnerLocation[0]]).addTo(map);
    }

    // Fit bounds
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([pickupLocation[1], pickupLocation[0]]);
    bounds.extend([initRunnerLoc[1], initRunnerLoc[0]]);
    bounds.extend([dropoffLocation[1], dropoffLocation[0]]);
    map.fitBounds(bounds, { padding: 60 });

    map.on('style.load', () => {
      const isDarkNow = document.documentElement.classList.contains('dark');
      try {
        map.setConfigProperty('basemap', 'lightPreset', isDarkNow ? 'night' : 'day');
      } catch (e) {
        console.warn('Could not set lightPreset', e);
      }

      // 1. Add Route sources and layers
      if (!map.getSource('errand-route-traveled')) {
        map.addSource('errand-route-traveled', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } }
        });
        map.addLayer({
          id: 'errand-route-traveled',
          type: 'line',
          source: 'errand-route-traveled',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#9CA3AF', 'line-width': 5, 'line-opacity': 0.8 } // Gray for traveled
        });
      }

      if (!map.getSource('errand-route-remaining')) {
        map.addSource('errand-route-remaining', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } }
        });
        map.addLayer({
          id: 'errand-route-remaining',
          type: 'line',
          source: 'errand-route-remaining',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#2E8B57', 'line-width': 5, 'line-opacity': 0.9 } // Green for remaining
        });
      }

      // ✅ After adding sources/layers, draw the route if it was already fetched
      if (routeGeometryRef.current) {
        const src = map.getSource('errand-route-remaining') as mapboxgl.GeoJSONSource | undefined;
        if (src) src.setData({ type: 'Feature', properties: {}, geometry: routeGeometryRef.current });
      }

    });

    // Reset route fetch state so a fresh route is always requested for this order
    fullRouteFetchedRef.current = false;
    routeGeometryRef.current = null;

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [!!order]);

  const prevRunnerLocationRef = useRef<[number, number] | null>(null);
  const fullRouteFetchedRef = useRef<boolean>(false);
  const routeGeometryRef = useRef<GeoJSON.LineString | null>(null);

  useEffect(() => {
    if (!mapRef.current || !runnerMarkerRef.current || !pickupLocation || !dropoffLocation) return;
    const map = mapRef.current;
    
    // Animate runner marker smoothly instead of snapping
    if (runnerLocation) {
      if (!runnerMarkerRef.current.getElement().parentNode) {
        runnerMarkerRef.current.setLngLat([runnerLocation[1], runnerLocation[0]]).addTo(map);
      } else {
        animateMarkerTo(runnerMarkerRef.current, [runnerLocation[1], runnerLocation[0]], 1000);
      }

      let heading = map.getBearing();
      if (prevRunnerLocationRef.current) {
        const prevPt = turf.point([prevRunnerLocationRef.current[1], prevRunnerLocationRef.current[0]]);
        const currPt = turf.point([runnerLocation[1], runnerLocation[0]]);
        const dist = turf.distance(prevPt, currPt, { units: 'meters' });
        // Only update heading if they moved significantly to avoid jitter
        if (dist > 2) {
          heading = turf.bearing(prevPt, currPt);
        }
      }

      // 3D Motion Tracking Camera
      map.easeTo({
        center: [runnerLocation[1], runnerLocation[0]],
        pitch: 60,
        bearing: heading,
        zoom: 16.5,
        duration: 2000, // Matches polling frequency for smooth motion
        easing: (t) => t
      });

      prevRunnerLocationRef.current = runnerLocation;
    }

    // Update runner marker icon based on transport mode
    if (order?.transport_mode && runnerMarkerRef.current) {
      const mode = order.transport_mode;
      const el = runnerMarkerRef.current.getElement();
      const icon = mode === 'bike' ? '🚴' : mode === 'vehicle' ? '🚗' : '🚶';
      el.innerHTML = `<div style="width:36px;height:36px;border-radius:18px;background:#2E8B57;display:flex;align-items:center;justify-content:center;box-shadow:0 0 15px rgba(46,139,87,0.6); border: 2px solid #ffffff; font-size: 20px;">${icon}</div>`;
    }

    // Fetch Route ONCE, then trim it
    const manageRoute = async () => {
      try {
        if (!fullRouteFetchedRef.current) {
          const rLoc = runnerLocation || pickupLocation;
          const coords = `${rLoc[1]},${rLoc[0]};${pickupLocation[1]},${pickupLocation[0]};${dropoffLocation[1]},${dropoffLocation[0]}`;
          const token = import.meta.env.VITE_MAPBOX_TOKEN;
          const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&access_token=${token}`;
          
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.routes && data.routes[0]) {
            const routeGeometry = data.routes[0].geometry;
            routeGeometryRef.current = routeGeometry;
            fullRouteFetchedRef.current = true;
            
            if (data.routes[0].legs) {
              const legs = data.routes[0].legs;
              if (legs[0]) setEtaLeg1(`Est. ${Math.ceil(legs[0].duration / 60)} mins`);
              if (legs[1]) setEtaLeg2(`Est. ${Math.ceil(legs[1].duration / 60)} mins`);
            }

            // ✅ Draw route if style is loaded; otherwise the style.load callback will draw it
            if (map.isStyleLoaded()) {
              const remainingSource = map.getSource('errand-route-remaining') as mapboxgl.GeoJSONSource | undefined;
              if (remainingSource) {
                remainingSource.setData({
                  type: 'Feature',
                  properties: {},
                  geometry: routeGeometry
                });
              }
            }
          }
        } else if (runnerLocation && routeGeometryRef.current) {
          // Fade pickup marker if post pickup
          const pickupInner = document.getElementById('pickup-marker-inner');
          if (pickupInner) {
             pickupInner.style.opacity = isPostPickup ? '0.3' : '1';
             pickupInner.style.filter = isPostPickup ? 'grayscale(100%)' : 'none';
          }

          // We have the full route, use Turf to trim it behind the runner
          const startPt = turf.point([runnerLocation[1], runnerLocation[0]]);
          const routeLine = turf.lineString(routeGeometryRef.current.coordinates);
          
          try {
            const snapped = turf.nearestPointOnLine(routeLine, startPt);
            const originPt = turf.point(routeGeometryRef.current.coordinates[0]);
            const destPt = turf.point(routeGeometryRef.current.coordinates[routeGeometryRef.current.coordinates.length - 1]);

            const traveled = turf.lineSlice(originPt, snapped, routeLine);
            const remaining = turf.lineSlice(snapped, destPt, routeLine);

            if (map.isStyleLoaded()) {
              (map.getSource('errand-route-traveled') as mapboxgl.GeoJSONSource)?.setData(traveled);
              (map.getSource('errand-route-remaining') as mapboxgl.GeoJSONSource)?.setData(remaining);
            }
          } catch (e) {
            console.warn("Turf line slice failed", e);
          }
        }
      } catch (error) {
        console.error("Failed to manage route", error);
      }
    };

    manageRoute();
  }, [runnerLocation, pickupLocation, dropoffLocation, apiBaseUrl]);

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
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        initial={{ y: "calc(100% - 120px)" }}
        animate={{ y: isSheetExpanded ? "0%" : "calc(100% - 120px)" }}
        onDragEnd={(_e, info) => {
          if (info.offset.y < -50) setIsSheetExpanded(true);
          else if (info.offset.y > 50) setIsSheetExpanded(false);
        }}
        className="absolute bottom-0 left-0 z-40 flex h-[85%] w-full flex-col rounded-t-[2rem] bg-white/95 dark:bg-[#0A0A0A]/95 pb-10 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.6)] backdrop-blur-3xl lg:hidden"
      >
        <div 
          className="flex w-full justify-center pb-3 pt-4 cursor-pointer active:cursor-grabbing"
          onClick={() => setIsSheetExpanded(!isSheetExpanded)}
        >
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
      ) : (!pickupLocation || !dropoffLocation) ? (
        <div className="flex h-full w-full flex-col items-center justify-center p-5 text-center">
          <header className="absolute top-0 left-0 w-full z-20 flex items-center px-5 pt-6 pb-4">
            <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
              <ArrowLeft size={20} className="text-[#FF6600]" />
            </button>
          </header>
          <div className="w-16 h-16 mb-4 animate-spin rounded-full border-4 border-black/10 border-t-kart-orange"></div>
          <h2 className="text-xl font-bold mb-2">Loading Location Data...</h2>
          <p className="text-black/50 dark:text-white/50 text-sm">Please wait while we fetch the exact coordinates for this errand.</p>
        </div>
      ) : status === 'cancelled' ? (
        <div className="flex h-full w-full flex-col items-center justify-center p-5 text-center">
          <header className="absolute top-0 left-0 w-full z-20 flex items-center px-5 pt-6 pb-4">
            <button onClick={() => navigate('/customer/dashboard')} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
              <ArrowLeft size={20} className="text-red-500" />
            </button>
          </header>
          <div className="w-24 h-24 mb-6 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <CheckCircle size={40} className="text-red-500 opacity-50" />
          </div>
          <h2 className="text-2xl font-black mb-2 text-red-500">Order Cancelled</h2>
          <p className="text-black/50 dark:text-white/50 mb-8 max-w-sm">
            This errand has been successfully cancelled. It will no longer be assigned to a runner.
          </p>
          <button 
            onClick={() => navigate('/customer/dashboard')}
            className="bg-red-500 text-white font-bold py-3.5 px-8 rounded-full shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:scale-105 transition-transform"
          >
            Return to Dashboard
          </button>
        </div>
      ) : (
      <>
        {/* Center Map */}
      <main className="relative flex-1">
        <div className="relative h-full w-full bg-white dark:bg-black">
          {/* Real Leaflet Map Container */}
          <div ref={mapContainerRef} className="h-full w-full z-0" />
          
          {/* Map Section */}
          <header className="absolute top-0 left-0 w-full z-20 flex items-center justify-between px-5 pt-6 pb-4 backdrop-blur-xl pointer-events-none">
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
        <motion.aside 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="hidden lg:flex lg:w-[35%] lg:min-w-[380px] lg:max-w-[420px] h-full flex-col border-l border-black/10 dark:border-white/10 bg-white dark:bg-[#0A0A0A] overflow-y-auto shadow-2xl z-30 pt-10"
        >
          <StatusAndDetails />
        </motion.aside>
      </>
      )}
    </div>
  );
};



