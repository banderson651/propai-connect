
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type AuthRouteProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

export const AuthRoute = ({ children, requireAdmin = false }: AuthRouteProps) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  
  // When auth is loading, show nothing or a loading spinner
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
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
