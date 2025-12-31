import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
