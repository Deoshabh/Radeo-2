import React from 'react';
import PropTypes from 'prop-types';

/**
 * LoadingState component that provides various loading indicators
 * @param {Object} props - Component props
 * @param {string} props.type - Type of loading indicator ('spinner', 'skeleton', 'pulse', 'dots')
 * @param {string} props.size - Size of the loading indicator ('small', 'medium', 'large')
 * @param {string} props.text - Optional text to display with the loader
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.fullScreen - Whether to display the loader full screen
 * @returns {JSX.Element} - Loading indicator component
 */
const LoadingState = ({ type = 'spinner', size = 'medium', text, className = '', fullScreen = false }) => {
  // Size mapping for different components
  const sizeMap = {
    small: {
      spinner: 'w-4 h-4',
      container: 'h-4',
      text: 'text-sm'
    },
    medium: {
      spinner: 'w-8 h-8',
      container: 'h-8',
      text: 'text-base'
    },
    large: {
      spinner: 'w-12 h-12',
      container: 'h-12',
      text: 'text-lg'
    }
  };

  // Container classes including fullscreen if enabled
  const containerClasses = `
    flex items-center justify-center
    ${fullScreen ? 'fixed inset-0 bg-white bg-opacity-80 z-50' : ''}
    ${className}
  `;

  // Render based on type
  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return (
          <div className="flex items-center justify-center">
            <div 
              className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${sizeMap[size].spinner}`}
              role="status"
              aria-label="Loading"
            />
            {text && <span className={`ml-3 ${sizeMap[size].text}`}>{text}</span>}
          </div>
        );

      case 'skeleton':
        return (
          <div className="w-full animate-pulse">
            <div className="h-2.5 bg-gray-200 rounded-full w-full mb-2.5"></div>
            <div className="h-2.5 bg-gray-200 rounded-full w-3/4 mb-2.5"></div>
            <div className="h-2.5 bg-gray-200 rounded-full w-1/2"></div>
            {text && <span className={`block mt-3 text-gray-400 ${sizeMap[size].text}`}>{text}</span>}
          </div>
        );

      case 'pulse':
        return (
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className={`bg-blue-600 rounded-full ${sizeMap[size].spinner} opacity-75`}></div>
              <div className={`absolute top-0 left-0 bg-blue-600 rounded-full ${sizeMap[size].spinner} animate-ping opacity-25`}></div>
            </div>
            {text && <span className={`ml-3 ${sizeMap[size].text}`}>{text}</span>}
          </div>
        );

      case 'dots':
        return (
          <div className="flex items-center justify-center">
            <div className="flex space-x-1">
              <div className={`animate-bounce delay-75 bg-blue-600 rounded-full ${size === 'small' ? 'w-1.5 h-1.5' : size === 'large' ? 'w-3 h-3' : 'w-2 h-2'}`}></div>
              <div className={`animate-bounce delay-150 bg-blue-600 rounded-full ${size === 'small' ? 'w-1.5 h-1.5' : size === 'large' ? 'w-3 h-3' : 'w-2 h-2'}`}></div>
              <div className={`animate-bounce delay-300 bg-blue-600 rounded-full ${size === 'small' ? 'w-1.5 h-1.5' : size === 'large' ? 'w-3 h-3' : 'w-2 h-2'}`}></div>
            </div>
            {text && <span className={`ml-3 ${sizeMap[size].text}`}>{text}</span>}
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center">
            <div 
              className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${sizeMap[size].spinner}`}
              role="status"
              aria-label="Loading"
            />
            {text && <span className={`ml-3 ${sizeMap[size].text}`}>{text}</span>}
          </div>
        );
    }
  };

  return (
    <div className={containerClasses}>
      {renderLoader()}
    </div>
  );
};

LoadingState.propTypes = {
  type: PropTypes.oneOf(['spinner', 'skeleton', 'pulse', 'dots']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  text: PropTypes.string,
  className: PropTypes.string,
  fullScreen: PropTypes.bool
};

export default LoadingState; 