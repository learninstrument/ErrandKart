import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapPin, Check, X, Navigation } from 'lucide-react';
import { Button } from '../UI/Button';

interface PinDropModalProps {
  isOpen: boolean;
  initialLocation: [number, number]; // [lng, lat]
  onConfirm: (location: [number, number], addressName: string) => void;
  onClose: () => void;
  title?: string;
}

export const PinDropModal: React.FC<PinDropModalProps> = ({
  isOpen,
  initialLocation,
  onConfirm,
  onClose,
  title = "Confirm Exact Location"
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [center, setCenter] = useState<[number, number]>(initialLocation);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [address, setAddress] = useState("Drag map to pin exact location...");

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/standard',
      center: initialLocation,
      zoom: 16,
      pitch: 45
    });

    mapRef.current = map;

    map.on('move', () => {
      const c = map.getCenter();
      setCenter([c.lng, c.lat]);
    });

    map.on('moveend', () => {
      const c = map.getCenter();
      reverseGeocode(c.lng, c.lat);
    });

    // Initial geocode
    reverseGeocode(initialLocation[0], initialLocation[1]);

    return () => map.remove();
  }, [isOpen]);

  const handleLocateMe = () => {
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { longitude, latitude } = pos.coords;
        mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 16 });
      });
    }
  };

  const reverseGeocode = async (lng: number, lat: number) => {
    setIsGeocoding(true);
    try {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      const res = await fetch(`https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${token}`);
      const data = await res.json();
      if (data?.features?.[0]) {
        setAddress(data.features[0].properties.full_address || data.features[0].properties.name);
      } else {
        setAddress("Unknown Location");
      }
    } catch (err) {
      console.error(err);
      setAddress("Failed to get address");
    } finally {
      setIsGeocoding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-[28px] overflow-hidden w-full max-w-md shadow-2xl flex flex-col h-[600px] max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10">
          <h3 className="font-bold text-black dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Map Area */}
        <div className="relative flex-1 bg-black/5 dark:bg-white/5">
          <div ref={mapContainerRef} className="w-full h-full" />
          
          {/* Static Center Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none drop-shadow-xl z-10">
            <MapPin size={40} className="text-kart-orange fill-white" strokeWidth={2} />
          </div>

          {/* Locate Me Button */}
          <button 
            onClick={handleLocateMe}
            className="absolute bottom-4 right-4 bg-white dark:bg-[#1A1A1A] text-black dark:text-white p-3 rounded-full shadow-xl border border-black/5 dark:border-white/5 hover:scale-105 transition-transform z-20"
          >
            <Navigation size={20} className="text-kart-orange" />
          </button>
        </div>

        {/* Footer Area */}
        <div className="p-6 bg-white dark:bg-[#0A0A0A]">
          <div className="mb-4">
             <p className="text-[11px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40 mb-1">Selected Location</p>
             <p className="text-sm font-semibold text-black dark:text-white line-clamp-2 min-h-[40px]">
               {isGeocoding ? 'Loading...' : address}
             </p>
          </div>
          
          <Button 
            theme="green" 
            className="w-full py-4 font-bold text-white shadow-xl shadow-market-green/20"
            onClick={() => onConfirm(center, address)}
            disabled={isGeocoding}
          >
            <Check size={18} className="mr-2" /> Confirm Pin Location
          </Button>
        </div>

      </div>
    </div>
  );
};
