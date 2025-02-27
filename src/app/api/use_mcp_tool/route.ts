import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to use MCP tools
 * This is a wrapper around the use_mcp_tool function
 */
export async function POST(req: NextRequest) {
  try {
    const { server_name, tool_name, arguments: args } = await req.json();
    
    if (!server_name) {
      return NextResponse.json(
        { error: 'server_name is required' },
        { status: 400 }
      );
    }
    
    if (!tool_name) {
      return NextResponse.json(
        { error: 'tool_name is required' },
        { status: 400 }
      );
    }
    
    // Log the MCP tool call for debugging
    console.log(`Using MCP tool: ${server_name} / ${tool_name}`, args);
    
    try {
      // Use the Google Maps MCP tool
      const result = await useMcpTool(server_name, tool_name, args);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Error using MCP tool:', error);
      return NextResponse.json(
        { error: `Failed to use MCP tool: ${error}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in use_mcp_tool API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Use an MCP tool
 * This implementation uses the Google Maps API directly without relying on the MCP server
 */
async function useMcpTool(server_name: string, tool_name: string, args: any) {
  console.log(`Using MCP tool directly: ${server_name} / ${tool_name}`, args);
  
  // Check if we're calling the Google Maps MCP
  if (server_name === 'github.com/modelcontextprotocol/servers/tree/main/src/google-maps') {
    // Use the Google Maps API directly
    if (tool_name === 'maps_geocode') {
      return await geocodeAddress(args.address);
    } else if (tool_name === 'maps_search_places') {
      return await searchPlaces(args.query, args.location, args.radius);
    } else if (tool_name === 'maps_place_details') {
      return await getPlaceDetails(args.place_id);
    } else {
      throw new Error(`Unsupported Google Maps MCP tool: ${tool_name}`);
    }
  } else {
    // For other MCP servers, fall back to mock data
    console.log(`Falling back to mock data for ${server_name} / ${tool_name}`);
    return fallbackToMockData(server_name, tool_name, args);
  }
}

/**
 * Fallback to mock data if the MCP call fails
 */
function fallbackToMockData(server_name: string, tool_name: string, args: any) {
  console.log(`Using mock data for ${server_name} / ${tool_name}`);
  
  // Check if we're calling the Google Maps MCP
  if (server_name === 'github.com/modelcontextprotocol/servers/tree/main/src/google-maps') {
    // Handle different Google Maps MCP tools
    if (tool_name === 'maps_geocode') {
      // Mock geocode response
      if (!args.address) {
        throw new Error('address is required for maps_geocode');
      }
      
      // Return a mock response based on the address
      if (args.address.includes('Sandy') || args.address.includes('97055')) {
        return {
          results: [
            {
              formatted_address: '14385 SE Lusted Rd, Sandy, OR 97055, USA',
              geometry: {
                location: {
                  lat: 45.4426,
                  lng: -122.2536
                }
              },
              place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4'
            }
          ],
          status: 'OK'
        };
      } else {
        // Default response for other addresses
        return {
          results: [
            {
              formatted_address: args.address,
              geometry: {
                location: {
                  lat: 45.5152,
                  lng: -122.6784
                }
              },
              place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4'
            }
          ],
          status: 'OK'
        };
      }
    } else if (tool_name === 'maps_search_places') {
      // Mock search places response
      if (!args.query) {
        throw new Error('query is required for maps_search_places');
      }
      
      // Return mock results for florist searches
      if (args.query.toLowerCase().includes('florist')) {
        return {
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
        };
      } else {
        // No results for other queries
        return {
          results: [],
          status: 'ZERO_RESULTS'
        };
      }
    } else if (tool_name === 'maps_place_details') {
      // Mock place details response
      if (!args.place_id) {
        throw new Error('place_id is required for maps_place_details');
      }
      
      // Return mock details based on the place_id
      if (args.place_id.includes('_1')) {
        return {
          result: {
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
            opening_hours: {
              weekday_text: [
                'Monday: 9:00 AM – 5:00 PM',
                'Tuesday: 9:00 AM – 5:00 PM',
                'Wednesday: 9:00 AM – 5:00 PM',
                'Thursday: 9:00 AM – 5:00 PM',
                'Friday: 9:00 AM – 6:00 PM',
                'Saturday: 10:00 AM – 4:00 PM',
                'Sunday: Closed'
              ]
            }
          },
          status: 'OK'
        };
      } else if (args.place_id.includes('_2')) {
        return {
          result: {
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
            opening_hours: {
              weekday_text: [
                'Monday: 8:00 AM – 6:00 PM',
                'Tuesday: 8:00 AM – 6:00 PM',
                'Wednesday: 8:00 AM – 6:00 PM',
                'Thursday: 8:00 AM – 6:00 PM',
                'Friday: 8:00 AM – 7:00 PM',
                'Saturday: 9:00 AM – 5:00 PM',
                'Sunday: 10:00 AM – 3:00 PM'
              ]
            }
          },
          status: 'OK'
        };
      } else {
        return {
          result: {
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
            opening_hours: {
              weekday_text: [
                'Monday: 9:00 AM – 5:30 PM',
                'Tuesday: 9:00 AM – 5:30 PM',
                'Wednesday: 9:00 AM – 5:30 PM',
                'Thursday: 9:00 AM – 5:30 PM',
                'Friday: 9:00 AM – 6:00 PM',
                'Saturday: 9:00 AM – 4:00 PM',
                'Sunday: Closed'
              ]
            }
          },
          status: 'OK'
        };
      }
    } else {
      throw new Error(`Unsupported Google Maps MCP tool: ${tool_name}`);
    }
  } else {
    throw new Error(`Unsupported MCP server: ${server_name}`);
  }
}

/**
 * Geocode an address using the Google Maps API
 */
async function geocodeAddress(address: string) {
  if (!address) {
    throw new Error('address is required for geocoding');
  }
  
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY is not configured');
  }
  
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Geocoding API error: ${data.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw error;
  }
}

/**
 * Search for places using the Google Maps API
 */
async function searchPlaces(query: string, location: { lat: number; lng: number }, radius: number) {
  if (!query) {
    throw new Error('query is required for place search');
  }
  
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    throw new Error('location with lat and lng is required for place search');
  }
  
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY is not configured');
  }
  
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${location.lat},${location.lng}&radius=${radius || 50000}&key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Place Search API error: ${data.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error searching for places:', error);
    throw error;
  }
}

/**
 * Get details for a place using the Google Maps API
 */
async function getPlaceDetails(placeId: string) {
  if (!placeId) {
    throw new Error('place_id is required for place details');
  }
  
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY is not configured');
  }
  
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,geometry,rating,user_ratings_total,opening_hours&key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Place Details API error: ${data.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error getting place details:', error);
    throw error;
  }
}
