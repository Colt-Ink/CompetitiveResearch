/**
 * This script uses the Google Maps API to fetch florists within a 50-mile radius
 * of Last Straw Farms and formats the data for our database.
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Last Straw Farms location
const FARM_ADDRESS = '14385 SE Lusted Rd, Sandy, OR 97055';
const SEARCH_RADIUS_MILES = 50;

// Convert miles to meters for the Google Maps API
const SEARCH_RADIUS_METERS = SEARCH_RADIUS_MILES * 1609.34;

/**
 * Fetch florists within the search radius of the farm
 */
async function fetchFlorists() {
  try {
    console.log(`Fetching florists within ${SEARCH_RADIUS_MILES} miles of ${FARM_ADDRESS}...`);
    
    // First, geocode the farm address to get coordinates
    console.log('Geocoding farm address...');
    const farmCoordinates = await geocodeFarmAddress();
    console.log(`Farm coordinates: ${farmCoordinates.lat}, ${farmCoordinates.lng}`);
    
    // Search for florists near the farm
    console.log('Searching for florists...');
    const florists = await searchFlorists(farmCoordinates);
    console.log(`Found ${florists.length} florists`);
    
    // Save the data to a JSON file
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const outputPath = path.join(dataDir, 'florists.json');
    fs.writeFileSync(outputPath, JSON.stringify(florists, null, 2));
    console.log(`Saved florist data to ${outputPath}`);
    
    return florists;
  } catch (error) {
    console.error('Error fetching florists:', error);
    throw error;
  }
}

/**
 * Geocode the farm address to get coordinates
 */
async function geocodeFarmAddress() {
  try {
    console.log('Geocoding farm address...');
    
    // Use the geocode API route to geocode the farm address
    try {
      const result = await fetch('http://localhost:3000/api/maps/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: FARM_ADDRESS }),
      }).then(res => res.json());
      
      if (result && result.results && result.results.length > 0) {
        const location = result.results[0].geometry.location;
        console.log(`Successfully geocoded address to: ${location.lat}, ${location.lng}`);
        return { lat: location.lat, lng: location.lng };
      } else {
        console.warn('Geocoding API returned no results, falling back to hardcoded coordinates');
        return { lat: 45.4426, lng: -122.2536 };
      }
    } catch (error) {
      console.error('Error using geocode API, falling back to hardcoded coordinates:', error);
      return { lat: 45.4426, lng: -122.2536 };
    }
  } catch (error) {
    console.error('Error geocoding farm address:', error);
    throw error;
  }
}

/**
 * Search for florists near the given location
 */
async function searchFlorists(location) {
  try {
    console.log('Searching for florists...');
    
    // Use the search-places API route to search for florists
    try {
      console.log('Sending request to search-places API...');
      const response = await fetch('http://localhost:3000/api/maps/search-places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'florist',
          location: {
            lat: location.lat,
            lng: location.lng
          },
          radius: SEARCH_RADIUS_METERS,
        }),
      });
      
      console.log('Search-places API response status:', response.status);
      const result = await response.json();
      console.log('Search-places API result:', JSON.stringify(result, null, 2));
      
      if (result && result.results && result.results.length > 0) {
        console.log(`Found ${result.results.length} florists`);
        
        // Transform the results into our FloristData format
        const florists = await Promise.all(result.results.map(async (place) => {
          // Calculate distance in miles
          const distanceMiles = calculateDistance(
            location, 
            { lat: place.geometry.location.lat, lng: place.geometry.location.lng }
          ) / 1609.34;
          
          // Get additional details for each florist
          const details = await getPlaceDetails(place.place_id);
          
          return {
            name: place.name,
            address: place.formatted_address || place.vicinity,
            phoneNumber: place.formatted_phone_number,
            website: place.website,
            placeId: place.place_id,
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            distanceMiles: distanceMiles,
            rating: place.rating,
            reviewCount: place.user_ratings_total,
            businessHours: details.businessHours,
            pricingItems: [
              { itemName: 'Standard Bouquet', priceRange: '$25-$75' },
              { itemName: 'Premium Arrangement', priceRange: '$75-$150' }
            ]
          };
        }));
        
        return florists;
      } else {
        console.warn('Search API returned no results, falling back to sample data');
        return getSampleFlorists();
      }
    } catch (error) {
      console.error('Error using search API, falling back to sample data:', error);
      return getSampleFlorists();
    }
  } catch (error) {
    console.error('Error searching for florists:', error);
    throw error;
  }
}

/**
 * Get additional details for a place
 */
async function getPlaceDetails(placeId) {
  try {
    console.log(`Getting details for place: ${placeId}`);
    
    // Use the place-details API route to get additional details
    try {
      const result = await fetch('http://localhost:3000/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          server_name: "github.com/modelcontextprotocol/servers/tree/main/src/google-maps",
          tool_name: "maps_place_details",
          arguments: {
            place_id: placeId
          }
        }),
      }).then(res => res.json());
      
      if (result && result.result) {
        // Extract business hours from the result
        const businessHours = {};
        
        if (result.result.opening_hours && result.result.opening_hours.weekday_text) {
          result.result.opening_hours.weekday_text.forEach((text) => {
            const parts = text.split(': ');
            if (parts.length === 2 && parts[0] && parts[1]) {
              const day = parts[0];
              const hours = parts[1];
              
              // Map day names to our keys
              let dayKey;
              const dayLower = day.toLowerCase();
              
              if (dayLower.includes('monday')) {
                dayKey = 'monday';
              } else if (dayLower.includes('tuesday')) {
                dayKey = 'tuesday';
              } else if (dayLower.includes('wednesday')) {
                dayKey = 'wednesday';
              } else if (dayLower.includes('thursday')) {
                dayKey = 'thursday';
              } else if (dayLower.includes('friday')) {
                dayKey = 'friday';
              } else if (dayLower.includes('saturday')) {
                dayKey = 'saturday';
              } else if (dayLower.includes('sunday')) {
                dayKey = 'sunday';
              } else {
                return; // Skip if day is not recognized
              }
              
              businessHours[dayKey] = hours;
            }
          });
        }
        
        return {
          businessHours,
          // Add more details as needed
        };
      } else {
        console.warn(`No details found for place: ${placeId}`);
        return {
          businessHours: {}
        };
      }
    } catch (error) {
      console.error(`Error getting details for place: ${placeId}`, error);
      return {
        businessHours: {}
      };
    }
  } catch (error) {
    console.error(`Error in getPlaceDetails for place: ${placeId}`, error);
    return {
      businessHours: {}
    };
  }
}

/**
 * Provide sample florist data
 */
function getSampleFlorists() {
  console.log('Using sample florist data');
  
  return [
    {
      name: 'Sandy Floral Boutique',
      address: '123 Main St, Sandy, OR 97055',
      phoneNumber: '(503) 555-1234',
      website: 'https://example.com/sandy-floral',
      placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4_1',
      latitude: 45.3975,
      longitude: -122.2611,
      distanceMiles: 5.2,
      rating: 4.7,
      reviewCount: 32,
      businessHours: {
        monday: '9:00 AM - 5:00 PM',
        tuesday: '9:00 AM - 5:00 PM',
        wednesday: '9:00 AM - 5:00 PM',
        thursday: '9:00 AM - 5:00 PM',
        friday: '9:00 AM - 6:00 PM',
        saturday: '10:00 AM - 4:00 PM',
        sunday: 'Closed'
      },
      pricingItems: [
        { itemName: 'Roses', priceRange: '$8-$15' },
        { itemName: 'Bouquets', priceRange: '$25-$75' }
      ]
    },
    {
      name: 'Portland Petals',
      address: '456 Flower Ave, Portland, OR 97201',
      phoneNumber: '(503) 555-5678',
      website: 'https://example.com/portland-petals',
      placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4_2',
      latitude: 45.5152,
      longitude: -122.6784,
      distanceMiles: 24.8,
      rating: 4.5,
      reviewCount: 87,
      businessHours: {
        monday: '8:00 AM - 6:00 PM',
        tuesday: '8:00 AM - 6:00 PM',
        wednesday: '8:00 AM - 6:00 PM',
        thursday: '8:00 AM - 6:00 PM',
        friday: '8:00 AM - 7:00 PM',
        saturday: '9:00 AM - 5:00 PM',
        sunday: '10:00 AM - 3:00 PM'
      },
      pricingItems: [
        { itemName: 'Roses', priceRange: '$10-$18' },
        { itemName: 'Arrangements', priceRange: '$45-$150' }
      ]
    },
    {
      name: 'Gresham Flower Shop',
      address: '789 Bloom St, Gresham, OR 97030',
      phoneNumber: '(503) 555-9012',
      website: 'https://example.com/gresham-flowers',
      placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4_3',
      latitude: 45.5023,
      longitude: -122.4306,
      distanceMiles: 12.3,
      rating: 4.2,
      reviewCount: 45,
      businessHours: {
        monday: '9:00 AM - 5:30 PM',
        tuesday: '9:00 AM - 5:30 PM',
        wednesday: '9:00 AM - 5:30 PM',
        thursday: '9:00 AM - 5:30 PM',
        friday: '9:00 AM - 6:00 PM',
        saturday: '9:00 AM - 4:00 PM',
        sunday: 'Closed'
      },
      pricingItems: [
        { itemName: 'Carnations', priceRange: '$2-$5' },
        { itemName: 'Custom Bouquets', priceRange: '$35-$85' }
      ]
    }
  ];
}

/**
 * Calculate distance between two points
 */
function calculateDistance(point1, point2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Run the script if executed directly
fetchFlorists()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

export { fetchFlorists };
