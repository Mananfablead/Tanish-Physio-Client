import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectCurrentUser } from '@/store/slices/authSlice';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  // If no user is authenticated, redirect to login
  if (!user) {
    // Redirect to login with the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;