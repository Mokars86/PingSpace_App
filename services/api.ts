import { supabase, isSupabaseConfigured } from "./supabase";
import { User, ChatSession, Transaction, Product, Space, Message, Story } from '../types';
import { authService } from './auth';

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      if (!isSupabaseConfigured()) throw new Error("Supabase is not configured. Please check your environment variables.");
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (pError && pError.code !== 'PGRST116') console.error("Profile fetch error:", pError);

      return {
        id: data.user.id,
        name: profile?.name || data.user.user_metadata?.full_name || 'User',
        avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}`,
        isOnline: true
      };
    },
    signup: async (form: any): Promise<User> => {
      if (!isSupabaseConfigured()) throw new Error("Supabase URL/Key missing. Check environment variables.");

      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { 
            full_name: form.name,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=ff1744&color=fff`
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error("Signup failed: No user data returned.");

      // Check if session exists (if email confirmation is disabled)
      // If email confirmation is ENABLED, the user must click the link before they can 'sign in'
      // and before we can reliably write to the 'profiles' table via the frontend (unless RLS allows it).
      
      try {
        const newUserProfile = {
          id: data.user.id,
          name: form.name,
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=ff1744&color=fff`,
          status: 'Hey there! I am using PingSpace.'
        };
        
        // We attempt to insert, but in production, a SQL trigger on 'auth.users' is the preferred way.
        const { error: pError } = await supabase.from('profiles').upsert(newUserProfile);
        if (pError) console.warn("Note: Profile creation via frontend failed (this is normal if Email Confirmation is ON). Error:", pError.message);
      } catch (err) {
        console.error("Profile insert exception:", err);
      }

      return {
        id: data.user.id,
        name: form.name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}`,
        isOnline: true
      };
    },
    socialLogin: async (provider: any): Promise<User> => {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) throw error;
      throw new Error("Redirecting to OAuth...");
    },
    me: async (): Promise<User> => {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Not authenticated");
      return user;
    },
    updateProfile: async (updates: Partial<User>): Promise<User> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");
      
      const sbUpdates: any = {};
      if (updates.name) sbUpdates.name = updates.name;
      if (updates.avatar) sbUpdates.avatar_url = updates.avatar;
      if (updates.status) sbUpdates.status = updates.status;

      const { data, error } = await supabase
        .from('profiles')
        .update(sbUpdates)
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      return { ...updates, id: user.id, name: data.name, avatar: data.avatar_url } as User;
    },
    logout: async () => {
      await authService.logout();
    }
  },

  chats: {
    list: async (): Promise<ChatSession[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          messages(id, text, type, created_at, sender_id)
        `)
        .contains('members', [user.id])
        .order('last_message_time', { ascending: false });

      if (error) throw error;

      return (data || []).map(chat => ({
        id: chat.id,
        participant: chat.is_group ? { id: chat.id, name: chat.name, avatar: chat.avatar } : { id: 'other', name: 'User', avatar: '' },
        lastMessage: chat.last_message,
        lastTime: chat.last_message_time ? new Date(chat.last_message_time).toLocaleTimeString() : '',
        unread: 0,
        messages: chat.messages || [],
        isGroup: chat.is_group,
        disappearingMode: chat.disappearing_mode
      }));
    },
    sendMessage: async (chatId: string, text: string, type: Message['type'] = 'text', metadata?: any, replyTo?: any, expiresAt?: number): Promise<Message> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const { data, error } = await supabase.from('messages').insert({
        chat_id: chatId,
        sender_id: user.id,
        text,
        type,
        metadata,
        reply_to: replyTo,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null
      }).select().single();

      if (error) throw error;

      await supabase.from('chats').update({
        last_message: text,
        last_message_time: new Date().toISOString()
      }).eq('id', chatId);

      return data;
    },
    createGroup: async (name: string, participantIds: string[]): Promise<ChatSession> => {
      const { data: { user } } = await supabase.auth.getUser();
      const allMembers = [user!.id, ...participantIds];
      
      const { data, error } = await supabase.from('chats').insert({
        name,
        is_group: true,
        members: allMembers,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`
      }).select().single();

      if (error) throw error;
      return { id: data.id, participant: { id: data.id, name, avatar: data.avatar }, messages: [], lastMessage: '', lastTime: '', unread: 0, isGroup: true };
    }
  },

  contacts: {
    list: async (): Promise<User[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('profiles').select('*').neq('id', user?.id);
      return (data || []).map(p => ({ id: p.id, name: p.name, avatar: p.avatar_url, status: p.status, isOnline: true }));
    }
  },

  wallet: {
    getTransactions: async (): Promise<Transaction[]> => {
      const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
      return (data || []).map(t => ({ id: t.id, type: t.type, amount: t.amount, date: t.created_at, entity: t.entity }));
    },
    transfer: async (recipient: string, amount: number) => {
      await supabase.from('transactions').insert({ type: 'sent', amount, entity: recipient });
    },
    withdraw: async (amount: number, method: string) => {
      await supabase.from('transactions').insert({ type: 'withdraw', amount, entity: method });
    },
    deposit: async (amount: number, method: string) => {
       const { data, error } = await supabase.from('transactions').insert({ type: 'deposit', amount, entity: method }).select().single();
       if (error) throw error;
       return data;
    }
  },

  market: {
    getProducts: async (): Promise<Product[]> => {
      const { data } = await supabase.from('products').select('*');
      return data || [];
    },
    addProduct: async (productData: Partial<Product>) => {
      const { data, error } = await supabase.from('products').insert(productData).select().single();
      if (error) throw error;
      return data;
    }
  },
  
  spaces: {
    list: async (): Promise<Space[]> => {
      const { data } = await supabase.from('spaces').select('*');
      return data || [];
    },
    create: async (data: Partial<Space>) => {
      const { data: res, error } = await supabase.from('spaces').insert(data).select().single();
      if (error) throw error;
      return res;
    },
    join: async (id: string) => {
      // Junction logic here
    }
  },

  stories: {
    list: async (): Promise<Story[]> => {
      const { data } = await supabase.from('stories').select('*, profiles(name, avatar_url)');
      return (data || []).map(s => ({
        id: s.id,
        userId: s.user_id,
        userName: s.profiles?.name || 'User',
        userAvatar: s.profiles?.avatar_url || '',
        image: s.image_url,
        timestamp: s.created_at,
        viewed: false,
        caption: s.caption
      }));
    },
    addStory: async (image: string, caption?: string) => {
       const { data: { user } } = await supabase.auth.getUser();
       const { data, error } = await supabase.from('stories').insert({ user_id: user?.id, image_url: image, caption }).select().single();
       if (error) throw error;
       return data;
    }
  }
};
