import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';
import { localDb } from './localStore';

export interface AuthSessionUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export const authService = {
  async getCurrentSession(): Promise<{ user: AuthSessionUser | null; profile: UserProfile | null }> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data: { session }, error } = await client.auth.getSession();
      if (error || !session) return { user: null, profile: null };

      const user = session.user as unknown as AuthSessionUser;
      const profile = await this.getProfile(user.id);
      return { user, profile };
    } else {
      // Local fallback session
      const savedUser = typeof window !== 'undefined' ? localStorage.getItem('SP_LOCAL_USER') : null;
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser) as AuthSessionUser;
          const profile = localDb.getProfile(u.id);
          return { user: u, profile };
        } catch {
          // invalid json
        }
      }
      // Default to demo user
      const demoProfile = localDb.getProfile('demo-user-001');
      if (demoProfile) {
        return {
          user: { id: demoProfile.id, email: demoProfile.email, user_metadata: { full_name: demoProfile.full_name, avatar_url: demoProfile.avatar_url } },
          profile: demoProfile,
        };
      }
      return { user: null, profile: null };
    }
  },

  async signUp(email: string, password: string, fullName: string): Promise<{ user: AuthSessionUser | null; error?: string }> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        // Upsert profile directly in case DB trigger takes time
        await client.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
        });
        return { user: data.user as unknown as AuthSessionUser };
      }
      return { user: null, error: 'Registration failed. Check email confirmation if enabled.' };
    } else {
      // Local engine signup
      const userId = 'user-' + Math.random().toString(36).substring(2, 9);
      const newProfile = localDb.upsertProfile({
        id: userId,
        email,
        full_name: fullName,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      });

      const user: AuthSessionUser = {
        id: newProfile.id,
        email: newProfile.email,
        user_metadata: {
          full_name: newProfile.full_name,
          avatar_url: newProfile.avatar_url,
        },
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('SP_LOCAL_USER', JSON.stringify(user));
      }

      // Automatically create a default workspace for new local user
      localDb.createWorkspace(`${fullName}'s Workspace`, 'Primary team workspace', userId);

      return { user };
    }
  },

  async signIn(email: string, password?: string): Promise<{ user: AuthSessionUser | null; error?: string }> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password: password || '',
      });

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: data.user as unknown as AuthSessionUser };
    } else {
      // Local engine signin
      let profile = localDb.getAllProfiles().find(p => p.email.toLowerCase() === email.toLowerCase());
      if (!profile) {
        // If not found in local mock, create it dynamically
        const newId = 'user-' + Math.random().toString(36).substring(2, 9);
        profile = localDb.upsertProfile({
          id: newId,
          email,
          full_name: email.split('@')[0],
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
        });
        localDb.createWorkspace(`${profile.full_name}'s Workspace`, 'Primary workspace', profile.id);
      }

      const user: AuthSessionUser = {
        id: profile.id,
        email: profile.email,
        user_metadata: {
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
        },
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('SP_LOCAL_USER', JSON.stringify(user));
      }

      return { user };
    }
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      await client.auth.signOut();
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('SP_LOCAL_USER');
      }
    }
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) return null;
      return data as UserProfile;
    } else {
      return localDb.getProfile(userId);
    }
  },

  async updateProfile(userId: string, updates: { full_name?: string; avatar_url?: string }): Promise<UserProfile | null> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      const { data, error } = await client
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as UserProfile;
    } else {
      const p = localDb.getProfile(userId);
      if (!p) return null;
      return localDb.upsertProfile({
        ...p,
        ...updates,
      });
    }
  },
};
