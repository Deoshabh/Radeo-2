import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import withAuth from '../../../components/withAuth';
import AdminLayout from '../../../components/admin/AdminLayout';

// Define Customer type
interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  joinDate: string;
  ordersCount: number;
  totalSpent: number;
}

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Simulate API call to fetch customers
    const fetchCustomers = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        // const response = await fetch(`${apiBaseUrl}/api/admin/customers`);
        // const data = await response.json();
        
        // Dummy data for demonstration
        setTimeout(() => {
          setCustomers([
            {
              id: 'cust-1',
              name: 'John Doe',
              email: 'john@example.com',
              phone: '555-123-4567',
              joinDate: '2023-01-15',
              ordersCount: 5,
              totalSpent: 549.95
            },
            {
              id: 'cust-2',
              name: 'Jane Smith',
              email: 'jane@example.com',
              phone: '555-987-6543',
              joinDate: '2023-02-20',
              ordersCount: 3,
              totalSpent: 329.97
            },
            {
              id: 'cust-3',
              name: 'Robert Johnson',
              email: 'robert@example.com',
              joinDate: '2023-03-10',
              ordersCount: 2,
              totalSpent: 199.98
            },
            {
              id: 'cust-4',
              name: 'Emily Wilson',
              email: 'emily@example.com',
              phone: '555-456-7890',
              joinDate: '2023-04-05',
              ordersCount: 1,
              totalSpent: 149.99
            },
            {
              id: 'cust-5',
              name: 'Michael Brown',
              email: 'michael@example.com',
              joinDate: '2023-05-12',
              ordersCount: 4,
              totalSpent: 479.96
            },
          ]);
          
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);
  
  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      (customer.phone && customer.phone.includes(searchTerm))
    );
  });
  
  return (
    <AdminLayout title="Manage Customers">
      <div className="mb-6">
        <div className="relative max-w-xs">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white shadow-sm rounded-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Join Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Orders
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total Spent
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                              {customer.name.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.email}</div>
                        {customer.phone && (
                          <div className="text-sm text-gray-500">{customer.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.joinDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.ordersCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${customer.totalSpent.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-3 justify-end">
                          <a href={`/admin/customers/${customer.id}`} className="text-blue-600 hover:text-blue-900">
                            View
                          </a>
                          <a href={`/admin/customers/${customer.id}/orders`} className="text-blue-600 hover:text-blue-900">
                            Orders
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </AdminLayout>
  );
};

// Wrap component with authentication HOC, requiring admin privileges
export default withAuth(AdminCustomers, true); 