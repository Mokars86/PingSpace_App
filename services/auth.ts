import { supabase } from "./supabase";
import { User } from "../types";

/**
 * Auth Service
 * Handles real Supabase Authentication
 */

const mapUser = (sbUser: any, profile?: any): User => {
  return {
    id: sbUser.id,
    name: profile?.name || sbUser.user_metadata?.full_name || 'User',
    avatar: profile?.avatar_url || sbUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${sbUser.email}`,
    isOnline: true,
    status: profile?.status || 'Available'
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
    
    // Fetch profile extension
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return mapUser(user, profile);
  },

  isAuthenticated: async () => {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  },

  onAuthStateChanged: (callback: (user: User | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        callback(mapUser(session.user, profile));
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
