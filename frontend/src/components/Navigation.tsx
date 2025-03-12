import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useCart } from '../hooks/useCart';

const Navigation: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => router.pathname === path;
  
  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="font-bold text-xl text-blue-600">
                Radeo
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Home
              </Link>
              <Link
                href="/products"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/products') || router.pathname.startsWith('/products/') 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Products
              </Link>
              <Link
                href="/categories"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/categories') 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Categories
              </Link>
              <Link
                href="/about"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/about') 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/contact') 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <Link
              href="/cart"
              className="relative p-1 rounded-full text-gray-500 hover:text-gray-900 focus:outline-none"
            >
              <span className="sr-only">View cart</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cart.items.length > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-blue-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.items.length}
                </span>
              )}
            </Link>
            
            {session ? (
              <div className="relative">
                <div>
                  <button
                    type="button"
                    className="flex text-sm rounded-full focus:outline-none"
                    id="user-menu-button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    {session.user.image ? (
                      <img className="h-8 w-8 rounded-full" src={session.user.image} alt={session.user.name || ''} />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                      </div>
                    )}
                  </button>
                </div>
                
                {mobileMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Link href="/account">
                      <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Account</span>
                    </Link>
                    <Link href="/account/orders">
                      <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Orders</span>
                    </Link>
                    {session.user.isAdmin && (
                      <Link href="/admin">
                        <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin Dashboard</span>
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/signin">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Sign in
                </button>
              </Link>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="sm:hidden"
        >
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              href="/"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/') 
                  ? 'border-blue-500 text-blue-700 bg-blue-50' 
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/products"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/products') || router.pathname.startsWith('/products/') 
                  ? 'border-blue-500 text-blue-700 bg-blue-50' 
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Products
            </Link>
            <Link 
              href="/categories"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/categories') 
                  ? 'border-blue-500 text-blue-700 bg-blue-50' 
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Categories
            </Link>
            <Link 
              href="/about"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/about') 
                  ? 'border-blue-500 text-blue-700 bg-blue-50' 
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              About
            </Link>
            <Link 
              href="/contact"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/contact') 
                  ? 'border-blue-500 text-blue-700 bg-blue-50' 
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Contact
            </Link>
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            {session ? (
              <>
                <div className="flex items-center px-4">
                  {session.user.image ? (
                    <div className="flex-shrink-0">
                      <img className="h-10 w-10 rounded-full" src={session.user.image} alt={session.user.name || ''} />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{session.user.name}</div>
                    <div className="text-sm font-medium text-gray-500">{session.user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link href="/account">
                    <span className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                      Your Account
                    </span>
                  </Link>
                  <Link href="/account/orders">
                    <span className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                      Orders
                    </span>
                  </Link>
                  <Link href="/cart">
                    <span className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                      Cart ({cart.items.length})
                    </span>
                  </Link>
                  {session.user.isAdmin && (
                    <Link href="/admin">
                      <span className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                        Admin Dashboard
                      </span>
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-3 space-y-1">
                <Link href="/auth/signin">
                  <span className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                    Sign in
                  </span>
                </Link>
                <Link href="/auth/signup">
                  <span className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                    Sign up
                  </span>
                </Link>
                <Link href="/cart">
                  <span className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                    Cart ({cart.items.length})
                  </span>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Navigation; 