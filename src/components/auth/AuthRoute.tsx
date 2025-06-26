
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const AuthRoute = ({ children, adminOnly = false }: AuthRouteProps) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  console.log('AuthRoute check:', { user: user?.email, isAdmin, loading, adminOnly });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    console.log('Admin required but user is not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
