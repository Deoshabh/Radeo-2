import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import Head from 'next/head';

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        // Set a timeout to avoid hanging if the API is down
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${apiUrl}/api/products`, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        
        // Set fallback data if API call fails
        setData([
          { id: 'sample-1', name: 'Sample Product 1', price: 19.99 },
          { id: 'sample-2', name: 'Sample Product 2', price: 29.99 },
        ]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  return (
    <>
      <Head>
        <title>Radeo Shop</title>
        <meta name="description" content="Welcome to Radeo Shop" />
      </Head>

      <Layout title="Radeo | Home">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to Radeo</h1>
            <p className="text-xl mb-8">Your one-stop shop for all your needs</p>
            <Link href="/products" className="bg-white text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">
              Browse Products
            </Link>
          </div>
        </div>

        <div className="container mx-auto py-12 px-4">
          {loading && (
            <div className="flex justify-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 p-4 mb-6 rounded-md border border-red-200">
              <h2 className="text-red-700 font-semibold mb-2">Error</h2>
              <p className="text-red-600">{error}</p>
              <p className="mt-2">Showing sample products instead.</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data && data.map((product: any) => (
              <div key={product.id} className="border rounded-lg p-4 shadow-sm">
                <h2 className="font-bold text-lg">{product.name}</h2>
                <p className="text-gray-700">${product.price?.toFixed(2)}</p>
                <Link href={`/products/${product.id}`} className="mt-2 inline-block text-blue-600 hover:underline">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default HomePage;