import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../Common/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute - Wrapper component for routes that require authentication
 *
 * - Checks if user is authenticated via AuthContext
 * - Shows loading spinner while checking auth state
 * - Redirects to login page if not authenticated
 * - Preserves the intended destination for redirect after login
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/admin/login'
}) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <LoadingScreen
        message="Verifying your session"
        fullScreen
      />
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
