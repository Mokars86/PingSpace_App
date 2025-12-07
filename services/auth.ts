
/**
 * Auth Service
 * Handles token management and session persistence.
 */

const TOKEN_KEY = 'pingspace_auth_token';
const USER_KEY = 'pingspace_user_data';

export const authService = {
  setSession: (token: string, user: any) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};
