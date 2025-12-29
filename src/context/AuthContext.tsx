import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  name: string;
  image?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name: string, role?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (email: string, name: string, role: string = 'patient') => {
    const newUser = { 
      email, 
      name, 
      role,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}` 
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
