import { supabase } from "./supabase";

/**
 * Real-time Service (Supabase Realtime)
 * Replaces Firestore listeners with Postgres Change Streams
 */

type Listener = (data: any) => void;

class RealtimeService {
  private listeners: Record<string, Listener[]> = {};
  private channel: any = null;
  public connected: boolean = false;

  connect(token: string) {
    if (this.channel) return;

    this.channel = supabase
      .channel('public_room')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        this.emit('new_message', {
          sender: 'New Message',
          text: payload.new.text,
          chatId: payload.new.chat_id
        });
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        this.emit('typing_status', payload.payload);
      })
      .subscribe((status) => {
        this.connected = status === 'SUBSCRIBED';
      });
  }

  disconnect() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  on(event: string, callback: Listener) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Listener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, payload: any) {
    if (event === 'typing_status' && this.channel) {
       this.channel.send({
         type: 'broadcast',
         event: 'typing',
         payload
       });
    }

    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(payload));
    }
  }
}

export const socketService = new RealtimeService();
