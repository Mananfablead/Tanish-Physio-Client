import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectCurrentUser } from '@/store/slices/authSlice';

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

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