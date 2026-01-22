import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectCurrentUser, selectAuthLoading } from '@/store/slices/authSlice';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const user = useSelector(selectCurrentUser);
  const isLoading = useSelector(selectAuthLoading);
  const location = useLocation();

  // Show loading state while authentication is being checked
  // This prevents redirecting when the store is still loading after page refresh
  if (isLoading && !user) {
    // Show a loading indicator while auth status is being determined
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If no user is authenticated after loading is complete, redirect to login
  if (!user) {
    // Redirect to login with the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;