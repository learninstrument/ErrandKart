import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import { Search } from 'lucide-react';

interface CustomerMapSectionProps {
  initials: string;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export const CustomerMapSection: React.FC<CustomerMapSectionProps> = ({ initials, searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    mapboxgl.accessToken = token || '';

    // Use standard light/dark v11 styles for reliable themes
    const isDark = document.documentElement.classList.contains('dark');
    const initialStyle = isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [3.4558, 6.4474], // [lng, lat]
      zoom: 14,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
    });

    // Customer location marker (will be updated after GPS)
    const el = document.createElement('div');
    el.innerHTML = `<div style="width:24px;height:24px;border-radius:999px;background:#3B82F6;color:#ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(59,130,246,0.5); border: 2px solid white;"></div>`;
    let userMarker = new mapboxgl.Marker({ element: el })
      .setLngLat([3.4558, 6.4474])
      .addTo(map);

    mapRef.current = map;

    // Auto-locate
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          map.jumpTo({ center: [longitude, latitude], zoom: 14 });
          userMarker.setLngLat([longitude, latitude]);
        },
        (err) => console.warn('[Fast Geolocation]', err.message),
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          map.flyTo({ center: [longitude, latitude], zoom: 15, duration: 1500 });
          userMarker.setLngLat([longitude, latitude]);
        },
        (err) => console.warn('[Geolocation High Acc]', err.message),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }

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
          const style = isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11';
          mapRef.current?.setStyle(style);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapRef.current!.flyTo({ center: [longitude, latitude], zoom: 15, duration: 1000 });
        setIsLocating(false);
      },
      (err) => {
        console.warn('[Locate Me]', err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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
        className="absolute right-5 top-1/2 -translate-y-1/2 z-[1000] flex items-center justify-center gap-2 rounded-full border border-black/10 dark:border-white/20 bg-white dark:bg-[#111] text-black dark:text-white px-3 py-2 sm:px-4 sm:py-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.18)] backdrop-blur-md transition-all hover:scale-105 hover:border-kart-orange/50 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
      >
        {isLocating ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-kart-orange border-t-transparent" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-kart-orange">
            <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
          </svg>
        )}
        <span className="text-[10px] sm:text-xs font-bold">{isLocating ? 'Locating...' : 'My Location'}</span>
      </button>

      {/* Desktop: Search overlay on map */}
      <div className="absolute left-1/2 top-8 z-10 hidden w-[80%] max-w-[600px] -translate-x-1/2 items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white/90 dark:bg-[#0A0A0A]/90 px-5 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl lg:flex">
        <Search size={20} className="text-black/40 dark:text-white/40" />
        <input
          type="text"
          placeholder="Search for a store, runner, or address..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full border-none bg-transparent text-sm font-semibold text-black dark:text-white outline-none placeholder:text-black/30 dark:placeholder:text-white/30 focus:ring-0"
        />
      </div>

      {/* Mobile: Header bar */}
      <header className="fixed left-0 top-0 z-50 flex h-20 w-full max-w-full items-center justify-between px-5 pt-4 pb-2 lg:hidden pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => navigate('/customer/profile')}
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-black/10 dark:border-white/20 bg-white/80 dark:bg-black/50 text-sm font-bold text-black dark:text-white backdrop-blur-md shadow-sm"
          >
            {initials}
          </button>
        </div>
        <div className="pointer-events-auto flex items-center justify-center gap-1.5 rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/50 px-4 py-2 backdrop-blur-md shadow-sm">
          <div className="h-2 w-2 rounded-full bg-market-green shadow-[0_0_10px_#2E8B57]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-market-green">Online</span>
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
            onClick={() => navigate('/customer/notifications')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/50 text-black/60 dark:text-white/60 transition-colors hover:text-black dark:hover:text-white backdrop-blur-md shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </button>
        </div>
      </header>

      {/* Floating FAB for Post Errand (desktop) */}
      <button
        onClick={() => navigate('/customer/post-errand')}
        className="absolute bottom-8 right-8 z-20 hidden h-16 w-16 items-center justify-center rounded-full bg-[#FF6600] text-white shadow-[0_10px_40px_rgba(255,102,0,0.5)] transition-transform hover:scale-105 lg:flex border-2 border-black"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
      </button>
    </div>
  );
};
