import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../Common/LoadingScreen';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * PublicRoute - Wrapper for routes that should only be accessible when NOT logged in
 *
 * - Used for login and registration pages
 * - Redirects to admin dashboard if user is already authenticated
 * - Shows loading spinner while checking auth state
 */
const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = '/admin'
}) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <LoadingScreen
        message="Loading"
        fullScreen
      />
    );
  }

  // If already authenticated, redirect to admin or the page they came from
  if (isAuthenticated) {
    const from = (location.state as { from?: string })?.from || redirectTo;
    return <Navigate to={from} replace />;
  }

  // User is not authenticated, render the public content (login, register, etc.)
  return <>{children}</>;
};

export default PublicRoute;
