import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  FaHome, 
  FaBox, 
  FaTag, 
  FaShoppingCart, 
  FaUsers, 
  FaChartBar,
  FaCog
} from 'react-icons/fa';

const AdminSidebar = () => {
  const router = useRouter();
  
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: FaHome },
    { name: 'Products', href: '/admin/products', icon: FaBox },
    { name: 'Categories', href: '/admin/categories', icon: FaTag },
    { name: 'Orders', href: '/admin/orders', icon: FaShoppingCart },
    { name: 'Customers', href: '/admin/customers', icon: FaUsers },
    { name: 'Analytics', href: '/admin/analytics', icon: FaChartBar },
    { name: 'Settings', href: '/admin/settings', icon: FaCog },
  ];
  
  const isActive = (href: string) => {
    if (href === '/admin') {
      return router.pathname === '/admin';
    }
    return router.pathname.startsWith(href);
  };
  
  return (
    <div className="hidden md:flex flex-col w-64 bg-gray-800 min-h-screen">
      <div className="flex items-center justify-center h-16 px-4 bg-gray-900">
        <Link 
          href="/"
          className="text-white font-bold text-xl"
        >
          Radeo Admin
        </Link>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link 
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  active
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    active ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-300'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-700">
        <Link 
          href="/"
          className="flex items-center text-gray-300 hover:text-white text-sm"
        >
          <span>Back to Store</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar; 