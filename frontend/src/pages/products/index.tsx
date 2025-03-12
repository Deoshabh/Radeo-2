import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Breadcrumbs from '../../components/Breadcrumbs';
import ProductCard from '../../components/ProductCard';

// Define Product type
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  brand: string;
  countInStock: number;
  rating: number;
  numReviews: number;
  slug: string; // Ensure slug is required
  createdAt: string; // Add createdAt property
}

interface Filter {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'popular';
}

const ProductsPage: React.FC = () => {
  const router = useRouter();
  const { category, brand, minPrice, maxPrice, sortBy } = router.query;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>({});
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 12;
  const { data: session } = useSession();
  
  // Animation variants for Framer Motion
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiBaseUrl}/api/products`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Filter and sort products based on user selection
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const sortedProducts = products
    .filter(product => {
      const matchesCategory = filter.category ? product.category === filter.category : true;
      const matchesBrand = filter.brand ? product.brand === filter.brand : true;
      const matchesPrice = (filter.minPrice ? product.price >= filter.minPrice : true) &&
                           (filter.maxPrice ? product.price <= filter.maxPrice : true);
      return matchesCategory && matchesBrand && matchesPrice;
    })
    .sort((a, b) => {
      if (filter.sortBy === 'price-asc') return a.price - b.price;
      if (filter.sortBy === 'price-desc') return b.price - a.price;
      if (filter.sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0; // Default sorting
    });

  return (
    <Layout title="Products | Radeo">
      <Breadcrumbs 
        items={[
          { label: 'Products', path: '/products' }
        ]}
      />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Our Products</h1>
          <p className="mt-2 text-lg text-gray-600">
            Discover our latest collection of high-quality products
          </p>
        </div>
        
        {/* Filter Section */}
        <div className="flex flex-col md:flex-row mb-4">
          <div className="flex flex-col w-full md:w-1/4 mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select name="category" id="category" onChange={handleFilterChange} className="mt-1 block w-full border-gray-300 rounded-md">
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="home">Home & Kitchen</option>
              <option value="beauty">Beauty & Personal Care</option>
            </select>
          </div>

          <div className="flex flex-col w-full md:w-1/4 mb-4">
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
            <select name="brand" id="brand" onChange={handleFilterChange} className="mt-1 block w-full border-gray-300 rounded-md">
              <option value="">All Brands</option>
              <option value="apple">Apple</option>
              <option value="samsung">Samsung</option>
              <option value="nike">Nike</option>
              <option value="sony">Sony</option>
            </select>
          </div>

          <div className="flex flex-col w-full md:w-1/4 mb-4">
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">Sort By</label>
            <select name="sortBy" id="sortBy" onChange={handleFilterChange} className="mt-1 block w-full border-gray-300 rounded-md">
              <option value="">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8"
          >
            {sortedProducts.map((product) => (
              <motion.div key={product._id} variants={item}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination can be added here if needed */}
      </div>
    </Layout>
  );
};

export default ProductsPage; 