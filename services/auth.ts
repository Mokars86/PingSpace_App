
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { User } from "../types";

/**
 * Auth Service
 * Handles real Firebase Authentication
 */

// Helper to map Firebase User to our App User type
const mapUser = (fbUser: FirebaseUser, extraData?: any): User => {
  return {
    id: fbUser.uid,
    name: fbUser.displayName || extraData?.name || 'User',
    avatar: fbUser.photoURL || extraData?.avatar || `https://ui-avatars.com/api/?name=${fbUser.email}`,
    isOnline: true, // In a real app, we'd check presence
    status: 'Online'
  };
};

export const authService = {
  // We no longer manually set session in localStorage, Firebase SDK handles this.
  
  getToken: async () => {
    return auth.currentUser ? await auth.currentUser.getIdToken() : null;
  },

  getCurrentUser: (): User | null => {
    const fbUser = auth.currentUser;
    if (!fbUser) return null;
    return mapUser(fbUser);
  },

  isAuthenticated: () => {
    return !!auth.currentUser;
  },

  // Listener for React to know when auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Fetch extra profile data from Firestore if needed
        const userDoc = await getDoc(doc(db, "users", fbUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        callback(mapUser(fbUser, userData));
      } else {
        callback(null);
      }
    });
  },

  logout: async () => {
    await firebaseSignOut(auth);
  }
};
