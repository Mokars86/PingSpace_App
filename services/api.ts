
import { supabase } from "./supabase";
import { User, ChatSession, Transaction, Product, Space, Message, Story, CallLog } from '../types';
import { authService } from './auth';

/**
 * PINGSPACE ULTIMATE DATABASE SETUP (SQL)
 * 
 * -- 1. PROFILES TABLE
 * CREATE TABLE public.profiles (
 *   id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
 *   name TEXT,
 *   username TEXT UNIQUE,
 *   avatar TEXT,
 *   email TEXT,
 *   phone TEXT,
 *   status TEXT DEFAULT 'Available',
 *   bio TEXT,
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
 * );
 * 
 * -- 2. CALLS TABLE
 * CREATE TABLE public.calls (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users ON DELETE CASCADE,
 *   participant_id UUID REFERENCES public.profiles(id),
 *   type TEXT, -- incoming, outgoing, missed
 *   media_type TEXT, -- audio, video
 *   duration INTEGER, -- in seconds
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
 * );
 * 
 * -- 3. RLS POLICIES (CRITICAL FOR LOGIN)
 * ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
 * CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
 * CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
 */

const formatError = (error: any, prefix: string): string => {
  if (!error) return `${prefix}: Unknown error`;
  const message = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
  
  if (message.toLowerCase().includes('email not confirmed')) {
    return "Verification Required: Please check your email inbox (and spam) for the confirmation link.";
  }

  if (message.includes('column') && message.includes('does not exist')) {
    return `Schema Mismatch: The database is missing a required column. Please check the SQL migration notes in api.ts.`;
  }

  if (message.includes('relation') && message.includes('does not exist')) {
    return `Database Error: A required table is missing from your Supabase project.`;
  }

  if (message.includes('JWT') || message.includes('invalid claim')) {
    return "Session Expired: Please clear your browser cache/cookies or use the Reset Session tool.";
  }

  return `${prefix}: ${message}`;
};

export const api = {
  system: {
    diagnose: async () => {
      const results = {
        connection: false,
        auth: false,
        tables: { profiles: false, chats: false, messages: false, stories: false, products: false, spaces: false, transactions: false, calls: false },
        error: null as string | null
      };

      try {
        // Check connection & basic session
        const { data: { session }, error: authErr } = await supabase.auth.getSession();
        results.connection = true;
        results.auth = !authErr;

        // Check tables with row count (efficient check for table existence and RLS read permission)
        const checkTable = async (name: string) => {
          try {
            const { error } = await supabase.from(name).select('*', { count: 'exact', head: true }).limit(1);
            return !error || !error.message.includes('does not exist');
          } catch {
            return false;
          }
        };

        results.tables.profiles = await checkTable('profiles');
        results.tables.chats = await checkTable('chats');
        results.tables.messages = await checkTable('messages');
        results.tables.stories = await checkTable('stories');
        results.tables.products = await checkTable('products');
        results.tables.spaces = await checkTable('spaces');
        results.tables.transactions = await checkTable('transactions');
        results.tables.calls = await checkTable('calls');

      } catch (e: any) {
        results.error = e.message;
      }

      return results;
    }
  },
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(formatError(error, "Login failed"));

      // Get profile with robust fallback
      let profile = null;
      try {
        const { data: p, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
        
        if (p) {
          profile = p;
        } else if (!profileErr || profileErr.code === 'PGRST116') {
          // If no profile exists, attempt creation from metadata
          const metadata = data.user.user_metadata || {};
          const { data: newP } = await supabase.from('profiles').insert({
            id: data.user.id,
            name: metadata.name || email.split('@')[0],
            username: metadata.username || `user_${data.user.id.slice(0, 5)}`,
            avatar: metadata.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}`,
            email: email
          }).select().maybeSingle();
          
          if (newP) profile = newP;
        }
      } catch (e) {
        console.warn("Profile fetch/create failed, using auth metadata instead", e);
      }

      const p = profile as any;
      return {
        id: data.user.id,
        name: p?.name || data.user.user_metadata?.name || 'User',
        avatar: p?.avatar || data.user.user_metadata?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}`,
        isOnline: true,
        status: p?.status || 'Available',
        bio: p?.bio || ''
      };
    },
    signup: async (form: any): Promise<User> => {
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=ff1744&color=fff`;
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { 
          data: { 
            name: form.name, 
            username: form.username, 
            phone: form.phone,
            avatar: avatarUrl 
          } 
        }
      });
      if (error) throw new Error(formatError(error, "Signup failed"));
      if (!data.user) throw new Error("Signup failed: No user returned");
      return { id: data.user.id, name: form.name, avatar: avatarUrl, isOnline: true };
    },
    checkUsernameAvailability: async (username: string): Promise<boolean> => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') return true; 
        return !data;
      } catch (e) {
        return true; 
      }
    },
    resendConfirmationEmail: async (email: string): Promise<void> => {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw new Error(formatError(error, "Resend failed"));
    },
    socialLogin: async (provider: string): Promise<void> => {
      const { error } = await supabase.auth.signInWithOAuth({ provider: provider.toLowerCase() as any });
      if (error) throw new Error(formatError(error, "Social login failed"));
    },
    resetPassword: async (email: string): Promise<void> => {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw new Error(formatError(error, "Reset failed"));
    },
    me: async (): Promise<User> => {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Not authenticated");
      return user;
    },
    updateProfile: async (updates: Partial<User>): Promise<User> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No active session");
      
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.avatar !== undefined) payload.avatar = updates.avatar;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.bio !== undefined) payload.bio = updates.bio;

      const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id)
        .select()
        .maybeSingle();
        
      if (error) throw new Error(formatError(error, "Profile update failed"));
      const d = data as any;
      return { id: d.id, name: d.name, avatar: d.avatar, status: d.status, bio: d.bio, isOnline: true };
    },
    logout: async () => { await authService.logout(); }
  },
  contacts: {
    list: async (): Promise<User[]> => {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) throw error;
        return ((data || []) as any[]).map(d => ({ id: d.id, name: d.name, avatar: d.avatar, status: d.status, bio: d.bio, isOnline: false }));
      } catch (e) { return []; }
    }
  },
  chats: {
    list: async (): Promise<ChatSession[]> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        const { data: chatsData, error } = await supabase.from('chats').select(`*, messages(*)`).contains('members', [user.id]).order('last_message_time', { ascending: false });
        if (error) throw error;
        const chats = (chatsData || []) as any[];
        const otherUserIds = new Set<string>();
        chats.forEach(c => { if (!c.is_group) { const otherId = c.members.find((m: string) => m !== user.id); if (otherId) otherUserIds.add(otherId); } });
        const { data: profilesData } = await supabase.from('profiles').select('id, name, avatar, status, bio').in('id', Array.from(otherUserIds));
        const profiles = (profilesData || []) as any[];
        const profileMap = new Map(profiles.map(p => [p.id, p]));
        return chats.map(d => {
          let participant: User;
          if (d.is_group) { participant = { id: d.id, name: d.name, avatar: d.avatar }; } 
          else {
            const otherId = d.members.find((m: string) => m !== user.id);
            const p = profileMap.get(otherId) as any;
            participant = { id: otherId || 'unknown', name: p?.name || 'User', avatar: p?.avatar || `https://ui-avatars.com/api/?name=U`, status: p?.status, bio: p?.bio };
          }
          return {
            id: d.id, participant, lastMessage: d.last_message || '', lastTime: d.last_message_time ? new Date(d.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            unread: 0, messages: (d.messages || []).map((m: any) => ({ id: m.id, senderId: m.sender_id, text: m.text, type: m.type, timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), createdAt: new Date(m.created_at).getTime() })),
            isGroup: d.is_group, isPinned: d.is_pinned, disappearingMode: d.disappearing_mode
          };
        });
      } catch (e) { return []; }
    },
    createGroup: async (name: string, memberIds: string[]): Promise<ChatSession> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");
      const members = Array.from(new Set([...memberIds, user.id]));
      const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ff1744&color=fff`;
      const { data, error } = await supabase.from('chats').insert({ name, avatar, is_group: true, members, last_message: 'Group created' }).select().single();
      if (error) throw new Error(formatError(error, "Failed to create group"));
      const d = data as any;
      return { id: d.id, participant: { id: d.id, name: d.name, avatar: d.avatar }, lastMessage: d.last_message, lastTime: 'Just now', unread: 0, messages: [], isGroup: true };
    },
    createChat: async (contactId: string): Promise<ChatSession> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");
      const { data: existing } = await supabase.from('chats').select('*').eq('is_group', false).contains('members', [user.id, contactId]).maybeSingle();
      if (existing) {
        const { data: contact } = await supabase.from('profiles').select('*').eq('id', contactId).maybeSingle();
        const c = contact as any;
        const e = existing as any;
        return { id: e.id, participant: { id: contactId, name: c?.name || 'User', avatar: c?.avatar || '' }, lastMessage: e.last_message, lastTime: 'Now', unread: 0, messages: [], isGroup: false };
      }
      const members = [user.id, contactId];
      const { data: contact } = await supabase.from('profiles').select('*').eq('id', contactId).maybeSingle();
      const { data, error } = await supabase.from('chats').insert({ is_group: false, members, last_message: 'Started conversation' }).select().single();
      if (error) throw new Error(formatError(error, "Failed to start chat"));
      const d = data as any;
      const c = contact as any;
      return { id: d.id, participant: { id: contactId, name: c?.name || 'User', avatar: c?.avatar || `https://ui-avatars.com/api/?name=User` }, lastMessage: d.last_message, lastTime: 'Just now', unread: 0, messages: [], isGroup: false };
    },
    sendMessage: async (sessionId: string, text: string, type: Message['type'], metadata?: any): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");
      const { error } = await supabase.from('messages').insert({ chat_id: sessionId, sender_id: user.id, text, type, metadata });
      if (error) throw new Error(formatError(error, "Message failed"));
      await supabase.from('chats').update({ last_message: text || type, last_message_time: new Date().toISOString() }).eq('id', sessionId);
    },
    togglePin: async (chatId: string, isPinned: boolean): Promise<void> => {
      const { error } = await supabase.from('chats').update({ is_pinned: isPinned }).eq('id', chatId);
      if (error) throw new Error(formatError(error, "Failed to update pin state"));
    }
  },
  wallet: {
    getTransactions: async (): Promise<Transaction[]> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        const { data, error } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (error) throw error;
        return ((data || []) as any[]).map(d => ({ id: d.id, type: d.type, amount: d.amount, date: new Date(d.created_at).toLocaleDateString(), entity: d.entity }));
      } catch (e) { return []; }
    },
    transfer: async (recipient: string, amount: number): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");
      const { error } = await supabase.from('transactions').insert({ user_id: user.id, type: 'sent', amount, entity: recipient });
      if (error) throw new Error(formatError(error, "Transfer failed"));
    },
    deposit: async (amount: number, method: string): Promise<Transaction> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");
      const { data, error } = await supabase.from('transactions').insert({ user_id: user.id, type: 'deposit', amount, entity: method }).select().single();
      if (error) throw new Error(formatError(error, "Deposit failed"));
      const d = data as any;
      return { id: d.id, type: d.type, amount: d.amount, date: 'Just now', entity: d.entity };
    }
  },
  calls: {
    list: async (): Promise<CallLog[]> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        const { data, error } = await supabase
          .from('calls')
          .select('*, profiles!calls_participant_id_fkey(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return ((data || []) as any[]).map(d => ({
          id: d.id,
          participant: {
            id: d.profiles?.id || 'unknown',
            name: d.profiles?.name || 'Unknown User',
            avatar: d.profiles?.avatar || `https://ui-avatars.com/api/?name=U`,
          },
          type: d.type,
          mediaType: d.media_type,
          duration: d.duration,
          timestamp: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
          createdAt: new Date(d.created_at).getTime()
        }));
      } catch (e) { return []; }
    },
    save: async (log: Omit<CallLog, 'id' | 'timestamp' | 'createdAt'>): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");
      
      const { error } = await supabase.from('calls').insert({
        user_id: user.id,
        participant_id: log.participant.id,
        type: log.type,
        media_type: log.mediaType,
        duration: log.duration
      });
      
      if (error) throw new Error(formatError(error, "Failed to log neural transmission"));
    }
  },
  stories: {
    list: async (): Promise<Story[]> => {
      try {
        const { data, error } = await supabase.from('stories').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return ((data || []) as any[]).map(d => ({ id: d.id, userId: d.user_id, userName: d.user_name, userAvatar: d.user_avatar, type: 'image', content: d.image_url, timestamp: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), viewed: false, caption: d.caption }));
      } catch (e) { return []; }
    },
    addStory: async (image: string, caption: string): Promise<Story> => {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Unauthorized");
      const { data, error } = await supabase.from('stories').insert({ user_id: user.id, user_name: user.name, user_avatar: user.avatar, image_url: image, caption }).select().single();
      if (error) throw new Error(formatError(error, "Failed to share story"));
      const d = data as any;
      return { id: d.id, userId: d.user_id, userName: d.user_name, userAvatar: d.user_avatar, type: 'image', content: d.image_url, timestamp: 'Just now', viewed: false, caption: d.caption };
    }
  },
  spaces: {
    list: async (): Promise<Space[]> => {
      try {
        const { data, error } = await supabase.from('spaces').select('*');
        if (error) throw error;
        return ((data || []) as any[]).map(d => ({ id: d.id, name: d.name, members: d.member_count, image: d.image_url, description: d.description, joined: false }));
      } catch (e) { return []; }
    },
    create: async (formData: { name: string; description: string; image: string }): Promise<Space> => {
      const { data, error } = await supabase.from('spaces').insert({ name: formData.name, description: formData.description, image_url: formData.image, member_count: 1 }).select().single();
      if (error) throw new Error(formatError(error, "Failed to create space"));
      const d = data as any;
      return { id: d.id, name: d.name, members: d.member_count, image: d.image_url, description: d.description, joined: true };
    }
  },
  market: {
    getProducts: async (): Promise<Product[]> => {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        return ((data || []) as any[]).map(d => ({ id: d.id, title: d.title, price: d.price, image: d.image_url, seller: d.seller_name, rating: 4.5, description: d.description, category: d.category, condition: d.condition, location: d.location }));
      } catch (e) { return []; }
    }
  }
};
