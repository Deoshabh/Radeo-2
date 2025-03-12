import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/admin/AdminLayout';
import withAuth from '../../../components/withAuth';

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

const OrderDetailPage: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query; // Get order ID from URL
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return; // Ensure ID is available

      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiBaseUrl}/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${session?.user?.token}`, // Ensure session has the correct type
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError('There was an error fetching the order details. Please try again.');
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, session]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return;

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/orders/${order._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Update the order status in the state
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      setError('There was an error updating the order status. Please try again.');
      console.error('Error updating order status:', err);
    }
  };

  return (
    <AdminLayout title={`Order ${id}`}>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="mb-6 bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      ) : (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Order Details</h1>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Customer Information</h2>
            <p>Name: {order.user.name}</p>
            <p>Email: {order.user.email}</p>
          </div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Order Items</h2>
            <ul>
              {order.items.map((item, index) => (
                <li key={index} className="flex justify-between">
                  <span>{item.product}</span>
                  <span>{item.quantity} x ${item.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Total Amount</h2>
            <p>${order.total.toFixed(2)}</p>
          </div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Order Status</h2>
            <p>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
            <div className="mt-2">
              <button onClick={() => handleUpdateStatus('shipped')} className="mr-2 bg-blue-500 text-white px-4 py-2 rounded">Mark as Shipped</button>
              <button onClick={() => handleUpdateStatus('delivered')} className="bg-green-500 text-white px-4 py-2 rounded">Mark as Delivered</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

// Wrap component with authentication HOC, requiring admin privileges
export default withAuth(OrderDetailPage, true); 