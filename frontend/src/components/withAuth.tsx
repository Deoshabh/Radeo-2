import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

// This HOC wraps components that require authentication
export default function withAuth<P>(Component: React.ComponentType<P>, adminRequired: boolean = false) {
  const AuthComponent = (props: P) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const isLoading = status === 'loading';

    useEffect(() => {
      // If finished loading session and not authenticated
      if (!isLoading && !session) {
        router.replace({
          pathname: '/auth/signin',
          query: { callbackUrl: router.asPath }
        });
      }

      // If admin route and user is not an admin
      if (adminRequired && session?.user && !(session.user as any).isAdmin) {
        router.replace('/');
      }
    }, [isLoading, session, router, adminRequired]);

    // Show loading state or redirect if not authenticated
    if (isLoading || !session) {
      return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    // If authenticated (and admin if required), render the protected component
    return <Component {...props} />;
  };

  return AuthComponent;
} 