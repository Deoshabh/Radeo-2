import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import withAuth from '../../../components/withAuth';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

// Define Order type
interface Order {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  items: Array<{
    product: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
}

const AdminOrders: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiBaseUrl}/api/orders`, {
          headers: {
            Authorization: `Bearer ${session?.user?.token}`, // Ensure session has the correct type
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError('There was an error fetching orders. Please try again.');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchOrders();
    }
  }, [session]);
  
  // Filter orders based on status
  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);
  
  const getStatusColor = (status: Order['status']) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleDelete = async (orderId: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiBaseUrl}/api/orders/${orderId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session?.user?.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete order');
        }

        setOrders(orders.filter(order => order._id !== orderId));
      } catch (err) {
        setError('There was an error deleting the order. Please try again.');
        console.error('Error deleting order:', err);
      }
    }
  };
  
  return (
    <AdminLayout title="Manage Orders">
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('processing')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'processing'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Processing
          </button>
          <button
            onClick={() => setFilter('shipped')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'shipped'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Shipped
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'delivered'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Delivered
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'cancelled'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

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
          {filteredOrders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No orders found matching the selected filter.
            </div>
          ) : (
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
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.user.name} ({order.user.email})</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDelete(order._id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      )}
    </AdminLayout>
  );
};

// Wrap component with authentication HOC, requiring admin privileges
export default withAuth(AdminOrders, true); 