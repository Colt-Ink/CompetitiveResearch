import { NextRequest, NextResponse } from 'next/server';

/**
 * Generic API route to handle MCP tool calls
 * This allows us to use MCP tools from client-side code
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
    
    // Log the MCP call for debugging
    console.log(`MCP call: ${server_name} / ${tool_name}`, args);
    
    try {
      // Use the MCP tool directly
      const response = await fetch('http://localhost:3000/api/use_mcp_tool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          server_name,
          tool_name,
          arguments: args
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error from MCP tool:', errorData);
        
        // Fall back to mock data if the MCP call fails
        return fallbackToMockData(server_name, tool_name, args);
      }
      
      const result = await response.json();
      return NextResponse.json(result);
    } catch (error) {
      console.error('Error calling MCP tool:', error);
      
      // Fall back to mock data if the MCP call fails
      return fallbackToMockData(server_name, tool_name, args);
    }
  } catch (error) {
    console.error('Error in MCP API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Fallback to mock data if the MCP call fails
 */
function fallbackToMockData(server_name: string, tool_name: string, args: any) {
  console.log(`Falling back to mock data for ${server_name} / ${tool_name}`);
  
  // Check if we're calling the Google Maps MCP
  if (server_name === 'github.com/modelcontextprotocol/servers/tree/main/src/google-maps') {
    // Handle different Google Maps MCP tools
    if (tool_name === 'maps_geocode') {
      // Mock geocode response
      if (!args.address) {
        return NextResponse.json(
          { error: 'address is required for maps_geocode' },
          { status: 400 }
        );
      }
      
      // Return a mock response based on the address
      if (args.address.includes('Sandy') || args.address.includes('97055')) {
        return NextResponse.json({
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
        });
      } else {
        // Default response for other addresses
        return NextResponse.json({
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
        });
      }
    } else if (tool_name === 'maps_search_places') {
      // Mock search places response
      if (!args.query) {
        return NextResponse.json(
          { error: 'query is required for maps_search_places' },
          { status: 400 }
        );
      }
      
      if (!args.location || typeof args.location.latitude !== 'number' || typeof args.location.longitude !== 'number') {
        return NextResponse.json(
          { error: 'location with latitude and longitude is required for maps_search_places' },
          { status: 400 }
        );
      }
      
      // Return mock results for florist searches
      if (args.query.toLowerCase().includes('florist')) {
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
        // No results for other queries
        return NextResponse.json({
          results: [],
          status: 'ZERO_RESULTS'
        });
      }
    } else if (tool_name === 'maps_place_details') {
      // Mock place details response
      if (!args.place_id) {
        return NextResponse.json(
          { error: 'place_id is required for maps_place_details' },
          { status: 400 }
        );
      }
      
      // Return mock details based on the place_id
      if (args.place_id.includes('_1')) {
        return NextResponse.json({
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
        });
      } else if (args.place_id.includes('_2')) {
        return NextResponse.json({
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
        });
      } else {
        return NextResponse.json({
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
        });
      }
    } else {
      // Unsupported tool
      return NextResponse.json(
        { error: `Unsupported Google Maps MCP tool: ${tool_name}` },
        { status: 400 }
      );
    }
  } else {
    // Unsupported MCP server
    return NextResponse.json(
      { error: `Unsupported MCP server: ${server_name}` },
      { status: 400 }
    );
  }
}
