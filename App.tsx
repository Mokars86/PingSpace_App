
import React, { useEffect, useState } from 'react';
import { MessageCircle, CircleDashed, Compass, LayoutGrid, ShoppingBag, User as UserIcon, CheckCircle, AlertCircle, Info, Loader2, Phone, Video, Mic, MicOff, PhoneOff, VideoOff, Maximize2, WifiOff, Plus, Tag, Wallet as WalletIcon } from 'lucide-react';
import { Tab, Message, ActiveCall } from './types';
import { ChatList, ChatWindow } from './components/ChatFeatures';
import { StatusScreen, DiscoveryScreen, SpacesScreen, MarketplaceScreen, ProfileScreen } from './components/TabScreens';
import { SplashScreen, LoginScreen, SignupScreen, ForgotPasswordScreen } from './components/AuthScreens';
import { GlobalProvider, useGlobalState, useGlobalDispatch } from './store';
import { api } from './services/api';
import { authService } from './services/auth';
import { socketService } from './services/socket';
import { notificationService } from './services/notificationService';

// --- CALL OVERLAY COMPONENT ---
const CallOverlay: React.FC<{ call: ActiveCall }> = ({ call }) => {
  const dispatch = useGlobalDispatch();
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (call.status === 'ringing') {
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_CALL_STATUS', payload: 'connected' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [call.status, dispatch]);

  useEffect(() => {
    if (call.status === 'connected') {
      const timer = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [call.status]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
      <div className="absolute inset-0 bg-slate-800">
         {call.type === 'video' && !call.isVideoOff ? (
            <img 
              src={`https://picsum.photos/800/1200?random=${call.participant.id}`} 
              className="w-full h-full object-cover opacity-60" 
              alt="Video Feed"
            />
         ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
               <div className="w-32 h-32 rounded-full bg-slate-700 flex items-center justify-center">
                  <UserIcon className="w-16 h-16 text-slate-500" />
               </div>
            </div>
         )}
         {call.type === 'video' && call.status === 'connected' && (
            <div className="absolute top-4 right-4 w-28 h-36 bg-black rounded-xl overflow-hidden border-2 border-white/20 shadow-xl">
               <img src="https://picsum.photos/200/300" className="w-full h-full object-cover" alt="Me" />
            </div>
         )}
      </div>

      <div className="absolute top-12 flex flex-col items-center z-10 w-full">
         <div className="w-24 h-24 rounded-full border-4 border-white/10 p-1 mb-4 shadow-2xl">
            <img src={call.participant.avatar} className="w-full h-full rounded-full object-cover" alt={call.participant.name} />
         </div>
         <h2 className="text-2xl font-bold text-white mb-1">{call.participant.name}</h2>
         <p className="text-white/60 font-medium animate-pulse">
            {call.status === 'ringing' ? 'Calling...' : formatTime(duration)}
         </p>
      </div>

      <div className="absolute bottom-12 w-full max-w-sm px-8 z-10">
         <div className="flex items-center justify-between bg-black/20 backdrop-blur-md rounded-3xl p-4 border border-white/10">
            <button 
              onClick={() => dispatch({type: 'TOGGLE_CALL_MUTE'})}
              className={`p-4 rounded-full transition-all ${call.isMuted ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
               {call.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <button 
              onClick={() => dispatch({type: 'END_CALL'})}
              className="p-5 bg-[#ff1744] text-white rounded-full shadow-lg shadow-red-500/40 hover:scale-110 transition-transform"
            >
               <PhoneOff className="w-8 h-8" />
            </button>
            {call.type === 'video' ? (
               <button 
                 onClick={() => dispatch({type: 'TOGGLE_CALL_VIDEO'})}
                 className={`p-4 rounded-full transition-all ${call.isVideoOff ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
               >
                  {call.isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
               </button>
            ) : (
               <button className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20">
                  <Maximize2 className="w-6 h-6" />
               </button>
            )}
         </div>
      </div>
    </div>
  );
};

const MainAppContent = () => {
  const state = useGlobalState();
  const dispatch = useGlobalDispatch();

  // --- 1. THEME MANAGEMENT ---
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('pingspace_theme', state.theme);
  }, [state.theme]);

  // --- 2. OFFLINE DETECTION ---
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: false });
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  // --- 3. INITIALIZATION & AUTH CHECK ---
  useEffect(() => {
    const loadAppData = async (user: any) => {
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const [chats, contacts, products, spaces, transactions, stories] = await Promise.all([
          api.chats.list(),
          api.contacts.list(),
          api.market.getProducts(),
          api.spaces.list(),
          api.wallet.getTransactions(),
          api.stories.list()
        ]);
        dispatch({ 
          type: 'SET_DATA', 
          payload: { chats, contacts, products, spaces, transactions, stories } 
        });
        const token = await authService.getToken();
        if (token) socketService.connect(token);
      } catch (e: any) {
        console.error("Failed to load initial data:", e.message || e);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    const initAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          await loadAppData(user);
        } else {
          dispatch({ type: 'SET_SCREEN', payload: 'login' });
        }
      } catch (e: any) {
        console.error("Auth init error:", e.message || e);
        dispatch({ type: 'SET_SCREEN', payload: 'login' });
      }

      const unsubscribe = authService.onAuthStateChanged(async (user) => {
        if (user) {
          loadAppData(user);
        } else {
          dispatch({ type: 'SET_SCREEN', payload: 'login' });
        }
      });
      return unsubscribe;
    };

    let unsubscribeFn: (() => void) | undefined;
    initAuth().then(fn => unsubscribeFn = fn);

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, [dispatch]);

  // --- 4. REALTIME LISTENERS & NOTIFICATIONS ---
  useEffect(() => {
    if (state.currentUser) {
       const handleNewMessage = (data: any) => {
          if (data.senderId !== state.currentUser?.id) {
             const message: Message = {
                id: data.id,
                senderId: data.senderId,
                text: data.text,
                type: data.type || 'text',
                timestamp: new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                createdAt: data.createdAt,
                metadata: data.metadata
             };

             dispatch({ 
                type: 'RECEIVE_MESSAGE', 
                payload: { sessionId: data.chatId, message } 
             });

             dispatch({ 
               type: 'ADD_NOTIFICATION', 
               payload: { type: 'info', message: `New message from ${data.senderId === 'ping-ai' ? 'PingAI' : 'a contact'}` } 
             });

             if (state.settings.notifications.push) {
               notificationService.showLocalNotification(`PingSpace`, {
                 body: data.text || 'You received a new file.',
                 tag: data.chatId
               });
             }
          }
       };

       socketService.on('new_message', handleNewMessage);
       return () => {
         socketService.off('new_message', handleNewMessage);
       };
    }
  }, [state.currentUser, state.settings.notifications.push, dispatch]);

  // --- 5. AUTO-REMOVE NOTIFICATIONS ---
  useEffect(() => {
    if (state.notifications.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: state.notifications[0].id });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.notifications, dispatch]);

  const handleSendMessage = async (sessionId: string, text: string, type: Message['type'] = 'text', metadata?: any) => {
    dispatch({ type: 'SEND_MESSAGE', payload: { sessionId, text, type, metadata } });
    try {
      await api.chats.sendMessage(sessionId, text, type, metadata);
    } catch (e: any) {
      console.error(e);
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: e.message || 'Failed to send message' } });
    }
  };

  const handleBotResponse = (sessionId: string, text: string) => {
    dispatch({ 
      type: 'RECEIVE_MESSAGE', 
      payload: { 
        sessionId, 
        message: {
          id: Date.now().toString(),
          senderId: 'ping-ai',
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: Date.now(),
          type: 'text'
        }
      } 
    });
  };

  const getHeaderTitle = () => {
    switch (state.activeTab) {
      case Tab.CHATS: return 'PingSpace';
      case Tab.STATUS: return 'Status';
      case Tab.DISCOVERY: return 'Discover';
      case Tab.MARKET: return 'Market';
      case Tab.PROFILE: return 'Profile Hub';
      case Tab.SPACES: return 'Spaces';
      default: return 'PingSpace';
    }
  };

  // --- RENDERERS ---
  const renderNotifications = () => (
    <div className="fixed top-4 left-0 right-0 z-[100] px-4 flex flex-col items-center gap-2 pointer-events-none">
      {state.notifications.map(n => (
        <div 
          role="alert" 
          aria-live="polite"
          key={n.id} 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-top-4 duration-300 max-w-sm w-full backdrop-blur-md pointer-events-auto ${
            n.type === 'success' ? 'bg-emerald-500/90 text-white' : 
            n.type === 'error' ? 'bg-[#ff1744]/90 text-white' : 
            'bg-slate-800/90 text-white dark:bg-slate-700/90'
          }`}
        >
          {n.type === 'success' ? <CheckCircle className="w-5 h-5" /> : 
           n.type === 'error' ? <AlertCircle className="w-5 h-5" /> : 
           <Info className="w-5 h-5" />}
          <p className="font-bold text-sm">{n.message}</p>
        </div>
      ))}
    </div>
  );

  const renderLoading = () => {
    if (!state.isLoading) return null;
    return (
      <div className="absolute inset-0 z-50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ff1744] animate-spin" />
      </div>
    );
  };

  if (state.screen === 'splash') return <SplashScreen />;

  if (state.screen === 'login') return (
    <>
      {renderNotifications()}
      <LoginScreen 
        onNavigate={() => dispatch({ type: 'SET_SCREEN', payload: 'signup' })} 
        onForgotPassword={() => dispatch({ type: 'SET_SCREEN', payload: 'forgot-password' })}
      />
    </>
  );

  if (state.screen === 'signup') return (
    <>
      {renderNotifications()}
      <SignupScreen onNavigate={() => dispatch({ type: 'SET_SCREEN', payload: 'login' })} />
    </>
  );

  if (state.screen === 'forgot-password') return (
    <>
      {renderNotifications()}
      <ForgotPasswordScreen onNavigate={() => dispatch({ type: 'SET_SCREEN', payload: 'login' })} />
    </>
  );

  const selectedChat = state.chats.find(c => c.id === state.selectedChatId);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-200 dark:border-slate-800 transition-colors duration-300">
      {renderNotifications()}
      {renderLoading()}
      {state.activeCall && <CallOverlay call={state.activeCall} />}

      {!state.isOnline && (
        <div className="bg-slate-800 dark:bg-slate-900 text-white text-[10px] font-bold text-center py-1.5 absolute top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2 border-b border-white/10">
           <WifiOff className="w-3 h-3" />
           Offline Mode
        </div>
      )}

      {state.selectedChatId && selectedChat ? (
        <ChatWindow 
          session={selectedChat} 
          currentUser={state.currentUser!}
          onBack={() => dispatch({ type: 'SELECT_CHAT', payload: null })}
          onSendMessage={handleSendMessage}
          onBotResponse={handleBotResponse}
        />
      ) : (
        <>
          {/* Universal Dynamic Header */}
          <header className={`p-4 flex justify-between items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur z-30 sticky top-0 border-b border-gray-100 dark:border-slate-800 ${!state.isOnline ? 'mt-6' : ''}`}>
            <h1 className="text-xl font-black tracking-tighter font-display text-[#ff1744] uppercase">{getHeaderTitle()}</h1>
            <div className="flex gap-3">
               {state.activeTab === Tab.CHATS && (
                  <button 
                    onClick={() => dispatch({ type: 'SET_TAB', payload: Tab.SPACES })}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-[#ff1744] hover:border-[#ff1744] group transition-all"
                  >
                    <LayoutGrid className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-white" />
                    <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 group-hover:text-white">Spaces</span>
                  </button>
               )}
               {state.activeTab === Tab.PROFILE && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                     <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                     <span className="text-[10px] font-black uppercase text-emerald-600">Secure</span>
                  </div>
               )}
            </div>
          </header>

          <main className="flex-1 overflow-hidden relative bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
            {state.activeTab === Tab.CHATS && (
              <ChatList 
                chats={state.chats}
                contacts={state.contacts}
                onSelectChat={(id) => dispatch({ type: 'SELECT_CHAT', payload: id })} 
              />
            )}
            {state.activeTab === Tab.STATUS && <StatusScreen />}
            {state.activeTab === Tab.DISCOVERY && <DiscoveryScreen />}
            {state.activeTab === Tab.SPACES && <SpacesScreen spaces={state.spaces} />}
            {state.activeTab === Tab.MARKET && <MarketplaceScreen />}
            {state.activeTab === Tab.PROFILE && <ProfileScreen />}
          </main>

          <nav className="h-[76px] bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800/50 flex justify-between items-center px-4 pb-4 fixed bottom-0 w-full max-w-md z-40 transition-colors duration-300">
            {[
              { id: Tab.CHATS, icon: MessageCircle, label: 'Chats' },
              { id: Tab.STATUS, icon: CircleDashed, label: 'Status' },
              { id: Tab.DISCOVERY, icon: Compass, label: 'Explore' },
              { id: Tab.MARKET, icon: ShoppingBag, label: 'Market' },
              { id: Tab.PROFILE, icon: UserIcon, label: 'Profile' },
            ].map((item) => {
              const isActive = state.activeTab === item.id || (item.id === Tab.CHATS && state.activeTab === Tab.SPACES);
              return (
                <button
                  key={item.id}
                  onClick={() => dispatch({ type: 'SET_TAB', payload: item.id as Tab })}
                  className={`flex flex-col items-center justify-center w-full h-full gap-1.5 transition-all duration-300 ${isActive ? 'text-[#ff1744] translate-y-[-4px]' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  aria-selected={isActive}
                  role="tab"
                >
                  <div className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-[#ff1744]/10 shadow-lg shadow-red-500/10' : ''}`}>
                    <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </>
      )}
    </div>
  );
};

export default function App() {
  return (
    <GlobalProvider>
      <MainAppContent />
    </GlobalProvider>
  );
}
