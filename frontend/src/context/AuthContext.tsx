import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { message } from 'antd';
import { adminApi } from '../services/admin.api';
import type { Wedding } from '../types/wedding.types';

interface Admin {
  id: number;
  email: string;
  weddingId: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  admin: Admin | null;
  wedding: Wedding | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateWedding: (wedding: Wedding) => void;
  refreshWedding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeddingData = useCallback(async () => {
    try {
      const weddingData = await adminApi.getWedding();
      setWedding(weddingData);
      return weddingData;
    } catch (error) {
      console.error('Failed to fetch wedding data:', error);
      throw error;
    }
  }, []);

  const restoreSession = useCallback(async () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Verify token and get admin info
      const adminData = await adminApi.getMe();
      setAdmin({
        id: adminData.id,
        email: adminData.email,
        weddingId: adminData.wedding_id,
      });

      // Fetch wedding data
      await fetchWeddingData();

      setIsAuthenticated(true);
    } catch (error) {
      // Token is invalid or expired
      console.error('Session restoration failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('wedding_id');
      setIsAuthenticated(false);
      setAdmin(null);
      setWedding(null);
    } finally {
      setLoading(false);
    }
  }, [fetchWeddingData]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      const response = await adminApi.login({ email, password });

      // Store token
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('wedding_id', response.wedding_id.toString());

      // Set admin info
      setAdmin({
        id: response.admin_id,
        email: email,
        weddingId: response.wedding_id,
      });

      // Fetch wedding data
      await fetchWeddingData();

      setIsAuthenticated(true);
      message.success('Welcome back!');

      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      message.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('wedding_id');
    setIsAuthenticated(false);
    setAdmin(null);
    setWedding(null);
    message.info('You have been logged out.');
  };

  const updateWedding = (updatedWedding: Wedding) => {
    setWedding(updatedWedding);
  };

  const refreshWedding = async () => {
    await fetchWeddingData();
  };

  const value: AuthContextType = {
    isAuthenticated,
    admin,
    wedding,
    loading,
    login,
    logout,
    updateWedding,
    refreshWedding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
