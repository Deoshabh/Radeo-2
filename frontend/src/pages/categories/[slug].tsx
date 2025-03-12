import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../../components/Layout';
import Breadcrumbs from '../../components/Breadcrumbs';
import ProductCard from '../../components/ProductCard';

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
}

interface Category {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  slug: string;
}

const CategoryPage: React.FC = () => {
  const router = useRouter();
  const { slug } = router.query;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      if (!slug) return;
      
      try {
        // Fetch category details
        const categoryRes = await fetch(`/api/categories/${slug}`);
        
        if (!categoryRes.ok) {
          throw new Error(`Failed to fetch category: ${categoryRes.statusText}`);
        }
        
        const categoryData = await categoryRes.json();
        setCategory(categoryData);
        
        // Fetch products for this category
        const productsRes = await fetch(`/api/products?category=${categoryData._id}`);
        
        if (!productsRes.ok) {
          throw new Error(`Failed to fetch products: ${productsRes.statusText}`);
        }
        
        const productsData = await productsRes.json();
        setProducts(productsData);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load category data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [slug]);

  if (loading) {
    return (
      <Layout title="Loading... | Radeo">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error || !category) {
    return (
      <Layout title="Error | Radeo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <p>{error || 'Category not found'}</p>
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/categories"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Categories
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${category.name} | Radeo`}>
      <Breadcrumbs 
        items={[
          { label: 'Categories', path: '/categories' },
          { label: category.name, path: `/categories/${slug}` }
        ]}
      />
      
      <div className="relative">
        <div className="h-64 w-full relative">
          <Image
            src={category.imageUrl || '/images/placeholder-category-hero.jpg'}
            alt={category.name}
            layout="fill"
            objectFit="cover"
            priority
          />
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-6 text-xl text-white">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {products.length} {products.length === 1 ? 'Product' : 'Products'}
          </h2>
          
          <div>
            <select
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              defaultValue="featured"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No products found in this category.</p>
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              View All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage; 