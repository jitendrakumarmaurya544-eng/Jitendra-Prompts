import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.ts';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { signInWithPopup, signOut as fbSignOut } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { fullName?: string; bio?: string; website?: string; avatarUrl?: string }) => Promise<{ success: boolean; error?: string }>;
  stats: { favorites: number; saved: number; created: number; views: number };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jp_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ favorites: 0, saved: 0, created: 0, views: 0 });

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.stats) setStats(data.stats);
      } else {
        // Token invalid
        localStorage.removeItem('jp_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Fetch me error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      localStorage.setItem('jp_token', data.token);
      setToken(data.token);
      setUser(data.user);
      await fetchCurrentUser(data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const register = async (fullName: string, username: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      localStorage.setItem('jp_token', data.token);
      setToken(data.token);
      setUser(data.user);
      await fetchCurrentUser(data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await result.user.getIdToken();
      const res = await fetch('/api/auth/firebase-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Google login failed' };
      }
      localStorage.setItem('jp_token', data.token);
      setToken(data.token);
      setUser(data.user);
      await fetchCurrentUser(data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google login failed' };
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('jp_token');
    setToken(null);
    setUser(null);
    setStats({ favorites: 0, saved: 0, created: 0, views: 0 });
  };

  const refreshUser = async () => {
    if (token) await fetchCurrentUser(token);
  };

  const updateProfile = async (profileData: {
    fullName?: string;
    bio?: string;
    website?: string;
    avatarUrl?: string;
  }) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update profile' };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser,
        updateProfile,
        stats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
