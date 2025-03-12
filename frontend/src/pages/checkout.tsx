import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import Layout from '../components/Layout';

// You can implement a route protection HOC, but here we'll do it inline for simplicity
import withAuth from '../components/withAuth'; // We'll create this component

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart, clearCart } = useCart();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: session?.user?.email || '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });
  const [error, setError] = useState<string | null>(null);
  
  const totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: session?.user,
          items: cart.items,
          total: totalPrice,
          shippingDetails: formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Your Razorpay Key ID
        amount: totalPrice * 100, // Amount in paise
        currency: 'INR',
        name: 'Radeo',
        description: 'Order Payment',
        order_id: order.id, // Use the order ID returned from your server
        handler: function (response: any) {
          // Handle successful payment
          console.log('Payment successful:', response);
          clearCart();
          router.push(`/order-confirmation?id=${order.id}`);
        },
        prefill: {
          name: formData.firstName + ' ' + formData.lastName,
          email: formData.email,
          contact: '', // Add contact number if needed
        },
        theme: {
          color: '#F37254',
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Error creating order:', err);
      setError('There was an error processing your order. Please try again.');
    }
  };

  // If cart is empty, redirect to cart page
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-md">
          <h2 className="text-xl font-medium text-gray-700 mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">You need items in your cart to proceed to checkout.</p>
          <Link href="/products">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors duration-300">
              Browse Products
            </button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <Layout title="Checkout | Radeo">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Checkout</h1>
        
        {error && (
          <div className="mb-6 bg-red-50 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 shadow-sm rounded-lg sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              
              <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto mb-4">
                {cart.items.map(item => (
                  <li key={item.id} className="py-4 flex">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-sm font-medium text-gray-900">
                          <h3>{item.name}</h3>
                          <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex-1 flex items-end justify-between text-sm">
                        <p className="text-gray-500">Qty {item.quantity}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="font-medium">${totalPrice.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Shipping</p>
                  <p className="font-medium">$0.00</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Tax</p>
                  <p className="font-medium">${(totalPrice * 0.07).toFixed(2)}</p>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <p className="text-lg font-medium text-gray-900">Total</p>
                  <p className="text-lg font-medium text-gray-900">
                    ${(totalPrice + (totalPrice * 0.07)).toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <Link href="/cart">
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    Edit Cart
                  </button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Checkout Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 lg:mt-0 lg:col-span-8"
          >
            <form onSubmit={handleSubmit} className="bg-white p-6 shadow-sm rounded-lg">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Shipping Information</h2>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State / Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="JP">Japan</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-300"
                >
                  Complete Order
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage; 