import React, { ReactNode, useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';

// Define props
interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = 'Admin Dashboard' }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin');
    }
    
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);
  
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (status === 'authenticated' && session?.user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">You do not have permission to access the admin dashboard.</p>
        <Link href="/">
          <a className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Return to Home
          </a>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>{title} | Radeo Shop</title>
        <meta name="description" content="Radeo Shop Admin Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="h-screen flex overflow-hidden bg-gray-100">
        {/* Sidebar for mobile */}
        <div className={`md:hidden fixed inset-0 flex z-40 ${isSidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsSidebarOpen(false)}></div>
          
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <Link href="/admin">
                  <a className="text-xl font-bold text-blue-600">Radeo Admin</a>
                </Link>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                <Link href="/admin">
                  <a className={`${router.pathname === '/admin' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-2 text-base font-medium rounded-md`}>
                    <svg className={`${router.pathname === '/admin' ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'} mr-4 h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </a>
                </Link>
                
                <Link href="/admin/orders">
                  <a className={`${router.pathname.startsWith('/admin/orders') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-2 text-base font-medium rounded-md`}>
                    <svg className={`${router.pathname.startsWith('/admin/orders') ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'} mr-4 h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Orders
                  </a>
                </Link>
                
                <Link href="/admin/products">
                  <a className={`${router.pathname.startsWith('/admin/products') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-2 text-base font-medium rounded-md`}>
                    <svg className={`${router.pathname.startsWith('/admin/products') ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'} mr-4 h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Products
                  </a>
                </Link>
                
                <Link href="/admin/categories">
                  <a className={`${router.pathname.startsWith('/admin/categories') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-2 text-base font-medium rounded-md`}>
                    <svg className={`${router.pathname.startsWith('/admin/categories') ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'} mr-4 h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Categories
                  </a>
                </Link>
                
                <Link href="/admin/customers">
                  <a className={`${router.pathname.startsWith('/admin/customers') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-2 text-base font-medium rounded-md`}>
                    <svg className={`${router.pathname.startsWith('/admin/customers') ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'} mr-4 h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Customers
                  </a>
                </Link>
                
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <Link href="/">
                    <a className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md">
                      <svg className="text-gray-400 group-hover:text-gray-500 mr-4 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Back to Shop
                    </a>
                  </Link>
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                  >
                    <svg className="text-gray-400 group-hover:text-gray-500 mr-4 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>
        
        {/* Static sidebar for desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                  <Link href="/admin">
                    <a className="text-xl font-bold text-blue-600">Radeo Admin</a>
                  </Link>
                </div>
                <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                  <Link href="/admin">
                    <a className={`${router.pathname === '/admin' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                      <svg className={`${router.pathname === '/admin' ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'} mr-3 h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </a>
                  </Link>
                  
                  <Link href="/admin/orders">
                    <a className={`${router.pathname.startsWith('/admin/orders') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                      <svg className={`${router.pathname.startsWith('/admin/orders') ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'} mr-3 h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Orders
                    </a>
                  </Link>
                  
                  <Link href="/admin/products">
                    <a className={`${router.pathname.startsWith('/admin/products') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                      <svg className={`${router.pathname.startsWith('/admin/products') ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'} mr-3 h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Products
                    </a>
                  </Link>
                  
                  <Link href="/admin/categories">
                    <a className={`${router.pathname.startsWith('/admin/categories') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                      <svg className={`${router.pathname.startsWith('/admin/categories') ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'} mr-3 h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Categories
                    </a>
                  </Link>
                  
                  <Link href="/admin/customers">
                    <a className={`${router.pathname.startsWith('/admin/customers') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                      <svg className={`${router.pathname.startsWith('/admin/customers') ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'} mr-3 h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Customers
                    </a>
                  </Link>
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <Link href="/">
                  <a className="flex-shrink-0 group block">
                    <div className="flex items-center">
                      <div>
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                          {session?.user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          {session?.user?.name || 'Admin User'}
                        </p>
                        <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                          Back to Shop
                        </p>
                      </div>
                    </div>
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
            <button
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
              </div>
              <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
                <div className="py-4">
                  {children}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 