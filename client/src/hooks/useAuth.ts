import { useState, useEffect } from 'react';
import { authService, type User } from '@/lib/auth';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData) {
          console.log('User loaded from auth service:', userData.user);
          setUser(userData.user);
        } else {
          console.log('No user data from auth service');
        }
      } catch (error) {
        console.log('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for auth changes
    const handleAuthChange = (event: CustomEvent) => {
      console.log('Auth change detected:', event.detail);
      setUser(event.detail.user);
    };

    window.addEventListener('auth-changed', handleAuthChange as EventListener);
    loadUser();

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange as EventListener);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.user);
    return response;
  };

  const register = async (userData: any) => {
    const response = await authService.register(userData);
    setUser(response.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    window.location.href = '/driver/login';
  };

  const hasRole = (role: string): boolean => {
    return authService.hasRole(role);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    hasRole,
  };
}