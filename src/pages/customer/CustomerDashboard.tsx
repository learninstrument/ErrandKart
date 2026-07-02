import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Plus,
  Store,
  Wallet,
  LifeBuoy,
  FileText,
  ShoppingCart,
  PackageCheck,
  Home,
  Truck,
  Settings,
  User,
  Bell,
  ArrowUpDown,
} from 'lucide-react';
import { BottomNav } from './BottomNav';
import { Button } from '../../components/UI/Button';
import { ThemeSwitcher } from '../../components/UI/ThemeSwitcher';
import { clearSession } from '../../utils/auth';
import { motion, useAnimation } from 'framer-motion';
import mapboxgl from 'mapbox-gl';

export const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [errands, setErrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const apiBaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL ?? 'http://localhost:4000');

  useEffect(() => {
    // 1. Fetch profile details
    fetch(`${apiBaseUrl}/api/auth/me`, { method: 'GET', credentials: 'include' })
      .then(res => {
        if (res.status === 401) {
          clearSession();
          navigate('/login');
          throw new Error('Session expired');
        }
        return res.json();
      })
      .then(data => {
        if (data?.user) {
          setFullName(data.user.full_name || '');
          setWalletBalance(Number(data.user.wallet_balance || 0));
        }
      })
      .catch(console.error);

    // 2. Fetch customer errands (poll every 10 seconds for live map updates)
    const fetchErrands = () => {
      fetch(`${apiBaseUrl}/api/errands`, { method: 'GET', credentials: 'include' })
        .then(res => {
          if (res.ok) return res.json();
          return { errands: [] };
        })
        .then(data => {
          if (data.errands) {
            setErrands(data.errands);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    };

    fetchErrands();
    const interval = setInterval(fetchErrands, 10000);
    return () => clearInterval(interval);
  }, [apiBaseUrl, navigate]);

  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] || 'Customer';
  const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0].toUpperCase() : '';
  const displayName = lastInitial ? `${firstName} ${lastInitial}.` : firstName;
  const initials = (firstName[0] || 'C').toUpperCase() + (lastInitial || '');

  // Calculate metrics



  // Filter errands based on search
  const filteredErrands = useMemo(() => {
    if (!searchQuery.trim()) return errands;
    return errands.filter(e =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.pickup_address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [errands, searchQuery]);

  // Grab the 3 most recent errands
  const recentErrands = useMemo(() => {
    return filteredErrands.slice(0, 3);
  }, [filteredErrands]);



  const getErrandTimeText = (status: string, createdAt: string) => {
    if (['active', 'shopping', 'en_route', 'arrived'].includes(status)) {
      return 'In Progress';
    }
    const date = new Date(createdAt);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusChip = (status: string) => {
    const isActive = ['active', 'shopping', 'en_route', 'arrived'].includes(status);
    if (isActive) {
      return (
        <span className="rounded-md bg-kart-orange/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-kart-orange">
          In Transit
        </span>
      );
    }
    if (status === 'completed') {
      return (
        <span className="rounded-md bg-market-green/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-market-green">
          Completed
        </span>
      );
    }
    return (
      <span className="rounded-md bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
        {status}
      </span>
    );
  };

  /* ═════════════════════════════════════════
     DESKTOP: Left Sidebar Navigation
     ═════════════════════════════════════════ */
  const DesktopSidebar = () => (
    <aside className="hidden lg:flex lg:w-[22%] lg:min-w-[240px] lg:max-w-[280px] h-full flex-col border-r border-black/5 dark:border-white/10 bg-white dark:bg-black p-6">
      {/* Logo */}
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            <img src="/logo.png" alt="ErrandKart" className="h-6 w-6 object-contain dark:brightness-0 dark:invert" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-black dark:text-white">
            Errand<span className="text-kart-orange">Kart</span>
          </h1>
        </div>
        <ThemeSwitcher />
      </div>

      {/* Nav Links */}
      <nav className="flex flex-1 flex-col gap-1.5">
        {[
          { label: 'Dashboard', icon: <Home size={20} />, href: '/customer/dashboard', active: true },
          { label: 'Active Errands', icon: <Truck size={20} />, href: '/customer/track', active: false },
          { label: 'Wallet', icon: <Wallet size={20} />, href: '/customer/wallet', active: false },
          { label: 'Profile', icon: <User size={20} />, href: '/customer/profile', active: false },
          { label: 'Settings', icon: <Settings size={20} />, href: '/customer/preferences', active: false },
          { label: 'Support', icon: <LifeBuoy size={20} />, href: '/customer/support', active: false },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => navigate(item.href)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] font-semibold transition-all ${
              item.active
                ? 'bg-kart-orange/10 text-kart-orange border border-kart-orange/20 shadow-sm'
                : 'text-black/50 dark:text-white/50 border border-transparent hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/10 dark:hover:border-white/10 hover:text-black dark:hover:text-white/80'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* User profile at bottom */}
      <div className="mt-auto border-t border-black/5 dark:border-white/10 pt-4">
        <button
          onClick={() => navigate('/customer/profile')}
          className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-black/10 dark:hover:border-white/10"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-sm font-bold text-black dark:text-white">
            {initials}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold leading-tight text-black dark:text-white">{displayName}</p>
            <p className="text-xs text-black/40 dark:text-white/40">Customer</p>
          </div>
        </button>
      </div>
    </aside>
  );

  /* ═════════════════════════════════════════
     MOBILE BOTTOM SHEET: Category Grid + Wallet
     ═════════════════════════════════════════ */
  const MobileBottomSheet = () => {
    const controls = useAnimation();

    const handleDragEnd = (_event: any, info: any) => {
      // If dragged down significantly, collapse it slightly
      if (info.offset.y > 50) {
        controls.start({ y: "55%" });
      } 
      // If dragged up, snap back to fully expanded
      else if (info.offset.y < -50) {
        controls.start({ y: "0%" });
      }
    };

    return (
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 200 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ y: "0%" }}
        className="absolute bottom-0 left-0 z-40 flex w-full flex-col rounded-t-[2rem] border-t border-black/10 dark:border-white/20 bg-white/95 dark:bg-black/90 pb-24 shadow-[0_-20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl lg:hidden"
      >
        {/* Drag Handle - Added grab cursor */}
        <div className="flex w-full justify-center pb-3 pt-4 cursor-grab active:cursor-grabbing">
          <div className="h-1.5 w-12 rounded-full bg-black/20 dark:bg-white/20" />
        </div>

        <div className="flex flex-col gap-4 sm:gap-5 px-4 sm:px-5 pt-1">
          {/* Search Input Removed as per user request */}

          {/* Quick Category Grid (Responsive gaps) */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[
              { label: 'Groceries', icon: <ShoppingCart size={20} className="sm:w-[22px] sm:h-[22px]" />, color: 'text-black dark:text-white', bg: 'bg-black/5 dark:bg-white/15', href: '/customer/post-errand' },
              { label: 'Courier', icon: <Truck size={20} className="sm:w-[22px] sm:h-[22px]" />, color: 'text-market-green', bg: 'bg-market-green/15', href: '/customer/post-errand' },
              { label: 'Store', icon: <Store size={20} className="sm:w-[22px] sm:h-[22px]" />, color: 'text-kart-orange', bg: 'bg-kart-orange/15', href: '/customer/post-errand' },
              { label: 'Track Live', icon: <MapPin size={20} className="sm:w-[22px] sm:h-[22px]" />, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/15', href: '/customer/track' },
            ].map(cat => (
              <button
                key={cat.label}
                onClick={() => navigate(cat.href)}
                className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-2 sm:p-3 transition-colors hover:border-black/10 dark:hover:border-white/20 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95"
              >
                <div className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full ${cat.bg} ${cat.color}`}>
                  {cat.icon}
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-black dark:text-white text-center leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Wallet Card */}
          <button
            onClick={() => navigate('/customer/wallet')}
            className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-4 sm:p-5 text-left transition-colors hover:border-kart-orange/40"
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-kart-orange/20 blur-[40px] transition-colors group-hover:bg-kart-orange/30" />
            <div className="relative z-10 flex flex-col">
              <span className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-black/50 dark:text-white/50">
                <Wallet size={12} className="sm:w-[13px] sm:h-[13px]" />
                Wallet Balance
              </span>
              <span className="mt-1 sm:mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-black dark:text-white">
                ₦{walletBalance.toLocaleString()}<span className="text-xs sm:text-sm font-bold text-black/40 dark:text-white/40">.00</span>
              </span>
            </div>
            <div className="relative z-10 flex items-center gap-1.5 rounded-[10px] sm:rounded-[12px] border border-kart-orange/30 bg-kart-orange/10 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold text-kart-orange transition-all hover:bg-kart-orange hover:text-white">
              <Plus size={12} className="sm:w-[14px] sm:h-[14px]" />
              Top Up
            </div>
          </button>
        </div>
      </motion.div>
    );
  };

  /* ═════════════════════════════════════════
     DESKTOP: Right Utility Panel
     ═════════════════════════════════════════ */
  const DesktopRightPanel = () => (
    <aside className="hidden lg:flex lg:w-[30%] lg:min-w-[340px] lg:max-w-[400px] h-full flex-col gap-6 overflow-y-auto border-l border-black/5 dark:border-white/10 bg-white dark:bg-black p-8">
      {/* Wallet Card */}
      <section className="relative overflow-hidden rounded-3xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-8 backdrop-blur-xl">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-kart-orange/20 blur-[50px]" />
        <div className="relative z-10">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-black/50 dark:text-white/50">Available Balance</p>
          <h2 className="mb-8 text-5xl font-black tracking-tighter text-black dark:text-white">
            ₦{walletBalance.toLocaleString()}<span className="text-2xl text-black/40 dark:text-white/40">.00</span>
          </h2>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/customer/wallet')} className="flex-1 gap-2 py-3.5 text-xs font-bold uppercase tracking-widest rounded-xl">
              <Plus size={16} /> Deposit
            </Button>
            <Button variant="outline" onClick={() => navigate('/customer/wallet')} className="flex-1 gap-2 py-3.5 text-xs font-bold uppercase tracking-widest rounded-xl">
              <ArrowUpDown size={16} /> Transfer
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/50 dark:text-white/50">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Post Errand', icon: <Plus size={20} />, href: '/customer/post-errand' },
            { label: 'Track Live', icon: <MapPin size={20} />, href: '/customer/track' },
            { label: 'Activity', icon: <FileText size={20} />, href: '/customer/orders' },
          ].map(action => (
            <button
              key={action.label}
              onClick={() => navigate(action.href)}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 p-4 transition-all hover:border-kart-orange/40 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-black dark:text-white shadow-inner">
                {action.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-black/80 dark:text-white/80">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Errands Feed */}
      <section className="flex flex-1 flex-col mt-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/50 dark:text-white/50">Recent Errands</h3>
          <button
            onClick={() => navigate('/customer/orders')}
            className="text-[10px] font-bold uppercase tracking-wider text-kart-orange hover:underline"
          >
            View All
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 w-full animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
            ))}
          </div>
        ) : recentErrands.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 p-8 text-center">
            <PackageCheck size={32} className="mb-3 text-black/20 dark:text-white/20" />
            <p className="mb-4 text-sm text-black/40 dark:text-white/40">No errands yet</p>
            <Button onClick={() => navigate('/customer/post-errand')} className="text-xs uppercase tracking-widest font-bold">
              Post Your First Errand
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentErrands.map(errand => {
              const isActive = ['active', 'shopping', 'en_route', 'arrived'].includes(errand.status);
              const timeText = getErrandTimeText(errand.status, errand.created_at);

              return (
                <button
                  key={errand.id}
                  onClick={() => {
                    if (isActive) navigate('/customer/track');
                    else navigate(`/customer/orders/${errand.id}`);
                  }}
                  className="rounded-2xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 p-5 text-left transition-colors hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/20 dark:hover:border-white/20"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold leading-tight text-black dark:text-white">{errand.title}</h4>
                      <p className="mt-1 text-[11px] text-black/40 dark:text-white/40 uppercase tracking-wide">
                        {errand.pickup_address} • {timeText}
                      </p>
                    </div>
                    {getStatusChip(errand.status)}
                  </div>
                  {isActive && (
                    <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-2/3 rounded-full bg-kart-orange" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </aside>
  );

  /* ═════════════════════════════════════════
     MAP SECTION (Center – shared by both layouts)
     ═════════════════════════════════════════ */
  const MapSection = () => {
    const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
    const mapRef = React.useRef<mapboxgl.Map | null>(null);
    const [isLocating, setIsLocating] = React.useState(false);

    React.useEffect(() => {
      if (!mapContainerRef.current || mapRef.current) return;

      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      mapboxgl.accessToken = token || '';
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: `https://api.mapbox.com/styles/v1/mapbox/dark-v11`,
        center: [3.4558, 6.4474], // [lng, lat]
        zoom: 14,
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
        {/* Real Leaflet Map Container */}
        <div ref={mapContainerRef} className="h-full w-full z-0" />

        {/* Ambient overlay to blend with dark mode */}
        <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_100px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] bg-white/10 dark:bg-black/20" />

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
      <header className="fixed left-0 top-0 z-50 flex h-20 w-full max-w-full items-center justify-between bg-gradient-to-b from-white/90 via-white/70 dark:from-black dark:via-black/80 to-transparent px-5 pt-4 pb-2 lg:hidden pointer-events-none">
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
          <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Online</span>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <ThemeSwitcher />
          <button
            onClick={() => navigate('/customer/notifications')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/50 text-black/60 dark:text-white/60 transition-colors hover:text-black dark:hover:text-white backdrop-blur-md shadow-sm"
          >
            <Bell size={20} />
          </button>
        </div>
      </header>

      {/* Floating FAB for Post Errand (desktop) */}
      <button
        onClick={() => navigate('/customer/post-errand')}
        className="absolute bottom-8 right-8 z-20 hidden h-16 w-16 items-center justify-center rounded-full bg-kart-orange text-white shadow-[0_10px_40px_rgba(255,102,0,0.5)] transition-transform hover:scale-105 lg:flex border-2 border-black"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-white dark:bg-black text-black dark:text-white selection:bg-kart-orange selection:text-white transition-colors duration-300">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Center: Map Canvas */}
      <main className="relative flex-1">
        <MapSection />
        {/* Mobile Bottom Sheet */}
        <MobileBottomSheet />
      </main>

      {/* Desktop Right Panel */}
      <DesktopRightPanel />

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <BottomNav activeTab="home" />
      </div>
    </div>
  );
};


