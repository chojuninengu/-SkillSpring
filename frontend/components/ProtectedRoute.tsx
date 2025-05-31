import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser } from '../utils/supabaseAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles = [] }: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        
        if (!user) {
          router.push('/login');
          return;
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(user.user_metadata.role)) {
          router.push('/dashboard');
          return;
        }

        setIsLoading(false);
      } catch (error) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return <>{children}</>;
} 