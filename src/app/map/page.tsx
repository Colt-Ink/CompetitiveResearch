'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import the FloristMap component with no SSR
// This is necessary because Leaflet requires the window object
const FloristMap = dynamic(() => import('@/components/FloristMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-gray-200 flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

export default function MapPage() {
  interface Florist {
    id: string;
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    distanceMiles: number | null;
    rating?: number;
    reviewCount?: number;
  }
  
  interface Territory {
    id: string;
    name: string;
    description?: string;
    color: string | null;
    florists: { floristId: string }[];
  }
  
  const [florists, setFlorists] = useState<Florist[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch florists
        const floristsResponse = await fetch('/api/florists');
        const floristsData = await floristsResponse.json();
        
        // Fetch territories
        const territoriesResponse = await fetch('/api/territories');
        const territoriesData = await territoriesResponse.json();
        
        setFlorists(floristsData.florists || []);
        setTerritories(territoriesData?.territories || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Florist Map</h1>
          <div className="flex space-x-2">
            <Link
              href="/dashboard"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Dashboard
            </Link>
            <Link
              href="/florists"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Florist List
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-lg">Loading map data...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Florist Map</h1>
        <div className="flex space-x-2">
          <Link
            href="/dashboard"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Dashboard
          </Link>
          <Link
            href="/florists"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Florist List
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Map Legend</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
              <span>Last Straw Farms</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              <span>Florists</span>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Territories</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {territories.map((territory) => (
              <div key={territory.id} className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: territory.color || '#9CA3AF' }}
                ></div>
                <span>
                  {territory.name} ({territory.florists?.length || 0} florists)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <FloristMap
          florists={florists}
          territories={territories}
          height="600px"
          zoom={9}
        />
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Florists on Map ({florists.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {florists.map((florist) => (
            <div key={florist.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-lg">{florist.name}</h3>
              <p className="text-gray-600 text-sm">{florist.address}</p>
              <p className="text-gray-600 text-sm">
                {florist.distanceMiles ? `${florist.distanceMiles.toFixed(1)} miles` : 'N/A'}
              </p>
              <div className="mt-2">
                <Link
                  href={`/florists/${florist.id}`}
                  className="text-blue-500 hover:underline text-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
