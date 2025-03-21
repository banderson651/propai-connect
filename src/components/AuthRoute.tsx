import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const AuthRoute = ({ children, adminOnly = false }: AuthRouteProps) => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}; 