import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectCurrentUser, selectAuthLoading } from '@/store/slices/authSlice';

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const user = useSelector(selectCurrentUser);
  const isLoading = useSelector(selectAuthLoading);
  const location = useLocation();

  // Show loading state while authentication is being checked
  // This prevents incorrect redirects when the store is still loading after page refresh
  if (isLoading && !user) {
    // Show a loading indicator while auth status is being determined
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If user is authenticated, redirect to home (or dashboard)
  if (user) {
    // Avoid redirecting to protected routes like login/register if coming from there
    if (location.pathname === '/login' || location.pathname === '/register') {
      return <Navigate to="/" replace />;
    }
    // For other cases where user is already logged in
    // return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default PublicRoute;