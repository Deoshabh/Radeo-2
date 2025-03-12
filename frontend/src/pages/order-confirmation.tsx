import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

interface OrderDetails {
  id: string;
  date: string;
  total: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
}

const OrderConfirmation: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Only fetch when id is available (after hydration)
    if (!id) return;
    
    const fetchOrderDetails = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        // const response = await fetch(`${apiBaseUrl}/api/orders/${id}`);
        // const data = await response.json();
        
        // Dummy data for demonstration
        setTimeout(() => {
          setOrder({
            id: id as string,
            date: new Date().toISOString().split('T')[0],
            total: 194.37,
            items: [
              { id: 'prod-1', name: 'Classic T-Shirt', quantity: 2, price: 29.99 },
              { id: 'prod-3', name: 'Running Shoes', quantity: 1, price: 119.99 }
            ],
            shippingAddress: {
              firstName: 'John',
              lastName: 'Doe',
              address: '123 Main St',
              city: 'Anytown',
              state: 'CA',
              postalCode: '12345',
              country: 'United States'
            },
            paymentMethod: 'Credit Card'
          });
          
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load order details');
        console.error('Error fetching order:', err);
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error || 'Order not found'}</p>
          <Link href="/">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300">
              Return to Homepage
            </button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Head>
        <title>Order Confirmation | Radeo</title>
        <meta name="description" content="Your order has been confirmed" />
      </Head>
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="p-6 bg-green-50 border-b border-green-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-800">Order Confirmed!</h3>
                <p className="text-green-700">Thank you for your purchase.</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Order #{order.id}</h2>
              <p className="text-sm text-gray-500">Placed on {order.date}</p>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-base font-medium text-gray-900 mb-4">Order Summary</h3>
              
              <ul className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <li key={item.id} className="py-4 flex">
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between text-sm">
                  <p className="text-gray-500">Subtotal</p>
                  <p className="font-medium text-gray-900">${order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <p className="text-gray-500">Shipping</p>
                  <p className="font-medium text-gray-900">$0.00</p>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <p className="text-gray-500">Tax</p>
                  <p className="font-medium text-gray-900">${(order.total - order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)).toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-base font-medium mt-4">
                  <p className="text-gray-900">Total</p>
                  <p className="text-gray-900">${order.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">Shipping Information</h3>
                  <p className="text-sm text-gray-500">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p className="text-sm text-gray-500">{order.shippingAddress.address}</p>
                  <p className="text-sm text-gray-500">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-sm text-gray-500">{order.shippingAddress.country}</p>
                </div>
                
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">Payment Method</h3>
                  <p className="text-sm text-gray-500">{order.paymentMethod}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-between">
              <Link href="/">
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  Continue Shopping
                </button>
              </Link>
              
              {session && (
                <Link href="/account/orders">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300">
                    View All Orders
                  </button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 