import React, { useEffect, useState } from 'react';
import withAuth from '../../components/withAuth';
import AdminLayout from '../../components/admin/AdminLayout';
import { motion } from 'framer-motion';

// Define types for dashboard stats
interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  newCustomers: number;
}

// Define types for recent orders
interface RecentOrder {
  id: string;
  date: string;
  customer: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    newCustomers: 0
  });
  
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API call to fetch dashboard stats
    const fetchDashboardData = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        // const response = await fetch(`${apiBaseUrl}/api/admin/dashboard`);
        // const data = await response.json();
        
        // Dummy data for demonstration
        setTimeout(() => {
          setStats({
            totalProducts: 120,
            totalOrders: 56,
            totalRevenue: 12450.75,
            newCustomers: 28
          });
          
          setRecentOrders([
            {
              id: 'ORD-12345',
              date: '2023-05-15',
              customer: 'John Doe',
              status: 'delivered',
              total: 129.99
            },
            {
              id: 'ORD-12346',
              date: '2023-05-16',
              customer: 'Jane Smith',
              status: 'processing',
              total: 79.50
            },
            {
              id: 'ORD-12347',
              date: '2023-05-16',
              customer: 'Robert Johnson',
              status: 'shipped',
              total: 199.95
            },
            {
              id: 'ORD-12348',
              date: '2023-05-17',
              customer: 'Emily Wilson',
              status: 'pending',
              total: 149.90
            },
            {
              id: 'ORD-12349',
              date: '2023-05-17',
              customer: 'Michael Brown',
              status: 'cancelled',
              total: 59.99
            }
          ]);
          
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const getStatusColor = (status: RecentOrder['status']) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalProducts}</dd>
                </dl>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalOrders}</dd>
                </dl>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">${stats.totalRevenue.toFixed(2)}</dd>
                </dl>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">New Customers</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.newCustomers}</dd>
                </dl>
              </div>
            </motion.div>
          </div>
          
          {/* Recent Orders */}
          <div className="mt-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="bg-white shadow rounded-lg"
            >
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Order ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
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
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Total
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a href={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-900">
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

// Wrap component with authentication HOC, requiring admin privileges
export default withAuth(AdminDashboard, true); 