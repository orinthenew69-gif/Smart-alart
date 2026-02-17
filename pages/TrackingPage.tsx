import React, { useState, useEffect, useRef } from 'react';
import { UserLocation } from '../types';

const TrackingPage: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Map
  useEffect(() => {
    // @ts-ignore
    if (typeof L === 'undefined') {
      setError("Map resources are loading...");
      const checkL = setInterval(() => {
         // @ts-ignore
         if (typeof L !== 'undefined') {
           clearInterval(checkL);
           setError(null);
           initMap();
         }
      }, 500);
      return () => clearInterval(checkL);
    } else {
      initMap();
    }

    function initMap() {
      if (containerRef.current && !mapRef.current) {
        // @ts-ignore
        mapRef.current = L.map(containerRef.current, { zoomControl: false, attributionControl: false }).setView([0, 0], 2);
        // @ts-ignore
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
        setIsMapReady(true);
      }
    }
    
    return () => { 
        if (mapRef.current) { 
            mapRef.current.remove(); 
            mapRef.current = null; 
            markerRef.current = null;
        } 
    };
  }, []);

  // Track Location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("GPS not supported.");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, timestamp: pos.timestamp });
      },
      (err) => setError("Location Signal Weak: " + err.message),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Sync Marker with Map
  useEffect(() => {
      if (isMapReady && currentLocation && mapRef.current) {
          // @ts-ignore
          const latlng = [currentLocation.lat, currentLocation.lng];
          if (markerRef.current) {
            markerRef.current.setLatLng(latlng);
            mapRef.current.panTo(latlng);
          } else {
            // @ts-ignore
            if (typeof L !== 'undefined') {
                // @ts-ignore
                markerRef.current = L.circleMarker(latlng, { radius: 10, fillColor: '#4f46e5', color: '#fff', weight: 3, fillOpacity: 1 }).addTo(mapRef.current);
                mapRef.current.setView(latlng, 15);
            }
          }
      }
  }, [isMapReady, currentLocation]);

  return (
    <div className="h-full flex flex-col relative">
      <div className="absolute top-6 left-6 right-6 z-[1000]">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-indigo-100">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Signal ID</p>
           <p className="text-xl font-black text-slate-800 mt-1">{localStorage.getItem('user_phone') || 'Connecting...'}</p>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 bg-slate-200 relative">
        {error && <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-[1001] p-4 text-center text-sm font-bold text-slate-500">{error}</div>}
      </div>
    </div>
  );
};

export default TrackingPage;