import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { User } from "../types";

/**
 * Auth Service
 * Handles Firebase Authentication
 */

const mapUser = (fbUser: any, profile?: any): User => {
  return {
    id: fbUser.uid,
    name: profile?.name || fbUser.displayName || 'User',
    avatar: profile?.avatar || fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.email || 'User')}`,
    isOnline: true,
    status: profile?.status || 'Available'
  };
};

export const authService = {
  getToken: async () => {
    const user = auth.currentUser;
    return user ? await user.getIdToken() : null;
  },

  getCurrentUser: async (): Promise<User | null> => {
    const user = auth.currentUser;
    if (!user) return null;
    
    // Fetch profile extension
    const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
    const profile = profileDoc.exists() ? profileDoc.data() : null;

    return mapUser(user, profile);
  },

  isAuthenticated: async () => {
    return !!auth.currentUser;
  },

  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profileDoc = await getDoc(doc(db, 'profiles', fbUser.uid));
        const profile = profileDoc.exists() ? profileDoc.data() : null;
        callback(mapUser(fbUser, profile));
      } else {
        callback(null);
      }
    });
  },

  logout: async () => {
    await signOut(auth);
  }
};