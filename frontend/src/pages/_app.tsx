import { useEffect, useState } from 'react';
import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '../context/CartContext';
import '../styles/globals.css';
import ErrorBoundary from '../components/ErrorBoundary';
import { checkEnvironmentVariables } from '../utils/environmentCheck';

// Debug logging to verify that environment variables are loaded
console.log("DEBUG: NEXT_PUBLIC_API_URL =", process.env.NEXT_PUBLIC_API_URL);
console.log("DEBUG: NEXTAUTH_SECRET =", process.env.NEXTAUTH_SECRET);

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const [apiStatus, setApiStatus] = useState({
    checked: false,
    reachable: false,
  });

  const [environmentStatus, setEnvironmentStatus] = useState({
    checked: false,
    valid: false,
    issues: [] as string[],
  });

  // Check environment variables on mount
  useEffect(() => {
    const result = checkEnvironmentVariables();
    setEnvironmentStatus({
      checked: true,
      valid: result.valid,
      issues: result.issues,
    });
  }, []);

  // Check API connectivity on mount
  useEffect(() => {
    const checkApiServer = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          // Set a timeout to avoid hanging if the API is down
          signal: AbortSignal.timeout(5000),
        });

        setApiStatus({
          checked: true,
          reachable: response.ok,
        });
        
        console.log('✅ API server is reachable');
      } catch (error) {
        setApiStatus({
          checked: true,
          reachable: false,
        });
        console.error('❌ API server is not reachable', error);
      }
    };

    checkApiServer();
  }, []);

  // Log environment issues in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && environmentStatus.checked) {
      if (!environmentStatus.valid) {
        console.error('❌ Environment configuration issues:');
        environmentStatus.issues.forEach(issue => {
          console.error(`  - ${issue}`);
        });
      }
    }
  }, [environmentStatus]);

  return (
    <SessionProvider session={session} refetchInterval={5 * 60}>
      <CartProvider>
        <ErrorBoundary>
          {apiStatus.checked && !apiStatus.reachable && process.env.NODE_ENV !== 'production' && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
              <p className="text-yellow-700">
                <strong>Warning:</strong> Cannot connect to API server. Some features may not work correctly.
                Please ensure the backend server is running at {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}.
              </p>
            </div>
          )}
          <Component {...pageProps} />
        </ErrorBoundary>
      </CartProvider>
    </SessionProvider>
  );
}

export default MyApp;
