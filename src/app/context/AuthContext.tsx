'use client';

import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useRouter } from 'next/navigation';

// Define the User type
interface User {
  email: string;
  firstName: string;
  lastName: string;
  role: 'Admin' | 'Employee' | 'Customer';
}

// Define the Context shape
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  // We'll let the login page handle the login API call
  // But the context will provide a way to set the user after login
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // The browser automatically sends the HttpOnly cookie
        const response = await fetch('http://localhost:5001/api/Auth/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // IMPORTANT: This sends the cookie
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []); // Empty array means this runs once on mount

  const logout = async () => {
    try {
      await fetch('http://localhost:5001/api/Auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear user state regardless of API call success
      setUser(null);
      // Redirect to login page
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};