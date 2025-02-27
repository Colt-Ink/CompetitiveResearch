'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import the FloristMap component with no SSR
// This is necessary because Leaflet requires the window object
const FloristMap = dynamic(() => import('@/components/FloristMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-200 h-64 rounded flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

export default function DashboardPage() {
  interface Florist {
    id: string;
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    distanceMiles: number | null;
  }
  
  const [floristCount, setFloristCount] = useState(0);
  const [territoryCount, setTerritoryCount] = useState(0);
  const [routeCount, setRouteCount] = useState(0);
  const [recentFlorists, setRecentFlorists] = useState<Florist[]>([]);
  const [florists, setFlorists] = useState<Florist[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch florists for the map
        const floristsResponse = await fetch('/api/florists');
        const floristsData = await floristsResponse.json();
        setFlorists(floristsData.florists || []);
        setFloristCount(floristsData.florists?.length || 0);
        
        // Get recent florists (first 5)
        const sortedFlorists = [...(floristsData.florists || [])].sort((a, b) => {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
        setRecentFlorists(sortedFlorists.slice(0, 5));
        
        // Fetch territories count
        const territoriesResponse = await fetch('/api/territories');
        const territoriesData = await territoriesResponse.json();
        setTerritoryCount(territoriesData.territories?.length || 0);
        
        // Set route count (hardcoded for now)
        setRouteCount(2);
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
        <h1 className="text-3xl font-bold mb-8">Last Straw Farms - Market Research Dashboard</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-lg">Loading dashboard data...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Last Straw Farms - Market Research Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Florists</h2>
          <p className="text-4xl font-bold text-green-600">{floristCount}</p>
          <Link href="/florists" className="text-blue-500 hover:underline mt-2 inline-block">
            View all florists
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Territories</h2>
          <p className="text-4xl font-bold text-blue-600">{territoryCount}</p>
          <Link href="/territories" className="text-blue-500 hover:underline mt-2 inline-block">
            Manage territories
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Routes</h2>
          <p className="text-4xl font-bold text-purple-600">{routeCount}</p>
          <Link href="/routes" className="text-blue-500 hover:underline mt-2 inline-block">
            Plan routes
          </Link>
        </div>
      </div>
      
      {/* Map Preview */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Map Overview</h2>
        <FloristMap 
          florists={florists} 
          height="300px" 
          zoom={8}
        />
        <div className="mt-4">
          <Link href="/map" className="text-blue-500 hover:underline">
            View full map
          </Link>
        </div>
      </div>
      
      {/* Recent Florists */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recently Added Florists</h2>
        {recentFlorists.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentFlorists.map((florist) => (
                  <tr key={florist.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{florist.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{florist.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {florist.distanceMiles ? `${florist.distanceMiles.toFixed(1)} miles` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link href={`/florists/${florist.id}`} className="text-blue-500 hover:underline mr-4">
                        View
                      </Link>
                      <Link href={`/florists/${florist.id}/edit`} className="text-blue-500 hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No florists found. Run the seed script to add sample data.</p>
        )}
        <div className="mt-4">
          <Link href="/florists/new" className="text-blue-500 hover:underline">
            Add new florist
          </Link>
        </div>
      </div>
    </div>
  );
}
