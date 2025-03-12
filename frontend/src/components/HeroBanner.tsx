import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({
  title = "Discover Premium Quality Products",
  subtitle = "Explore our curated collection of high-quality products designed for your lifestyle",
  imageUrl = "/images/hero-banner.jpg", // Default image, should be replaced with actual image
  ctaText = "Shop Now",
  ctaLink = "/products"
}) => {
  return (
    <div className="relative h-screen max-h-[800px] min-h-[600px] w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl}
          alt="Hero Banner"
          layout="fill"
          objectFit="cover"
          priority
          className="brightness-75"
        />
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10"></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 h-full flex items-center relative z-20">
        <div className="max-w-2xl">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-200 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {subtitle}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              href={ctaLink}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {ctaText}
              <FaArrowRight className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <motion.div 
            className="w-1.5 h-3 bg-white rounded-full mt-2"
            animate={{ 
              y: [0, 12, 0],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut"
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default HeroBanner; 