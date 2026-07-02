import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';

interface Errand {
  id: string;
  lat: number;
  lng: number;
  [key: string]: any;
}

interface RunnerMapSectionProps {
  availableErrands: Errand[];
  initials: string;
}

export const RunnerMapSection: React.FC<RunnerMapSectionProps> = ({ availableErrands, initials }) => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const hasInitialZoomed = useRef(false);
  const [isLocating, setIsLocating] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    mapboxgl.accessToken = token || '';

    // Use Mapbox Standard Style
    const initialStyle = 'mapbox://styles/mapbox/standard';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [7.49508, 9.05785], // Mapbox uses [lng, lat] (Abuja)
      zoom: 14,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
    });

    // Runner location marker (will be updated after GPS)
    const el = document.createElement('div');
    el.innerHTML = `<div style="width:24px;height:24px;border-radius:999px;background:#2E8B57;color:#ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(46,139,87,0.5); border: 2px solid white;"></div>`;
    userMarkerRef.current = new mapboxgl.Marker({ element: el })
      .setLngLat([7.49508, 9.05785])
      .addTo(map);

    mapRef.current = map;

    // Auto-locate
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          map.jumpTo({ center: [longitude, latitude], zoom: 14 });
          if (userMarkerRef.current) userMarkerRef.current.setLngLat([longitude, latitude]);
        },
        (err) => console.warn('[Fast Geolocation]', err.message),
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          map.flyTo({ center: [longitude, latitude], zoom: 15, duration: 1500 });
          if (userMarkerRef.current) userMarkerRef.current.setLngLat([longitude, latitude]);
        },
        (err) => console.warn('[Geolocation High Acc]', err.message),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }
    
    map.on('style.load', () => {
      const isDark = document.documentElement.classList.contains('dark');
      try {
        map.setConfigProperty('basemap', 'lightPreset', isDark ? 'night' : 'day');
      } catch (e) {
        console.warn('Could not set lightPreset', e);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Theme observer
  useEffect(() => {
    if (!mapRef.current) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          if (mapRef.current) {
            try {
              mapRef.current.setConfigProperty('basemap', 'lightPreset', isDark ? 'night' : 'day');
            } catch (e) {
              console.warn('Could not set lightPreset', e);
            }
          }
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  // Render available errands on the map
  useEffect(() => {
    if (!mapRef.current) return;
    
    const map = mapRef.current;
    
    // Add new markers and update existing ones
    const currentErrandIds = new Set(availableErrands.map(e => e.id));

    // Remove markers for errands that are no longer available
    Object.keys(markersRef.current).forEach(id => {
      if (!currentErrandIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    const bounds = new mapboxgl.LngLatBounds();
    let hasValidBounds = false;

    availableErrands.forEach(errand => {
      if (errand.lat && errand.lng) {
        const lng = Number(errand.lng);
        const lat = Number(errand.lat);

        if (!markersRef.current[errand.id]) {
          const el = document.createElement('div');
          el.innerHTML = `<div style="width:36px;height:36px;border-radius:18px;background:#FF6600;display:flex;align-items:center;justify-content:center;box-shadow:0 0 15px rgba(255,102,0,0.6);border:3px solid white;cursor:pointer;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`;
          
          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([lng, lat])
            .addTo(map);
          
          el.addEventListener('click', () => navigate(`/runner/errand/${errand.id}`));
          
          markersRef.current[errand.id] = marker;
        } else {
          // Update position if changed
          markersRef.current[errand.id].setLngLat([lng, lat]);
        }
        
        bounds.extend([lng, lat]);
        hasValidBounds = true;
      }
    });
    
    // Auto-zoom map only initially
    if (hasValidBounds && !hasInitialZoomed.current) {
      map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
      hasInitialZoomed.current = true;
    }
  }, [availableErrands, navigate]);

  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapRef.current!.flyTo({ center: [longitude, latitude], zoom: 15, duration: 1000 });
        if (userMarkerRef.current) {
          userMarkerRef.current.setLngLat([longitude, latitude]);
        }
        setIsLocating(false);
      },
      (err) => {
        console.warn('[Locate Me]', err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-white dark:bg-black">
      {/* Real Mapbox Map Container */}
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Locate Me Button - Positioned right-center to avoid overlaps but stay accessible */}
      <button
        onClick={handleLocateMe}
        disabled={isLocating}
        title="Go to my location"
        className="absolute right-5 top-1/2 -translate-y-1/2 z-[1000] flex items-center justify-center gap-2 rounded-full border border-black/10 dark:border-white/20 bg-white dark:bg-[#111] text-black dark:text-white px-3 py-2 sm:px-4 sm:py-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.18)] backdrop-blur-md transition-all hover:scale-105 hover:border-market-green/50 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
      >
        {isLocating ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-market-green border-t-transparent" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-market-green">
            <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
          </svg>
        )}
        <span className="text-[10px] sm:text-xs font-bold">{isLocating ? 'Locating...' : 'My Location'}</span>
      </button>

      {/* Mobile: Top Header bar over Map */}
      <header className="fixed left-0 top-0 z-50 flex h-20 w-full max-w-full items-center justify-between px-5 pt-4 pb-2 lg:hidden pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => navigate('/runner/profile')}
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-black/10 dark:border-white/20 bg-white/80 dark:bg-black/50 text-sm font-bold text-black dark:text-white backdrop-blur-md shadow-sm"
          >
            {initials}
          </button>
        </div>
        <div className="pointer-events-auto flex items-center justify-center gap-2 rounded-full border border-market-green/30 bg-market-green/10 px-4 py-2 backdrop-blur-md shadow-[0_0_20px_rgba(46,139,87,0.2)]">
          <div className="h-2 w-2 rounded-full bg-market-green shadow-[0_0_8px_rgba(46,139,87,1)]" />
          <span className="text-xs font-bold tracking-wide text-market-green">ONLINE</span>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => {
              const isDark = document.documentElement.classList.contains('dark');
              if (isDark) document.documentElement.classList.remove('dark');
              else document.documentElement.classList.add('dark');
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/50 text-black/60 dark:text-white/60 transition-colors hover:text-black dark:hover:text-white backdrop-blur-md shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          </button>
          <button
            onClick={() => navigate('/runner/wallet')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/50 text-black/60 dark:text-white/60 transition-colors hover:text-black dark:hover:text-white backdrop-blur-md shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 2-2h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          </button>
        </div>
      </header>
    </div>
  );
};
