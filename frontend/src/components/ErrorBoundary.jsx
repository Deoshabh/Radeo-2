import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

/**
 * ErrorBoundary component to catch and handle errors in the component tree.
 * This prevents the entire application from crashing when an error occurs in a child component.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  /**
   * Update state when an error occurs
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Log error details when caught
   */
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Log error to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }
    
    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      // Example: Send to monitoring service
      // Uncomment and configure once you have a monitoring service
      /*
      window.fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.toString(),
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      }).catch(e => console.error('Failed to log error:', e));
      */
    }
  }

  /**
   * Reset the error state
   */
  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    // If no error, render children normally
    if (!this.state.hasError) {
      return this.props.children;
    }

    // If error occurred, render fallback UI
    return (
      <div className="error-boundary-container p-6 mx-auto max-w-3xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-700 mb-4">
            {this.props.fallbackHeading || 'Something went wrong'}
          </h2>
          
          <div className="text-red-600 mb-4">
            {this.props.fallbackMessage || 
              "We're sorry, but there was an error loading this page. Our team has been notified."}
          </div>
          
          {/* Show error details in non-production environments */}
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="mt-4">
              <details className="bg-red-100 p-3 rounded border border-red-300">
                <summary className="font-medium cursor-pointer">Error Details (Development Only)</summary>
                <div className="mt-2">
                  <p className="font-mono text-sm overflow-auto p-2 bg-red-200 rounded">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <p className="font-mono text-sm mt-2 overflow-auto p-2 bg-red-200 rounded max-h-40">
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </p>
                  )}
                </div>
              </details>
            </div>
          )}
          
          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
            
            {this.props.resetable && (
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            )}
            
            <Link 
              href="/"
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallbackHeading: PropTypes.string,
  fallbackMessage: PropTypes.string,
  resetable: PropTypes.bool
};

ErrorBoundary.defaultProps = {
  resetable: true
};

export default ErrorBoundary; 