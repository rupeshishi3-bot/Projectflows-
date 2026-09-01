import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { authService, AuthSessionUser } from '../services/authService';
import { isSupabaseConfigured, getSupabaseClient } from '../lib/supabase';

interface AuthContextType {
  user: AuthSessionUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthSessionUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const configured = isSupabaseConfigured();

  const loadSession = async () => {
    try {
      setLoading(true);
      const session = await authService.getCurrentSession();
      setUser(session.user);
      setProfile(session.profile);
    } catch (err) {
      console.error('Failed to load auth session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();

    if (configured) {
      const client = getSupabaseClient()!;
      const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const u = session.user as unknown as AuthSessionUser;
          setUser(u);
          const p = await authService.getProfile(u.id);
          setProfile(p);
        } else {
          setUser(null);
          setProfile(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [configured]);

  const signIn = async (email: string, password?: string) => {
    const res = await authService.signIn(email, password);
    if (res.error) {
      return { success: false, error: res.error };
    }
    if (res.user) {
      setUser(res.user);
      const p = await authService.getProfile(res.user.id);
      setProfile(p);
      return { success: true };
    }
    return { success: false, error: 'Sign in failed' };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const res = await authService.signUp(email, password, fullName);
    if (res.error) {
      return { success: false, error: res.error };
    }
    if (res.user) {
      setUser(res.user);
      const p = await authService.getProfile(res.user.id);
      setProfile(p);
      return { success: true };
    }
    return { success: false, error: 'Sign up failed' };
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
    if (!user) return;
    const updated = await authService.updateProfile(user.id, updates);
    if (updated) {
      setProfile(updated);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const p = await authService.getProfile(user.id);
    if (p) setProfile(p);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isConfigured: configured,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
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
