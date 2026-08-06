import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBasket, ShoppingCart, PackageCheck, MapPin, Home, Store, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { TextArea } from '../../components/UI/TextArea';
import { clearSession } from '../../utils/auth';
import { PinDropModal } from '../../components/Map/PinDropModal';

const CURATED_MARKETS: Record<string, string[]> = {
  abuja: ["Wuse Market", "Garki International Market", "Utako Market", "Kado Fish Market", "Karmo Market", "Gwarinpa Market"],
  kano: ["Kantin Kwari Market", "Kurmi Market", "Abubakar Rimi Market (Sabon Gari)", "Dawanau Market", "Tarauni Market"],
  lagos: ["Balogun Market", "Tejuosho Market", "Oshodi Market", "Mile 12 Market", "Computer Village", "Alaba International Market", "Idumota Market"],
  "port harcourt": ["Mile 1 Market", "Mile 3 Market", "Oil Mill Market", "Diobu Market"],
  ibadan: ["Bodija Market", "Oje Market", "Dugbe Market", "Aleshinloye Market"]
};

// Mapbox geocoding often struggles with local Nigerian markets. We hardcode precise coordinates for Abuja to ensure perfect accuracy.
const ABUJA_MARKET_COORDS: Record<string, { lat: number, lng: number }> = {
  "Wuse Market": { lat: 9.0620, lng: 7.4608 },
  "Garki International Market": { lat: 9.0270, lng: 7.4721 },
  "Utako Market": { lat: 9.0664, lng: 7.4334 },
  "Kado Fish Market": { lat: 9.0818, lng: 7.4206 },
  "Karmo Market": { lat: 9.0559, lng: 7.3820 },
  "Gwarinpa Market": { lat: 9.1060, lng: 7.4116 },
};

export const PostErrand: React.FC = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('Purchase');
  const [fulfillmentMode, setFulfillmentMode] = useState<'direct-runner' | 'supermarket-dispatch'>('direct-runner');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  
  // Market specific state
  const [marketItems, setMarketItems] = useState([{ name: '', estimatedPrice: '' }]);
  
  // Track exact GPS coordinates if the user dropped a pin or we auto-detected them
  const [explicitPickupCoords, setExplicitPickupCoords] = useState<{lat: number, lng: number} | null>(null);
  const [explicitDropoffCoords, setExplicitDropoffCoords] = useState<{lat: number, lng: number} | null>(null);

  const [budget, setBudget] = useState('');
  const [supermarketName, setSupermarketName] = useState('');
  const [orderRef, setOrderRef] = useState('');
  const [supermarketContact, setSupermarketContact] = useState('');
  const [requiresCooler, setRequiresCooler] = useState(false);

  const [pickupResults, setPickupResults] = useState<any[]>([]);
  const [dropoffResults, setDropoffResults] = useState<any[]>([]);
  const [savedLocations, setSavedLocations] = useState<any[]>([]);
  const [activeInput, setActiveInput] = useState<'pickup' | 'dropoff' | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Pin Drop Modal State
  const [pinDropModal, setPinDropModal] = useState<{
    isOpen: boolean;
    location: [number, number];
    type: 'pickup' | 'dropoff' | null;
  }>({ isOpen: false, location: [7.4951, 9.0579], type: null }); // [Lng, Lat] for Abuja

  const [userCity, setUserCity] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [detectingCity, setDetectingCity] = useState(false);
  
  // Cache user GPS coordinates so the PinDropModal can open instantly without waiting for geolocation
  const [userCoords, setUserCoords] = useState<[number, number]>([7.4951, 9.0579]); // Default to Abuja

  // Background fetch of exact GPS coordinates on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserCoords([pos.coords.longitude, pos.coords.latitude]),
        err => console.warn("Background GPS failed", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  // Auto-detect city when "Market" is selected
  useEffect(() => {
    if (category === 'Market' && !userCity) {
      setDetectingCity(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const { latitude, longitude } = pos.coords;
              setUserCoords([longitude, latitude]);
              const token = import.meta.env.VITE_MAPBOX_TOKEN;
              const res = await fetch(`https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}&latitude=${latitude}&types=place&access_token=${token}`);
              const data = await res.json();
              if (data.features && data.features.length > 0) {
                // Stringify the feature to easily search for city keywords in context/name
                const featureStr = JSON.stringify(data.features[0]).toLowerCase();
                const matchedCity = Object.keys(CURATED_MARKETS).find(k => featureStr.includes(k));
                if (matchedCity) {
                  setUserCity(matchedCity);
                  setSelectedCity(matchedCity);
                } else {
                  // Fallback to first city if none matched
                  setSelectedCity('abuja');
                }
              }
            } catch (err) {
              console.error("City detection failed", err);
              setSelectedCity('abuja');
            } finally {
              setDetectingCity(false);
            }
          },
          () => {
            setDetectingCity(false);
            setSelectedCity('abuja');
          },
          { timeout: 5000 }
        );
      } else {
        setDetectingCity(false);
      }
    }
  }, [category, userCity]);

  const apiBaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL ?? 'http://localhost:4000');

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/locations`, { method: 'GET', credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          clearSession();
          navigate('/login');
          throw new Error('Session expired');
        }
        return res.json();
      })
      .then((data) => {
        if (data?.locations && data.locations.length > 0) {
          setSavedLocations(data.locations);
          // Auto-fill Delivery Location with 'Home' or the first saved profile location
          setDropoffLocation(prev => {
            if (prev) return prev; // Don't overwrite if the user already started typing
            const homeLoc = data.locations.find((loc: any) => loc.label.toLowerCase() === 'home');
            return homeLoc ? homeLoc.address : data.locations[0].address;
          });
        }
      })
      .catch(console.error);
  }, [apiBaseUrl]);

  const handleAddressSearch = (query: string, type: 'pickup' | 'dropoff') => {
    if (type === 'pickup') {
      setPickupLocation(query);
      setExplicitPickupCoords(null); // ✅ Clear stale coords when user edits text
    } else {
      setDropoffLocation(query);
      setExplicitDropoffCoords(null); // ✅ Clear stale coords when user edits text
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (query.trim().length < 3) {
      if (type === 'pickup') setPickupResults([]);
      else setDropoffResults([]);
      return;
    }

    // Wait 600ms after the user stops typing before calling the Mapbox API
    searchTimeout.current = setTimeout(async () => {
      try {
        const token = import.meta.env.VITE_MAPBOX_TOKEN;
        // ✅ Use user's real GPS as proximity bias so results match their actual area
        const proximity = `${userCoords[0]},${userCoords[1]}`;
        const res = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(query)}&country=ng&proximity=${proximity}&limit=4&access_token=${token}`);
        const data = await res.json();
        const mapped = (data.features || []).map((f: any) => ({
          display_name: f.properties.full_address || f.properties.name,
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0]
        }));
        if (type === 'pickup') setPickupResults(mapped);
        else setDropoffResults(mapped);
      } catch (err) { console.error('Geocoding error:', err); }
    }, 600);
  };

  const handleContinue = async () => {
    if (!title || !pickupLocation || !dropoffLocation || !budget) {
      setError('Please fill in all required fields (Title, Locations, and Budget).');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      // 1. USE EXPLICIT COORDS OR GEOCODING
      let pickupLat = explicitPickupCoords?.lat;
      let pickupLng = explicitPickupCoords?.lng;
      let dropoffLat = explicitDropoffCoords?.lat;
      let dropoffLng = explicitDropoffCoords?.lng;
      
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      // ✅ Use user's real GPS for proximity so fallback geocoding stays in their area
      const proximity = `${userCoords[0]},${userCoords[1]}`;
      try {
        if (!pickupLat || !pickupLng) {
          const pRes = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(pickupLocation)}&country=ng&proximity=${proximity}&limit=1&access_token=${token}`);
          const pData = await pRes.json();
          if (pData?.features?.[0]) { 
            pickupLat = Number(pData.features[0].geometry.coordinates[1]); 
            pickupLng = Number(pData.features[0].geometry.coordinates[0]); 
          }
        }

        if (!dropoffLat || !dropoffLng) {
          const dRes = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(dropoffLocation)}&country=ng&proximity=${proximity}&limit=1&access_token=${token}`);
          const dData = await dRes.json();
          if (dData?.features?.[0]) { 
            dropoffLat = Number(dData.features[0].geometry.coordinates[1]); 
            dropoffLng = Number(dData.features[0].geometry.coordinates[0]); 
          }
        }
      } catch (geoErr) {
        console.warn('Geocoding failed, falling back to null coordinates', geoErr);
      }

      // Fallback to real GPS if OpenStreetMap couldn't find the text address and no explicit pin was dropped
      if (!pickupLat || !dropoffLat || isNaN(pickupLat) || isNaN(dropoffLat)) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, (err) => {
              reject(err);
            }, { timeout: 5000, enableHighAccuracy: true });
          });
          if (!pickupLat || isNaN(pickupLat)) {
            pickupLat = pos.coords.latitude;
            pickupLng = pos.coords.longitude;
          }
          if (!dropoffLat || isNaN(dropoffLat)) {
            dropoffLat = pos.coords.latitude + (Math.random() * 0.01 - 0.005);
            dropoffLng = pos.coords.longitude + (Math.random() * 0.01 - 0.005);
          }
        } catch (err) {
          console.warn('Geolocation fallback failed', err);
        }
      }

      // 🚨 "Make bad data loud": No more silent Abuja fallbacks. If we STILL don't have coords, reject the order.
      if (!pickupLat || !dropoffLat || isNaN(pickupLat) || isNaN(dropoffLat)) {
        setIsSubmitting(false);
        setError("Could not find the exact location on the map. Please click 'Select precise house pin on map' to drop a pin manually.");
        return;
      }

      // 🚨 Reject exact fallback coordinates! If the user just clicked "Confirm" on the default pin drop without moving it.
      // 9.0579 is the hardcoded lat for the default center.
      if (Math.abs(pickupLat - 9.0579) < 0.0001 || Math.abs(dropoffLat - 9.0579) < 0.0001) {
        setIsSubmitting(false);
        setError("You must select your EXACT location. The default map center is not allowed. Please drag the map pin to your actual house/market.");
        return;
      }

      console.log(`[PostErrand] FINAL COORDS → pickup=(${pickupLat}, ${pickupLng}) dropoff=(${dropoffLat}, ${dropoffLng}) | explicit pickup=${!!explicitPickupCoords} dropoff=${!!explicitDropoffCoords} | userCoords=${userCoords}`);
      const res = await fetch(`${apiBaseUrl}/api/errands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title, description, category, fulfillment_mode: fulfillmentMode,
          pickup_location: pickupLocation, dropoff_location: dropoffLocation,
          budget: Number(budget), supermarket_name: supermarketName,
          order_ref: orderRef, supermarket_contact: supermarketContact,
          requires_cooler: requiresCooler,
          pickup_lat: pickupLat, 
          pickup_lng: pickupLng,
          dropoff_lat: dropoffLat, 
          dropoff_lng: dropoffLng,
          market_items: category === 'Market' 
            ? marketItems.filter(item => item.name.trim() !== '').map(item => ({
                name: item.name,
                estimatedPrice: Number(item.estimatedPrice) || 0
              }))
            : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to post errand');

      // Pass the errand data in memory to the checkout page
      navigate('/customer/checkout', { state: { errand: data.errand } });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: 'Market', label: 'Market Run', icon: <ShoppingBasket size={16} /> },
    { id: 'Purchase', label: 'Purchase', icon: <ShoppingCart size={16} /> },
    { id: 'Service', label: 'Service', icon: <PackageCheck size={16} /> },
    { id: 'Supermarket', label: 'Supermarket', icon: <Store size={16} /> },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-white dark:bg-[#000000] text-black dark:text-white transition-colors duration-300">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-[#050505]/80 p-6 backdrop-blur-xl">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-95 -ml-2"
        >
          <ArrowLeft size={18} className="text-black dark:text-white" />
        </button>
        <h2 className="text-lg font-extrabold tracking-tight text-black dark:text-white">Post Errand</h2>
        <div className="w-10" />
      </header>

      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="mx-auto w-full max-w-2xl p-6 pb-36"
      >
        <div className="mb-6 rounded-[28px] border border-black/10 dark:border-white/10 bg-white dark:bg-[#0A0A0A] p-6 text-black dark:text-white shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-kart-orange">Create request</p>
          <h3 className="mb-1 text-2xl font-black tracking-tight">Describe your errand</h3>
          <p className="text-sm text-black/60 dark:text-white/60">Set details, pickup & delivery points, and runner fee.</p>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl md:p-6 backdrop-blur-md">
            <h3 className="mb-4 text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">ERRAND DETAILS</h3>
            <Input 
              label="Title" 
              placeholder="e.g., Pickup groceries from Shoprite" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {category !== 'Market' ? (
              <TextArea
                label="Description"
                placeholder="Share item list, preferred brand, quantity, and instructions..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            ) : (
              <div className="mt-4 mb-2">
                <label className="mb-2 ml-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-black/50 dark:text-white/50">
                  Shopping List
                </label>
                <div className="flex flex-col gap-3">
                  {marketItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="flex-1">
                        <Input 
                          placeholder="e.g. 1 Bag of Rice" 
                          value={item.name}
                          onChange={(e) => {
                            const newItems = [...marketItems];
                            newItems[index].name = e.target.value;
                            setMarketItems(newItems);
                          }}
                        />
                      </div>
                      <div className="w-1/3">
                        <Input 
                          type="number"
                          placeholder="Price (₦)" 
                          value={item.estimatedPrice}
                          onChange={(e) => {
                            const newItems = [...marketItems];
                            newItems[index].estimatedPrice = e.target.value;
                            setMarketItems(newItems);
                          }}
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          const newItems = marketItems.filter((_, i) => i !== index);
                          setMarketItems(newItems);
                        }}
                        className="h-12 w-12 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 mt-1 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setMarketItems([...marketItems, { name: '', estimatedPrice: '' }])}
                    className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-black/20 dark:border-white/20 py-3 text-sm font-bold text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 transition-colors mt-2"
                  >
                    <Plus size={16} /> Add Item
                  </button>
                </div>
              </div>
            )}

            <div className="mt-2">
              <label className="mb-2 ml-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-black/50 dark:text-white/50">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      if (cat.id === 'Supermarket') {
                        setFulfillmentMode('supermarket-dispatch');
                      } else {
                        setFulfillmentMode('direct-runner');
                      }
                    }}
                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 px-2 py-4 text-xs font-semibold transition-all ${
                      category === cat.id
                        ? 'border-kart-orange bg-kart-orange/10 text-kart-orange shadow-[0_4px_20px_rgba(255,102,0,0.1)]'
                        : 'border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/50 hover:border-black/20 dark:hover:border-white/20'
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 ml-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-black/50 dark:text-white/50">
                Fulfillment mode
              </label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {[
                  { id: 'direct-runner', label: 'Customer assigns runner', detail: 'Regular customer request flow' },
                  {
                    id: 'supermarket-dispatch',
                    label: 'Supermarket dispatch',
                    detail: 'Store coordinates runner delivery',
                  },
                ].map(mode => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setFulfillmentMode(mode.id as 'direct-runner' | 'supermarket-dispatch')}
                    className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                      fulfillmentMode === mode.id
                        ? 'border-kart-orange bg-kart-orange/10 shadow-[0_4px_20px_rgba(255,102,0,0.1)]'
                        : 'border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 hover:border-black/20 dark:hover:border-white/20'
                    }`}
                  >
                    <p className={`text-sm font-bold ${fulfillmentMode === mode.id ? 'text-kart-orange' : 'text-black dark:text-white'}`}>{mode.label}</p>
                    <p className="mt-1 text-xs text-black/50 dark:text-white/50">{mode.detail}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {(category === 'Supermarket' || fulfillmentMode === 'supermarket-dispatch') && (
            <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl md:p-6 backdrop-blur-md">
              <h3 className="mb-4 text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">SUPERMARKET DETAILS</h3>
              <Input 
                label="Supermarket name" 
                placeholder="e.g., Shoprite, Spar, Ebeano" 
                value={supermarketName}
                onChange={(e) => setSupermarketName(e.target.value)}
              />
              <Input 
                label="Order reference (optional)" 
                placeholder="Paste your order ID or cart ref" 
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
              />
              <Input 
                label="Supermarket contact" 
                placeholder="Store phone or contact person" 
                value={supermarketContact}
                onChange={(e) => setSupermarketContact(e.target.value)}
              />
              <label className="ml-1 flex items-center gap-3 text-sm text-black/60 dark:text-white/60 font-semibold cursor-pointer">
                <input type="checkbox" className="h-5 w-5 rounded accent-kart-orange bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10" defaultChecked />
                Supermarket will dispatch a runner
              </label>
            </section>
          )}

          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl md:p-6 backdrop-blur-md">
            <h3 className="mb-4 text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">LOCATIONS</h3>
            
            {category === 'Market' && (
              <div className="mb-6 rounded-2xl bg-black/5 dark:bg-white/5 p-4 border border-black/10 dark:border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-black/60 dark:text-white/60">Top Markets</h4>
                  {detectingCity ? (
                    <span className="text-[10px] bg-kart-orange/20 text-kart-orange px-2 py-0.5 rounded-full font-bold animate-pulse">Detecting...</span>
                  ) : (
                    <select 
                      className="text-xs font-bold bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 outline-none text-black dark:text-white"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                    >
                      <option value="" disabled>Select City</option>
                      {Object.keys(CURATED_MARKETS).map(city => (
                        <option key={city} value={city}>{city.charAt(0).toUpperCase() + city.slice(1)}</option>
                      ))}
                    </select>
                  )}
                </div>
                
                {!detectingCity && selectedCity && CURATED_MARKETS[selectedCity] ? (
                  <div className="flex flex-wrap gap-2">
                    {CURATED_MARKETS[selectedCity].map(market => {
                      const displayCity = selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1);
                      return (
                        <button
                          key={market}
                          type="button"
                          onClick={() => {
                            setPickupLocation(`${market}, ${displayCity}`);
                            if (ABUJA_MARKET_COORDS[market]) {
                              setExplicitPickupCoords(ABUJA_MARKET_COORDS[market]);
                            } else {
                              setExplicitPickupCoords(null);
                            }
                          }}
                          className={`text-xs font-bold px-4 py-2.5 rounded-xl border transition-all ${
                            pickupLocation.includes(market) 
                              ? 'bg-kart-orange text-white border-kart-orange shadow-[0_4px_15px_rgba(255,102,0,0.4)]'
                              : 'bg-white dark:bg-[#1A1A1A] text-black/70 dark:text-white/70 border-black/10 dark:border-white/10 hover:border-kart-orange/50 hover:text-kart-orange'
                          }`}
                        >
                          {market}
                        </button>
                      );
                    })}
                  </div>
                ) : !detectingCity ? (
                  <p className="text-xs font-medium text-black/50 dark:text-white/50">Please select a city above to see curated markets, or type the market name below.</p>
                ) : null}
              </div>
            )}

            <div className="relative z-20 mb-4">
              <Input 
                label={category === 'Market' ? 'Market Location' : 'Pickup Location'} 
                placeholder={category === 'Market' ? 'Select a market above or search...' : 'Where should the runner go?'} 
                icon={<MapPin size={18} />} 
                value={pickupLocation}
                onChange={(e) => handleAddressSearch(e.target.value, 'pickup')}
                onFocus={() => setActiveInput('pickup')}
                onBlur={() => setTimeout(() => setActiveInput(null), 200)}
              />
              {activeInput === 'pickup' && (pickupResults.length > 0 || savedLocations.length > 0) && (
                <AddressDropdown
                  results={pickupResults}
                  savedLocations={savedLocations}
                  onSelect={(value, lat, lon) => {
                    setPickupLocation(value);
                    setPickupResults([]);
                    if (lat != null && lon != null) {
                      setExplicitPickupCoords({ lat, lng: lon });
                    }
                  }}
                />
              )}
            </div>

            <div className="relative z-10 mb-4">
              <Input 
                label="Delivery Location" 
                placeholder="e.g. House 4, Gwarinpa Estate, Abuja" 
                icon={<Home size={18} />} 
                value={dropoffLocation}
                onChange={(e) => handleAddressSearch(e.target.value, 'dropoff')}
                onFocus={() => setActiveInput('dropoff')}
                onBlur={() => setTimeout(() => setActiveInput(null), 200)}
              />
              {activeInput === 'dropoff' && (dropoffResults.length > 0 || savedLocations.length > 0) && (
                <AddressDropdown
                  results={dropoffResults}
                  savedLocations={savedLocations}
                  onSelect={(value, lat, lon) => {
                    setDropoffLocation(value);
                    setDropoffResults([]);
                    if (lat != null && lon != null) {
                      setExplicitDropoffCoords({ lat, lng: lon });
                    }
                  }}
                />
              )}
              
              <button 
                type="button" 
                onClick={() => {
                   setPinDropModal({ isOpen: true, location: userCoords, type: 'dropoff' });
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 py-3 text-xs font-bold text-black/70 dark:text-white/70 transition-colors hover:bg-black/10 dark:hover:bg-white/10 hover:text-kart-orange"
              >
                <MapPin size={14} className="text-kart-orange" /> Select precise house pin on map
              </button>
            </div>

            <label className="ml-1 flex items-center gap-3 text-sm text-black/60 dark:text-white/60 font-semibold cursor-pointer">
              <input 
                type="checkbox" 
                id="saveLoc" 
                className="h-5 w-5 rounded accent-kart-orange bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                checked={requiresCooler}
                onChange={(e) => setRequiresCooler(e.target.checked)} 
              />
              Must have a cooler bag / insulation
            </label>
          </section>

          <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl md:p-6 backdrop-blur-md">
            <h3 className="mb-4 text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">RUNNER SERVICE FEE</h3>
            
            {category === 'Market' && (
              <div className="mb-4 rounded-xl bg-kart-orange/10 p-4 border border-kart-orange/20">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-kart-orange uppercase tracking-wider">Total Item Cost (Escrow)</span>
                  <span className="text-lg font-black text-kart-orange">
                    ₦{marketItems.reduce((sum, item) => sum + (Number(item.estimatedPrice) || 0), 0).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-kart-orange/80">This amount will be held safely and sent directly to the seller when purchased.</p>
              </div>
            )}

            <p className="mb-3 ml-1 text-xs text-black/50 dark:text-white/50">How much are you paying the runner for their service?</p>

            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-black dark:text-white">₦</div>
              <input
                type="number"
                className="w-full rounded-2xl border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#121212] py-5 pl-12 pr-4 text-2xl font-black text-black dark:text-white shadow-inner outline-none transition-all placeholder:text-black/30 dark:placeholder:text-white/30 focus:border-kart-orange focus:ring-4 focus:ring-kart-orange/20"
                placeholder="0.00"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </section>
        </div>
      </motion.main>

      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-2xl -translate-x-1/2 border-t border-black/5 dark:border-white/5 bg-white/95 dark:bg-[#050505]/95 p-5 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-2xl rounded-t-[32px]">
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500 dark:text-red-400 font-medium">
            {error}
          </div>
        )}
        <Button fullWidth onClick={handleContinue} disabled={isSubmitting} className="h-14 text-base font-bold shadow-[0_4px_20px_rgba(255,102,0,0.2)]">
          {isSubmitting ? 'Saving...' : 'Review & Checkout'}
        </Button>
      </div>

      <PinDropModal 
        isOpen={pinDropModal.isOpen}
        initialLocation={pinDropModal.location}
        title={pinDropModal.type === 'pickup' ? 'Confirm Pickup Location' : 'Confirm Delivery Location'}
        onClose={() => setPinDropModal({ ...pinDropModal, isOpen: false })}
        onConfirm={(_loc, addr) => {
           if (pinDropModal.type === 'pickup') {
             setPickupLocation(addr);
             setExplicitPickupCoords({ lat: _loc[1], lng: _loc[0] });
           } else {
             setDropoffLocation(addr);
             setExplicitDropoffCoords({ lat: _loc[1], lng: _loc[0] });
           }
           setPinDropModal({ ...pinDropModal, isOpen: false });
           // Auto-trigger continue after pin drop
           setTimeout(() => handleContinue(), 100);
        }}
      />
    </div>
  );
};

const AddressDropdown = ({ results, savedLocations, onSelect }: { results: any[], savedLocations: any[], onSelect: (value: string, lat?: number, lon?: number) => void }) => {
  const hasSaved = savedLocations.length > 0;
  const hasResults = results.length > 0;

  return (
    <div className="absolute top-full mt-2 w-full overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#0A0A0A] shadow-[0_15px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      {hasSaved && (
        <>
          <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Saved Locations</p>
          {savedLocations.map((loc: any) => (
            <div key={`saved-${loc.id}`} className="cursor-pointer border-b border-black/5 dark:border-white/5 px-4 py-3 text-sm text-black/80 dark:text-white/80 transition-colors hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white" onClick={() => onSelect(loc.address, loc.lat ?? undefined, loc.lng ?? undefined)}>
              <span className="font-bold text-kart-orange">{loc.label}:</span> {loc.address}
            </div>
          ))}
        </>
      )}
      {hasResults && (
        <>
          {hasSaved && <div className="h-1 bg-black/5 dark:bg-white/5"></div>}
          <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Suggestions</p>
          {results.map((res: any, idx: number) => (
            <div key={idx} className="cursor-pointer border-b border-black/5 dark:border-white/5 px-4 py-3 text-sm text-black/80 dark:text-white/80 transition-colors hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white" onClick={() => onSelect(res.display_name, res.lat, res.lon)}>
              {res.display_name}
            </div>
          ))}
        </>
      )}
    </div>
  );
};
