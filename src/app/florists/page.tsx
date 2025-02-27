import Link from 'next/link';
import { db } from '@/server/db';
import FloristFilters from '@/components/FloristFilters';

export const dynamic = 'force-dynamic';

// Define the search params type
type SearchParams = {
  sort?: string;
  order?: 'asc' | 'desc';
  distance?: string;
  search?: string;
};

export default async function FloristsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Parse search params safely
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'name';
  const order = searchParams.order === 'desc' ? 'desc' : 'asc';
  const distanceFilter = typeof searchParams.distance === 'string' && searchParams.distance !== '' 
    ? parseInt(searchParams.distance) 
    : undefined;
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  
  // Build the query
  let where: any = {};
  
  if (distanceFilter) {
    where.distanceMiles = {
      lte: distanceFilter,
    };
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { address: { contains: search } },
      { notes: { contains: search } },
    ];
  }
  
  // Build the orderBy
  const orderBy: any = {};
  orderBy[sort] = order;
  
  // Fetch florists
  const florists = await db.florist.findMany({
    where,
    orderBy,
    include: {
      territories: {
        include: {
          territory: true,
        },
      },
    },
  });
  
  // Fetch territories for filter dropdown
  const territories = await db.territory.findMany();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Florists</h1>
        <Link
          href="/florists/new"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Add New Florist
        </Link>
      </div>
      
      {/* Filters */}
      <FloristFilters 
        initialSort={sort}
        initialOrder={order as 'asc' | 'desc'}
        initialDistance={distanceFilter?.toString() || ''}
        initialSearch={search}
      />
      
      {/* Florists List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {florists.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Territories
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {florists.map((florist) => (
                  <tr key={florist.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{florist.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{florist.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {florist.distanceMiles ? `${florist.distanceMiles.toFixed(1)} miles` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {florist.rating ? `${florist.rating} (${florist.reviewCount} reviews)` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link href={`/florists/${florist.id}`} className="text-blue-500 hover:underline mr-4">
                        View
                      </Link>
                      <Link href={`/florists/${florist.id}/edit`} className="text-blue-500 hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">No florists found. Try adjusting your filters or add new florists.</p>
          </div>
        )}
      </div>
    </div>
  );
}
