
import { User, ChatSession, Transaction, Product, Space, Message } from '../types';
import { authService } from './auth';

// --- MOCK DATABASE ---
const DB = {
  currentUser: {
    id: 'u1',
    name: 'Alex Nova',
    avatar: 'https://picsum.photos/200/200?random=1',
    isOnline: true
  } as User,

  chats: [
    {
      id: 'c1',
      participant: { id: 'ping-ai', name: 'PingAI', avatar: 'https://picsum.photos/200/200?random=99', isOnline: true },
      lastMessage: 'How can I assist you with your wallet today?',
      lastTime: 'Now',
      unread: 1,
      isPinned: true,
      messages: [
        { id: 'm0', senderId: 'ping-ai', text: 'Welcome to PingSpace! I am PingAI. How can I help?', timestamp: '10:00 AM', type: 'text' }
      ]
    },
    {
      id: 'c2',
      participant: { id: 'u2', name: 'Sarah Connor', avatar: 'https://picsum.photos/200/200?random=2', isOnline: false },
      lastMessage: 'Did you see the new drone on Marketplace?',
      lastTime: '2m',
      unread: 3,
      messages: [
          { id: 'm1', senderId: 'u2', text: 'Hey Alex!', timestamp: '9:30 AM', type: 'text' },
          { id: 'm2', senderId: 'u2', text: 'Did you see the new drone on Marketplace?', timestamp: '9:31 AM', type: 'text' }
      ]
    },
    {
      id: 'c3',
      participant: { id: 'u3', name: 'John Doe', avatar: 'https://picsum.photos/200/200?random=3', isOnline: true },
      lastMessage: 'Payment received. Thanks!',
      lastTime: '1h',
      unread: 0,
      messages: [
          { id: 'm3', senderId: 'u1', text: 'Here is my share for dinner.', timestamp: 'Yesterday', type: 'payment', metadata: { amount: 45.00, status: 'Completed' } },
          { id: 'm4', senderId: 'u3', text: 'Payment received. Thanks!', timestamp: 'Yesterday', type: 'text' }
      ]
    }
  ] as ChatSession[],

  products: [
    { id: 'p1', title: 'Vintage Camera', price: 120, image: 'https://picsum.photos/300/300?random=100', seller: 'RetroGuy', rating: 4.5 },
    { id: 'p2', title: 'Neon Sign - Custom', price: 85, image: 'https://picsum.photos/300/300?random=101', seller: 'LightWorks', rating: 4.8 },
    { id: 'p3', title: 'Gaming Headset', price: 55, image: 'https://picsum.photos/300/300?random=102', seller: 'GamerPro', rating: 4.2 },
    { id: 'p4', title: 'Mechanical Keyboard', price: 150, image: 'https://picsum.photos/300/300?random=103', seller: 'ClickClack', rating: 4.9 },
  ] as Product[],

  spaces: [
    { id: 's1', name: 'Cyberpunk Art', members: 12500, description: 'Digital art & neon vibes.', image: 'https://picsum.photos/400/200?random=200' },
    { id: 's2', name: 'Crypto Traders', members: 8400, description: 'Market analysis & signals.', image: 'https://picsum.photos/400/201?random=201' },
    { id: 's3', name: 'VR Enthusiasts', members: 3200, description: 'Oculus, Vive, & Metaverse.', image: 'https://picsum.photos/400/200?random=202' },
  ] as Space[],

  transactions: [
      { id: 't1', type: 'received', amount: 500, date: 'Today', entity: 'Freelance Gig' },
      { id: 't2', type: 'sent', amount: 45, date: 'Yesterday', entity: 'John Doe' },
      { id: 't3', type: 'withdraw', amount: 1000, date: '2 days ago', entity: 'Bank Transfer' },
      { id: 't4', type: 'deposit', amount: 200, date: 'Last Week', entity: 'PayPal' },
  ] as Transaction[]
};

// --- SIMULATED ASYNC API CALLS ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      await delay(800); // Simulate network
      // In a real backend, we'd hash check password here
      if (password === 'error') throw new Error('Invalid credentials');
      
      const token = 'mock_jwt_token_' + Date.now();
      authService.setSession(token, DB.currentUser);
      return DB.currentUser;
    },
    signup: async (data: any): Promise<User> => {
      await delay(1000);
      const token = 'mock_jwt_token_' + Date.now();
      authService.setSession(token, DB.currentUser);
      return DB.currentUser;
    },
    me: async (): Promise<User> => {
      await delay(400);
      // Check if token exists
      if (!authService.isAuthenticated()) throw new Error('Unauthorized');
      return DB.currentUser;
    },
    logout: async () => {
      await delay(200);
      authService.clearSession();
    }
  },

  chats: {
    list: async (): Promise<ChatSession[]> => {
      await delay(500);
      return [...DB.chats]; // Return copy
    },
    sendMessage: async (chatId: string, text: string, type: 'text' | 'image' | 'payment' = 'text', metadata?: any): Promise<Message> => {
      await delay(300);
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: DB.currentUser.id,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type,
        metadata
      };
      
      // Update Mock DB (in memory only for this session)
      const chatIndex = DB.chats.findIndex(c => c.id === chatId);
      if (chatIndex > -1) {
        DB.chats[chatIndex].messages.push(newMessage);
        DB.chats[chatIndex].lastMessage = text;
        DB.chats[chatIndex].lastTime = 'Now';
      }
      return newMessage;
    }
  },

  wallet: {
    getTransactions: async (): Promise<Transaction[]> => {
      await delay(600);
      return [...DB.transactions];
    },
    transfer: async (recipient: string, amount: number): Promise<Transaction> => {
      await delay(1000); // Secure transaction delay
      const newTx: Transaction = {
        id: Date.now().toString(),
        type: 'sent',
        amount,
        date: 'Just now',
        entity: recipient
      };
      DB.transactions.unshift(newTx);
      return newTx;
    }
  },

  market: {
    getProducts: async (): Promise<Product[]> => {
      await delay(500);
      return [...DB.products];
    }
  },
  
  spaces: {
    list: async (): Promise<Space[]> => {
      await delay(400);
      return [...DB.spaces];
    }
  }
};
