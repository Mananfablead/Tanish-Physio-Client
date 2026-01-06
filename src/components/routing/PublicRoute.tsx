import { Navigate } from "react-router-dom";


const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  // Remove authentication check for now
  // In a real app, you would check authentication status here
  // For now, always render children
  
  return <>{children}</>;
};

export default PublicRoute;
