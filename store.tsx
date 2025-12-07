

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GlobalState, Action, User, Message, ChatSession, Product, Space, Transaction, Tab } from './types';

// --- INITIAL STATE ---
// Started empty to simulate waiting for backend
const savedTheme = localStorage.getItem('pingspace_theme') as 'light' | 'dark' || 'light';

const initialState: GlobalState = {
  isLoading: false,
  theme: savedTheme,
  screen: 'splash',
  currentUser: null,
  activeTab: Tab.CHATS,
  chats: [],
  selectedChatId: null,
  cart: [],
  notifications: [],
  transactions: [],
  spaces: [],
  products: [],
  workspaceWidgets: [
    {
      id: 'w1',
      type: 'tasks',
      title: 'Sprint Tasks',
      w: 'col-span-2',
      content: [
        { id: 't1', text: 'Design review with Sarah', done: false },
        { id: 't2', text: 'Fix payment API bug', done: true },
        { id: 't3', text: 'Update PingSpace icons', done: false }
      ]
    },
    {
      id: 'w2',
      type: 'notes',
      title: 'Quick Notes',
      w: 'col-span-1',
      content: 'Remember to check the quarterly budget report.'
    },
    {
      id: 'w3',
      type: 'links',
      title: 'Project Links',
      w: 'col-span-1',
      content: [
        { label: 'Figma File', url: '#' },
        { label: 'GitHub Repo', url: '#' },
        { label: 'Jira Board', url: '#' }
      ]
    }
  ]
};

// --- REDUCER ---
const globalReducer = (state: GlobalState, action: Action): GlobalState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_SCREEN':
      return { ...state, screen: action.payload };
    case 'LOGIN_SUCCESS':
      return { ...state, currentUser: action.payload, screen: 'main' };
    case 'LOGOUT':
      return { ...initialState, screen: 'login', theme: state.theme }; // Preserve theme on logout
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    case 'SELECT_CHAT':
      return { ...state, selectedChatId: action.payload };
    
    case 'SET_DATA':
      return {
        ...state,
        chats: action.payload.chats,
        products: action.payload.products,
        spaces: action.payload.spaces,
        transactions: action.payload.transactions
      };

    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [...state.notifications, { ...action.payload, id: Date.now().toString() }] 
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    case 'ADD_TO_CART': {
      const existing = state.cart.find(item => item.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map(item => item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item)
        };
      }
      return { ...state, cart: [...state.cart, { ...action.payload, quantity: 1 }] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(item => item.id !== action.payload) };

    case 'SEND_MESSAGE': {
      const { sessionId, text } = action.payload;
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: state.currentUser?.id || 'u1',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text'
      };
      
      return {
        ...state,
        chats: state.chats.map(c => 
          c.id === sessionId 
            ? { ...c, messages: [...c.messages, newMessage], lastMessage: text, lastTime: 'Now' }
            : c
        )
      };
    }
    
    case 'RECEIVE_MESSAGE': {
      const { sessionId, message } = action.payload;
      return {
        ...state,
        chats: state.chats.map(c => 
          c.id === sessionId 
            ? { ...c, messages: [...c.messages, message], lastMessage: message.text, lastTime: 'Now' }
            : c
        )
      };
    }

    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions]
      };

    case 'TOGGLE_TASK': {
      const { widgetId, taskId } = action.payload;
      return {
        ...state,
        workspaceWidgets: state.workspaceWidgets.map(w => {
          if (w.id !== widgetId || w.type !== 'tasks') return w;
          return {
            ...w,
            content: w.content.map((t: any) => t.id === taskId ? { ...t, done: !t.done } : t)
          };
        })
      };
    }

    default:
      return state;
  }
};

// --- CONTEXT ---
const GlobalContext = createContext<{
  state: GlobalState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error('useGlobalState must be used within GlobalProvider');
  return context.state;
};

export const useGlobalDispatch = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error('useGlobalDispatch must be used within GlobalProvider');
  return context.dispatch;
};