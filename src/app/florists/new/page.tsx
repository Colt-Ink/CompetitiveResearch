import Link from 'next/link';

export default function NewFloristPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/florists" className="text-blue-500 hover:underline">
          ← Back to Florists
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Add New Florist</h1>
          <p className="text-gray-600 mt-1">
            Enter the details of the florist you want to add to the database.
          </p>
        </div>
        
        <div className="p-6">
          <form action="/api/florists" method="POST">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      required
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Business Hours */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Business Hours</h2>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="monday" className="block text-sm font-medium text-gray-700 mb-1">
                      Monday
                    </label>
                    <input
                      type="text"
                      id="monday"
                      name="businessHours.monday"
                      placeholder="e.g., 9:00 AM - 5:00 PM"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="tuesday" className="block text-sm font-medium text-gray-700 mb-1">
                      Tuesday
                    </label>
                    <input
                      type="text"
                      id="tuesday"
                      name="businessHours.tuesday"
                      placeholder="e.g., 9:00 AM - 5:00 PM"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="wednesday" className="block text-sm font-medium text-gray-700 mb-1">
                      Wednesday
                    </label>
                    <input
                      type="text"
                      id="wednesday"
                      name="businessHours.wednesday"
                      placeholder="e.g., 9:00 AM - 5:00 PM"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="thursday" className="block text-sm font-medium text-gray-700 mb-1">
                      Thursday
                    </label>
                    <input
                      type="text"
                      id="thursday"
                      name="businessHours.thursday"
                      placeholder="e.g., 9:00 AM - 5:00 PM"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="friday" className="block text-sm font-medium text-gray-700 mb-1">
                      Friday
                    </label>
                    <input
                      type="text"
                      id="friday"
                      name="businessHours.friday"
                      placeholder="e.g., 9:00 AM - 5:00 PM"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="saturday" className="block text-sm font-medium text-gray-700 mb-1">
                      Saturday
                    </label>
                    <input
                      type="text"
                      id="saturday"
                      name="businessHours.saturday"
                      placeholder="e.g., 10:00 AM - 3:00 PM"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="sunday" className="block text-sm font-medium text-gray-700 mb-1">
                      Sunday
                    </label>
                    <input
                      type="text"
                      id="sunday"
                      name="businessHours.sunday"
                      placeholder="e.g., Closed"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Pricing Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Pricing Information</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Add pricing information for common items. You can add more after creating the florist.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <label htmlFor="item1Name" className="block text-sm font-medium text-gray-700 mb-1">
                      Item 1 Name
                    </label>
                    <input
                      type="text"
                      id="item1Name"
                      name="pricingItems[0].itemName"
                      placeholder="e.g., Roses"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="item1Price" className="block text-sm font-medium text-gray-700 mb-1">
                      Item 1 Price Range
                    </label>
                    <input
                      type="text"
                      id="item1Price"
                      name="pricingItems[0].priceRange"
                      placeholder="e.g., $10-$15"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="item2Name" className="block text-sm font-medium text-gray-700 mb-1">
                      Item 2 Name
                    </label>
                    <input
                      type="text"
                      id="item2Name"
                      name="pricingItems[1].itemName"
                      placeholder="e.g., Bouquets"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="item2Price" className="block text-sm font-medium text-gray-700 mb-1">
                      Item 2 Price Range
                    </label>
                    <input
                      type="text"
                      id="item2Price"
                      name="pricingItems[1].priceRange"
                      placeholder="e.g., $25-$75"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Notes */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Notes</h2>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Add any additional notes about this florist..."
                ></textarea>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Link
                href="/florists"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add Florist
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
