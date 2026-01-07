'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('[AUTH] Error loading stored auth:', error);
      // Clear invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('[AUTH] Login attempt for:', email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        cache: 'no-store',
      });

      // Parse response
      const data = await response.json();

      if (!response.ok) {
        console.error('[AUTH] Login failed:', data.error);
        throw new Error(data.error || 'Inloggning misslyckades');
      }

      // Validate response structure
      if (!data.user || !data.token) {
        console.error('[AUTH] Invalid response structure:', data);
        throw new Error('Ogiltigt svar från servern');
      }

      console.log('[AUTH] Login successful');
      
      // Update state
      setUser(data.user);
      setToken(data.token);
      
      // Store in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
    } catch (error) {
      console.error('[AUTH] Login error:', error);
      
      // Re-throw with user-friendly message
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Ett oväntat fel uppstod vid inloggning');
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    try {
      console.log('[AUTH] Register attempt for:', email);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        cache: 'no-store',
      });

      // Parse response
      const data = await response.json();

      if (!response.ok) {
        console.error('[AUTH] Registration failed:', data.error);
        throw new Error(data.error || 'Registrering misslyckades');
      }

      // Validate response structure
      if (!data.user || !data.token) {
        console.error('[AUTH] Invalid response structure:', data);
        throw new Error('Ogiltigt svar från servern');
      }

      console.log('[AUTH] Registration successful');
      
      // Update state
      setUser(data.user);
      setToken(data.token);
      
      // Store in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
    } catch (error) {
      console.error('[AUTH] Registration error:', error);
      
      // Re-throw with user-friendly message
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Ett oväntat fel uppstod vid registrering');
    }
  };

  const logout = (): void => {
    console.log('[AUTH] Logging out');
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
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
