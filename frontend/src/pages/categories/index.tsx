import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import Breadcrumbs from '../../components/Breadcrumbs';
import CategoryCard from '../../components/CategoryCard';

interface Category {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  slug: string;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Layout title="Product Categories | Radeo">
      <Breadcrumbs 
        items={[
          { label: 'Categories', path: '/categories' }
        ]}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Shop by Categories
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Browse our wide selection of products by category
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CategoryCard
                  id={category.slug || category._id}
                  name={category.name}
                  imageUrl={category.imageUrl || '/images/placeholder-category.jpg'}
                  description={category.description}
                />
              </motion.div>
            ))}
          </div>
        )}
        
        {!loading && !error && categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No categories found.</p>
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              View All Products
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoriesPage; 