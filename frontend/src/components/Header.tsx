import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaShoppingCart, FaUser, FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { items } = useCart();
  
  // Add a mounted state to handle client-side rendering
  const [mounted, setMounted] = useState(false);
  
  // Safe session access
  const { data: session, status } = useSession();
  
  // Only run useEffect on the client-side
  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.asPath]);

  // Don't render session-dependent parts during SSR
  const isLoadingSession = !mounted || status === 'loading';

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-md text-gray-900' 
          : router.pathname === '/' 
            ? 'bg-transparent text-white' 
            : 'bg-white text-gray-900 shadow-sm'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold flex items-center">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Radeo
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <NavLink href="/" label="Home" active={router.pathname === '/'} />
            <NavLink href="/products" label="Products" active={router.pathname.startsWith('/products')} />
            <NavLink href="/categories" label="Categories" active={router.pathname.startsWith('/categories')} />
            <NavLink href="/about" label="About" active={router.pathname === '/about'} />
            <NavLink href="/contact" label="Contact" active={router.pathname === '/contact'} />
          </nav>
          
          {/* Right Side Icons */}
          <div className="flex items-center space-x-6">
            <Link 
              href="/search" 
              className={`hover:text-blue-600 transition-colors duration-200 ${
                router.pathname === '/search' ? 'text-blue-600' : ''
              }`}
            >
              <FaSearch className="text-lg" />
            </Link>
            
            <Link 
              href="/cart" 
              className={`hover:text-blue-600 transition-colors duration-200 relative ${
                router.pathname === '/cart' ? 'text-blue-600' : ''
              }`}
            >
              <FaShoppingCart className="text-lg" />
              {/* Cart counter - would be dynamic based on cart state */}
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
            
            {isLoadingSession ? (
              // Loading state
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : (
              // User is authenticated or not
              session ? (
                <div className="relative group">
                  <button className="flex items-center space-x-1">
                    <FaUser />
                  </button>
                  <div className="absolute right-0 w-48 bg-white shadow-lg rounded-md mt-2 py-2 z-10 hidden group-hover:block">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium">{session.user?.name}</p>
                      <p className="text-xs text-gray-500">{session.user?.email}</p>
                    </div>
                    <Link href="/account" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      My Account
                    </Link>
                    <button 
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link 
                  href="/auth/signin" 
                  className={`bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 
                    text-white px-4 py-2 rounded-md transition-colors duration-200 text-sm font-medium`}
                >
                  Login / Sign Up
                </Link>
              )
            )}
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden bg-white shadow-lg absolute top-full left-0 w-full"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                <MobileNavLink href="/" label="Home" active={router.pathname === '/'} />
                <MobileNavLink href="/products" label="Products" active={router.pathname.startsWith('/products')} />
                <MobileNavLink href="/categories" label="Categories" active={router.pathname.startsWith('/categories')} />
                <MobileNavLink href="/about" label="About" active={router.pathname === '/about'} />
                <MobileNavLink href="/contact" label="Contact" active={router.pathname === '/contact'} />
                
                {!isLoadingSession && !session && (
                  <Link
                    href="/auth/signin"
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-md transition-colors text-center font-medium"
                  >
                    Login / Sign Up
                  </Link>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// Desktop Nav Link component
interface NavLinkProps {
  href: string;
  label: string;
  active: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label, active }) => {
  return (
    <Link 
      href={href} 
      className={`relative font-medium transition-colors duration-200 hover:text-blue-600
        ${active ? 'text-blue-600' : ''}`}
    >
      {label}
      {active && (
        <motion.span 
          className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded"
          layoutId="underline"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );
};

// Mobile Nav Link component
const MobileNavLink: React.FC<NavLinkProps> = ({ href, label, active }) => {
  return (
    <Link 
      href={href} 
      className={`py-2 px-3 rounded-md transition-colors duration-200 font-medium
        ${active 
          ? 'bg-blue-50 text-blue-600' 
          : 'text-gray-900 hover:bg-gray-50'
        }`}
    >
      {label}
    </Link>
  );
};

export default Header;