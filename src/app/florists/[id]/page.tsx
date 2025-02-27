import Link from 'next/link';
import { db } from '@/server/db';
import { notFound } from 'next/navigation';
import FloristNotes from '@/components/FloristNotes';
import FloristActions from '@/components/FloristActions';

export const dynamic = 'force-dynamic';

export default async function FloristDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch the florist by ID
  const florist = await db.florist.findUnique({
    where: {
      id: params.id,
    },
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
  
  // If florist not found, show 404
  if (!florist) {
    notFound();
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/florists" className="text-blue-500 hover:underline">
          ← Back to Florists
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{florist.name}</h1>
              <p className="text-gray-600 mt-1">{florist.address}</p>
              {florist.distanceMiles && (
                <p className="text-gray-600 mt-1">
                  {florist.distanceMiles.toFixed(1)} miles from Last Straw Farms
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <FloristActions floristId={florist.id} />
            </div>
          </div>
          
          {florist.territories.length > 0 && (
            <div className="mt-4">
              <h2 className="text-sm font-medium text-gray-500">Territories</h2>
              <div className="flex flex-wrap gap-2 mt-1">
                {florist.territories.map((ft) => (
                  <span
                    key={ft.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: ft.territory.color || '#9CA3AF', color: 'white' }}
                  >
                    {ft.territory.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                <p className="mt-1">{florist.phoneNumber || 'Not available'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Website</h3>
                {florist.website ? (
                  <a
                    href={florist.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-blue-500 hover:underline"
                  >
                    {florist.website}
                  </a>
                ) : (
                  <p className="mt-1">Not available</p>
                )}
              </div>
              
              {florist.rating && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Rating</h3>
                  <p className="mt-1">
                    {florist.rating} / 5 ({florist.reviewCount} reviews)
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Business Hours */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Business Hours</h2>
            {florist.businessHours ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium text-gray-500">Monday</div>
                  <div>{florist.businessHours.monday || 'Closed'}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium text-gray-500">Tuesday</div>
                  <div>{florist.businessHours.tuesday || 'Closed'}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium text-gray-500">Wednesday</div>
                  <div>{florist.businessHours.wednesday || 'Closed'}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium text-gray-500">Thursday</div>
                  <div>{florist.businessHours.thursday || 'Closed'}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium text-gray-500">Friday</div>
                  <div>{florist.businessHours.friday || 'Closed'}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium text-gray-500">Saturday</div>
                  <div>{florist.businessHours.saturday || 'Closed'}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium text-gray-500">Sunday</div>
                  <div>{florist.businessHours.sunday || 'Closed'}</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No business hours available</p>
            )}
          </div>
          
          {/* Pricing Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Pricing Information</h2>
            {florist.pricingItems && florist.pricingItems.length > 0 ? (
              <div className="space-y-2">
                {florist.pricingItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium text-gray-500">{item.itemName}</div>
                    <div>{item.priceRange}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No pricing information available</p>
            )}
          </div>
          
          {/* Notes */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Official Notes</h2>
            {florist.notes ? (
              <p className="whitespace-pre-line">{florist.notes}</p>
            ) : (
              <p className="text-gray-500">No official notes available</p>
            )}
          </div>
      </div>
      
      {/* Personal Notes (stored in localStorage) */}
      <div className="mt-6">
        <FloristNotes 
          floristId={florist.id} 
          initialNotes={florist.notes || ''} 
        />
      </div>
    </div>
    </div>
  );
}
