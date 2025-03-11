
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Define user type
type User = {
  email: string;
  name: string;
  role: 'user' | 'admin';
} | null;

// Define auth context type
type AuthContextType = {
  user: User;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const navigate = useNavigate();
  
  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user from localStorage', error);
        localStorage.removeItem('user');
      }
    }
  }, []);
  
  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    // This is a demo implementation, in a real app this would call an API
    if ((email === 'user@propai.com' && password === 'demouser123') || 
        (email === 'admin@propai.com' && password === 'demoadmin123')) {
      const isAdmin = email === 'admin@propai.com';
      const userData = { 
        email, 
        role: isAdmin ? 'admin' : 'user' as 'admin' | 'user',
        name: isAdmin ? 'Admin User' : 'Demo User'
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }
    return false;
  };
  
  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  // Context value
  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
