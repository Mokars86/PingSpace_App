

import { User, ChatSession, Transaction, Product, Space, Message, Story } from '../types';
import { authService } from './auth';

// --- MOCK DATABASE ---
// We initialize default data, but currentUser will be dynamic based on session
const DB = {
  contacts: [
    { id: 'u2', name: 'Sarah Connor', avatar: 'https://picsum.photos/200/200?random=2', status: 'Saving the future', isOnline: false },
    { id: 'u3', name: 'John Doe', avatar: 'https://picsum.photos/200/200?random=3', status: 'At the gym', isOnline: true },
    { id: 'u4', name: 'Jane Smith', avatar: 'https://picsum.photos/200/200?random=4', status: 'Coding...', isOnline: true },
    { id: 'u5', name: 'Mike Ross', avatar: 'https://picsum.photos/200/200?random=5', status: 'In a meeting', isOnline: false },
    { id: 'ping-ai', name: 'PingAI', avatar: 'https://picsum.photos/200/200?random=99', status: 'Always here to help', isOnline: true },
  ] as User[],

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
    { id: 'p1', title: 'Vintage Camera', price: 120, image: 'https://picsum.photos/300/300?random=100', seller: 'RetroGuy', rating: 4.5, description: 'Classic 35mm film camera in great condition.', category: 'Electronics', condition: 'Used' },
    { id: 'p2', title: 'Neon Sign - Custom', price: 85, image: 'https://picsum.photos/300/300?random=101', seller: 'LightWorks', rating: 4.8, description: 'Handmade neon sign, custom text available.', category: 'Home', condition: 'New' },
    { id: 'p3', title: 'Gaming Headset', price: 55, image: 'https://picsum.photos/300/300?random=102', seller: 'GamerPro', rating: 4.2, description: 'Surround sound gaming headset with noise cancellation.', category: 'Electronics', condition: 'New' },
    { id: 'p4', title: 'Mechanical Keyboard', price: 150, image: 'https://picsum.photos/300/300?random=103', seller: 'ClickClack', rating: 4.9, description: 'RGB Mechanical keyboard with blue switches.', category: 'Electronics', condition: 'Like New' },
  ] as Product[],

  spaces: [
    { id: 's1', name: 'Cyberpunk Art', members: 12500, description: 'Digital art & neon vibes.', image: 'https://picsum.photos/400/200?random=200', joined: true },
    { id: 's2', name: 'Crypto Traders', members: 8400, description: 'Market analysis & signals.', image: 'https://picsum.photos/400/201?random=201', joined: false },
    { id: 's3', name: 'VR Enthusiasts', members: 3200, description: 'Oculus, Vive, & Metaverse.', image: 'https://picsum.photos/400/200?random=202', joined: false },
  ] as Space[],

  transactions: [
      { id: 't1', type: 'received', amount: 500, date: 'Today', entity: 'Freelance Gig' },
      { id: 't2', type: 'sent', amount: 45, date: 'Yesterday', entity: 'John Doe' },
      { id: 't3', type: 'withdraw', amount: 1000, date: '2 days ago', entity: 'Bank Transfer' },
      { id: 't4', type: 'deposit', amount: 200, date: 'Last Week', entity: 'PayPal' },
  ] as Transaction[],

  stories: [
    { id: 'st1', userId: 'u2', userName: 'Sarah Connor', userAvatar: 'https://picsum.photos/200/200?random=2', image: 'https://picsum.photos/300/500?random=300', timestamp: '2h ago', viewed: false, caption: 'Exploring the new city center! 🌆' },
    { id: 'st2', userId: 'u3', userName: 'John Doe', userAvatar: 'https://picsum.photos/200/200?random=3', image: 'https://picsum.photos/300/500?random=301', timestamp: '5h ago', viewed: true, caption: 'Morning grind 💪' },
  ] as Story[]
};

// Helper to get current active user from storage or fallback to a default for safety
const getCurrentUser = (): User => {
  const user = authService.getUser();
  if (user) return user;
  return { id: 'u1', name: 'Guest', avatar: 'https://ui-avatars.com/api/?name=Guest', isOnline: true };
};

// --- SIMULATED ASYNC API CALLS ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      await delay(800); // Simulate network
      // In a real backend, we'd hash check password here
      if (password === 'error') throw new Error('Invalid credentials');
      
      // Simulate finding a user or creating a session user based on email
      const namePart = email.split('@')[0];
      const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      
      const user: User = {
        id: 'u_' + Math.floor(Math.random() * 10000),
        name: name,
        avatar: `https://ui-avatars.com/api/?name=${name}&background=ff1744&color=fff`,
        isOnline: true
      };

      const token = 'mock_jwt_token_' + Date.now();
      authService.setSession(token, user);
      return user;
    },
    signup: async (data: any): Promise<User> => {
      await delay(1000);
      
      const user: User = {
        id: 'u_' + Date.now(),
        name: data.name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=ff1744&color=fff`,
        isOnline: true
      };

      const token = 'mock_jwt_token_' + Date.now();
      authService.setSession(token, user);
      return user;
    },
    socialLogin: async (provider: string): Promise<User> => {
      await delay(1000);
      
      const user: User = {
        id: 'u_social_' + Date.now(),
        name: `${provider} User`,
        avatar: `https://ui-avatars.com/api/?name=${provider}+User&background=0D8ABC&color=fff`,
        isOnline: true
      };

      const token = 'mock_jwt_token_' + Date.now();
      authService.setSession(token, user);
      return user;
    },
    me: async (): Promise<User> => {
      await delay(400);
      // Check if token exists
      if (!authService.isAuthenticated()) throw new Error('Unauthorized');
      
      // Return the persisted user details
      const user = authService.getUser();
      if (!user) throw new Error('User data not found');
      return user;
    },
    updateProfile: async (updates: Partial<User>): Promise<User> => {
      await delay(600);
      const currentUser = authService.getUser();
      if (!currentUser) throw new Error("No user session found");
      const updatedUser = { ...currentUser, ...updates };
      authService.setSession(authService.getToken()!, updatedUser);
      return updatedUser;
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
      const currentUser = getCurrentUser();
      
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: currentUser.id,
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
    },
    createGroup: async (name: string, participantIds: string[]): Promise<ChatSession> => {
      await delay(600);
      const groupChat: ChatSession = {
        id: 'g_' + Date.now(),
        participant: {
          id: 'group_' + Date.now(),
          name: name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ff1744&color=fff&length=2`,
          isOnline: true,
          status: `${participantIds.length + 1} members`
        },
        lastMessage: 'Group created',
        lastTime: 'Now',
        unread: 0,
        messages: [{
          id: 'sys_' + Date.now(),
          senderId: 'system',
          text: `Group "${name}" created with ${participantIds.length} members.`,
          timestamp: 'Just now',
          type: 'system'
        }],
        isGroup: true,
        members: participantIds
      };
      DB.chats.unshift(groupChat);
      return groupChat;
    }
  },

  contacts: {
    list: async (): Promise<User[]> => {
      await delay(400);
      return [...DB.contacts];
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
    },
    withdraw: async (amount: number, method: string): Promise<Transaction> => {
      await delay(1000);
      const newTx: Transaction = {
        id: Date.now().toString(),
        type: 'withdraw',
        amount,
        date: 'Just now',
        entity: method === 'bank' ? 'Bank Withdrawal' : 'Mobile Money'
      };
      DB.transactions.unshift(newTx);
      return newTx;
    },
    deposit: async (amount: number, method: string): Promise<Transaction> => {
      await delay(1000);
      const newTx: Transaction = {
        id: Date.now().toString(),
        type: 'deposit',
        amount,
        date: 'Just now',
        entity: method === 'card' ? 'Visa Card Deposit' : 'Mobile Money Deposit'
      };
      DB.transactions.unshift(newTx);
      return newTx;
    }
  },

  market: {
    getProducts: async (): Promise<Product[]> => {
      await delay(500);
      return [...DB.products];
    },
    addProduct: async (productData: Partial<Product>): Promise<Product> => {
      await delay(800);
      const currentUser = getCurrentUser();
      const newProduct: Product = {
        id: 'p' + Date.now(),
        title: productData.title || 'Untitled',
        price: productData.price || 0,
        image: productData.image || 'https://picsum.photos/300/300',
        seller: currentUser.name, // Current user is seller
        rating: 0,
        description: productData.description,
        category: productData.category,
        condition: productData.condition
      };
      DB.products.unshift(newProduct);
      return newProduct;
    }
  },
  
  spaces: {
    list: async (): Promise<Space[]> => {
      await delay(400);
      return [...DB.spaces];
    },
    create: async (data: Partial<Space>): Promise<Space> => {
      await delay(800);
      const newSpace: Space = {
        id: 's' + Date.now(),
        name: data.name || 'New Space',
        description: data.description || 'A new community',
        image: data.image || 'https://picsum.photos/400/200',
        members: 1,
        joined: true
      };
      DB.spaces.push(newSpace);
      return newSpace;
    },
    join: async (id: string): Promise<void> => {
      await delay(500);
      const space = DB.spaces.find(s => s.id === id);
      if (space) {
        space.joined = !space.joined;
        space.members += space.joined ? 1 : -1;
      }
    }
  },

  stories: {
    list: async (): Promise<Story[]> => {
      await delay(400);
      return [...DB.stories];
    },
    addStory: async (image: string, caption?: string): Promise<Story> => {
      await delay(800);
      const currentUser = getCurrentUser();
      const newStory: Story = {
        id: 'st' + Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        image: image,
        timestamp: 'Just now',
        viewed: false,
        caption: caption
      };
      DB.stories.unshift(newStory);
      return newStory;
    }
  }
};