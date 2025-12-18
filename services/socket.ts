import { db } from "./firebase";
import { collectionGroup, onSnapshot, query, where } from "firebase/firestore";

/**
 * Real-time Service (Firebase Firestore Listeners)
 * Replaces Socket with Firestore Snapshot listeners
 */

type Listener = (data: any) => void;

class RealtimeService {
  private listeners: Record<string, Listener[]> = {};
  private unsubscribers: (() => void)[] = [];
  public connected: boolean = false;

  connect(token: string) {
    if (this.connected) return;

    // Listen for global message updates across all chats
    const q = query(collectionGroup(db, 'messages'));
    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          this.emit('new_message', {
            sender: data.senderId,
            text: data.text,
            chatId: change.doc.ref.parent.parent?.id
          });
        }
      });
    });

    this.unsubscribers.push(unsub);
    this.connected = true;
  }

  disconnect() {
    this.unsubscribers.forEach(un => un());
    this.unsubscribers = [];
    this.connected = false;
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
    // In Firestore implementation, many "emits" (like typing) 
    // would be handled by writing to a dedicated 'presence' or 'typing' doc.
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(payload));
    }
  }
}

export const socketService = new RealtimeService();