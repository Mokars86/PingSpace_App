
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  Timestamp, 
  orderBy, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  arrayUnion 
} from "firebase/firestore";
import { db } from "./firebase";
import { User, ChatSession, Transaction, Product, Space, Message, Story } from '../types';
import { authService } from './auth';
import { auth } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

// --- MOCK DATA FOR NON-CONNECTED FEATURES (Market, Wallet) ---
// We keep these mocked for now to focus on Chat/Auth first
const MOCK_PRODUCTS: Product[] = [
    { id: 'p1', title: 'Vintage Camera', price: 120, image: 'https://picsum.photos/300/300?random=100', seller: 'RetroGuy', rating: 4.5, description: 'Classic 35mm film camera.', category: 'Electronics', condition: 'Used' },
    { id: 'p2', title: 'Neon Sign', price: 85, image: 'https://picsum.photos/300/300?random=101', seller: 'LightWorks', rating: 4.8, description: 'Custom text available.', category: 'Home', condition: 'New' },
];

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Fetch user profile from Firestore to get custom fields like 'name' if not in Auth
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      return {
        id: userCredential.user.uid,
        name: userCredential.user.displayName || userData.name || 'User',
        avatar: userCredential.user.photoURL || userData.avatar || `https://ui-avatars.com/api/?name=${email}`,
        isOnline: true
      };
    },
    signup: async (data: any): Promise<User> => {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, {
        displayName: data.name,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=ff1744&color=fff`
      });

      // Create user document in Firestore
      const newUser: User = {
        id: userCredential.user.uid,
        name: data.name,
        avatar: userCredential.user.photoURL || '',
        isOnline: true,
        status: 'Hey there! I am using PingSpace.'
      };
      
      await setDoc(doc(db, "users", newUser.id), newUser);
      return newUser;
    },
    socialLogin: async (provider: string): Promise<User> => {
      // For this demo code, we'll throw, but in real app use signInWithPopup(auth, provider)
      throw new Error("Social login requires configured providers in Firebase Console");
    },
    me: async (): Promise<User> => {
      const user = authService.getCurrentUser();
      if (!user) throw new Error("Not authenticated");
      return user;
    },
    updateProfile: async (updates: Partial<User>): Promise<User> => {
      const currentUser = auth.currentUser;
      if(!currentUser) throw new Error("No user");
      
      if (updates.name || updates.avatar) {
        await updateProfile(currentUser, {
          displayName: updates.name,
          photoURL: updates.avatar
        });
      }
      // Update Firestore as well
      await updateDoc(doc(db, "users", currentUser.uid), updates);
      
      return { ...authService.getCurrentUser()!, ...updates };
    },
    logout: async () => {
      await authService.logout();
    }
  },

  chats: {
    // Listen to real-time updates for the chat list
    // Note: We'll implement a simple fetch here, but ideally this is an onSnapshot in a hook
    list: async (): Promise<ChatSession[]> => {
      const currentUser = auth.currentUser;
      if (!currentUser) return [];

      const q = query(
        collection(db, "chats"), 
        where("members", "array-contains", currentUser.uid),
        orderBy("lastMessageTime", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      
      const chats: ChatSession[] = await Promise.all(querySnapshot.docs.map(async (chatDoc) => {
        const data = chatDoc.data();
        
        // Determine participant (the other person)
        const otherUserId = data.members.find((id: string) => id !== currentUser.uid);
        let participant: User = { id: 'unknown', name: 'Unknown', avatar: '', isOnline: false };
        
        if (data.isGroup) {
           participant = { id: chatDoc.id, name: data.name || 'Group', avatar: data.avatar || '', status: `${data.members.length} members` };
        } else if (otherUserId) {
           const userSnap = await getDoc(doc(db, "users", otherUserId));
           if (userSnap.exists()) participant = userSnap.data() as User;
        }

        // Fetch last few messages
        const msgsQuery = query(collection(db, "chats", chatDoc.id, "messages"), orderBy("createdAt", "asc")); // limit in real app
        const msgsSnap = await getDocs(msgsQuery);
        const messages = msgsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));

        return {
          id: chatDoc.id,
          participant,
          lastMessage: data.lastMessage,
          lastTime: data.lastMessageTime ? new Date(data.lastMessageTime.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '',
          unread: 0, // Logic for unread counts requires a separate subcollection or field
          messages,
          isGroup: data.isGroup,
          members: data.members,
          disappearingMode: data.disappearingMode
        };
      }));
      
      return chats;
    },
    sendMessage: async (chatId: string, text: string, type: Message['type'] = 'text', metadata?: any, replyTo?: Message['replyTo'], expiresAt?: number): Promise<Message> => {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not logged in");

      const newMessageData = {
        senderId: currentUser.uid,
        text,
        type,
        metadata: metadata || null,
        replyTo: replyTo || null,
        expiresAt: expiresAt || null,
        createdAt: Date.now(), // Store as number for sorting
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Display string
      };

      // 1. Add to messages subcollection
      const msgRef = await addDoc(collection(db, "chats", chatId, "messages"), newMessageData);
      
      // 2. Update chat metadata (last message)
      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: type === 'text' ? text : `Sent a ${type}`,
        lastMessageTime: Timestamp.now()
      });

      return { id: msgRef.id, ...newMessageData } as Message;
    },
    createGroup: async (name: string, participantIds: string[]): Promise<ChatSession> => {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not logged in");
      
      const allMembers = [currentUser.uid, ...participantIds];
      
      const newChatData = {
        isGroup: true,
        name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ff1744&color=fff`,
        members: allMembers,
        lastMessage: 'Group created',
        lastMessageTime: Timestamp.now(),
        createdBy: currentUser.uid
      };

      const docRef = await addDoc(collection(db, "chats"), newChatData);
      
      // Add initial system message
      await addDoc(collection(db, "chats", docRef.id, "messages"), {
        senderId: 'system',
        text: `Group "${name}" created.`,
        type: 'system',
        createdAt: Date.now(),
        timestamp: 'Just now'
      });

      return {
        id: docRef.id,
        participant: { id: docRef.id, name, avatar: newChatData.avatar, status: `${allMembers.length} members` },
        lastMessage: 'Group created',
        lastTime: 'Now',
        unread: 0,
        messages: [],
        isGroup: true,
        members: allMembers
      };
    }
  },

  contacts: {
    list: async (): Promise<User[]> => {
      const currentUser = auth.currentUser;
      // Get all users except self
      const q = query(collection(db, "users")); 
      const querySnapshot = await getDocs(q);
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        if (!currentUser || doc.id !== currentUser.uid) {
          users.push(doc.data() as User);
        }
      });
      return users;
    }
  },

  // --- WALLET, MARKET, SPACES, STORIES ---
  // Keeping these mocked for now to reduce complexity of the migration response
  // In a full production app, these would follow the exact same Firestore pattern as 'chats'
  wallet: {
    getTransactions: async (): Promise<Transaction[]> => {
      return [
          { id: 't1', type: 'received', amount: 500, date: 'Today', entity: 'Freelance Gig' },
          { id: 't4', type: 'deposit', amount: 200, date: 'Last Week', entity: 'PayPal' },
      ];
    },
    transfer: async (recipient: string, amount: number) => { return {} as any },
    withdraw: async (amount: number, method: string) => { return {} as any },
    deposit: async (amount: number, method: string) => { return {} as any }
  },

  market: {
    getProducts: async (): Promise<Product[]> => { return MOCK_PRODUCTS; },
    addProduct: async (productData: Partial<Product>) => { return {} as any }
  },
  
  spaces: {
    list: async (): Promise<Space[]> => {
        return [
            { id: 's1', name: 'Cyberpunk Art', members: 12500, description: 'Digital art & neon vibes.', image: 'https://picsum.photos/400/200?random=200', joined: true },
        ];
    },
    create: async (data: Partial<Space>) => { return {} as any },
    join: async (id: string) => { }
  },

  stories: {
    list: async (): Promise<Story[]> => {
        return [
            { id: 'st1', userId: 'u2', userName: 'Demo User', userAvatar: 'https://picsum.photos/200/200', image: 'https://picsum.photos/300/500', timestamp: '2h ago', viewed: false, caption: 'Firebase is live! 🔥' },
        ];
    },
    addStory: async (image: string, caption?: string) => { return {} as any }
  }
};
