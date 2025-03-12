import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCart } from '../../hooks/useCart'; 
import Image from 'next/image';
import Layout from '../../components/Layout';
import Breadcrumbs from '../../components/Breadcrumbs';
import { FaStar, FaStarHalfAlt, FaRegStar, FaShare, FaHeart, FaShoppingCart, FaShippingFast, FaRegCreditCard, FaUndo, FaCheck, FaMinus, FaPlus } from 'react-icons/fa';
import ProductCard from '../../components/ProductCard';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  images: string[];
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  brand: string;
  countInStock: number;
  rating: number;
  numReviews: number;
  features: string[];
  oldPrice?: number;
  gallery?: string[];
  isFeatured: boolean;
  sizes?: string[];
  colors?: string[];
  slug: string;
}

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}

const ProductDetail = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setError('');
      
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiBaseUrl}/api/products/${slug}`);

        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }

        const data = await response.json();
        setProduct(data);
        setSelectedImage(data.gallery?.[0] || data.imageUrl);
        
        // Set default selections if available
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }
      } catch (err) {
        console.error('Error fetching product data:', err);
        setError('Failed to load product information. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductData();
  }, [slug]);
  
  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    if (product && value > product.countInStock) return;
    setQuantity(value);
  };
  
  const handleAddToCart = () => {
    if (!product) return;
    
    const productWithSelections = {
      ...product,
      selectedSize,
      selectedColor
    };
    
    addToCart(productWithSelections, quantity);
    
    // Show confirmation animation or toast notification
    // For now, just navigate to cart
    router.push('/cart');
  };
  
  if (loading) {
    return (
      <Layout title="Loading Product | Radeo">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }
  
  if (error || !product) {
    return (
      <Layout title="Product Not Found | Radeo">
        <div className="container mx-auto px-4 py-16">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error || 'Product not found'}
          </div>
          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title={`${product.name} | Radeo`} description={product.description}>
      <div className="bg-gray-50 pt-20 pb-12">
        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-gray-500">
            <ol className="list-none p-0 inline-flex">
              <li className="flex items-center">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <span className="mx-2">/</span>
              </li>
              <li className="flex items-center">
                <Link href="/products" className="hover:text-blue-600">Products</Link>
                <span className="mx-2">/</span>
              </li>
              <li className="flex items-center">
                <Link href={`/categories/${product.category.slug}`} className="hover:text-blue-600">
                  {product.category.name}
                </Link>
                <span className="mx-2">/</span>
              </li>
              <li className="text-gray-700 font-medium truncate">{product.name}</li>
            </ol>
          </nav>
        </div>
        
        {/* Product Detail Section */}
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-6">
              {/* Product Images */}
              <div className="md:col-span-1">
                <div className="product-images">
                  {/* Main image */}
                  <div className="main-image mb-4 rounded-lg overflow-hidden bg-gray-100 relative h-80">
                    <Image
                      src={selectedImage}
                      alt={product.name}
                      layout="fill"
                      objectFit="contain"
                      className="transition-all duration-300"
                    />
                  </div>
                  
                  {/* Thumbnail gallery */}
                  {product.gallery && product.gallery.length > 0 && (
                    <div className="thumbnails grid grid-cols-4 gap-2">
                      {product.gallery.map((image, index) => (
                        <div 
                          key={index}
                          className={`h-20 rounded-md overflow-hidden cursor-pointer border-2 ${
                            selectedImage === image ? 'border-blue-500' : 'border-transparent'
                          }`}
                          onClick={() => setSelectedImage(image)}
                        >
                          <Image
                            src={image}
                            alt={`${product.name} thumbnail ${index + 1}`}
                            width={100}
                            height={100}
                            objectFit="cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Product Info */}
              <div className="md:col-span-1 lg:col-span-2">
                <div className="product-info">
                  {/* Brand and name */}
                  <div className="mb-2">
                    <span className="text-blue-600 text-sm font-medium">{product.brand}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      {product.rating.toFixed(1)} ({product.numReviews} reviews)
                    </span>
                  </div>
                  
                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                    {product.oldPrice && (
                      <span className="ml-2 text-lg text-gray-500 line-through">
                        ${product.oldPrice.toFixed(2)}
                      </span>
                    )}
                    {product.oldPrice && (
                      <span className="ml-2 bg-red-100 text-red-800 text-sm font-medium px-2 py-0.5 rounded">
                        {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>
                  
                  {/* Short description */}
                  <p className="text-gray-600 mb-6">{product.description.split('.')[0]}.</p>
                  
                  {/* Color selection */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Color</h3>
                      <div className="flex space-x-2">
                        {product.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`px-3 py-1 border rounded-md text-sm font-medium ${
                              selectedColor === color
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Size selection */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Size</h3>
                      <div className="flex space-x-2">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-3 py-1 border rounded-md text-sm font-medium ${
                              selectedSize === size
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Quantity and add to cart */}
                  <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                    <div className="flex items-center rounded-md border border-gray-300">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="px-4 py-2 text-gray-600 disabled:text-gray-400"
                      >
                        <FaMinus />
                      </button>
                      <span className="w-12 text-center">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product.countInStock}
                        className="px-4 py-2 text-gray-600 disabled:text-gray-400"
                      >
                        <FaPlus />
                      </button>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={product.countInStock === 0}
                      className={`flex-grow md:flex-grow-0 flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                        product.countInStock > 0
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <FaShoppingCart className="mr-2" />
                      {product.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    
                    <button
                      type="button"
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FaHeart className="mr-2 text-red-500" />
                      Wishlist
                    </button>
                    
                    <button
                      type="button"
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FaShare className="mr-2 text-blue-500" />
                      Share
                    </button>
                  </div>
                  
                  {/* Stock and delivery */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-1 gap-y-4">
                      {/* Availability */}
                      <div className="flex items-center">
                        <div className={`h-4 w-4 rounded-full ${product.countInStock > 0 ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                        <span className="text-sm text-gray-700">
                          {product.countInStock > 0 
                            ? `In Stock (${product.countInStock} available)` 
                            : 'Out of Stock'}
                        </span>
                      </div>
                      
                      {/* Shipping */}
                      <div className="flex items-center">
                        <FaShippingFast className="text-blue-500 mr-2" />
                        <span className="text-sm text-gray-700">
                          Free shipping on orders over $100
                        </span>
                      </div>
                      
                      {/* Returns */}
                      <div className="flex items-center">
                        <FaUndo className="text-blue-500 mr-2" />
                        <span className="text-sm text-gray-700">
                          30-day returns policy
                        </span>
                      </div>
                      
                      {/* Secure payment */}
                      <div className="flex items-center">
                        <FaRegCreditCard className="text-blue-500 mr-2" />
                        <span className="text-sm text-gray-700">
                          Secure payment processing
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs for Additional Info */}
            <div className="border-t border-gray-200 mt-8">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'description'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('features')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'features'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Features
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'reviews'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Reviews ({reviews.length})
                </button>
              </div>
              
              <div className="p-6">
                {/* Description Tab */}
                {activeTab === 'description' && (
                  <div className="prose max-w-none">
                    <p className="text-gray-600">{product.description}</p>
                    <p className="text-gray-600 mt-4">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisi aliquet nunc, quis lacinia nunc nunc eget nunc. Nullam auctor, nisl eget ultricies aliquam, nunc nisi aliquet nunc, quis lacinia nunc nunc eget nunc.
                    </p>
                    <p className="text-gray-600 mt-4">
                      Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Curabitur aliquet quam id dui posuere blandit. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus.
                    </p>
                  </div>
                )}
                
                {/* Features Tab */}
                {activeTab === 'features' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Key Features</h3>
                    <ul className="space-y-2">
                      {product.features?.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-3">Specifications</h4>
                        <dl className="space-y-1">
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <dt className="text-sm text-gray-500">Brand</dt>
                            <dd className="text-sm font-medium text-gray-900">{product.brand}</dd>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <dt className="text-sm text-gray-500">Model</dt>
                            <dd className="text-sm font-medium text-gray-900">A390</dd>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <dt className="text-sm text-gray-500">Connectivity</dt>
                            <dd className="text-sm font-medium text-gray-900">Bluetooth 5.0</dd>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <dt className="text-sm text-gray-500">Battery Life</dt>
                            <dd className="text-sm font-medium text-gray-900">Up to 40 hours</dd>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <dt className="text-sm text-gray-500">Weight</dt>
                            <dd className="text-sm font-medium text-gray-900">250g</dd>
                          </div>
                        </dl>
                      </div>
                      
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-3">In The Box</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>1 x {product.name}</li>
                          <li>1 x Carrying Case</li>
                          <li>1 x USB-C Charging Cable</li>
                          <li>1 x 3.5mm Audio Cable</li>
                          <li>1 x User Manual</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
                      <button className="text-sm text-blue-600 hover:text-blue-800">Write a Review</button>
                    </div>
                    
                    {/* Review Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="flex flex-col md:flex-row items-center">
                        <div className="flex flex-col items-center md:border-r md:border-gray-200 pr-0 md:pr-6 mb-4 md:mb-0">
                          <div className="text-5xl font-bold text-gray-900 mb-1">{product.rating.toFixed(1)}</div>
                          <div className="flex mb-1">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`h-5 w-5 ${
                                  i < Math.floor(product.rating)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-sm text-gray-500">{product.numReviews} reviews</div>
                        </div>
                        
                        <div className="flex-1 pl-0 md:pl-6">
                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => {
                              // Calculate % of reviews with this rating (mock data)
                              const percentage = star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 3 : 2;
                              
                              return (
                                <div key={star} className="flex items-center">
                                  <div className="text-sm text-gray-600 w-8">{star} star</div>
                                  <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full">
                                    <div
                                      className="h-2 bg-yellow-400 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <div className="text-sm text-gray-600 w-8">{percentage}%</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Review List */}
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-100 pb-6">
                          <div className="flex items-center mb-2">
                            {review.avatar ? (
                              <Image
                                src={review.avatar}
                                alt={review.name}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 font-medium">{review.name.charAt(0)}</span>
                              </div>
                            )}
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-gray-900">{review.name}</h4>
                              <div className="flex items-center">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < review.rating
                                          ? 'text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500 ml-2">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Load More Reviews Button */}
                    {reviews.length > 3 && (
                      <div className="text-center mt-6">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Load More Reviews
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products Section */}
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail; 