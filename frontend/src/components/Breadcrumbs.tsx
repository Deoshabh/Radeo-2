import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaHome, FaChevronRight } from 'react-icons/fa';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  items = [], 
  showHome = true 
}) => {
  const router = useRouter();
  
  // Generate breadcrumbs from path if no items are provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = router.asPath.split('/').filter(Boolean);
    let breadcrumbs: BreadcrumbItem[] = [];
    let currentPath = '';
    
    paths.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Format segment for display (replace hyphens with spaces, capitalize first letter)
      const label = segment
        .replace(/-/g, ' ')
        .replace(/^\w/, c => c.toUpperCase());
      
      breadcrumbs.push({
        label,
        path: currentPath
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbsItems = items.length > 0 ? items : generateBreadcrumbs();
  
  return (
    <nav className="bg-gray-50 py-3 px-4 sm:px-6 lg:px-8">
      <ol className="flex items-center space-x-2 text-sm text-gray-500">
        {showHome && (
          <li className="flex items-center">
            <Link 
              href="/"
              className="hover:text-blue-600 flex items-center"
            >
              <FaHome className="mr-1" />
              <span>Home</span>
            </Link>
            {(breadcrumbsItems.length > 0) && (
              <FaChevronRight className="text-gray-400 mx-2" size={10} />
            )}
          </li>
        )}
        
        {breadcrumbsItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index < breadcrumbsItems.length - 1 ? (
              <>
                <Link 
                  href={item.path}
                  className="hover:text-blue-600"
                >
                  {item.label}
                </Link>
                <FaChevronRight className="text-gray-400 mx-2" size={10} />
              </>
            ) : (
              <span className="font-medium text-gray-900">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs; 