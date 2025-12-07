
/**
 * Mock WebSocket Service
 * Simulates a real-time connection (e.g., Socket.io, Pusher).
 */

type Listener = (data: any) => void;

class MockSocket {
  private listeners: Record<string, Listener[]> = {};
  public connected: boolean = false;

  connect(token: string) {
    if (!token) {
      console.error('[Socket] Connection failed: No token provided');
      return;
    }
    // Simulate connection delay
    setTimeout(() => {
      this.connected = true;
      console.log('[Socket] Connected');
    }, 500);
  }

  disconnect() {
    this.connected = false;
    console.log('[Socket] Disconnected');
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
    console.log(`[Socket] Emitting event: ${event}`, payload);

    // SIMULATION: Echo specific events back to the client or trigger other events
    // to mimic a real server response.
    
    if (event === 'send_message') {
      // Simulate the server receiving the message and broadcasting it (or confirming it)
      // In a real app, we might get a 'new_message' event back
      setTimeout(() => {
        // Determine if we should trigger a bot response simulation here or let the API handle it.
        // For now, we assume the API update handles the local state, but the socket 
        // would push incoming messages from others.
      }, 200);
    }
  }

  // Helper to simulate receiving an event from the server
  simulateEvent(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}

export const socketService = new MockSocket();
