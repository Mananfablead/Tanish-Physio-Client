import React, { createContext, useContext, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import {
  logout as logoutAction,
  fetchProfile,
} from "../store/slices/authSlice";
import {
  createTokenExpirationWatcher,
  // createTokenExpirationInterceptor,
} from "../utils/tokenExpiration";
import api from "../lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  phone?: string;
  image?: string;
  healthProfile?: any;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name: string, role?: string) => void; // Keeping for compatibility
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { user, isAuthenticated, token } = useSelector(
    (state: RootState) => state.auth
  );
  const watcherRef = useRef<(() => void) | null>(null);

  // Initialize profile on mount if user is authenticated
  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchProfile());
    }
  }, [isAuthenticated, user, dispatch]);

  // Setup token expiration watcher
  useEffect(() => {
    // Clean up previous watcher
    if (watcherRef.current) {
      watcherRef.current();
      watcherRef.current = null;
    }

    // Set up new watcher if authenticated
    if (isAuthenticated && token) {
      watcherRef.current = createTokenExpirationWatcher(token, () => {
        console.log("Token expired, logging out automatically");
        dispatch(logoutAction());
      });
    }

    // Clean up on unmount
    return () => {
      if (watcherRef.current) {
        watcherRef.current();
        watcherRef.current = null;
      }
    };
  }, [isAuthenticated, token, dispatch]);

  // Setup API interceptor for token expiration
  // useEffect(() => {
  //   const interceptor = createTokenExpirationInterceptor(() => {
  //     console.log("API 401 error - token expired, logging out automatically");
  //     dispatch(logoutAction());
  //   });

  //   // Add interceptor to API instance
  //   const requestInterceptor = api.interceptors.response.use(
  //     (response) => response,
  //     interceptor
  //   );

  //   // Clean up interceptor on unmount
  //   return () => {
  //     api.interceptors.response.eject(requestInterceptor);
  //   };
  // }, [dispatch]);

  // Mock login function for compatibility - in real app, use the Redux auth
  const login = (email: string, name: string, role: string = "patient") => {
    console.warn("Direct login called - use Redux actions instead");
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
