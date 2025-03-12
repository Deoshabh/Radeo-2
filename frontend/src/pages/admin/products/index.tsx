import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import withAuth from '../../../components/withAuth';
import AdminLayout from '../../../components/admin/AdminLayout';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';

// Enhanced Session type to include accessToken
interface ExtendedSession {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  expires: string;
  accessToken?: string;
}

// Define Product type
interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  brand: string;
  countInStock: number;
  isFeatured: boolean;
  createdAt: string;
  imageUrl: string;
  rating: number;
  numReviews: number;
}

const AdminProducts: React.FC = () => {
  const { data: session, status } = useSession();
  const extendedSession = session as ExtendedSession;
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  useEffect(() => {
    const fetchProducts = async () => {
      if (status !== 'authenticated') return;
      
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiBaseUrl}/api/products`, {
          headers: {
            Authorization: `Bearer ${session?.user?.token}`,
          },
        });
        
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
  }, [session]);
  
  // Get unique categories from products
  const categories = ['all', ...new Set(products.map(product => product.category))];
  
  // Filter products based on search term and selected category
  const filteredProducts = searchTerm
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;
  
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiBaseUrl}/api/products/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session?.user?.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete product');
        }

        setProducts(products.filter(product => product._id !== id));
      } catch (err) {
        alert('An error occurred while deleting the product');
        console.error(err);
      }
    }
  };
  
  if (status === 'loading' || loading) {
    return (
      <Layout title="Admin Products | Radeo">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }
  
  if (status === 'unauthenticated') {
    router.push('/auth/signin?callbackUrl=/admin/products');
    return null;
  }
  
  return (
    <Layout title="Admin Products | Radeo">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Manage Products</h1>
        <Link href="/admin/products/add" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
          <FaPlus className="mr-2" />
          Add New Product
        </Link>

        {error && (
          <div className="mt-4 bg-red-50 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <table className="min-w-full divide-y divide-gray-200 mt-6">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product._id}>
                <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.countInStock}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/admin/products/edit/${product.slug}`} className="text-blue-600 hover:text-blue-800">Edit</Link>
                  <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-800 ml-4">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

// Wrap component with authentication HOC, requiring admin privileges
export default withAuth(AdminProducts, true); 