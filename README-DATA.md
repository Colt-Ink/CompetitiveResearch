# Populating the Database with Real Data

This guide explains how to populate the Last Straw Farms market research database with real florist data using the Google Maps API.

## Prerequisites

1. A Google Maps API key with the following APIs enabled:
   - Geocoding API
   - Places API
   - Place Details API

2. Node.js and npm installed on your system

## Setup

### 1. Configure the Google Maps MCP Server

The application uses the Model Context Protocol (MCP) to interact with the Google Maps API. You need to configure the MCP server with your API key.

We've created a script that automates this process:

```bash
npm run configure-mcp
```

This script will:
1. Read your Google Maps API key from the `.env` file
2. Find or create the MCP settings file for your operating system
3. Update the settings with the correct configuration for the Google Maps MCP server

Alternatively, you can manually configure the MCP server:

1. Open the MCP settings file:
   - For Windows: `%USERPROFILE%\AppData\Roaming\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
   - For macOS: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - For Linux: `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

2. Add or update the Google Maps MCP server configuration:

```json
{
  "mcpServers": {
    "github.com/modelcontextprotocol/servers/tree/main/src/google-maps": {
      "command": "node",
      "args": ["PATH_TO_MCP_SERVER_SCRIPT"],
      "env": {
        "GOOGLE_MAPS_API_KEY": "YOUR_API_KEY_HERE"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Replace `PATH_TO_MCP_SERVER_SCRIPT` with the path to the Google Maps MCP server script and `YOUR_API_KEY_HERE` with your actual Google Maps API key.

### 2. Set Up Environment Variables

Create a `.env` file in the project root with the following content:

```
# Database connection string
DATABASE_URL="file:./dev.db"

# Google Maps API key
GOOGLE_MAPS_API_KEY="YOUR_API_KEY_HERE"
```

Replace `YOUR_API_KEY_HERE` with your actual Google Maps API key.

## Running the Data Population Script

We've created a script that automates the process of fetching florist data and seeding the database. To run it:

```bash
npm run db:populate
```

This script will:

1. Start the development server if it's not already running
2. Fetch florist data using the Google Maps API
3. Save the data to a JSON file in the `data` directory
4. Seed the database with the fetched data

## Manual Process

If you prefer to run the steps manually:

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Fetch Florist Data

In a separate terminal:

```bash
npm run db:fetch-florists
```

This will:
- Geocode the Last Straw Farms address
- Search for florists within a 50-mile radius
- Get additional details for each florist
- Save the data to `data/florists.json`

### 3. Seed the Database

```bash
npm run db:seed
```

This will:
- Clear existing data from the database
- Insert the florists and related data
- Create sample territories and routes
- Assign florists to territories and routes

## Customizing the Data Fetching

You can customize the data fetching process by modifying the following files:

- `scripts/fetch-florists.ts`: Change the search radius, search query, or add more data fields
- `scripts/seed-database.ts`: Modify how the data is organized in the database
- `src/app/api/mcp/route.ts`: Add support for more Google Maps API features

## Troubleshooting

### API Key Issues

If you encounter errors related to the Google Maps API key:

1. Verify that your API key is correct
2. Check that the required APIs are enabled in the Google Cloud Console
3. Ensure the API key has the necessary permissions

### Server Connection Issues

If the script can't connect to the development server:

1. Make sure the server is running on port 3000
2. Check that the health check endpoint is accessible at `http://localhost:3000/api/health-check`

### Data Fetching Issues

If no florists are found:

1. Check the search radius in `scripts/fetch-florists.ts`
2. Verify that the farm address is correct
3. Try a different search query (e.g., "flower shop" instead of "florist")

## Google Maps API Limitations

When comparing the application's results with direct Google Maps searches, you may notice discrepancies in the number of florists found. For example, businesses like "Solabee Flowers & Botanicals" might appear in direct Google Maps searches but not in our application. This is due to several factors:

1. **API Endpoint Limitations**: The Places API Text Search endpoint returns a maximum of 20 results per page.

2. **No Pagination Implementation**: The current implementation doesn't fetch additional pages of results using the `next_page_token` parameter.

3. **Query Specificity**: The simple "florist" query might not capture all types of flower shops that Google Maps would include in a direct search.

4. **Different Search Algorithms**: Google Maps web interface likely uses more sophisticated algorithms and has access to more data than what's available through the API.

5. **Business Categories**: Some businesses might be categorized differently or have multiple categories that aren't captured by a simple "florist" query.

## Enhancing Data Collection

To improve the data collection and capture more florists:

### 1. Implement Pagination

Modify `scripts/fetch-florists.js` to use the `next_page_token` parameter to fetch additional pages of results:

```javascript
async function searchFlorists(location) {
  let allResults = [];
  let nextPageToken = null;
  
  do {
    // Build the request body
    const requestBody = {
      query: 'florist',
      location: {
        lat: location.lat,
        lng: location.lng
      },
      radius: SEARCH_RADIUS_METERS,
    };
    
    // Add the page token if we have one
    if (nextPageToken) {
      requestBody.pageToken = nextPageToken;
    }
    
    // Make the request
    const response = await fetch('http://localhost:3000/api/maps/search-places', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    const result = await response.json();
    
    if (result && result.results && result.results.length > 0) {
      allResults = [...allResults, ...result.results];
      nextPageToken = result.next_page_token;
      
      // If we have a next page token, wait a short delay before making the next request
      // This is required by the Google Maps API
      if (nextPageToken) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } else {
      nextPageToken = null;
    }
  } while (nextPageToken);
  
  return allResults;
}
```

### 2. Expand Search Queries

Modify the script to search for multiple related terms:

```javascript
async function fetchFlorists() {
  // ...existing code...
  
  // Search for different types of flower businesses
  const queries = ['florist', 'flower shop', 'floral design', 'botanical'];
  let allFlorists = [];
  
  for (const query of queries) {
    console.log(`Searching for "${query}"...`);
    const florists = await searchFlorists(farmCoordinates, query);
    allFlorists = [...allFlorists, ...florists];
  }
  
  // Remove duplicates based on place_id
  const uniqueFlorists = Array.from(
    new Map(allFlorists.map(item => [item.place_id, item])).values()
  );
  
  console.log(`Found ${uniqueFlorists.length} unique flower businesses`);
  
  // ...rest of the code...
}
```

### 3. Use Nearby Search Endpoint

Consider using the Nearby Search endpoint as an alternative to Text Search:

```javascript
// In src/app/api/maps/nearby-search/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { location, radius, type } = await req.json();
    
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return NextResponse.json(
        { error: 'Valid location with lat and lng is required' },
        { status: 400 }
      );
    }
    
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY is not configured');
      throw new Error('GOOGLE_MAPS_API_KEY is not configured');
    }
    
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius || 50000}&type=${type || 'florist'}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Maps API error:', data.status, data.error_message);
      throw new Error(`Google Maps API error: ${data.status}`);
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in nearby-search API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 4. Look Up Specific Businesses

If you know of specific businesses that should be included, you can use the Find Place endpoint:

```javascript
// In src/app/api/maps/find-place/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { input, inputType } = await req.json();
    
    if (!input) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      );
    }
    
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY is not configured');
      throw new Error('GOOGLE_MAPS_API_KEY is not configured');
    }
    
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(input)}&inputtype=${inputType || 'textquery'}&fields=place_id,name,formatted_address,geometry,rating,user_ratings_total&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Maps API error:', data.status, data.error_message);
      throw new Error(`Google Maps API error: ${data.status}`);
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in find-place API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Next Steps

After enhancing the data collection and populating the database, you can:

1. View the florists on the map page
2. Organize florists into territories
3. Plan delivery routes
4. Add more data fields to the florists
5. Implement business intelligence features for market analysis
6. Create reports and visualizations for business decision making
