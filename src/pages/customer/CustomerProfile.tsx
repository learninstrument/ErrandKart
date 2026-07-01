import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, MapPin, Plus, Settings, Trash2, X, Navigation } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';

import { BottomNav } from './BottomNav';
import { clearSession } from '../../utils/auth';

export const CustomerProfile: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [savedLocations, setSavedLocations] = useState<any[]>([]);
  const [isLocationsLoading, setIsLocationsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const apiBaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL ?? 'http://localhost:4000');

  const fetchLocations = () => {
    setIsLocationsLoading(true);
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
        if (data?.locations) setSavedLocations(data.locations);
      })
      .catch(console.error)
      .finally(() => setIsLocationsLoading(false));
  };

  useEffect(() => {
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
          setEmail(data.user.email || '');
          setGender(data.user.gender || data.user.user_metadata?.gender || '');
          setPhoneNumber(data.user.phone_number || '');
        }
      })
      .catch(console.error);
    fetchLocations();
  }, [apiBaseUrl]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ full_name: fullName, gender, phone_number: phoneNumber })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save profile');
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLocation = async ({ label, address }: { label: string; address: string }) => {
    const res = await fetch(`${apiBaseUrl}/api/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ label, address }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to save location.');
    }
    fetchLocations(); // Refresh list
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (!window.confirm('Are you sure you want to delete this location?')) return;

    try {
      const res = await fetch(`${apiBaseUrl}/api/locations/${locationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to delete location.');
      }
      setSavedLocations((prev) => prev.filter((loc) => loc.id !== locationId));
      setMessage({ type: 'success', text: 'Location deleted.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-white dark:bg-[#000000] text-black dark:text-white transition-colors duration-300">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/85 dark:bg-[#000000]/85 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-black/60 dark:text-white/60 transition-colors hover:text-black dark:hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-extrabold tracking-tight text-black dark:text-white">Profile</h2>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-lg md:max-w-2xl lg:max-w-4xl flex-1 flex-col gap-8 px-6 pb-28 pt-8 md:px-10 md:pb-10 animate-fade-in-up">
        {/* Avatar Section */}
        <div className="flex flex-col items-center justify-center mt-2 relative">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-black/10 dark:border-white/10 shadow-lg relative bg-black/5 dark:bg-white/5">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName || 'Sarah')}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <label className="absolute bottom-0 right-0 bg-kart-orange text-white rounded-full p-2.5 shadow-[0_4px_20px_rgba(255,102,0,0.3)] hover:scale-105 transition-transform flex items-center justify-center border-2 border-white dark:border-[#000000] cursor-pointer">
              <Camera size={16} className="text-white" />
              <input type="file" className="hidden" />
            </label>
          </div>
          <h2 className="mt-4 text-xl font-bold text-black dark:text-white">{fullName || 'Loading...'}</h2>
          <p className="text-sm text-black/50 dark:text-white/50">{email || 'Loading...'}</p>
        </div>

        <form className="flex flex-col gap-6 w-full" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
          <div className="flex flex-col gap-4">
            <Input 
              label="Full Name" 
              placeholder="Your Name" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="your@email.com" 
              value={email}
              disabled
            />
            
            <Input 
              label="Phone Number" 
              type="tel" 
              placeholder="+234 801 234 5678" 
              value={phoneNumber} 
              onChange={e => setPhoneNumber(e.target.value)}
            />

            <div>
              <label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/50 dark:text-white/50">Gender</label>
              <select 
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-4 text-sm text-black dark:text-white outline-none focus:border-kart-orange focus:ring-4 focus:ring-kart-orange/25 transition-colors"
              >
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {message.text && (
            <div className={`mt-2 rounded-2xl border px-4 py-3 text-sm ${message.type === 'error' ? 'border-red-500/40 bg-red-500/10 text-red-200' : 'border-market-green/40 bg-market-green/10 text-market-green'}`}>
              {message.text}
            </div>
          )}

          <Button type="submit" className="w-full h-14 text-base font-bold shadow-[0_4px_20px_rgba(255,102,0,0.2)] mt-2" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>

        <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">SETTINGS</h3>
              <p className="mt-1 text-xs text-black/50 dark:text-white/50">Notifications, privacy, and preferences.</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/customer/settings')} className="gap-2 text-xs border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">
              <Settings size={14} /> Manage
            </Button>
          </div>
        </section>

        <section className="rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A]/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-md">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40">SAVED LOCATIONS</h3>
            <Button variant="outline" className="gap-2 text-xs border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5" onClick={() => setIsModalOpen(true)}>
              <Plus size={14} /> Add
            </Button>
          </div>
          <div className="grid gap-3">
            {isLocationsLoading ? (
              <p className="text-sm text-black/50 dark:text-white/50">Loading locations...</p>
            ) : savedLocations.length === 0 ? (
              <p className="text-sm text-black/50 dark:text-white/50">You have no saved locations.</p>
            ) : (
              savedLocations.map((location) => (
                <div
                  key={location.id}
                  className="rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-4 transition-all hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-kart-orange/15 text-kart-orange">
                      <MapPin size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-black dark:text-white">{location.label}</p>
                      <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">{location.address}</p>
                    </div>
                    <button onClick={() => handleDeleteLocation(location.id)} className="p-2 -mr-2 text-black/30 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <div className="md:hidden">
        <BottomNav activeTab="profile" />
      </div>

      {isModalOpen && (
        <AddLocationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddLocation}
        />
      )}
    </div>
  );
};

const AddLocationModal = ({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { label: string; address: string }) => Promise<void>;
}) => {
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);


  if (!isOpen) return null;

  const handleSave = async () => {
    if (!label || String(label).trim() === '') {
      setError('Please provide a nickname for the location in the top box (e.g., Home, Office).');
      return;
    }
    if (!address || String(address).trim() === '') {
      setError('Please provide the full address in the bottom box.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      await onSave({ label, address });
      setLabel('');
      setAddress('');
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Location access is not supported by your browser.');
      return;
    }

    setIsFetchingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Fetch directly from OpenStreetMap so phones can connect without localhost IP issues!
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const street = addr.road || addr.pedestrian || addr.path || '';
            const house = addr.house_number || '';
            const neighbourhood = addr.neighbourhood || addr.suburb || addr.village || addr.city_district || '';
            const city = addr.city || addr.town || addr.county || '';
            
            const parts = [house, street, neighbourhood, city].filter(Boolean);
            setAddress(parts.join(', ') || data.display_name);
          } else if (data && data.display_name) {
            setAddress(data.display_name);
          } else {
            setError('Could not determine address from your location.');
          }
        } catch (err: any) {
          setError(`Error populating address: ${err.message}`);
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (err) => {
        setIsFetchingLocation(false);
        setError(`Unable to retrieve location: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0A0A0A] p-6 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-black dark:text-white tracking-tight">Add New Location</h3>
          <button onClick={onClose} className="p-2 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors bg-black/5 dark:bg-white/5 rounded-full">
            <X size={18} />
          </button>
        </div>
        <div className="mt-4 space-y-4">
          <Input label="Location Nickname" placeholder="e.g., Home, Office" value={label} onChange={e => setLabel(e.target.value)} />
          <Input label="Full Map Address" placeholder="Enter the full physical address" value={address} onChange={e => setAddress(e.target.value)} />
          
          <div className="-mt-1 flex justify-end">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isFetchingLocation || isSaving}
              className="flex items-center gap-1.5 text-xs font-bold text-kart-orange transition-colors hover:text-kart-orange/80 disabled:opacity-50"
            >
              <Navigation size={14} />
              {isFetchingLocation ? 'Locating...' : 'Use current location'}
            </button>
          </div>

          {error && <p className="text-sm text-red-500 dark:text-red-400 bg-red-500/10 p-3 rounded-xl">{error}</p>}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5 mt-4">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto border-black/10 dark:border-white/10">Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? 'Saving...' : 'Save Location'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
