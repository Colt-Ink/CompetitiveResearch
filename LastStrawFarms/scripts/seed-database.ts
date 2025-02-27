/**
 * This script seeds the database with initial data.
 * It reads the florists.json file and inserts the data into the database.
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { fetchFlorists } from './fetch-florists';

const prisma = new PrismaClient();

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

async function seedDatabase() {
  try {
    console.log('Seeding database...');
    
    // Check if we need to fetch florist data first
    const dataPath = path.join(__dirname, '..', 'data', 'florists.json');
    let florists: FloristData[];
    
    if (!fs.existsSync(dataPath)) {
      console.log('Florist data not found. Fetching data first...');
      florists = await fetchFlorists();
    } else {
      console.log('Reading florist data from file...');
      const fileData = fs.readFileSync(dataPath, 'utf-8');
      florists = JSON.parse(fileData);
    }
    
    console.log(`Inserting ${florists.length} florists into database...`);
    
    // Clear existing data
    await prisma.pricingItem.deleteMany({});
    await prisma.businessHours.deleteMany({});
    await prisma.slackMessage.deleteMany({});
    await prisma.floristTerritory.deleteMany({});
    await prisma.routeStop.deleteMany({});
    await prisma.route.deleteMany({});
    await prisma.territory.deleteMany({});
    await prisma.florist.deleteMany({});
    
    // Insert florists and related data
    for (const florist of florists) {
      const createdFlorist = await prisma.florist.create({
        data: {
          name: florist.name,
          address: florist.address,
          phoneNumber: florist.phoneNumber,
          website: florist.website,
          placeId: florist.placeId,
          latitude: florist.latitude,
          longitude: florist.longitude,
          distanceMiles: florist.distanceMiles,
          rating: florist.rating,
          reviewCount: florist.reviewCount,
        },
      });
      
      // Insert business hours if available
      if (florist.businessHours) {
        await prisma.businessHours.create({
          data: {
            floristId: createdFlorist.id,
            monday: florist.businessHours.monday,
            tuesday: florist.businessHours.tuesday,
            wednesday: florist.businessHours.wednesday,
            thursday: florist.businessHours.thursday,
            friday: florist.businessHours.friday,
            saturday: florist.businessHours.saturday,
            sunday: florist.businessHours.sunday,
          },
        });
      }
      
      // Insert pricing items if available
      if (florist.pricingItems && florist.pricingItems.length > 0) {
        for (const item of florist.pricingItems) {
          await prisma.pricingItem.create({
            data: {
              floristId: createdFlorist.id,
              itemName: item.itemName,
              priceRange: item.priceRange,
            },
          });
        }
      }
    }
    
    // Create a sample territory
    const territory = await prisma.territory.create({
      data: {
        name: 'Portland Metro',
        description: 'Florists in the Portland metropolitan area',
        color: '#4CAF50',
      },
    });
    
    // Assign florists to the territory
    const portlandFlorists = await prisma.florist.findMany({
      where: {
        distanceMiles: {
          lte: 30,
        },
      },
    });
    
    for (const florist of portlandFlorists) {
      await prisma.floristTerritory.create({
        data: {
          floristId: florist.id,
          territoryId: territory.id,
        },
      });
    }
    
    // Create a sample route
    const route = await prisma.route.create({
      data: {
        name: 'Portland East Side',
        description: 'Route covering east Portland and Gresham',
      },
    });
    
    // Add stops to the route
    const routeFlorists = await prisma.florist.findMany({
      take: 3,
    });
    
    for (let i = 0; i < routeFlorists.length; i++) {
      await prisma.routeStop.create({
        data: {
          routeId: route.id,
          floristId: routeFlorists[i].id,
          stopOrder: i + 1,
        },
      });
    }
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => console.log('Done!'))
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };
