import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { FaShoppingCart, FaStar } from 'react-icons/fa';

interface Product {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  imageUrl: string;
  rating?: number;
  countInStock: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = () => {
    addToCart(product, 1);
  };
  
  // Calculate rating to safely use in the component
  const productRating = product.rating ?? 0;
  const fullStars = Math.floor(productRating);
  
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/products/${product.slug}`} className="block relative h-48 overflow-hidden">
        <Image
          src={product.imageUrl || '/images/placeholder-product.jpg'}
          alt={product.name}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 hover:scale-105"
        />
      </Link>
      
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-gray-500">{product.brand}</span>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          <Link href={`/products/${product.slug}`} className="hover:text-blue-600 transition">
            {product.name}
          </Link>
        </h3>
        
        {product.rating !== undefined && (
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <FaStar 
                key={i} 
                className={`h-4 w-4 ${
                  i < fullStars 
                    ? 'text-yellow-400' 
                    : 'text-gray-300'
                }`} 
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">({product.rating.toFixed(1)})</span>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-3">
          <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
          
          <button
            onClick={handleAddToCart}
            disabled={product.countInStock === 0}
            className={`inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium ${
              product.countInStock > 0
                ? 'text-white bg-blue-600 hover:bg-blue-700'
                : 'text-gray-500 bg-gray-200 cursor-not-allowed'
            }`}
          >
            <FaShoppingCart className="mr-1" />
            {product.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard; 