'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounceValue } from 'usehooks-ts';

interface FloristFiltersProps {
  initialSort?: string;
  initialOrder?: 'asc' | 'desc';
  initialDistance?: string;
  initialSearch?: string;
}

export default function FloristFilters({
  initialSort = 'name',
  initialOrder = 'asc',
  initialDistance = '',
  initialSearch = '',
}: FloristFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Use debounced value for search to avoid too many requests
  const [debouncedSearch, setSearch] = useDebounceValue(initialSearch, 500);
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }
    
    router.push(`/florists?${params.toString()}`);
  }, [debouncedSearch, router, searchParams]);
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    
    const sort = formData.get('sort') as string;
    const order = formData.get('order') as string;
    const distance = formData.get('distance') as string;
    
    if (sort && sort !== 'name') params.set('sort', sort);
    if (order && order !== 'asc') params.set('order', order);
    if (distance) params.set('distance', distance);
    if (debouncedSearch) params.set('search', debouncedSearch);
    
    router.push(`/florists?${params.toString()}`);
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            name="search"
            defaultValue={initialSearch}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search florists..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={initialSort}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="name">Name</option>
            <option value="distanceMiles">Distance</option>
            <option value="rating">Rating</option>
            <option value="createdAt">Date Added</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
            Order
          </label>
          <select
            id="order"
            name="order"
            defaultValue={initialOrder}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">
            Max Distance (miles)
          </label>
          <select
            id="distance"
            name="distance"
            defaultValue={initialDistance}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="5">Within 5 miles</option>
            <option value="10">Within 10 miles</option>
            <option value="25">Within 25 miles</option>
            <option value="50">Within 50 miles</option>
          </select>
        </div>
        
        <div className="md:col-span-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Apply Filters
          </button>
          <Link
            href="/florists"
            className="ml-2 text-gray-500 hover:text-gray-700"
          >
            Reset
          </Link>
        </div>
      </form>
    </div>
  );
}
