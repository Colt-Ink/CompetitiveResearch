import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET(req: NextRequest) {
  try {
    // Fetch all territories
    const territories = await db.territory.findMany({
      include: {
        florists: true,
      },
    });
    
    return NextResponse.json({ territories });
  } catch (error) {
    console.error('Error fetching territories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch territories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, description, color } = await req.json();
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Create the territory
    const territory = await db.territory.create({
      data: {
        name,
        description,
        color,
      },
    });
    
    return NextResponse.json({ territory });
  } catch (error) {
    console.error('Error creating territory:', error);
    return NextResponse.json(
      { error: 'Failed to create territory' },
      { status: 500 }
    );
  }
}
