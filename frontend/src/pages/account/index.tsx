import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { FaUser, FaShoppingBag, FaHeart, FaCreditCard, FaAddressCard } from 'react-icons/fa';

const AccountPage = () => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (status === 'authenticated' && session) {
        try {
          const response = await fetch('/api/user/profile', {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      } else if (status !== 'loading') {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [session, status]);
  
  if (status === 'loading' || loading) {
    return (
      <Layout title="Account | Radeo">
        <div className="min-h-screen flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }
  
  if (status === 'unauthenticated') {
    return (
      <Layout title="Account | Radeo">
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">You need to sign in</h1>
            <p className="mt-4 text-lg text-gray-500">
              Please sign in to access your account page
            </p>
            <div className="mt-6">
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Account | Radeo">
      <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:px-6 bg-blue-600 text-white">
              <h1 className="text-2xl font-bold">Your Account</h1>
              <p className="mt-1 text-sm">Manage your account information and preferences</p>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              {userData && (
                <div className="mb-8 pb-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-14 w-14 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl">
                      {userData.name?.charAt(0) || userData.email?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{userData.name}</h2>
                      <p className="text-gray-500">{userData.email}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link 
                  href="/account/profile"
                  className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaUser className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">Profile Information</h3>
                  <p className="text-sm text-gray-500 text-center">Update your personal details and email</p>
                </Link>
                
                <Link 
                  href="/account/orders"
                  className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaShoppingBag className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">Orders</h3>
                  <p className="text-sm text-gray-500 text-center">View your order history and track packages</p>
                </Link>
                
                <Link 
                  href="/account/wishlist"
                  className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaHeart className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">Wishlist</h3>
                  <p className="text-sm text-gray-500 text-center">Products you've saved for later</p>
                </Link>
                
                <Link 
                  href="/account/payment"
                  className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaCreditCard className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">Payment Methods</h3>
                  <p className="text-sm text-gray-500 text-center">Manage your payment options</p>
                </Link>
                
                <Link 
                  href="/account/addresses"
                  className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaAddressCard className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">Addresses</h3>
                  <p className="text-sm text-gray-500 text-center">Update your shipping and billing addresses</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AccountPage; 