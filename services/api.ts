import { auth, db } from "./firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile as updateFbProfile 
} from "firebase/auth";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  arrayUnion
} from "firebase/firestore";
import { User, ChatSession, Transaction, Product, Space, Message, Story } from '../types';
import { authService } from './auth';

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
      const profile = profileDoc.exists() ? profileDoc.data() : null;

      return {
        id: user.uid,
        name: profile?.name || user.displayName || 'User',
        avatar: profile?.avatar || user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}`,
        isOnline: true
      };
    },
    signup: async (form: any): Promise<User> => {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
      
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=ff1744&color=fff`;
      
      await updateFbProfile(user, {
        displayName: form.name,
        photoURL: avatarUrl
      });

      const newUserProfile = {
        id: user.uid,
        name: form.name,
        avatar: avatarUrl,
        status: 'Hey there! I am using PingSpace.',
        email: form.email,
        createdAt: Timestamp.now()
      };
      
      await setDoc(doc(db, 'profiles', user.uid), newUserProfile);

      return {
        id: user.uid,
        name: form.name,
        avatar: avatarUrl,
        isOnline: true
      };
    },
    socialLogin: async (provider: any): Promise<User> => {
      // Basic implementation for demonstration
      throw new Error("Social login not configured in this demo.");
    },
    me: async (): Promise<User> => {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Not authenticated");
      return user;
    },
    updateProfile: async (updates: Partial<User>): Promise<User> => {
      const user = auth.currentUser;
      if (!user) throw new Error("No user");
      
      const fbUpdates: any = {};
      if (updates.name) fbUpdates.name = updates.name;
      if (updates.avatar) fbUpdates.avatar = updates.avatar;
      if (updates.status) fbUpdates.status = updates.status;

      await updateDoc(doc(db, 'profiles', user.uid), fbUpdates);
      
      return { ...updates, id: user.uid } as User;
    },
    logout: async () => {
      await authService.logout();
    }
  },

  chats: {
    list: async (): Promise<ChatSession[]> => {
      const user = auth.currentUser;
      if (!user) return [];

      const q = query(
        collection(db, 'chats'),
        where('members', 'array-contains', user.uid),
        orderBy('lastMessageTime', 'desc')
      );

      const snapshot = await getDocs(q);
      const chats: ChatSession[] = [];

      for (const d of snapshot.docs) {
        const data = d.data();
        const messagesQ = query(collection(db, 'chats', d.id, 'messages'), orderBy('createdAt', 'asc'), limit(50));
        const msgSnapshot = await getDocs(messagesQ);
        const messages = msgSnapshot.docs.map(m => ({ id: m.id, ...m.data() } as Message));

        chats.push({
          id: d.id,
          participant: data.isGroup ? { id: d.id, name: data.name, avatar: data.avatar } : { id: 'other', name: 'User', avatar: '' }, 
          lastMessage: data.lastMessage || '',
          lastTime: data.lastMessageTime ? data.lastMessageTime.toDate().toLocaleTimeString() : '',
          unread: 0,
          messages: messages,
          isGroup: data.isGroup,
          disappearingMode: data.disappearingMode
        });
      }

      return chats;
    },
    sendMessage: async (chatId: string, text: string, type: Message['type'] = 'text', metadata?: any, replyTo?: any, expiresAt?: number): Promise<Message> => {
      const user = auth.currentUser;
      if (!user) throw new Error("Unauthorized");

      const newMessageData = {
        senderId: user.uid,
        text,
        type,
        metadata: metadata || {},
        replyTo: replyTo || null,
        expiresAt: expiresAt || null,
        createdAt: Timestamp.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const msgRef = await addDoc(collection(db, 'chats', chatId, 'messages'), newMessageData);
      
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: text,
        lastMessageTime: Timestamp.now()
      });

      return { id: msgRef.id, ...newMessageData } as unknown as Message;
    },
    createGroup: async (name: string, participantIds: string[]): Promise<ChatSession> => {
      const user = auth.currentUser;
      if (!user) throw new Error("Auth required");
      
      const allMembers = [user.uid, ...participantIds];
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
      
      const chatData = {
        name,
        isGroup: true,
        members: allMembers,
        avatar: avatarUrl,
        lastMessage: '',
        lastMessageTime: Timestamp.now(),
        createdAt: Timestamp.now()
      };

      const chatRef = await addDoc(collection(db, 'chats'), chatData);
      
      return { 
        id: chatRef.id, 
        participant: { id: chatRef.id, name, avatar: avatarUrl }, 
        messages: [], 
        lastMessage: '', 
        lastTime: 'Now', 
        unread: 0, 
        isGroup: true 
      };
    }
  },

  contacts: {
    list: async (): Promise<User[]> => {
      const user = auth.currentUser;
      const q = query(collection(db, 'profiles'), where('id', '!=', user?.uid || ''));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => {
        const data = d.data();
        return { 
          id: d.id, 
          name: data.name, 
          avatar: data.avatar, 
          status: data.status, 
          isOnline: true 
        };
      });
    }
  },

  wallet: {
    getTransactions: async (): Promise<Transaction[]> => {
      const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
    },
    transfer: async (recipient: string, amount: number) => {
      await addDoc(collection(db, 'transactions'), {
        type: 'sent',
        amount,
        entity: recipient,
        createdAt: Timestamp.now(),
        date: new Date().toLocaleDateString()
      });
    },
    withdraw: async (amount: number, method: string) => {
      const tx = {
        type: 'withdraw',
        amount,
        entity: method,
        createdAt: Timestamp.now(),
        date: new Date().toLocaleDateString()
      };
      const docRef = await addDoc(collection(db, 'transactions'), tx);
      return { id: docRef.id, ...tx } as any;
    },
    deposit: async (amount: number, method: string) => {
       const tx = {
         type: 'deposit',
         amount,
         entity: method,
         createdAt: Timestamp.now(),
         date: new Date().toLocaleDateString()
       };
       const docRef = await addDoc(collection(db, 'transactions'), tx);
       return { id: docRef.id, ...tx } as any;
    }
  },

  market: {
    getProducts: async (): Promise<Product[]> => {
      const snapshot = await getDocs(collection(db, 'products'));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
    },
    addProduct: async (productData: Partial<Product>) => {
      const docRef = await addDoc(collection(db, 'products'), productData);
      return { id: docRef.id, ...productData } as Product;
    }
  },
  
  spaces: {
    list: async (): Promise<Space[]> => {
      const snapshot = await getDocs(collection(db, 'spaces'));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Space));
    },
    create: async (data: Partial<Space>) => {
      const docRef = await addDoc(collection(db, 'spaces'), {
        ...data,
        members: 1,
        createdAt: Timestamp.now()
      });
      return { id: docRef.id, ...data, members: 1 } as Space;
    },
    join: async (id: string) => {
      await updateDoc(doc(db, 'spaces', id), {
        members: Timestamp.now() // Mocking membership update
      });
    }
  },

  stories: {
    list: async (): Promise<Story[]> => {
       const snapshot = await getDocs(query(collection(db, 'stories'), orderBy('createdAt', 'desc')));
       return snapshot.docs.map(d => {
         const data = d.data();
         return {
           id: d.id,
           userId: data.userId,
           userName: data.userName,
           userAvatar: data.userAvatar,
           image: data.image,
           timestamp: 'Today',
           viewed: false,
           caption: data.caption
         };
       });
    },
    addStory: async (image: string, caption?: string) => {
       const user = auth.currentUser;
       const profileDoc = await getDoc(doc(db, 'profiles', user?.uid || ''));
       const profile = profileDoc.exists() ? profileDoc.data() : null;

       const storyData = {
         userId: user?.uid,
         userName: profile?.name || user?.displayName,
         userAvatar: profile?.avatar || user?.photoURL,
         image: image,
         caption: caption || '',
         createdAt: Timestamp.now()
       };

       const docRef = await addDoc(collection(db, 'stories'), storyData);
       return { id: docRef.id, ...storyData, timestamp: 'Now', viewed: false } as any;
    }
  }
};