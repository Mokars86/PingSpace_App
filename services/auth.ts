
import { supabase } from "./supabase";
import { User } from "../types";

/**
 * Auth Service
 * Handles Supabase Authentication and Profile Mapping
 */

export const authService = {
  /**
   * Maps a Supabase Auth User + Optional Profile Record to our app's User type.
   * Prioritizes Profile table data, falls back to Auth metadata.
   */
  mapUser: (sbUser: any, profile?: any): User => {
    // metadata is stored in user_metadata during signUp
    const meta = sbUser.user_metadata || {};
    
    return {
      id: sbUser.id,
      name: profile?.name || meta.name || 'PingSpace User',
      avatar: profile?.avatar || meta.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sbUser.email || 'PS')}&background=ff1744&color=fff`,
      isOnline: true,
      status: profile?.status || 'Available',
      bio: profile?.bio || meta.bio || ''
    };
  },

  getToken: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  },

  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    try {
      // Fetch profile extension from 'profiles' table safely
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      return authService.mapUser(user, profile);
    } catch (e) {
      console.warn("Failed to fetch profile table, using metadata fallback", e);
      return authService.mapUser(user);
    }
  },

  isAuthenticated: async () => {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  },

  onAuthStateChanged: (callback: (user: User | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          // On login or change, try to get the full profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          callback(authService.mapUser(session.user, profile));
        } catch (e) {
          // Fallback to auth data if database query fails (e.g. table not ready)
          callback(authService.mapUser(session.user));
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
