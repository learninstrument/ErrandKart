import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBasket, ShoppingCart, PackageCheck, MapPin, Home, Store } from 'lucide-react';
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
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

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

    // Wait 600ms after the user stops typing before calling the free OpenStreetMap API
    searchTimeout.current = setTimeout(async () => {
      try {
        // Using countrycodes=ng filters the map specifically to Nigeria for extreme accuracy!
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=4&countrycodes=ng&q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (type === 'pickup') setPickupResults(data);
        else setDropoffResults(data);
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
      // 1. FREE GEOCODING WITH OPENSTREETMAP
      let pickupLat, pickupLng, dropoffLat, dropoffLng;
      try {
        const pRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(pickupLocation)}`);
        const pData = await pRes.json();
        if (pData?.[0]) { 
          pickupLat = Number(pData[0].lat); 
          pickupLng = Number(pData[0].lon); 
        }

        const dRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(dropoffLocation)}`);
        const dData = await dRes.json();
        if (dData?.[0]) { 
          dropoffLat = Number(dData[0].lat); 
          dropoffLng = Number(dData[0].lon); 
        }
      } catch (geoErr) {
        console.warn('Free Geocoding failed, falling back to null coordinates', geoErr);
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
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#050505]/90 p-6 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-white">Post New Errand</h2>
        <div className="w-8" />
      </header>

      <main className="p-6 pb-36 md:p-8">
        <div className="mb-6 rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0A0A0A] via-[#121826] to-[#050505] p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/60">Create request</p>
          <h3 className="mb-1 text-2xl font-black">Describe your errand clearly</h3>
          <p className="text-sm text-white/70">Set details, pickup & delivery points, and runner fee.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.25fr_0.75fr]">
          <div className="flex flex-col gap-5">
            <section className="rounded-[28px] border border-white/10 bg-[#0A0A0A] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:p-6">
              <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">ERRAND DETAILS</h3>
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

              <div>
                <label className="mb-2 ml-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
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
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-2 py-3 text-xs font-semibold transition-all ${
                        category === cat.id
                          ? 'border-kart-orange bg-kart-orange/15 text-kart-orange'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      {cat.icon}
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 ml-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Fulfillment mode
                </label>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
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
                      className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                        fulfillmentMode === mode.id
                          ? 'border-kart-orange/40 bg-kart-orange/15'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <p className="text-sm font-semibold text-white">{mode.label}</p>
                      <p className="mt-1 text-xs text-white/60">{mode.detail}</p>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-white/50">
                  Supermarket requests still start in customer session so the customer controls delivery address and payment.
                </p>
              </div>
            </section>

            {(category === 'Supermarket' || fulfillmentMode === 'supermarket-dispatch') && (
              <section className="rounded-[28px] border border-white/10 bg-[#0A0A0A] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:p-6">
                <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">SUPERMARKET DETAILS</h3>
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
                <label className="ml-1 flex items-center gap-2 text-sm text-slate-400">
                  <input type="checkbox" className="h-4 w-4 rounded accent-kart-orange" defaultChecked />
                  Supermarket will dispatch a runner to deliver items
                </label>
              </section>
            )}

            <section className="rounded-[28px] border border-white/10 bg-[#0A0A0A] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:p-6">
              <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">LOCATIONS</h3>
              
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

              <label className="ml-1 flex items-center gap-2 text-sm text-slate-400">
                <input 
                  type="checkbox" 
                  id="saveLoc" 
                  className="h-4 w-4 rounded accent-kart-orange"
                  checked={requiresCooler}
                  onChange={(e) => setRequiresCooler(e.target.checked)} 
                />
                Must have a cooler bag / insulation
              </label>
            </section>
          </div>

          <div className="flex flex-col gap-5">
            <section className="rounded-[28px] border border-white/10 bg-[#0A0A0A] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:p-6">
              <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">BUDGET</h3>
              <p className="mb-2 ml-1 text-xs text-slate-400">How much are you paying the runner for this errand?</p>

              <div className="relative mb-2">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-white">₦</div>
                <input
                  type="number"
                  className="w-full rounded-2xl border border-[#253043] bg-[#121212] py-4 pl-10 pr-4 text-2xl font-black text-white shadow-[0_10px_24px_rgba(0,0,0,0.25)] outline-none transition-all placeholder:text-slate-500 focus:border-kart-orange focus:ring-4 focus:ring-kart-orange/20"
                  placeholder="0.00"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
            </section>

            <section className="hidden rounded-[28px] border border-white/10 bg-[#0A0A0A] p-5 text-sm text-white/70 shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:block md:p-6">
              <h3 className="mb-3 text-sm font-black tracking-[0.2em] text-white/70">SUMMARY</h3>
              <p className="text-sm text-white/70">
                Review your details, then continue to checkout to confirm pricing and priority options.
              </p>
              
              {error && (
                <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <Button fullWidth className="mt-5" onClick={handleContinue} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Continue to Checkout'}
              </Button>
            </section>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-3xl -translate-x-1/2 border-t border-white/5 bg-[#050505]/95 p-5 backdrop-blur-md md:hidden">
        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        <Button fullWidth onClick={handleContinue} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Continue to Checkout'}
        </Button>
      </div>
    </div>
  );
};

const AddressDropdown = ({ results, savedLocations, onSelect }: { results: any[], savedLocations: any[], onSelect: (value: string) => void }) => {
  const hasSaved = savedLocations.length > 0;
  const hasResults = results.length > 0;

  return (
    <div className="absolute top-full mt-1 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
      {hasSaved && (
        <>
          <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Saved Locations</p>
          {savedLocations.map((loc: any) => (
            <div key={`saved-${loc.id}`} className="cursor-pointer border-b border-white/5 px-4 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white" onClick={() => onSelect(loc.address)}>
              <span className="font-bold text-kart-orange">{loc.label}:</span> {loc.address}
            </div>
          ))}
        </>
      )}
      {hasResults && (
        <>
          {hasSaved && <div className="h-2 bg-black/20"></div>}
          <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Suggestions</p>
          {results.map((res: any, idx: number) => (
            <div key={idx} className="cursor-pointer border-b border-white/5 px-4 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white" onClick={() => onSelect(res.display_name)}>
              {res.display_name}
            </div>
          ))}
        </>
      )}
    </div>
  );
};
