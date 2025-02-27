import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { query, location, radius } = await req.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return NextResponse.json(
        { error: 'Valid location with lat and lng is required' },
        { status: 400 }
      );
    }
    
    // Use the Google Maps API directly
    try {
      console.log('Using Google Maps API directly for search-places');
      
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error('GOOGLE_MAPS_API_KEY is not configured');
        throw new Error('GOOGLE_MAPS_API_KEY is not configured');
      }
      
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${location.lat},${location.lng}&radius=${radius || 50000}&key=${apiKey}`;
      console.log('Google Maps API URL:', url);
      
      const response = await fetch(url);
      console.log('Google Maps API response status:', response.status);
      const data = await response.json();
      console.log('Google Maps API response:', JSON.stringify(data, null, 2));
      
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error('Google Maps API error:', data.status, data.error_message);
        throw new Error(`Google Maps API error: ${data.status}`);
      }
      
      const result = data;
      
      // If we get a successful response from the MCP tool
      if (result && !result.error) {
        return NextResponse.json(result);
      }
      
      // Fallback to mock data if MCP call fails
      console.warn('MCP call failed, using fallback data:', result?.error);
      if (query.toLowerCase().includes('florist')) {
        return NextResponse.json({
          results: [
            {
              name: 'Sandy Floral Boutique',
              formatted_address: '123 Main St, Sandy, OR 97055',
              formatted_phone_number: '(503) 555-1234',
              website: 'https://example.com/sandy-floral',
              place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4_1',
              geometry: {
                location: {
                  lat: 45.3975,
                  lng: -122.2611
                }
              },
              rating: 4.7,
              user_ratings_total: 32,
              vicinity: 'Sandy, OR'
            },
            {
              name: 'Portland Petals',
              formatted_address: '456 Flower Ave, Portland, OR 97201',
              formatted_phone_number: '(503) 555-5678',
              website: 'https://example.com/portland-petals',
              place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4_2',
              geometry: {
                location: {
                  lat: 45.5152,
                  lng: -122.6784
                }
              },
              rating: 4.5,
              user_ratings_total: 87,
              vicinity: 'Portland, OR'
            },
            {
              name: 'Gresham Flower Shop',
              formatted_address: '789 Bloom St, Gresham, OR 97030',
              formatted_phone_number: '(503) 555-9012',
              website: 'https://example.com/gresham-flowers',
              place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4_3',
              geometry: {
                location: {
                  lat: 45.5023,
                  lng: -122.4306
                }
              },
              rating: 4.2,
              user_ratings_total: 45,
              vicinity: 'Gresham, OR'
            }
          ],
          status: 'OK'
        });
      } else {
        return NextResponse.json({
          results: [],
          status: 'ZERO_RESULTS'
        });
      }
    } catch (error) {
      console.error('Error using Google Maps MCP:', error);
      return NextResponse.json(
        { error: 'Failed to search places' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in search-places API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
