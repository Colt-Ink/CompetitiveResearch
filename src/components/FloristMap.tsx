'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useMediaQuery, useUnmount } from 'usehooks-ts';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

interface Florist {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  distanceMiles: number | null;
}

interface Territory {
  id: string;
  name: string;
  color: string | null;
  florists: {
    floristId: string;
  }[];
}

interface FloristMapProps {
  florists: Florist[];
  territories?: Territory[];
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  height?: string;
}

export default function FloristMap({
  florists,
  territories = [],
  centerLat = 45.4426, // Default to Last Straw Farms location
  centerLng = -122.2536,
  zoom = 10,
  height = '500px',
}: FloristMapProps) {
  // Use media query to adjust zoom level based on screen size
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const responsiveZoom = isDesktop ? zoom : zoom - 1;
  
  // Create a unique ID for this map instance
  const mapId = useRef(`map-${Math.random().toString(36).substring(2, 15)}`);
  const mapRef = useRef<L.Map | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  
  // Filter out florists without coordinates
  const validFlorists = florists.filter(
    (florist) => florist.latitude !== null && florist.longitude !== null
  );
  
  // Fix Leaflet icon issues with Next.js
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore - Leaflet's icon default is not typed properly
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
    }
  }, []);
  
  // Initialize map
  useEffect(() => {
    // Only run on client and if not already initialized
    if (isMapInitialized || typeof window === 'undefined') return;
    
    // Make sure the map container exists
    const container = document.getElementById(mapId.current);
    if (!container) return;
    
    // Create the map
    const map = L.map(mapId.current).setView([centerLat, centerLng], responsiveZoom);
    
    // Add the tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add farm marker
    L.marker([centerLat, centerLng])
      .addTo(map)
      .bindPopup(`<strong>Last Straw Farms</strong><br />14385 SE Lusted Rd, Sandy, OR 97055`);
    
    // Add florist markers
    validFlorists.forEach(florist => {
      if (florist.latitude && florist.longitude) {
        L.marker([florist.latitude, florist.longitude])
          .addTo(map)
          .bindPopup(`
            <strong>${florist.name}</strong><br />
            ${florist.address}<br />
            ${florist.distanceMiles ? `${florist.distanceMiles.toFixed(1)} miles from Last Straw Farms` : ''}
            <br /><br />
            <a href="/florists/${florist.id}" target="_blank" rel="noopener noreferrer">
              View Details
            </a>
          `);
      }
    });
    
    // Store the map reference
    mapRef.current = map;
    setIsMapInitialized(true);
    
    // Log for debugging
    console.log(`Map initialized with ID: ${mapId.current}`);
    
  }, [centerLat, centerLng, responsiveZoom, validFlorists, isMapInitialized]);
  
  // Use the useUnmount hook to ensure cleanup when component unmounts
  useUnmount(() => {
    if (mapRef.current) {
      console.log(`Cleaning up map with ID: ${mapId.current}`);
      mapRef.current.remove();
      mapRef.current = null;
      setIsMapInitialized(false);
    }
  });
  
  return (
    <div style={{ height, width: '100%' }}>
      <div id={mapId.current} style={{ height: '100%', width: '100%' }}></div>
    </div>
  );
}
