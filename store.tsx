
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GlobalState, Action, User, Message, ChatSession, Product, Space, Transaction, Tab, Story } from './types';

// --- INITIAL STATE ---
const savedTheme = localStorage.getItem('pingspace_theme') as 'light' | 'dark' || 'light';

const initialState: GlobalState = {
  isLoading: false,
  theme: savedTheme,
  screen: 'splash',
  currentUser: null,
  activeTab: Tab.CHATS,
  chats: [],
  contacts: [],
  selectedChatId: null,
  selectedProductId: null,
  cart: [],
  notifications: [],
  transactions: [],
  spaces: [],
  products: [],
  stories: [], 
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
  ],
  activeCall: null,
  isOnline: navigator.onLine,
  settings: {
    notifications: {
      push: true,
      email: true,
      transactions: true,
      marketing: false
    },
    privacy: {
      readReceipts: true,
      lastSeen: 'Everyone',
      profilePhoto: 'Everyone',
      about: 'Everyone'
    },
    security: {
      twoFactor: false,
      biometric: true
    }
  }
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
    case 'UPDATE_USER':
      return { ...state, currentUser: state.currentUser ? { ...state.currentUser, ...action.payload } : null };
    case 'LOGOUT':
      return { ...initialState, screen: 'login', theme: state.theme }; 
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    case 'SELECT_CHAT':
      return { ...state, selectedChatId: action.payload };
    case 'SELECT_PRODUCT':
      return { ...state, selectedProductId: action.payload };
    
    case 'SET_DATA':
      return {
        ...state,
        chats: action.payload.chats,
        contacts: action.payload.contacts,
        products: action.payload.products,
        spaces: action.payload.spaces,
        transactions: action.payload.transactions,
        stories: action.payload.stories
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
    
    case 'CLEAR_CART':
      return { ...state, cart: [] };

    case 'SEND_MESSAGE': {
      const { sessionId, text, type, metadata, replyTo, expiresAt } = action.payload;
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: state.currentUser?.id || 'u1',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now(),
        type: type || 'text',
        metadata: metadata,
        replyTo: replyTo,
        expiresAt: expiresAt,
        isStarred: false
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

    case 'CREATE_GROUP': 
    case 'ADD_CHAT': {
      const exists = state.chats.some(c => c.id === action.payload.id);
      if (exists) {
        return { ...state, selectedChatId: action.payload.id };
      }
      return {
        ...state,
        chats: [action.payload, ...state.chats],
        selectedChatId: action.payload.id
      };
    }

    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions]
      };
    
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [action.payload, ...state.products]
      };

    case 'ADD_STORY':
      return {
        ...state,
        stories: [action.payload, ...state.stories]
      };

    case 'ADD_SPACE':
      return {
        ...state,
        spaces: [...state.spaces, action.payload]
      };
    
    case 'JOIN_SPACE':
      return {
        ...state,
        spaces: state.spaces.map(s => {
          if (s.id === action.payload) {
             const joined = !s.joined;
             return { ...s, joined, members: s.members + (joined ? 1 : -1) };
          }
          return s;
        })
      };

    case 'TOGGLE_STAR_MESSAGE': {
      const { sessionId, messageId } = action.payload;
      return {
        ...state,
        chats: state.chats.map(chat => {
          if (chat.id !== sessionId) return chat;
          return {
            ...chat,
            messages: chat.messages.map(msg => msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg)
          };
        })
      };
    }

    case 'SET_CHAT_WALLPAPER': {
      const { sessionId, url } = action.payload;
      return {
        ...state,
        chats: state.chats.map(c => c.id === sessionId ? { ...c, wallpaper: url } : c)
      };
    }

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

    case 'TOGGLE_DISAPPEARING_MODE': {
      return {
        ...state,
        chats: state.chats.map(c => 
          c.id === action.payload.sessionId 
            ? { ...c, disappearingMode: action.payload.enabled }
            : c
        )
      };
    }

    case 'ADD_REACTION': {
      const { sessionId, messageId, emoji } = action.payload;
      return {
        ...state,
        chats: state.chats.map(chat => {
          if (chat.id !== sessionId) return chat;
          return {
            ...chat,
            messages: chat.messages.map(msg => {
              if (msg.id !== messageId) return msg;
              
              const reactions = msg.reactions || [];
              const existingReaction = reactions.find(r => r.emoji === emoji);
              
              let newReactions;
              if (existingReaction) {
                newReactions = reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r);
              } else {
                newReactions = [...reactions, { emoji, count: 1, userIds: ['me'] }];
              }
              
              return { ...msg, reactions: newReactions };
            })
          };
        })
      };
    }

    case 'DELETE_EXPIRED_MESSAGES': {
      const now = Date.now();
      return {
        ...state,
        chats: state.chats.map(chat => {
          if (chat.id !== action.payload.sessionId) return chat;
          
          const validMessages = chat.messages.filter(msg => {
            if (!msg.expiresAt) return true;
            return msg.expiresAt > now;
          });

          if (validMessages.length === chat.messages.length) return chat;

          return {
            ...chat,
            messages: validMessages,
            lastMessage: validMessages.length > 0 ? validMessages[validMessages.length - 1].text : 'Messages expired'
          };
        })
      };
    }

    case 'START_CALL':
      return {
        ...state,
        activeCall: {
          id: Date.now().toString(),
          participant: action.payload.participant,
          type: action.payload.type,
          status: 'ringing',
          isMuted: false,
          isVideoOff: false
        }
      };

    case 'END_CALL':
      return {
        ...state,
        activeCall: null
      };

    case 'SET_CALL_STATUS':
      return state.activeCall ? {
        ...state,
        activeCall: {
          ...state.activeCall,
          status: action.payload,
          startTime: action.payload === 'connected' ? Date.now() : state.activeCall.startTime
        }
      } : state;

    case 'TOGGLE_CALL_MUTE':
      return state.activeCall ? {
        ...state,
        activeCall: { ...state.activeCall, isMuted: !state.activeCall.isMuted }
      } : state;

    case 'TOGGLE_CALL_VIDEO':
      return state.activeCall ? {
        ...state,
        activeCall: { ...state.activeCall, isVideoOff: !state.activeCall.isVideoOff }
      } : state;

    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };

    case 'UPDATE_SETTING':
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.payload.section]: {
            ...state.settings[action.payload.section],
            [action.payload.key]: action.payload.value
          }
        }
      };

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
