
import React, { useEffect } from 'react';
import { MessageCircle, CircleDashed, Compass, LayoutGrid, ShoppingBag, User as UserIcon, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';
import { Tab } from './types';
import { ChatList, ChatWindow } from './components/ChatFeatures';
import { StatusScreen, DiscoveryScreen, SpacesScreen, MarketplaceScreen, ProfileScreen } from './components/TabScreens';
import { SplashScreen, LoginScreen, SignupScreen } from './components/AuthScreens';
import { GlobalProvider, useGlobalState, useGlobalDispatch } from './store';
import { api } from './services/api';
import { authService } from './services/auth';
import { socketService } from './services/socket';

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

  // --- 2. INITIALIZATION & AUTH CHECK ---
  useEffect(() => {
    const initApp = async () => {
      // Small artificial delay for splash screen visibility
      await new Promise(r => setTimeout(r, 2000));
      
      try {
        if (authService.isAuthenticated()) {
          const user = await api.auth.me();
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
          
          // Initialize Data
          dispatch({ type: 'SET_LOADING', payload: true });
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
          dispatch({ type: 'SET_LOADING', payload: false });
          
          // Connect Socket
          socketService.connect(authService.getToken()!);

        } else {
          dispatch({ type: 'SET_SCREEN', payload: 'login' });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        authService.clearSession();
        dispatch({ type: 'SET_SCREEN', payload: 'login' });
      }
    };

    if (state.screen === 'splash') {
      initApp();
    }
  }, [state.screen, dispatch]);

  // --- 3. SOCKET LISTENERS ---
  useEffect(() => {
    // Only set up listeners if we are logged in
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

  // --- 4. AUTO-REMOVE NOTIFICATIONS ---
  useEffect(() => {
    if (state.notifications.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: state.notifications[0].id });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.notifications, dispatch]);

  const handleSendMessage = async (sessionId: string, text: string) => {
    // Update UI immediately (Optimistic UI)
    dispatch({ type: 'SEND_MESSAGE', payload: { sessionId, text } });
    
    try {
      // Send to Backend
      await api.chats.sendMessage(sessionId, text);
      // Emit via Socket
      socketService.emit('send_message', { sessionId, text });
    } catch (e) {
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

  if (state.selectedChatId && selectedChat) {
    return (
      <ChatWindow 
        session={selectedChat} 
        currentUser={state.currentUser!}
        onBack={() => dispatch({ type: 'SELECT_CHAT', payload: null })}
        onSendMessage={handleSendMessage}
        onBotResponse={handleBotResponse}
      />
    );
  }

  const renderTabContent = () => {
    switch (state.activeTab) {
      case Tab.CHATS:
        return (
          <ChatList 
            chats={state.chats}
            contacts={state.contacts}
            onSelectChat={(id) => dispatch({ type: 'SELECT_CHAT', payload: id })} 
          />
        );
      case Tab.STATUS:
        return <StatusScreen />;
      case Tab.DISCOVERY:
        return <DiscoveryScreen />;
      case Tab.SPACES:
        return <SpacesScreen spaces={state.spaces} />;
      case Tab.MARKET:
        return <MarketplaceScreen />;
      case Tab.PROFILE:
        return <ProfileScreen />;
      default:
        // Handle Spaces implicitly here if set as active tab
        if (state.activeTab === Tab.SPACES) {
          return <SpacesScreen spaces={state.spaces} />;
        }
        return <div className="p-10 text-center dark:text-white">Unknown Tab</div>;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-200 dark:border-slate-800 transition-colors duration-300">
      {renderNotifications()}
      {renderLoading()}

      {/* Dynamic Header */}
      {state.activeTab === Tab.CHATS && (
        <div className="p-4 flex justify-between items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10 sticky top-0 border-b border-gray-100 dark:border-slate-800">
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
        {renderTabContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="h-[72px] bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex justify-between items-center px-2 pb-2 fixed bottom-0 w-full max-w-md z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.02)] transition-colors duration-300">
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
