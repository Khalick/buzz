'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

// Using dynamic import for Leaflet in Next.js since it needs window object
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamic import of react-leaflet components
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface Business {
  id: string;
  name: string;
  category: string;
  rating: number;
  location?: {
    lat?: number;
    lng?: number;
    town?: string;
    county?: string;
  };
}

interface MapViewProps {
  businesses: Business[];
  centerLat?: number;
  centerLng?: number;
}

export default function MapView({ businesses, centerLat = -1.03326, centerLng = 37.06933 }: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    // Dynamically import leaflet so we can define custom icons
    import('leaflet').then((leaflet) => {
      setL(leaflet);
    });
  }, []);

  if (!isMounted || !L) {
    return (
      <div className="w-full h-[500px] bg-[#F5F5F5] rounded-2xl flex items-center justify-center animate-pulse">
        <MapPin className="h-10 w-10 text-[#D4D4D4]" />
        <span className="ml-3 text-[#A3A3A3] font-medium">Loading Map...</span>
      </div>
    );
  }

  // Create a custom icon using our brand colors
  const customIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const businessesWithCoords = businesses.filter(
    (b) => b.location && typeof b.location.lat === 'number' && typeof b.location.lng === 'number'
  );

  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-lg border border-[#E5E5E5] relative z-0">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {businessesWithCoords.map((business) => (
          <Marker
            key={business.id}
            position={[business.location!.lat!, business.location!.lng!]}
            icon={customIcon}
          >
            <Popup className="rounded-xl overflow-hidden">
              <div className="p-1">
                <h3 className="font-bold text-[#1B4332] text-sm mb-1">{business.name}</h3>
                <p className="text-xs text-[#525252] mb-2">{business.category}</p>
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-xs font-bold">{business.rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-[#D4AF37] text-xs">★</span>
                </div>
                <a
                  href={`/business/${business.id}`}
                  className="block text-center bg-[#1B4332] text-white text-xs py-1.5 rounded-lg hover:bg-[#2D6A4F] transition-colors"
                >
                  View Profile
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {businessesWithCoords.length === 0 && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[1000] flex items-center justify-center">
          <div className="text-center p-6 bg-white rounded-2xl shadow-xl max-w-sm">
            <MapPin className="h-10 w-10 text-[#A3A3A3] mx-auto mb-3" />
            <h3 className="font-bold text-[#1A1A1A] mb-2">No Map Data Available</h3>
            <p className="text-sm text-[#737373]">
              None of the businesses in the current view have location coordinates to display on the map.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
