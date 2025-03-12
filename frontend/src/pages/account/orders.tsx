import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import withAuth from '../../components/withAuth';
import Layout from '../../components/Layout';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';

interface Order {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
}

const OrderHistoryPage: React.FC = () => {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiBaseUrl}/api/orders/user`, {
          headers: {
            Authorization: `Bearer ${session?.user?.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError('There was an error fetching your orders. Please try again.');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchOrders();
    }
  }, [session]);

  return (
    <Layout title="Order History">
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
          <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
          <ul>
            {orders.map(order => (
              <li key={order._id} className="mb-4 p-4 border rounded">
                <h2 className="text-lg font-semibold">Order ID: {order._id}</h2>
                <p>Total: ${order.total.toFixed(2)}</p>
                <p>Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
                <p>Ordered on: {new Date(order.createdAt).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Layout>
  );
};

export default OrderHistoryPage; 