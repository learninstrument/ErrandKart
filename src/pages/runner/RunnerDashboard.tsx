import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  ShoppingBasket,
  Pill,
  Shirt,
  Wallet,
  Bolt,
  PackageCheck,
  CheckSquare,
  TrendingUp,
  LifeBuoy,
  User,
  Settings,
  Navigation
} from 'lucide-react';
import { RunnerBottomNav } from './RunnerBottomNav';
import { Button } from '../../components/UI/Button';
import { clearSession } from '../../utils/auth';
import { motion, useAnimation } from 'framer-motion';
import * as L from 'leaflet';

export const RunnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [errands, setErrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const apiBaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL ?? 'http://localhost:4000');

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/auth/me`, { method: 'GET', credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data?.user?.full_name) {
          setFullName(data.user.full_name);
        }
      })
      .catch(console.error);

    fetch(`${apiBaseUrl}/api/errands/available`, { method: 'GET', credentials: 'include' })
      .then(res => {
        if (res.status === 401) {
          clearSession();
          navigate('/login');
          throw new Error('Session expired');
        }
        return res.json();
      })
      .then(data => {
        if (data.errands) setErrands(data.errands);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [apiBaseUrl, navigate]);

  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] || 'Runner';
  const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0].toUpperCase() : '';
  const displayName = lastInitial ? `${firstName} ${lastInitial}.` : firstName;
  const initials = (firstName[0] || 'R').toUpperCase() + (lastInitial || '');

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'purchase': return <ShoppingBasket size={20} />;
      case 'supermarket': return <Shirt size={20} />;
      case 'service': return <Pill size={20} />;
      default: return <PackageCheck size={20} />;
    }
  };

  const filteredErrands = useMemo(() => {
    if (!searchQuery.trim()) return errands;
    return errands.filter(e =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.pickup_address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [errands, searchQuery]);

  const availableErrands = useMemo(() => filteredErrands.map(errand => ({
    id: errand.id,
    title: errand.title,
    price: `₦${Number(errand.budget_customer_fee || 0).toLocaleString()}`,
    location: errand.pickup_address,
    time: new Date(errand.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    distance: 'Nearby',
    items: `${errand.description?.split('\n').length || 1} items`,
    icon: getCategoryIcon(errand.category),
  })), [filteredErrands]);

  /* ═════════════════════════════════════════
     DESKTOP: Left Sidebar Navigation
     ═════════════════════════════════════════ */
  const DesktopSidebar = () => (
    <aside className="hidden lg:flex lg:w-[22%] lg:min-w-[240px] lg:max-w-[280px] h-full flex-col border-r border-white/10 bg-black p-6">
      {/* Logo */}
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
          <img src="/logo.png" alt="ErrandKart" className="h-6 w-6 object-contain brightness-0 invert" />
        </div>
        <h1 className="text-xl font-black tracking-tight text-white">
          Errand<span className="text-market-green">Kart</span>
        </h1>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-1 flex-col gap-1.5">
        {[
          { label: 'Map Radar', icon: <Navigation size={20} />, href: '/runner/dashboard', active: true },
          { label: 'Active Gig', icon: <CheckSquare size={20} />, href: '/runner/active', active: false },
          { label: 'Wallet', icon: <Wallet size={20} />, href: '/runner/wallet', active: false },
          { label: 'Earnings', icon: <TrendingUp size={20} />, href: '/runner/earnings', active: false },
          { label: 'Profile', icon: <User size={20} />, href: '/runner/profile', active: false },
          { label: 'Settings', icon: <Settings size={20} />, href: '/runner/settings', active: false },
          { label: 'Support', icon: <LifeBuoy size={20} />, href: '/runner/support', active: false },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => navigate(item.href)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] font-semibold transition-all ${
              item.active
                ? 'bg-market-green/10 text-market-green border border-market-green/20'
                : 'text-white/50 border border-transparent hover:bg-white/5 hover:border-white/10 hover:text-white/80'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* User profile at bottom */}
      <div className="mt-auto border-t border-white/10 pt-4">
        <button
          onClick={() => navigate('/runner/profile')}
          className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/5 border border-transparent hover:border-white/10"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-bold text-white">
            {initials}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold leading-tight text-white">{displayName}</p>
            <p className="text-xs text-white/40">Verified Runner</p>
          </div>
          <div className="h-2 w-2 rounded-full bg-market-green shadow-[0_0_10px_#2E8B57]" />
        </button>
      </div>
    </aside>
  );

  /* ═════════════════════════════════════════
     MOBILE BOTTOM SHEET: Feed
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
        dragConstraints={{ top: 0, bottom: 300 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ y: "0%" }}
        className="absolute bottom-0 left-0 z-40 flex h-[65%] w-full flex-col rounded-t-[2rem] border-t border-white/20 bg-black/80 pb-20 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl lg:hidden"
      >
        {/* Drag Handle */}
        <div className="flex w-full justify-center pb-2 pt-4 cursor-grab active:cursor-grabbing">
          <div className="h-1.5 w-12 rounded-full bg-white/20" />
        </div>

        <div className="flex flex-1 flex-col gap-4 px-5 pt-2 overflow-hidden">
          {/* Header / Quick Stats */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Available Gigs</h2>
              <p className="text-xs font-bold uppercase tracking-widest text-market-green mt-0.5">{availableErrands.length} Nearby</p>
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10">
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {/* Scrollable Feed */}
          <div className="flex-1 overflow-y-auto pb-4 space-y-3 pr-1 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 w-full animate-pulse rounded-2xl bg-white/5" />
                ))}
              </div>
            ) : availableErrands.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Bolt size={32} className="mb-3 text-white/20" />
                <p className="text-sm font-bold text-white/60">No gigs available right now.</p>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">Move to a hot zone</p>
              </div>
            ) : (
              availableErrands.map(errand => (
                <button
                  key={errand.id}
                  onClick={() => navigate(`/runner/errand/${errand.id}`)}
                  className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-colors hover:bg-white/10"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-market-green/30 bg-market-green/10 text-market-green">
                      {errand.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{errand.title}</h4>
                      <p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-white/40 truncate">
                        <MapPin size={12} /> {errand.location}
                      </p>
                      <p className="mt-0.5 text-[10px] text-white/30 truncate">{errand.distance} • {errand.items}</p>
                    </div>
                    <div className="flex flex-col items-end shrink-0 pl-2">
                      <span className="text-base font-black text-white">{errand.price}</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 mt-1">{errand.time}</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  /* ═════════════════════════════════════════
     DESKTOP: Right Utility Panel (Job Feed)
     ═════════════════════════════════════════ */
  const DesktopRightPanel = () => (
    <aside className="hidden lg:flex lg:w-[32%] lg:min-w-[380px] lg:max-w-[440px] h-full flex-col border-l border-white/10 bg-black p-0 overflow-hidden">
      
      {/* Header Area */}
      <div className="p-8 pb-4">
        <h2 className="text-3xl font-black tracking-tighter text-white mb-2">Gig Radar</h2>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-market-green">
            {isLoading ? 'Scanning...' : `${availableErrands.length} Gigs Available`}
          </p>
          <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/70 hover:bg-white/10 hover:text-white transition-all">
            <SlidersHorizontal size={12} /> Filter
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full mt-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search by area or item..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm font-semibold text-white shadow-inner outline-none transition-colors placeholder:text-white/30 focus:border-white/30 focus:ring-1 focus:ring-white/20"
          />
        </div>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
        <div className="flex flex-col gap-4">
          {isLoading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 w-full animate-pulse rounded-2xl bg-white/5" />
            ))
          ) : availableErrands.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/5 p-10 text-center mt-4">
              <Bolt size={40} className="mb-4 text-white/20" />
              <h3 className="text-lg font-black text-white mb-1">No Jobs Found</h3>
              <p className="text-xs text-white/40 mb-6">There are no open errands near your location right now.</p>
              <Button theme="green" className="text-xs font-bold uppercase tracking-widest w-full">
                Refresh Radar
              </Button>
            </div>
          ) : (
            availableErrands.map(errand => (
              <button
                key={errand.id}
                onClick={() => navigate(`/runner/errand/${errand.id}`)}
                className="group w-full flex flex-col rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition-all hover:bg-white/10 hover:border-white/30 hover:shadow-[0_10px_40px_rgba(46,139,87,0.15)] active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-market-green/30 bg-market-green/10 text-market-green">
                      {errand.icon}
                    </div>
                    <div>
                      <h4 className="text-base font-bold leading-tight text-white">{errand.title}</h4>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
                        {errand.items}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xl font-black text-white">{errand.price}</span>
                    <span className="mt-1 block text-[9px] font-bold uppercase tracking-widest text-white/30">{errand.time}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                  <div className="flex items-center gap-1.5 text-xs text-white/60">
                    <MapPin size={14} className="text-market-green" />
                    <span className="truncate max-w-[200px]">{errand.location}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-market-green group-hover:underline">
                    View
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </aside>
  );

  /* ═════════════════════════════════════════
     MAP SECTION (Center – shared by both layouts)
     ═════════════════════════════════════════ */
  const MapSection = () => {
    const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
    const mapRef = React.useRef<L.Map | null>(null);

    React.useEffect(() => {
      if (!mapContainerRef.current || mapRef.current) return;

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([6.4474, 3.4558], 14); // Default to Lagos, Nigeria, slightly zoomed in for runners

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Add a marker for the runner's current location
      const runnerIcon = L.divIcon({
        className: '',
        html: `<div style="width:36px;height:36px;border-radius:999px;background:#2E8B57;color:#ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px rgba(46,139,87,0.6); border: 3px solid black;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      L.marker([6.4474, 3.4558], { icon: runnerIcon }).addTo(map);

      mapRef.current = map;

      return () => {
        map.remove();
        mapRef.current = null;
      };
    }, []);

    return (
      <div className="relative h-full w-full overflow-hidden bg-black">
        {/* Real Leaflet Map Container */}
        <div ref={mapContainerRef} className="h-full w-full z-0" />

        {/* Ambient overlay to blend with dark mode */}
        <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] bg-black/20" />

      {/* Mobile: Top Header bar over Map */}
      <header className="fixed left-0 top-0 z-50 flex h-20 w-full max-w-full items-center justify-between bg-gradient-to-b from-black via-black/80 to-transparent px-5 pt-4 pb-2 lg:hidden pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => navigate('/runner/profile')}
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-black/50 text-sm font-bold text-white backdrop-blur-md"
          >
            {initials}
          </button>
        </div>
        <div className="pointer-events-auto flex items-center justify-center gap-2 rounded-full border border-market-green/30 bg-market-green/10 px-4 py-2 backdrop-blur-md shadow-[0_0_20px_rgba(46,139,87,0.2)]">
          <div className="h-2 w-2 rounded-full bg-market-green shadow-[0_0_10px_#2E8B57]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-market-green">Online</span>
        </div>
        <button
          onClick={() => navigate('/runner/wallet')}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/60 transition-colors hover:text-white pointer-events-auto backdrop-blur-md"
        >
          <Wallet size={18} />
        </button>
      </header>
    </div>
  );
};

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-black text-white selection:bg-market-green selection:text-white">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Center: Map Canvas */}
      <main className="relative flex-1">
        <MapSection />
        {/* Mobile Bottom Sheet */}
        <MobileBottomSheet />
      </main>

      {/* Desktop Right Panel (Job Feed) */}
      <DesktopRightPanel />

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <RunnerBottomNav activeTab="available" />
      </div>
    </div>
  );
};
