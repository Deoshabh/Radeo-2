import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-200">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Radeo</h3>
            <p className="mb-4">Your one-stop shop for all your needs.</p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-400"><FaFacebook /></a>
              <a href="#" className="hover:text-blue-400"><FaTwitter /></a>
              <a href="#" className="hover:text-blue-400"><FaInstagram /></a>
              <a href="#" className="hover:text-blue-400"><FaLinkedin /></a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-blue-400">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400">Contact Us</Link></li>
              <li><Link href="/products" className="hover:text-blue-400">Products</Link></li>
              <li><Link href="/blog" className="hover:text-blue-400">Blog</Link></li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div>
            <h3 className="text-xl font-bold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link href="/faq" className="hover:text-blue-400">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-blue-400">Shipping Policy</Link></li>
              <li><Link href="/returns" className="hover:text-blue-400">Returns & Exchanges</Link></li>
              <li><Link href="/terms" className="hover:text-blue-400">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-400">Privacy Policy</Link></li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-4">Stay Updated</h3>
            <p className="mb-4">Subscribe to our newsletter for updates and promotions.</p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 w-full rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Radeo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;