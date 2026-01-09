import React, { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout as logoutAction, fetchProfile } from '../store/slices/authSlice';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch: AppDispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Initialize profile on mount if user is authenticated
  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchProfile());
    }
  }, [isAuthenticated, user, dispatch]);

  // Mock login function for compatibility - in real app, use the Redux auth
  const login = (email: string, name: string, role: string = 'patient') => {
    console.warn('Direct login called - use Redux actions instead');
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
