import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'driver' | 'restaurant' | 'admin';
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
  driver?: any;
  restaurant?: any;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  async register(userData: any): Promise<AuthResponse> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registrasi gagal');
    }

    const data = await response.json();
    this.setAuth(data.token, data.user);
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login gagal');
    }

    const data = await response.json();
    this.setAuth(data.token, data.user);
    return data;
  }

  async getCurrentUser(): Promise<AuthResponse | null> {
    if (!this.token) {
      console.log('getCurrentUser: no token');
      return null;
    }

    try {
      console.log('getCurrentUser: making request with token:', this.token.substring(0, 20) + '...');
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        console.log('getCurrentUser: response not ok:', response.status);
        this.logout();
        return null;
      }

      const data = await response.json();
      console.log('getCurrentUser: success, user:', data.user);
      this.user = data.user;
      return data;
    } catch (error) {
      console.log('getCurrentUser: error:', error);
      this.logout();
      return null;
    }
  }

  logout(): void {
    this.token = null;
    this.user = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private setAuth(token: string, user: User): void {
    this.token = token;
    this.user = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      console.log('Auth token saved:', token.substring(0, 20) + '...');
      console.log('User saved:', user);
      
      // Force refresh of auth state across the app
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user, token } }));
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  hasRole(role: string): boolean {
    return this.user?.role === role;
  }
}

export const authService = new AuthService();