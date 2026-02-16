import { useParams, Navigate } from 'react-router-dom';

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * GuestRoute - Wrapper for guest portal routes
 *
 * - Validates that a token exists in the URL
 * - Redirects to invalid link page if no token
 * - Token validation against the API is handled by the GuestPortal component itself
 */
const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { token } = useParams<{ token: string }>();

  // If no token in URL, redirect to invalid link page
  if (!token || token.trim() === '') {
    return <Navigate to="/invalid-link" replace />;
  }

  // Token exists, render the guest portal
  // API validation happens in the child component (GuestPortal)
  return <>{children}</>;
};

export default GuestRoute;
