import { Navigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Remove authentication check for now
  // In a real app, you would check authentication status here
  // For now, always render children
  
  // const isAuthenticated = true; // Mock value
  
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     toast({
  //       title: "Authentication Required",
  //       description: "Please login to access this page.",
  //       variant: "destructive",
  //     });
  //   }
  // }, [isAuthenticated, toast]);
  
  // if (!isAuthenticated) {
  //   return <Navigate to="/" replace />;
  // }

  return <>{children}</>;
};

export default ProtectedRoute;
