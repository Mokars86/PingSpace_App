
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";
import { auth } from "./firebase";

/**
 * Real-time Service (Replacing Mock Socket)
 * Uses Firestore onSnapshot listeners to mimic the previous socket interface.
 */

type Listener = (data: any) => void;

class RealtimeService {
  private listeners: Record<string, Listener[]> = {};
  private unsubscribes: Record<string, () => void> = {};
  public connected: boolean = true;

  connect(token: string) {
    // Firestore handles connection automatically, but we can set up global listeners here
    // Example: Listen for new messages in ALL user's chats
    this.setupGlobalMessageListener();
  }

  disconnect() {
    // Unsubscribe from all Firestore listeners
    Object.values(this.unsubscribes).forEach(unsub => unsub());
    this.unsubscribes = {};
  }

  // Set up a listener for specific chats when the user opens them
  // This logic normally lives in React hooks, but we are adapting the existing service pattern
  setupGlobalMessageListener() {
    const user = auth.currentUser;
    if (!user) return;

    // In a real optimized app, we wouldn't listen to ALL chats at root level for messages
    // We would listen to the 'chats' collection for metadata updates (unread counts)
    const q = query(
      collection(db, "chats"), 
      where("members", "array-contains", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
          const data = change.doc.data();
          // Emit event if the last message was updated and it wasn't sent by me
          // This triggers the "New Message" notification toast
          if (data.lastMessageTime) {
             // We'd need more complex logic to know WHO sent it to avoid notifying yourself
             // For now, we simulate the event
             this.simulateEvent('new_message', { 
               sender: 'Someone', // In real app, fetch sender name
               text: data.lastMessage 
             });
          }
        }
      });
    });
    
    this.unsubscribes['global_chats'] = unsub;
  }

  on(event: string, callback: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Listener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, payload: any) {
    // With Firestore, we don't "emit" to send data. 
    // Data is sent via api.chats.sendMessage().
    // We update local state immediately via optimistic UI in App.tsx
    console.log(`[Realtime] Action: ${event}`, payload);
    
    if (event === 'typing_status') {
       // Here you would write to a Realtime Database node (user/typing)
       // Skipping for this implementation phase
    }
  }

  simulateEvent(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}

export const socketService = new RealtimeService();
