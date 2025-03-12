import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Category {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  productCount: number;
  createdAt: string;
}

const AdminCategoriesPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/categories');
    }
    
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);
  
  useEffect(() => {
    const fetchCategories = async () => {
      if (status === 'authenticated' && session?.user?.role === 'admin') {
        try {
          setIsLoading(true);
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
          const response = await fetch(`${apiBaseUrl}/api/admin/categories`, {
            headers: {
              'Authorization': `Bearer ${session?.accessToken}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch categories');
          }
          
          const data = await response.json();
          setCategories(data);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching categories:', error);
          setError('Failed to load categories. Please try again later.');
          setIsLoading(false);
        }
      }
    };
    
    fetchCategories();
  }, [status, session]);
  
  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setDeleteError(null);
    
    try {
      setIsDeleting(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
      
      // Remove the deleted category from the state
      setCategories(categories.filter(category => category._id !== id));
      setIsDeleting(false);
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      setDeleteError('Failed to delete category. Please try again later.');
      setIsDeleting(false);
    }
  };
  
  if (status === 'loading' || isLoading) {
    return (
      <AdminLayout title="Categories | Admin Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title="Categories | Admin Dashboard">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
            <Link href="/admin/categories/add">
              <a className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Add Category
              </a>
            </Link>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : categories.length > 0 ? (
            <div className="mt-8 flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Products
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created At
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((category) => (
                          <tr key={category._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {category.imageUrl && (
                                  <div className="flex-shrink-0 h-10 w-10 mr-4">
                                    <img className="h-10 w-10 rounded-full object-cover" src={category.imageUrl} alt={category.name} />
                                  </div>
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 truncate max-w-xs">{category.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{category.productCount}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {new Date(category.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-3">
                                <Link href={`/admin/categories/edit/${category._id}`}>
                                  <a className="text-indigo-600 hover:text-indigo-900">Edit</a>
                                </Link>
                                <button
                                  onClick={() => handleDelete(category._id)}
                                  disabled={isDeleting && deleteId === category._id}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                >
                                  {isDeleting && deleteId === category._id ? 'Deleting...' : 'Delete'}
                                </button>
                              </div>
                              {deleteError && deleteId === category._id && (
                                <p className="text-xs text-red-500 mt-1">{deleteError}</p>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg mt-8">
              <h3 className="mt-2 text-lg font-medium text-gray-900">No categories found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new category.</p>
              <div className="mt-6">
                <Link href="/admin/categories/add">
                  <a className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Add Category
                  </a>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCategoriesPage; 