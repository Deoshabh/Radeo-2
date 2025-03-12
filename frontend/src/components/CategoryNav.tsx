import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FaLaptop, FaTshirt, FaHome, FaSprayCan, FaRunning, FaGift, FaMobileAlt, FaHeadphones } from 'react-icons/fa';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: React.ReactNode;
  imageUrl?: string;
}

const categories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    icon: <FaLaptop />,
    imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661'
  },
  {
    id: '2',
    name: 'Clothing',
    slug: 'clothing',
    icon: <FaTshirt />,
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050'
  },
  {
    id: '3',
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    icon: <FaHome />,
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f'
  },
  {
    id: '4',
    name: 'Beauty',
    slug: 'beauty',
    icon: <FaSprayCan />,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348'
  },
  {
    id: '5',
    name: 'Sports',
    slug: 'sports',
    icon: <FaRunning />,
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b'
  },
  {
    id: '6',
    name: 'Gifts',
    slug: 'gifts',
    icon: <FaGift />,
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48'
  },
  {
    id: '7',
    name: 'Phones',
    slug: 'phones',
    icon: <FaMobileAlt />,
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9'
  },
  {
    id: '8',
    name: 'Audio',
    slug: 'audio',
    icon: <FaHeadphones />,
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b'
  }
];

interface CategoryNavProps {
  className?: string;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ className = '' }) => {
  const router = useRouter();
  const { category } = router.query;
  
  return (
    <div className={`${className}`}>
      <div className="overflow-x-auto pb-2 hide-scrollbar">
        <div className="flex space-x-4 min-w-max px-2">
          <Link 
            href="/products" 
            className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg transition-colors ${
              !category ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl mb-1">🛍️</span>
            <span className="text-sm font-medium">All</span>
          </Link>
          
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg transition-colors ${
                category === cat.slug ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl mb-1">{cat.icon}</span>
              <span className="text-sm font-medium">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;

// Featured Categories Grid for Homepage
export const FeaturedCategories: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.slice(0, 4).map((category) => (
        <Link key={category.id} href={`/products?category=${category.slug}`}>
          <motion.div 
            className="relative h-64 rounded-lg overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            {category.imageUrl && (
              <Image
                src={category.imageUrl}
                alt={category.name}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                <p className="text-gray-200 text-sm">Shop Now</p>
              </div>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}; 