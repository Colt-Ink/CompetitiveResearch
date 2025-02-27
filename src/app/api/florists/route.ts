import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Extract basic florist data
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const phoneNumber = formData.get('phoneNumber') as string | null;
    const website = formData.get('website') as string | null;
    const notes = formData.get('notes') as string | null;
    
    // Validate required fields
    if (!name || !address) {
      return NextResponse.json(
        { error: 'Name and address are required' },
        { status: 400 }
      );
    }
    
    // Geocode the address to get coordinates
    let latitude: number | null = null;
    let longitude: number | null = null;
    let distanceMiles: number | null = null;
    
    try {
      const geocodeResponse = await fetch(`${req.nextUrl.origin}/api/maps/geocode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
      
      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData.results && geocodeData.results.length > 0) {
        const location = geocodeData.results[0].geometry.location;
        latitude = location.lat;
        longitude = location.lng;
        
        // Only calculate distance if we have valid coordinates
        if (latitude !== null && longitude !== null) {
          // Calculate distance from Last Straw Farms
          const farmLat = 45.4426;
          const farmLng = -122.2536;
          
          // Simple distance calculation (Haversine formula)
          const R = 6371e3; // Earth's radius in meters
          const φ1 = (farmLat * Math.PI) / 180;
          const φ2 = (latitude * Math.PI) / 180;
          const Δφ = ((latitude - farmLat) * Math.PI) / 180;
          const Δλ = ((longitude - farmLng) * Math.PI) / 180;
          
          const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          
          // Convert meters to miles
          distanceMiles = (R * c) / 1609.34;
        }
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      // Continue without coordinates
    }
    
    // Create the florist
    const florist = await db.florist.create({
      data: {
        name,
        address,
        phoneNumber,
        website,
        notes,
        latitude,
        longitude,
        distanceMiles,
      },
    });
    
    // Extract and create business hours
    const businessHoursData: Record<string, string | null> = {};
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    for (const day of daysOfWeek) {
      const hours = formData.get(`businessHours.${day}`) as string | null;
      if (hours) {
        businessHoursData[day] = hours;
      }
    }
    
    // Only create business hours if at least one day is provided
    if (Object.keys(businessHoursData).length > 0) {
      await db.businessHours.create({
        data: {
          floristId: florist.id,
          ...businessHoursData,
        },
      });
    }
    
    // Extract and create pricing items
    const pricingItems = [];
    let itemIndex = 0;
    
    while (true) {
      const itemName = formData.get(`pricingItems[${itemIndex}].itemName`) as string | null;
      const priceRange = formData.get(`pricingItems[${itemIndex}].priceRange`) as string | null;
      
      if (!itemName || !priceRange) {
        break;
      }
      
      pricingItems.push({
        floristId: florist.id,
        itemName,
        priceRange,
      });
      
      itemIndex++;
    }
    
    // Create pricing items if any are provided
    if (pricingItems.length > 0) {
      await db.pricingItem.createMany({
        data: pricingItems,
      });
    }
    
    // Redirect to the florist detail page
    return NextResponse.redirect(`${req.nextUrl.origin}/florists/${florist.id}`);
  } catch (error) {
    console.error('Error creating florist:', error);
    return NextResponse.json(
      { error: 'Failed to create florist' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const sort = searchParams.get('sort') || 'name';
    const order = searchParams.get('order') || 'asc';
    const distance = searchParams.get('distance');
    
    // Build the query
    const where: any = {};
    if (distance) {
      where.distanceMiles = {
        lte: parseInt(distance),
      };
    }
    
    // Build the orderBy
    const orderBy: any = {};
    orderBy[sort] = order;
    
    // Fetch florists
    const florists = await db.florist.findMany({
      where,
      orderBy,
      include: {
        businessHours: true,
        pricingItems: true,
        territories: {
          include: {
            territory: true,
          },
        },
      },
    });
    
    return NextResponse.json({ florists });
  } catch (error) {
    console.error('Error fetching florists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch florists' },
      { status: 500 }
    );
  }
}
