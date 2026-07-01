import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, MapPin, Plus, Settings, Trash2, X, Navigation } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { TextArea } from '../../components/UI/TextArea';
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

  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

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
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#050505]/90 px-6 py-4 backdrop-blur-md md:px-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/60 transition-colors hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-white">Profile</h2>
        <div className="w-8" />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 pb-28 pt-6 md:px-10 md:pb-10">
        <section className="rounded-[28px] border border-white/10 bg-[#0A0A0A] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName || 'Sarah')}`}
                alt="Profile"
                className="h-16 w-16 rounded-2xl border border-white/10 bg-white/5"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Profile photo</p>
                <p className="text-lg font-bold text-white">{fullName || 'Loading...'}</p>
                <p className="text-sm text-slate-400">{email || 'Loading...'}</p>
              </div>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-white">
              <Camera size={16} />
              Upload
              <input type="file" className="hidden" />
            </label>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#0A0A0A] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <h3 className="mb-4 text-sm font-black tracking-[0.2em] text-white/70">PERSONAL INFO</h3>
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
            <label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Gender</label>
            <select 
              value={gender}
              onChange={e => setGender(e.target.value)}
              className="mb-6 mt-1 w-full rounded-2xl border border-[#253043] bg-[#111621] px-4 py-3 text-sm text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none focus:border-kart-orange focus:ring-4 focus:ring-kart-orange/25"
            >
              <option value="" disabled>Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          {message.text && (
            <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${message.type === 'error' ? 'border-red-500/40 bg-red-500/10 text-red-200' : 'border-kart-orange/40 bg-kart-orange/10 text-kart-orange'}`}>
              {message.text}
            </div>
          )}

          <Button className="w-full" onClick={handleSaveProfile} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#0A0A0A] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black tracking-[0.2em] text-white/70">SETTINGS</h3>
              <p className="mt-2 text-sm text-slate-400">Notifications, privacy, and preferences.</p>
            </div>
            <Button onClick={() => navigate('/customer/settings')} className="gap-2 text-xs">
              <Settings size={14} /> Manage
            </Button>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#0A0A0A] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-sm font-black tracking-[0.2em] text-white/70">SAVED LOCATIONS</h3>
            <Button variant="outline" className="gap-2 text-xs" onClick={() => setIsModalOpen(true)}>
              <Plus size={14} /> Add
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {isLocationsLoading ? (
              <p className="text-sm text-slate-400">Loading locations...</p>
            ) : savedLocations.length === 0 ? (
              <p className="text-sm text-slate-400 col-span-full">You have no saved locations.</p>
            ) : (
              savedLocations.map((location) => (
                <div
                  key={location.id}
                  className="rounded-2xl border border-white/10 bg-[#121212] p-4 shadow-[0_10px_24px_rgba(0,0,0,0.25)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-kart-orange/15 text-kart-orange">
                      <MapPin size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{location.label}</p>
                      <p className="text-xs text-slate-400">{location.address}</p>
                    </div>
                    <button onClick={() => handleDeleteLocation(location.id)} className="p-1 text-slate-500 hover:text-red-400">
                      <Trash2 size={14} />
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
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

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
          if (data && data.display_name) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111822] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Add New Location</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="mt-4 space-y-4">
          <Input label="1. Location Nickname" placeholder="e.g., Home, Office, Mom's House" value={label} onChange={e => setLabel(e.target.value)} />
          <Input label="2. Full Map Address" placeholder="Enter the full physical address" value={address} onChange={e => setAddress(e.target.value)} />
          
          <div className="-mt-2 flex justify-end">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isFetchingLocation || isSaving}
              className="flex items-center gap-1 text-xs font-bold text-kart-orange transition-colors hover:text-white disabled:opacity-50"
            >
              <Navigation size={12} />
              {isFetchingLocation ? 'Locating...' : 'Use current location'}
            </button>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Location'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
