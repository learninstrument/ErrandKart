import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBasket, ShoppingCart, PackageCheck, MapPin, Home, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { TextArea } from '../../components/UI/TextArea';
import { clearSession } from '../../utils/auth';

export const PostErrand: React.FC = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('Purchase');
  const [fulfillmentMode, setFulfillmentMode] = useState<'direct-runner' | 'supermarket-dispatch'>('direct-runner');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
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
    if (type === 'pickup') setPickupLocation(query);
    else setDropoffLocation(query);

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
        const abujaBbox = "7.25,8.85,7.60,9.25";
        const res = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(query)}&country=ng&bbox=${abujaBbox}&limit=4&access_token=${token}`);
        const data = await res.json();
        const mapped = (data.features || []).map((f: any) => ({
          display_name: f.properties.full_address,
          lat: f.properties.coordinates.latitude,
          lon: f.properties.coordinates.longitude
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
      // 1. GEOCODING WITH MAPBOX
      let pickupLat, pickupLng, dropoffLat, dropoffLng;
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      const abujaBbox = "7.25,8.85,7.60,9.25";
      try {
        const pRes = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(pickupLocation)}&country=ng&bbox=${abujaBbox}&limit=1&access_token=${token}`);
        const pData = await pRes.json();
        if (pData?.features?.[0]) { 
          pickupLat = Number(pData.features[0].properties.coordinates.latitude); 
          pickupLng = Number(pData.features[0].properties.coordinates.longitude); 
        }

        const dRes = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(dropoffLocation)}&country=ng&bbox=${abujaBbox}&limit=1&access_token=${token}`);
        const dData = await dRes.json();
        if (dData?.features?.[0]) { 
          dropoffLat = Number(dData.features[0].properties.coordinates.latitude); 
          dropoffLng = Number(dData.features[0].properties.coordinates.longitude); 
        }
      } catch (geoErr) {
        console.warn('Geocoding failed, falling back to null coordinates', geoErr);
      }

      // Fallback to real GPS if OpenStreetMap couldn't find the text address
      if (!pickupLat || !dropoffLat) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, (err) => {
              if (err.code === err.PERMISSION_DENIED) {
                alert("Please enable location services in your browser settings to automatically use your current location.");
              }
              reject(err);
            }, { timeout: 5000 });
          });
          if (!pickupLat) {
            pickupLat = pos.coords.latitude;
            pickupLng = pos.coords.longitude;
          }
          if (!dropoffLat) {
            // Dropoff defaults to slightly away from pickup to simulate travel distance
            dropoffLat = pos.coords.latitude + (Math.random() * 0.01 - 0.005);
            dropoffLng = pos.coords.longitude + (Math.random() * 0.01 - 0.005);
          }
        } catch (err) {
          console.warn('Geolocation fallback failed, using Abuja default', err);
          if (!pickupLat) { pickupLat = 9.0579; pickupLng = 7.4951; }
          if (!dropoffLat) { dropoffLat = 9.0579; dropoffLng = 7.4951; }
        }
      }
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
            <TextArea
              label="Description"
              placeholder="Share item list, preferred brand, quantity, and instructions..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

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
            
            <div className="relative z-20 mb-4">
              <Input 
                label="Pickup Location" 
                placeholder="Where should the runner go?" 
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
                  onSelect={(value) => {
                    setPickupLocation(value);
                    setPickupResults([]);
                  }}
                />
              )}
            </div>

            <div className="relative z-10 mb-4">
              <Input 
                label="Delivery Location" 
                placeholder="Enter delivery address" 
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
                  onSelect={(value) => {
                    setDropoffLocation(value);
                    setDropoffResults([]);
                  }}
                />
              )}
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
            <h3 className="mb-4 text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">BUDGET</h3>
            <p className="mb-3 ml-1 text-xs text-black/50 dark:text-white/50">How much are you paying the runner for this errand?</p>

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
    </div>
  );
};

const AddressDropdown = ({ results, savedLocations, onSelect }: { results: any[], savedLocations: any[], onSelect: (value: string) => void }) => {
  const hasSaved = savedLocations.length > 0;
  const hasResults = results.length > 0;

  return (
    <div className="absolute top-full mt-2 w-full overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#0A0A0A] shadow-[0_15px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      {hasSaved && (
        <>
          <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Saved Locations</p>
          {savedLocations.map((loc: any) => (
            <div key={`saved-${loc.id}`} className="cursor-pointer border-b border-black/5 dark:border-white/5 px-4 py-3 text-sm text-black/80 dark:text-white/80 transition-colors hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white" onClick={() => onSelect(loc.address)}>
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
            <div key={idx} className="cursor-pointer border-b border-black/5 dark:border-white/5 px-4 py-3 text-sm text-black/80 dark:text-white/80 transition-colors hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white" onClick={() => onSelect(res.display_name)}>
              {res.display_name}
            </div>
          ))}
        </>
      )}
    </div>
  );
};
