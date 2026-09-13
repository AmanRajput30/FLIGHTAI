"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://flightai-backend.onrender.com';

export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  role: string;
  isEmailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let csrfPromise: Promise<string> | null = null;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Configure axios defaults globally for SSR/CSR cookies
  axios.defaults.withCredentials = true;

  const refreshUser = async () => {
    try {
      // 1. Fetch CSRF Token First (cached promise to prevent Strict Mode race conditions)
      if (!csrfPromise) {
        csrfPromise = axios.get(`${API_URL}/api/auth/csrf-token`).then(res => res.data.csrfToken);
      }
      const csrfToken = await csrfPromise;
      axios.defaults.headers.common['x-csrf-token'] = csrfToken;

      // 2. Fetch User
      const res = await axios.get(`${API_URL}/api/auth/me`);
      setUser(res.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // Simple route protection logic
  useEffect(() => {
    if (!loading) {
      const isAuthRoute = pathname.startsWith('/settings');
      if (isAuthRoute && !user) {
        router.push('/login');
      }
    }
  }, [user, loading, pathname, router]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`);
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
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
