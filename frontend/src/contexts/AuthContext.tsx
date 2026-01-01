import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          console.log('🔍 Validating token...', token.substring(0, 20) + '...');
          const userData = await authApi.getCurrentUser();
          console.log('✅ Token valid, user loaded:', userData);
          setUser(userData);
        } catch (error: any) {
          console.error('❌ Failed to fetch user:', error);
          console.error('Error details:', {
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message,
            token: token?.substring(0, 20) + '...',
          });
          localStorage.removeItem('authToken');
        }
      } else {
        console.log('ℹ️ No token found in localStorage');
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const setToken = (token: string) => {
    localStorage.setItem('authToken', token);
    // Fetch user data after setting token
    authApi.getCurrentUser().then(setUser).catch(console.error);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('authToken');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        setToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
