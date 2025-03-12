import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import AdminLayout from '../../../components/AdminLayout';
import { FaSave, FaTrash, FaArrowLeft } from 'react-icons/fa';

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

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  brand: string;
  countInStock: number;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
}

const AdminProductDetail = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { data: session, status } = useSession();
  const extendedSession = session as ExtendedSession;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug || status !== 'authenticated') return;
      
      try {
        const response = await fetch(`/api/admin/products/${slug}`, {
          headers: {
            Authorization: `Bearer ${extendedSession?.accessToken || ''}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError('An error occurred while fetching product data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [slug, extendedSession, status]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (!product) return;
    
    // Handle special case for checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProduct({
        ...product,
        [name]: checked,
      });
      return;
    }
    
    // Handle numeric inputs
    if (type === 'number') {
      setProduct({
        ...product,
        [name]: parseFloat(value),
      });
      return;
    }
    
    // Handle regular text inputs
    setProduct({
      ...product,
      [name]: value,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !session) return;
    
    setSaving(true);
    setSaveError('');
    setSuccessMessage('');
    
    try {
      const response = await fetch(`/api/admin/products/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${extendedSession?.accessToken || ''}`,
        },
        body: JSON.stringify(product),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      
      setSuccessMessage('Product updated successfully');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/products');
      }, 2000);
    } catch (err) {
      setSaveError('An error occurred while saving the product');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    if (!product || !session) return;
    
    setSaving(true);
    setSaveError('');
    
    try {
      const response = await fetch(`/api/admin/products/${slug}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${extendedSession?.accessToken || ''}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      // Redirect to products list
      router.push('/admin/products');
    } catch (err) {
      setSaveError('An error occurred while deleting the product');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  if (status === 'loading' || loading) {
    return (
      <AdminLayout title="Loading... | Admin">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }
  
  if (status === 'unauthenticated') {
    router.push('/auth/signin?callbackUrl=/admin/products');
    return null;
  }
  
  if (error || !product) {
    return (
      <AdminLayout title="Error | Admin">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Product not found'}
        </div>
        <div className="mt-4">
          <Link
            href="/admin/products"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <FaArrowLeft className="mr-2" />
            Back to Products
          </Link>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title={`Edit ${product.name} | Admin`}>
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-lg font-medium text-gray-900">Edit Product</h1>
            <Link
              href="/admin/products"
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaArrowLeft className="mr-1" />
              Back
            </Link>
          </div>
          
          {saveError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {saveError}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Product Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={product.name}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  Slug
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="slug"
                    id="slug"
                    required
                    value={product.slug}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={product.description}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="price"
                    id="price"
                    required
                    min="0"
                    step="0.01"
                    value={product.price}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="countInStock" className="block text-sm font-medium text-gray-700">
                  Stock
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="countInStock"
                    id="countInStock"
                    required
                    min="0"
                    value={product.countInStock}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <div className="mt-1">
                  <select
                    id="category"
                    name="category"
                    value={product.category}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Select Category</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="books">Books</option>
                    <option value="home">Home & Kitchen</option>
                    <option value="beauty">Beauty & Personal Care</option>
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                  Brand
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="brand"
                    id="brand"
                    value={product.brand}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="imageUrl"
                    id="imageUrl"
                    value={product.imageUrl}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <div className="flex items-center">
                  <input
                    id="isFeatured"
                    name="isFeatured"
                    type="checkbox"
                    checked={product.isFeatured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                    Featured product
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <FaTrash className="mr-1" />
                Delete
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <FaSave className="mr-1" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProductDetail; 