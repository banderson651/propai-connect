
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type AuthRouteProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

export const AuthRoute = ({ children, requireAdmin = false }: AuthRouteProps) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    // Redirect to landing page if not authenticated
    return <Navigate to="/landing" state={{ from: location }} replace />;
  }
  
  if (requireAdmin && !isAdmin) {
    // Redirect to dashboard if not admin but admin is required
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};
