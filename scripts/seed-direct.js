/**
 * This script directly seeds the database with sample florist data.
 * It bypasses the TypeScript compilation issues by using plain JavaScript.
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read florist data from the JSON file
function getFloristData() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'florists.json');
    
    if (fs.existsSync(dataPath)) {
      console.log('Reading florist data from file...');
      const fileData = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(fileData);
    } else {
      console.warn('Florist data file not found. Using sample data instead.');
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
  } catch (error) {
    console.error('Error reading florist data:', error);
    return [];
  }
}

// Get the florist data
const florists = getFloristData();
console.log(`Loaded ${florists.length} florists from data file`);
console.log('Florist names:', florists.map(f => f.name));

// Sample territories
const sampleTerritories = [
  {
    name: 'Portland Metro',
    description: 'Florists in the Portland metropolitan area',
    color: '#4CAF50', // Green
  },
  {
    name: 'Sandy Area',
    description: 'Florists near Sandy, OR',
    color: '#2196F3', // Blue
  }
];

// Sample routes
const sampleRoutes = [
  {
    name: 'Portland East Side',
    description: 'Route covering east Portland and Gresham',
  },
  {
    name: 'Sandy Local',
    description: 'Route covering Sandy and immediate surroundings',
  }
];

async function seedDatabase() {
  try {
    console.log('Seeding database...');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.pricingItem.deleteMany({});
    await prisma.businessHours.deleteMany({});
    await prisma.slackMessage.deleteMany({});
    await prisma.floristTerritory.deleteMany({});
    await prisma.routeStop.deleteMany({});
    await prisma.route.deleteMany({});
    await prisma.territory.deleteMany({});
    await prisma.slackNotificationSubscription.deleteMany({});
    await prisma.florist.deleteMany({});
    
    // Create territories
    console.log('Creating territories...');
    const territories = await Promise.all(
      sampleTerritories.map(territory => 
        prisma.territory.create({
          data: territory
        })
      )
    );
    
    // Create routes
    console.log('Creating routes...');
    const routes = await Promise.all(
      sampleRoutes.map(route => 
        prisma.route.create({
          data: route
        })
      )
    );
    
    // Create florists and related data
    console.log('Creating florists...');
    console.log('Creating these florists:', florists.map(f => f.name));
    for (const floristData of florists) {
      const { businessHours, pricingItems, ...floristInfo } = floristData;
      
      // Create the florist
      const florist = await prisma.florist.create({
        data: floristInfo
      });
      
      // Create business hours
      if (businessHours) {
        await prisma.businessHours.create({
          data: {
            floristId: florist.id,
            ...businessHours
          }
        });
      }
      
      // Create pricing items
      if (pricingItems && pricingItems.length > 0) {
        await prisma.pricingItem.createMany({
          data: pricingItems.map(item => ({
            floristId: florist.id,
            ...item
          }))
        });
      }
      
      // Assign to territories based on distance
      const distance = florist.distanceMiles ?? Infinity;
      
      // Ensure territories array has elements and they have IDs
      if (territories && territories.length > 0 && territories[0] && territories[0].id) {
        if (distance <= 30) {
          await prisma.floristTerritory.create({
            data: {
              floristId: florist.id,
              territoryId: territories[0].id // Portland Metro
            }
          });
        }
      }
      
      if (territories && territories.length > 1 && territories[1] && territories[1].id) {
        if (distance <= 10) {
          await prisma.floristTerritory.create({
            data: {
              floristId: florist.id,
              territoryId: territories[1].id // Sandy Area
            }
          });
        }
      }
      
      // We'll handle route stops separately to avoid unique constraint errors
    }
    
    // Create sample Slack notification subscription
    await prisma.slackNotificationSubscription.create({
      data: {
        channelId: 'C12345678', // Example channel ID
        eventType: 'new_florist',
      },
    });
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('Done!');
  })
  .catch((error) => {
    console.error('Script failed:', error);
  });
