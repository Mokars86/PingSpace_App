
import React, { useEffect, useState } from 'react';
import { MessageCircle, CircleDashed, Compass, LayoutGrid, ShoppingBag, User as UserIcon, CheckCircle, AlertCircle, Info, Loader2, Phone, Video, Mic, MicOff, PhoneOff, VideoOff, Maximize2, WifiOff } from 'lucide-react';
import { Tab, Message, ActiveCall } from './types';
import { ChatList, ChatWindow } from './components/ChatFeatures';
import { StatusScreen, DiscoveryScreen, SpacesScreen, MarketplaceScreen, ProfileScreen } from './components/TabScreens';
import { SplashScreen, LoginScreen, SignupScreen } from './components/AuthScreens';
import { GlobalProvider, useGlobalState, useGlobalDispatch } from './store';
import { api } from './services/api';
import { authService } from './services/auth';
import { socketService } from './services/socket';

// --- CALL OVERLAY COMPONENT ---
const CallOverlay: React.FC<{ call: ActiveCall }> = ({ call }) => {
  const dispatch = useGlobalDispatch();
  const [duration, setDuration] = useState(0);

  // Auto-connect simulation
  useEffect(() => {
    if (call.status === 'ringing') {
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_CALL_STATUS', payload: 'connected' });
      }, 3000); // Connect after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [call.status, dispatch]);

  // Duration timer
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
      
      {/* Background/Video Feed */}
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
         
         {/* Self View (Mock) */}
         {call.type === 'video' && call.status === 'connected' && (
            <div className="absolute top-4 right-4 w-28 h-36 bg-black rounded-xl overflow-hidden border-2 border-white/20 shadow-xl">
               <img src="https://picsum.photos/200/300" className="w-full h-full object-cover" alt="Me" />
            </div>
         )}
      </div>

      {/* Call Info */}
      <div className="absolute top-12 flex flex-col items-center z-10 w-full">
         <div className="w-24 h-24 rounded-full border-4 border-white/10 p-1 mb-4 shadow-2xl">
            <img src={call.participant.avatar} className="w-full h-full rounded-full object-cover" alt={call.participant.name} />
         </div>
         <h2 className="text-2xl font-bold text-white mb-1">{call.participant.name}</h2>
         <p className="text-white/60 font-medium animate-pulse">
            {call.status === 'ringing' ? 'Calling...' : formatTime(duration)}
         </p>
      </div>

      {/* Controls */}
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

// --- MAIN CONTENT COMPONENT ---
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

  // --- 3. INITIALIZATION & AUTH CHECK (Updated for Firebase) ---
  useEffect(() => {
    // Listen to Firebase Auth state
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      if (user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        
        // Initialize Data
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
          
          // Connect Socket (Realtime Listeners)
          socketService.connect('firebase_token');
        } catch (e) {
          console.error("Failed to load initial data", e);
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        // Only set to login screen if we are not already on signup
        if (state.screen !== 'signup') {
           dispatch({ type: 'SET_SCREEN', payload: 'login' });
        }
      }
    });

    return () => unsubscribe();
  }, [dispatch]); // Removed state.screen dependency to prevent loop

  // --- 4. SOCKET LISTENERS ---
  useEffect(() => {
    if (state.currentUser) {
       socketService.on('new_message', (data) => {
          dispatch({ 
            type: 'ADD_NOTIFICATION', 
            payload: { type: 'info', message: `New message from ${data.sender}` } 
          });
       });

       return () => {
         socketService.disconnect();
       };
    }
  }, [state.currentUser, dispatch]);

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
    // Optimistic UI Update
    dispatch({ type: 'SEND_MESSAGE', payload: { sessionId, text, type, metadata } });
    
    try {
      await api.chats.sendMessage(sessionId, text, type, metadata);
      // No need to emit via socket, Firestore listener will pick up changes if we implement full real-time syncing in the hook
    } catch (e) {
      console.error(e);
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Failed to send message' } });
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
          type: 'text'
        }
      } 
    });
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

  // Global Loading Overlay
  const renderLoading = () => {
    if (!state.isLoading) return null;
    return (
      <div className="absolute inset-0 z-50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ff1744] animate-spin" />
      </div>
    );
  };

  if (state.screen === 'splash') {
    return <SplashScreen />;
  }

  if (state.screen === 'login') {
    return (
      <>
        {renderNotifications()}
        <LoginScreen onNavigate={() => dispatch({ type: 'SET_SCREEN', payload: 'signup' })} />
      </>
    );
  }

  if (state.screen === 'signup') {
    return (
      <>
        {renderNotifications()}
        <SignupScreen onNavigate={() => dispatch({ type: 'SET_SCREEN', payload: 'login' })} />
      </>
    );
  }

  // --- MAIN APP ---
  const selectedChat = state.chats.find(c => c.id === state.selectedChatId);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-200 dark:border-slate-800 transition-colors duration-300">
      {renderNotifications()}
      {renderLoading()}
      {state.activeCall && <CallOverlay call={state.activeCall} />}

      {/* Offline Banner */}
      {!state.isOnline && (
        <div className="bg-slate-800 dark:bg-slate-900 text-white text-[10px] font-bold text-center py-1.5 absolute top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2 border-b border-white/10">
           <WifiOff className="w-3 h-3" />
           You are currently offline. Using cached data.
        </div>
      )}

      {/* Render Chat Window if selected */}
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
          {/* Dynamic Header */}
          {state.activeTab === Tab.CHATS && (
            <div className={`p-4 flex justify-between items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10 sticky top-0 border-b border-gray-100 dark:border-slate-800 ${!state.isOnline ? 'mt-6' : ''}`}>
              <h1 className="text-xl font-bold tracking-wide font-[Poppins] text-[#ff1744]">PingSpace</h1>
              <div className="flex gap-4">
                 <button 
                   onClick={() => dispatch({ type: 'SET_TAB', payload: Tab.SPACES })}
                   className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-[#ff1744] hover:border-[#ff1744] dark:hover:border-[#ff1744] group transition-all shadow-sm"
                   aria-label="Go to Spaces"
                 >
                   <LayoutGrid className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-white" />
                   <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-white">Spaces</span>
                 </button>
              </div>
            </div>
          )}

          {/* Main Content Area */}
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

          {/* Bottom Navigation */}
          <nav className="h-[72px] bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 flex justify-between items-center px-2 pb-2 fixed bottom-0 w-full max-w-md z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.02)] transition-colors duration-300">
            {[
              { id: Tab.CHATS, icon: MessageCircle, label: 'Chats' },
              { id: Tab.STATUS, icon: CircleDashed, label: 'Status' },
              { id: Tab.DISCOVERY, icon: Compass, label: 'Discover' },
              { id: Tab.MARKET, icon: ShoppingBag, label: 'Market' },
              { id: Tab.PROFILE, icon: UserIcon, label: 'Profile' },
            ].map((item) => {
              // Highlight Chats tab if we are in Chats OR Spaces
              const isActive = state.activeTab === item.id || (item.id === Tab.CHATS && state.activeTab === Tab.SPACES);
              
              return (
                <button
                  key={item.id}
                  onClick={() => dispatch({ type: 'SET_TAB', payload: item.id as Tab })}
                  className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 ${isActive ? 'text-[#ff1744]' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'}`}
                  aria-selected={isActive}
                  role="tab"
                >
                  <item.icon className={`w-6 h-6 ${isActive ? 'fill-[#ff1744]/10' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">{item.label}</span>
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
