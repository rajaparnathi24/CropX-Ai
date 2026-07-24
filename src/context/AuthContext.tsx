'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { apiService, clearAuthToken } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Omit<User, 'id' | 'createdAt'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_DB_KEY = 'cropx_users_db_v1';
const CURRENT_USER_KEY = 'cropx_current_user_v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check backend for active profile or restore from localStorage
    const initAuth = async () => {
      try {
        const profile = await apiService.auth.getProfile();
        setUser(profile);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
      } catch {
        const storedUser = localStorage.getItem(CURRENT_USER_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      try {
        const { user: backendUser } = await apiService.auth.login(email, password);
        if (backendUser) {
          setUser(backendUser);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(backendUser));
          setIsLoading(false);
          return true;
        }
      } catch {
        // Fallback local authentication
        const usersDbStr = localStorage.getItem(USERS_DB_KEY);
        const usersDb: Array<User & { password: string }> = usersDbStr
          ? JSON.parse(usersDbStr)
          : [];

        const foundUser = usersDb.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (foundUser) {
          const { password: _, ...cleanUser } = foundUser;
          setUser(cleanUser);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(cleanUser));
          setIsLoading(false);
          return true;
        }
      }
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const signup = async (
    userData: Omit<User, 'id' | 'createdAt'> & { password: string }
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      try {
        const { user: backendUser } = await apiService.auth.signup(userData);
        if (backendUser) {
          setUser(backendUser);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(backendUser));
          setIsLoading(false);
          return true;
        }
      } catch {
        // Local user database fallback
        const newUser: User = {
          id: `user-${Date.now()}`,
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          state: userData.state,
          district: userData.district,
          primaryCrop: userData.primaryCrop || 'Rice',
          createdAt: new Date().toISOString(),
        };

        const usersDbStr = localStorage.getItem(USERS_DB_KEY);
        const usersDb: Array<User & { password: string }> = usersDbStr ? JSON.parse(usersDbStr) : [];

        if (usersDb.some((u) => u.email.toLowerCase() === userData.email.toLowerCase())) {
          setIsLoading(false);
          return false;
        }

        usersDb.push({ ...newUser, password: userData.password });
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDb));

        setUser(newUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
        return true;
      }
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    clearAuthToken();
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
