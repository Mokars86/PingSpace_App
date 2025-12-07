

export enum Tab {
  CHATS = 'Chats',
  STATUS = 'Status',
  DISCOVERY = 'Discovery',
  SPACES = 'Spaces',
  MARKET = 'Market',
  PROFILE = 'Profile'
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  status?: string;
  isOnline?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: 'text' | 'image' | 'payment' | 'product';
  metadata?: any;
}

export interface ChatSession {
  id: string;
  participant: User;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: Message[];
  isGroup?: boolean;
  isPinned?: boolean;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  seller: string;
  rating: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Space {
  id: string;
  name: string;
  members: number;
  image: string;
  description: string;
}

export interface Transaction {
  id: string;
  type: 'received' | 'sent' | 'withdraw' | 'deposit';
  amount: number;
  date: string;
  entity: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

// --- NEW FEATURES TYPES ---

export interface WorkspaceWidget {
  id: string;
  type: 'tasks' | 'notes' | 'calendar' | 'links';
  title: string;
  content: any;
  w: string; // width class (e.g. col-span-2)
}

export interface SummaryResult {
  summary: string;
  decisions: string[];
  actionItems: string[];
}

// --- GLOBAL STATE TYPES ---

export type Screen = 'splash' | 'login' | 'signup' | 'main';

export interface GlobalState {
  isLoading: boolean;
  theme: 'light' | 'dark';
  screen: Screen;
  currentUser: User | null;
  activeTab: Tab;
  chats: ChatSession[];
  selectedChatId: string | null;
  cart: CartItem[];
  notifications: Notification[];
  transactions: Transaction[];
  spaces: Space[];
  products: Product[];
  workspaceWidgets: WorkspaceWidget[];
}

export type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_SCREEN'; payload: Screen }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_TAB'; payload: Tab }
  | { type: 'SELECT_CHAT'; payload: string | null }
  | { type: 'ADD_NOTIFICATION'; payload: { type: 'success' | 'error' | 'info'; message: string } }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'SEND_MESSAGE'; payload: { sessionId: string; text: string } }
  | { type: 'RECEIVE_MESSAGE'; payload: { sessionId: string; message: Message } }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'SET_DATA'; payload: { chats: ChatSession[], products: Product[], spaces: Space[], transactions: Transaction[] } }
  | { type: 'TOGGLE_TASK'; payload: { widgetId: string; taskId: string } };