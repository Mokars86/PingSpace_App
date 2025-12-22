
import { supabase } from "./supabase";
import { User } from "../types";

/**
 * Auth Service
 * Handles Supabase Authentication
 */

const mapUser = (sbUser: any, profile?: any): User => {
  return {
    id: sbUser.id,
    name: profile?.name || sbUser.user_metadata?.name || 'User',
    avatar: profile?.avatar || sbUser.user_metadata?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sbUser.email || 'User')}`,
    isOnline: true,
    status: profile?.status || 'Available',
    bio: profile?.bio || ''
  };
};

export const authService = {
  getToken: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  },

  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Fetch profile extension from 'profiles' table safely
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return mapUser(user, profile);
  },

  isAuthenticated: async () => {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  },

  onAuthStateChanged: (callback: (user: User | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          // If we just signed up, wait a tiny bit for the trigger to finish
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
            callback(mapUser(session.user, profile));
          } else {
            callback(mapUser(session.user));
          }
        } catch (e) {
          callback(mapUser(session.user));
        }
      } else {
        callback(null);
      }
    });

    return () => subscription.unsubscribe();
  },

  logout: async () => {
    await supabase.auth.signOut();
  }
};
