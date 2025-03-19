
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

type AuthRouteProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

export const AuthRoute = ({ children, requireAdmin = false }: AuthRouteProps) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  
  // When auth is loading, show a better loading spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span className="font-playfair">Verifying authentication...</span>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (requireAdmin && !isAdmin) {
    // Redirect to dashboard if not admin but admin is required
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};
