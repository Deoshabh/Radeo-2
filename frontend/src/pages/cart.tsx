import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCart, CartItem } from '../hooks/useCart';
import Layout from '../components/Layout';
import { FaTrash, FaArrowLeft } from 'react-icons/fa';

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateCartQuantity } = useCart();
  
  // Ensure cartItems is defined and is an array
  const totalPrice = Array.isArray(cartItems) 
    ? cartItems.reduce((total, item) => total + item.price * item.quantity, 0) 
    : 0;
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <Layout title="Shopping Cart | Radeo">
      <Head>
        <title>Shopping Cart | Radeo</title>
        <meta name="description" content="View your shopping cart" />
      </Head>
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Shopping Cart</h1>
        
        {Array.isArray(cartItems) && cartItems.length === 0 ? (
          <div className="mt-4 text-center">
            <p className="text-lg text-gray-600">Your cart is empty.</p>
            <Link href="/products" className="text-blue-600 hover:text-blue-800">Continue Shopping</Link>
          </div>
        ) : (
          <div className="mt-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remove</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(cartItems) && cartItems.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img src={item.imageUrl} alt={item.name} className="h-16 w-16 object-cover rounded-md" />
                        <div className="ml-4">
                          <Link href={`/products/${item.slug}`} className="text-sm font-medium text-gray-900">{item.name}</Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateCartQuantity(item._id, Number(e.target.value))}
                        className="w-16 border border-gray-300 rounded-md text-center"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => removeFromCart(item._id)} className="text-red-600 hover:text-red-800">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-between items-center">
              <h2 className="text-xl font-bold">Total Price: ${totalPrice.toFixed(2)}</h2>
              <Link href="/checkout" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CartPage; 