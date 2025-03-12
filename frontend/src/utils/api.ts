/**
 * API utilities for the Radeo E-commerce Frontend
 * 
 * This file contains utility functions for making API calls with proper error handling,
 * retry logic, and response normalization.
 */

// Base API URL from environment
const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Default request timeout in milliseconds
const DEFAULT_TIMEOUT: number = 10000;

// Maximum number of retries for failed requests
const MAX_RETRIES: number = 2;

// Delay between retries (in milliseconds)
const RETRY_DELAY: number = 1000;

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Sleep utility for async delay
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>} - Resolves after the specified delay
 */
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Makes an API request with timeout, retry logic, and error handling
 * 
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {RequestInit} options - Fetch options (method, headers, body, etc.)
 * @param {number} timeout - Request timeout in milliseconds
 * @param {number} retries - Number of retries for failed requests
 * @returns {Promise<any>} - Parsed response data
 * @throws {ApiError} - If the request fails after all retries
 */
export const fetchWithRetry = async (
  endpoint: string, 
  options: RequestInit = {}, 
  timeout: number = DEFAULT_TIMEOUT,
  retries: number = MAX_RETRIES
): Promise<any> => {
  // Create URL with endpoint
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // Set default headers if not provided
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // Track current retry attempt
  let currentRetry = 0;
  
  while (true) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      // Make the request with timeout
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      // Parse the response based on content type
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      // Handle error responses
      if (!response.ok) {
        throw new ApiError(
          data.message || `API request failed with status ${response.status}`,
          response.status,
          data
        );
      }
      
      // Return successful response data
      return data;
    } catch (error: any) {
      // Determine if we should retry
      const isRetryable = shouldRetry(error);
      
      // If we've reached max retries or the error isn't retryable, throw
      if (currentRetry >= retries || !isRetryable) {
        if (error instanceof ApiError) {
          throw error;
        } else {
          throw new ApiError(
            error.message || 'Unknown API error',
            error.name === 'AbortError' ? 408 : 500
          );
        }
      }
      
      // Increment retry counter and wait before retrying
      currentRetry++;
      console.warn(`API request to ${url} failed, retrying (${currentRetry}/${retries})...`, error);
      await sleep(RETRY_DELAY * currentRetry);
    }
  }
};

/**
 * Determines if an error is retryable
 * @param {Error|ApiError} error - The error to check
 * @returns {boolean} - True if the error is retryable
 */
const shouldRetry = (error: Error | ApiError): boolean => {
  // Network errors are retryable
  if (!('status' in error)) return true;
  
  // Timeout errors are retryable
  if (error.name === 'AbortError') return true;
  
  // Server errors (5xx) are retryable
  if ('status' in error && error.status >= 500 && error.status < 600) return true;
  
  // Too many requests (429) is retryable
  if ('status' in error && error.status === 429) return true;
  
  // Other errors are not retryable
  return false;
};

interface UserData {
  name?: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

/**
 * API client with methods for common endpoints
 */
export const api = {
  // Health check
  checkHealth: async (): Promise<any> => {
    return fetchWithRetry('api/users/health');
  },
  
  // Products
  getProducts: async (): Promise<any> => {
    return fetchWithRetry('api/products');
  },
  
  getProduct: async (id: string): Promise<any> => {
    return fetchWithRetry(`api/products/${id}`);
  },
  
  // Categories
  getCategories: async (): Promise<any> => {
    return fetchWithRetry('api/categories');
  },
  
  getCategory: async (id: string): Promise<any> => {
    return fetchWithRetry(`api/categories/${id}`);
  },
  
  // Cart
  getCart: async (): Promise<any> => {
    return fetchWithRetry('api/cart');
  },
  
  addToCart: async (productId: string, quantity: number = 1): Promise<any> => {
    return fetchWithRetry('api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
  },
  
  updateCartItem: async (productId: string, quantity: number): Promise<any> => {
    return fetchWithRetry(`api/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  },
  
  removeFromCart: async (productId: string): Promise<any> => {
    return fetchWithRetry(`api/cart/${productId}`, {
      method: 'DELETE'
    });
  },
  
  // User
  login: async (email: string, password: string): Promise<any> => {
    return fetchWithRetry('api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },
  
  register: async (userData: UserData): Promise<any> => {
    return fetchWithRetry('api/users/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  forgotPassword: async (email: string): Promise<any> => {
    return fetchWithRetry('api/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }
};

export default api;
