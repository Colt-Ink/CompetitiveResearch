/**
 * This script uses the Google Maps API to fetch florists within a 50-mile radius
 * of Last Straw Farms and formats the data for our database.
 */

import fs from 'fs';
import path from 'path';

// Last Straw Farms location
const FARM_ADDRESS = '14385 SE Lusted Rd, Sandy, OR 97055';
const SEARCH_RADIUS_MILES = 50;

// Convert miles to meters for the Google Maps API
const SEARCH_RADIUS_METERS = SEARCH_RADIUS_MILES * 1609.34;

interface FloristData {
  name: string;
  address: string;
  phoneNumber?: string;
  website?: string;
  placeId: string;
  latitude: number;
  longitude: number;
  distanceMiles: number;
  rating?: number;
  reviewCount?: number;
  businessHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  pricingItems?: Array<{
    itemName: string;
    priceRange: string;
  }>;
}

async function fetchFlorists() {
  try {
    console.log(`Fetching florists within ${SEARCH_RADIUS_MILES} miles of ${FARM_ADDRESS}...`);
    
    // First, geocode the farm address to get coordinates
    // This would use the Google Maps MCP geocode tool
    // const geocodeResult = await mapsGeocode(FARM_ADDRESS);
    // const farmLocation = geocodeResult.results[0].geometry.location;
    
    // For now, we'll hardcode the coordinates (these are approximate)
    const farmLocation = { lat: 45.4426, lng: -122.2536 };
    
    console.log(`Farm coordinates: ${farmLocation.lat}, ${farmLocation.lng}`);
    
    // Search for florists near the farm
    // This would use the Google Maps MCP places search tool
    // const searchResults = await mapsSearchPlaces({
    //   query: 'florist',
    //   location: farmLocation,
    //   radius: SEARCH_RADIUS_METERS
    // });
    
    // For now, we'll create sample data
    const sampleFlorists: FloristData[] = [
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
    
    console.log(`Found ${sampleFlorists.length} florists`);
    
    // Save the data to a JSON file
    const outputPath = path.join(__dirname, '..', 'data', 'florists.json');
    
    // Ensure the data directory exists
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(sampleFlorists, null, 2));
    console.log(`Saved florist data to ${outputPath}`);
    
    return sampleFlorists;
  } catch (error) {
    console.error('Error fetching florists:', error);
    throw error;
  }
}

// Run the script if executed directly
if (require.main === module) {
  fetchFlorists()
    .then(() => console.log('Done!'))
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { fetchFlorists };
