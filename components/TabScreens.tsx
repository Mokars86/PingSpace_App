

import React, { useState } from 'react';
import { 
  Search, Plus, Heart, MessageCircle, Share2, 
  Users, ShoppingCart, 
  Settings, Shield, Smartphone, HelpCircle, LogOut,
  Wallet, ArrowUpRight, ArrowDownLeft, QrCode,
  CreditCard, Send, Scan, Target,
  Zap, TrendingUp,
  Compass, User as UserIcon, ArrowRightLeft, X, Trash2,
  Lock, Fingerprint, Delete, Check,
  ChevronLeft, ChevronRight, Camera, Moon, Sun, ShieldCheck, Key,
  Layout, ListTodo, Calendar, Link, MoreHorizontal
} from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { Space, WorkspaceWidget } from '../types';
import { useGlobalState, useGlobalDispatch } from '../store';
import { api } from '../services/api';

// --- Status Screen ---
export const StatusScreen: React.FC = () => {
  return (
    <div className="p-4 overflow-y-auto h-full pb-24 bg-gray-50 dark:bg-slate-950 transition-colors">
      <h2 className="text-2xl font-bold font-[Poppins] mb-4 text-slate-900 dark:text-white">Status</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        <div className="flex flex-col items-center gap-2">
           <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm">
             <Plus className="w-6 h-6 text-[#ff1744]" />
           </div>
           <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Add Story</span>
        </div>
        {[1,2,3,4,5].map(i => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#ff1744] to-orange-400">
              <img src={`https://picsum.photos/100/100?random=${i}`} className="w-full h-full rounded-full border-2 border-white dark:border-slate-900 object-cover" alt="User story" />
            </div>
            <span className="text-xs text-slate-700 dark:text-slate-300">User {i}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-6 space-y-4">
         <h3 className="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Recent Updates</h3>
         {[1,2,3].map(i => (
           <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#ff1744] to-orange-400">
                <img src={`https://picsum.photos/100/100?random=${i+10}`} className="w-full h-full rounded-full border-2 border-white dark:border-slate-900 object-cover" alt="Friend story" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">Friend {i}</h4>
                <p className="text-xs text-gray-500 dark:text-slate-500">Today, 10:3{i} AM</p>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

// --- Discovery Screen ---
export const DiscoveryScreen: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto pb-24 bg-gray-50 dark:bg-slate-950 transition-colors">
      <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10 p-4 border-b border-gray-100 dark:border-slate-800">
        <div className="relative shadow-sm rounded-xl">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search users, spaces, products..." className="w-full bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#ff1744]/20 transition-all placeholder-gray-500 font-medium" />
        </div>
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
          {['All', 'People', 'Posts', 'Products', 'Spaces'].map(filter => (
            <button key={filter} className="px-5 py-2 rounded-full text-xs font-bold border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#ff1744] hover:text-white hover:border-[#ff1744] transition-colors whitespace-nowrap shadow-sm first:bg-[#ff1744] first:text-white first:border-[#ff1744]">
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Trending People</h3>
            <button className="text-xs text-[#ff1744] font-bold cursor-pointer hover:underline">View All</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="min-w-[140px] bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow">
                <img src={`https://picsum.photos/150/150?random=${i+20}`} className="w-16 h-16 rounded-full mb-3 object-cover shadow-sm" alt="Creator" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Creator {i}</h4>
                <p className="text-[10px] text-gray-400 mb-3">@creator_{i}</p>
                <button className="w-full py-1.5 rounded-lg bg-[#ff1744]/10 text-[#ff1744] text-xs font-bold hover:bg-[#ff1744] hover:text-white transition-colors">Follow</button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Public Posts</h3>
          {[1, 2].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm">
              <div className="p-4 flex items-center gap-3">
                <img src={`https://picsum.photos/50/50?random=${i+30}`} className="w-10 h-10 rounded-full shadow-sm" alt="Author" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Tech Influencer</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-500">@tech_guru</p>
                </div>
                <span className="text-xs text-gray-400 ml-auto font-medium">2h ago</span>
              </div>
              <img src={`https://picsum.photos/600/400?random=${i+40}`} className="w-full h-56 object-cover" alt="Post content" />
              <div className="p-4">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">Just checked out the new PingSpace update. The UI is incredibly smooth! 🚀 <span className="text-[#ff1744] font-medium">#tech #design</span></p>
                <div className="flex items-center gap-6 mt-4 text-gray-400 border-t border-gray-50 dark:border-slate-800 pt-3">
                  <button className="flex items-center gap-2 hover:text-[#ff1744] transition-colors"><Heart className="w-5 h-5" /> <span className="text-xs font-bold">1.2k</span></button>
                  <button className="flex items-center gap-2 hover:text-slate-800 dark:hover:text-white transition-colors"><MessageCircle className="w-5 h-5" /> <span className="text-xs font-bold">45</span></button>
                  <button className="flex items-center gap-2 hover:text-slate-800 dark:hover:text-white transition-colors ml-auto"><Share2 className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

// --- Spaces Screen ---
export const SpacesScreen: React.FC<{spaces: Space[]}> = ({ spaces }) => {
  const [activeView, setActiveView] = useState<'community' | 'desk'>('community');
  const { workspaceWidgets } = useGlobalState();
  const dispatch = useGlobalDispatch();

  const renderWidget = (widget: WorkspaceWidget) => {
    return (
      <div key={widget.id} className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm ${widget.w} animate-in zoom-in-95`}>
        <div className="flex justify-between items-center mb-3">
           <div className="flex items-center gap-2 text-[#ff1744]">
             {widget.type === 'tasks' && <ListTodo className="w-4 h-4" />}
             {widget.type === 'notes' && <Layout className="w-4 h-4" />}
             {widget.type === 'links' && <Link className="w-4 h-4" />}
             <h4 className="font-bold text-sm text-slate-900 dark:text-white">{widget.title}</h4>
           </div>
           <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
        </div>
        
        <div className="space-y-2">
           {widget.type === 'tasks' && widget.content.map((task: any) => (
             <div key={task.id} onClick={() => dispatch({type: 'TOGGLE_TASK', payload: {widgetId: widget.id, taskId: task.id}})} className="flex items-center gap-3 cursor-pointer group">
               <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${task.done ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-slate-600'}`}>
                 {task.done && <Check className="w-3 h-3 text-white" />}
               </div>
               <span className={`text-sm ${task.done ? 'text-gray-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{task.text}</span>
             </div>
           ))}
           
           {widget.type === 'notes' && (
             <p className="text-sm text-gray-500 dark:text-slate-400 italic leading-relaxed">{widget.content}</p>
           )}

           {widget.type === 'links' && widget.content.map((link: any, i: number) => (
             <a key={i} href={link.url} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
               <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{link.label}</span>
               <ArrowUpRight className="w-3 h-3 text-gray-400" />
             </a>
           ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto pb-24 p-4 bg-gray-50 dark:bg-slate-950 transition-colors">
      <div className="flex justify-between items-end mb-6">
         <div>
            <h2 className="text-2xl font-bold font-[Poppins] text-slate-900 dark:text-white">Spaces</h2>
            <p className="text-gray-500 dark:text-slate-500 text-sm mt-1">Your digital HQ</p>
         </div>
         <button className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center border border-gray-100 dark:border-slate-700 hover:bg-[#ff1744] hover:text-white group transition-colors">
           <Plus className="w-6 h-6 text-[#ff1744] group-hover:text-white" />
         </button>
      </div>

      <div className="flex gap-2 mb-6 bg-gray-200 dark:bg-slate-800 p-1 rounded-xl">
        <button 
          onClick={() => setActiveView('community')}
          className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${activeView === 'community' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-slate-700'}`}
        >
          Communities
        </button>
        <button 
          onClick={() => setActiveView('desk')}
          className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${activeView === 'desk' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-slate-700'}`}
        >
          My Desk
        </button>
      </div>

      {activeView === 'community' ? (
        <div className="grid grid-cols-1 gap-5 animate-in slide-in-from-left-4 duration-300">
          {spaces.map(space => (
            <div key={space.id} className="relative h-48 rounded-3xl overflow-hidden group cursor-pointer shadow-md">
              <img src={space.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={space.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end">
                <h3 className="font-bold text-xl text-white mb-1">{space.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-200 line-clamp-1 w-2/3">{space.description}</span>
                  <span className="text-xs font-bold bg-white/20 backdrop-blur-md text-white px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Users className="w-3 h-3" /> {(space.members / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
           <div className="flex justify-between items-center mb-2">
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">My Widgets</h3>
             <Settings className="w-4 h-4 text-gray-400" />
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             {workspaceWidgets.map(renderWidget)}
             
             {/* Add Widget Placeholder */}
             <div className="col-span-1 min-h-[140px] border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#ff1744] hover:text-[#ff1744] cursor-pointer transition-colors">
                <Plus className="w-6 h-6" />
                <span className="text-xs font-bold">Add Widget</span>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

// --- Marketplace Screen ---
export const MarketplaceScreen: React.FC = () => {
  const { products, cart } = useGlobalState();
  const dispatch = useGlobalDispatch();
  const [showCart, setShowCart] = useState(false);
  
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="h-full overflow-y-auto pb-24 bg-gray-50 dark:bg-slate-950 transition-colors relative">
       <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10 p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <h2 className="text-2xl font-bold font-[Poppins] text-[#ff1744]">Market</h2>
          <div className="flex gap-3">
            <button className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-[#ff1744] hover:text-white transition-colors"><Search className="w-5 h-5" /></button>
            <button 
              onClick={() => setShowCart(true)} 
              className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-[#ff1744] hover:text-white transition-colors relative"
              aria-label={`Cart, ${cart.length} items`}
            >
               <ShoppingCart className="w-5 h-5" />
               {cart.length > 0 && (
                 <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff1744] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                   {cart.length}
                 </span>
               )}
            </button>
          </div>
       </div>

       <div className="p-4 grid grid-cols-2 gap-4">
         {products.map(product => (
           <div key={product.id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all group flex flex-col">
             <div className="relative h-40">
               <img src={product.image} className="w-full h-full object-cover" alt={product.title} />
               <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-full flex items-center justify-center text-slate-900 dark:text-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#ff1744]">
                 <Heart className="w-4 h-4" />
               </button>
             </div>
             <div className="p-3 flex-1 flex flex-col">
               <div className="flex justify-between items-start mb-1 gap-1">
                 <h4 className="font-bold text-sm truncate text-slate-800 dark:text-slate-200">{product.title}</h4>
                 <div className="flex items-center gap-0.5 text-[10px] text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded">
                   ★ {product.rating}
                 </div>
               </div>
               <p className="font-bold text-[#ff1744] text-lg mb-2">${product.price}</p>
               <div className="flex items-center gap-1.5 mt-auto pt-3 border-t border-gray-50 dark:border-slate-800 mb-3">
                 <img src={`https://picsum.photos/50/50?random=${product.id}`} className="w-5 h-5 rounded-full object-cover" alt="Seller" />
                 <span className="text-xs text-gray-500 dark:text-slate-400 truncate font-medium">{product.seller}</span>
               </div>
               <button 
                onClick={() => {
                  dispatch({ type: 'ADD_TO_CART', payload: product });
                  dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: `Added ${product.title} to cart` } });
                }}
                className="w-full py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-[#ff1744] dark:hover:bg-[#ff1744] transition-colors"
               >
                 Add to Cart
               </button>
             </div>
           </div>
         ))}
       </div>
       
       <button className="fixed bottom-24 right-6 bg-[#ff1744] text-white px-5 py-3.5 rounded-full font-bold shadow-xl shadow-red-500/30 flex items-center gap-2 z-10 hover:scale-105 transition-transform">
         <Plus className="w-5 h-5" /> Sell Item
       </button>

       {/* Cart Modal */}
       {showCart && (
         <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
               <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white">Your Cart ({cart.length})</h3>
                  <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
                    <X className="w-6 h-6 text-slate-500" />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50 dark:bg-slate-950">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                       <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                         <ShoppingCart className="w-10 h-10 text-gray-300 dark:text-slate-600" />
                       </div>
                       <p className="text-gray-500 dark:text-slate-400 font-medium">Your cart is empty.</p>
                       <button onClick={() => setShowCart(false)} className="text-[#ff1744] font-bold text-sm">Start Shopping</button>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="flex gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                         <img src={item.image} className="w-20 h-20 rounded-xl object-cover" alt={item.title} />
                         <div className="flex-1 flex flex-col justify-between">
                            <div>
                               <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.title}</h4>
                               <p className="text-xs text-gray-500 font-medium">{item.seller}</p>
                            </div>
                            <div className="flex justify-between items-center">
                               <p className="font-bold text-[#ff1744]">${item.price * item.quantity}</p>
                               <div className="flex items-center gap-3">
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Qty: {item.quantity}</span>
                                  <button onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.id })} className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))
                  )}
               </div>

               <div className="p-6 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-4">
                     <span className="text-slate-500 font-medium">Total</span>
                     <span className="text-2xl font-bold text-slate-900 dark:text-white">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button className="w-full py-4 bg-[#ff1744] text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 hover:bg-red-600 active:scale-[0.98] transition-all">
                     Checkout Now
                  </button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

// --- Enhanced Wallet & Profile Screen ---
export const ProfileScreen: React.FC = () => {
  const { currentUser: user, transactions, theme } = useGlobalState();
  const dispatch = useGlobalDispatch();
  const [activeTab, setActiveTab] = useState<'wallet' | 'account'>('wallet');
  const [subSection, setSubSection] = useState<'none' | 'personal' | 'security' | 'appearance'>('none');
  
  // Converter State
  const [showConverter, setShowConverter] = useState(false);
  const [convAmount, setConvAmount] = useState<string>('1');
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('EUR');

  // Send Money Modal State
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendStep, setSendStep] = useState<'input' | 'security' | 'success'>('input');
  const [sendData, setSendData] = useState({ recipient: '', amount: '' });
  const [pin, setPin] = useState('');

  // Personal Info Edit State
  const [editName, setEditName] = useState(user?.name || '');
  const [editBio, setEditBio] = useState('Digital enthusiast living in the future.');
  const [editPhone, setEditPhone] = useState('+1 (555) 000-0000');

  const rates: Record<string, number> = {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      JPY: 150.5,
      CAD: 1.36,
      NGN: 1600.0,
      GHS: 13.5
  };
  
  const conversionResult = (parseFloat(convAmount || '0') * (rates[toCurr] / rates[fromCurr])).toFixed(2);

  if (!user) return null;

  const handleLogout = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await api.auth.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (err) {
      console.error(err);
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleSaveProfile = () => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Profile updated successfully!' } });
    setSubSection('none');
  };

  const handleToggleTheme = (newTheme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: newTheme });
  };

  // Enhanced Chart Data
  const data = transactions.map((t, i) => ({
    name: i,
    amount: t.type === 'received' || t.type === 'deposit' ? t.amount : -t.amount,
    category: t.entity
  }));

  let runningBalance = 2450;
  const chartData = data.reverse().map(d => {
    runningBalance += d.amount;
    return { name: d.name, balance: runningBalance, amt: Math.abs(d.amount) };
  });

  const handleSendAction = (actionLabel: string) => {
    if (actionLabel === 'Send') {
      setSendStep('input');
      setSendData({ recipient: '', amount: '' });
      setPin('');
      setShowSendModal(true);
    }
  };

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const verifyTransaction = () => {
    // Simulate verification
    if (pin === '1234' || pin.length === 4) {
      dispatch({ 
        type: 'ADD_TRANSACTION', 
        payload: {
          id: Date.now().toString(),
          type: 'sent',
          amount: parseFloat(sendData.amount),
          date: 'Just now',
          entity: sendData.recipient
        }
      });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Transfer Successful!' } });
      setSendStep('success');
    } else {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Incorrect PIN' } });
      setPin('');
    }
  };

  const handleBiometric = () => {
     // Simulate FaceID success
     setTimeout(() => {
        dispatch({ 
          type: 'ADD_TRANSACTION', 
          payload: {
            id: Date.now().toString(),
            type: 'sent',
            amount: parseFloat(sendData.amount),
            date: 'Just now',
            entity: sendData.recipient
          }
        });
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Verified with FaceID' } });
        setSendStep('success');
     }, 1000);
  };

  // --- SUB SCREENS RENDERING ---
  if (subSection === 'personal') {
     return (
       <div className="h-full flex flex-col bg-gray-50 dark:bg-slate-950">
          <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 sticky top-0 z-10">
            <button onClick={() => setSubSection('none')} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
               <ChevronLeft className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Personal Info</h3>
          </div>
          <div className="p-6 space-y-6 overflow-y-auto">
             <div className="flex flex-col items-center">
                <div className="relative">
                   <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-md object-cover" alt="Profile" />
                   <button className="absolute bottom-0 right-0 p-2 bg-[#ff1744] text-white rounded-full shadow-sm hover:scale-105 transition-transform">
                      <Camera className="w-4 h-4" />
                   </button>
                </div>
             </div>
             
             <div className="space-y-4">
                <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                   <input 
                      type="text" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#ff1744]" 
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-400 uppercase">Bio</label>
                   <textarea 
                      value={editBio} 
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#ff1744] resize-none" 
                      rows={3}
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
                   <input 
                      type="tel" 
                      value={editPhone} 
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#ff1744]" 
                   />
                </div>
                <div className="space-y-1 opacity-60">
                   <label className="text-xs font-bold text-gray-400 uppercase">Email (Read-only)</label>
                   <input 
                      type="email" 
                      value="alex.nova@example.com" 
                      readOnly
                      className="w-full p-4 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold focus:outline-none cursor-not-allowed" 
                   />
                </div>
             </div>

             <button onClick={handleSaveProfile} className="w-full py-4 bg-[#ff1744] text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all mt-4">
               Save Changes
             </button>
          </div>
       </div>
     );
  }

  if (subSection === 'security') {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-slate-950">
         <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 sticky top-0 z-10">
           <button onClick={() => setSubSection('none')} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
              <ChevronLeft className="w-6 h-6" />
           </button>
           <h3 className="text-xl font-bold text-slate-900 dark:text-white">Login & Security</h3>
         </div>
         <div className="p-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                     <Key className="w-5 h-5" />
                  </div>
                  <div>
                     <h4 className="font-bold text-slate-900 dark:text-white">Password</h4>
                     <p className="text-xs text-gray-500 dark:text-slate-500">Last changed 3 months ago</p>
                  </div>
               </div>
               <button onClick={() => dispatch({type: 'ADD_NOTIFICATION', payload: {type: 'info', message: 'Reset link sent to email'}})} className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  Change Password
               </button>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                     <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                     <h4 className="font-bold text-slate-900 dark:text-white">Two-Factor Auth</h4>
                     <p className="text-xs text-gray-500 dark:text-slate-500">Extra layer of security</p>
                  </div>
               </div>
               <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff1744]"></div>
               </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center">
                     <Fingerprint className="w-5 h-5" />
                  </div>
                  <div>
                     <h4 className="font-bold text-slate-900 dark:text-white">Biometric Login</h4>
                     <p className="text-xs text-gray-500 dark:text-slate-500">FaceID / TouchID</p>
                  </div>
               </div>
               <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff1744]"></div>
               </div>
            </div>
         </div>
      </div>
    );
  }

  if (subSection === 'appearance') {
     return (
       <div className="h-full flex flex-col bg-gray-50 dark:bg-slate-950">
          <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 sticky top-0 z-10">
            <button onClick={() => setSubSection('none')} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
               <ChevronLeft className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Appearance</h3>
          </div>
          <div className="p-4 space-y-4">
             <h4 className="text-xs font-bold text-gray-400 uppercase ml-2">Theme</h4>
             <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <button 
                  onClick={() => handleToggleTheme('light')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800 border-b border-gray-100 dark:border-slate-800 transition-colors"
                >
                   <div className="flex items-center gap-3">
                      <Sun className="w-5 h-5 text-orange-500" />
                      <span className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-500 dark:text-slate-400'}`}>Light Mode</span>
                   </div>
                   {theme === 'light' && <Check className="w-5 h-5 text-[#ff1744]" />}
                </button>
                <button 
                  onClick={() => handleToggleTheme('dark')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                   <div className="flex items-center gap-3">
                      <Moon className="w-5 h-5 text-slate-400 dark:text-slate-200" />
                      <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-400'}`}>Dark Mode</span>
                   </div>
                   {theme === 'dark' && <Check className="w-5 h-5 text-[#ff1744]" />}
                </button>
             </div>
          </div>
       </div>
     );
  }

  return (
    <div className="h-full overflow-y-auto pb-24 bg-gray-50 dark:bg-slate-950 transition-colors relative">
      {/* Top Header */}
      <div className="p-6 pb-2 bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-gray-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-bold font-[Poppins] text-slate-900 dark:text-white">Profile</h2>
           <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
             <Settings className="w-6 h-6 text-slate-600 dark:text-slate-300" />
           </button>
        </div>
        
        {/* Profile Info Mini */}
        <div className="flex items-center gap-4 mb-6">
           <div className="relative">
              <img src={user.avatar} className="w-16 h-16 rounded-full border-2 border-white dark:border-slate-800 shadow-md object-cover" alt="Profile" />
              <button className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 p-1.5 rounded-full border border-gray-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-300">
                <QrCode className="w-3 h-3" />
              </button>
           </div>
           <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h3>
              <p className="text-slate-500 text-sm">@pixel_pioneer</p>
           </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
           <button 
             onClick={() => setActiveTab('wallet')} 
             className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'wallet' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             <Wallet className="w-4 h-4" /> Wallet
           </button>
           <button 
             onClick={() => setActiveTab('account')} 
             className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'account' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             <UserIcon className="w-4 h-4" /> Account
           </button>
        </div>
      </div>

      {activeTab === 'wallet' ? (
        <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Virtual Card */}
          <div className="relative w-full aspect-[1.586] rounded-3xl overflow-hidden shadow-2xl shadow-red-500/20 group perspective">
             <div className="absolute inset-0 bg-gradient-to-br from-[#ff1744] to-[#d50000] p-6 flex flex-col justify-between text-white transition-transform transform group-hover:scale-105 duration-500">
                <div className="flex justify-between items-start">
                   <div>
                      <p className="text-white/70 text-sm font-medium tracking-wider">Current Balance</p>
                      <h3 className="text-3xl font-bold mt-1">$2,450.30</h3>
                   </div>
                   <CreditCard className="w-8 h-8 text-white/50" />
                </div>
                
                <div className="space-y-4">
                   <div className="flex gap-3 items-center opacity-80">
                      <div className="w-10 h-7 bg-yellow-400/90 rounded-md flex items-center justify-center relative overflow-hidden">
                        <div className="absolute w-full h-[1px] bg-black/10 top-2"></div>
                        <div className="absolute w-full h-[1px] bg-black/10 bottom-2"></div>
                      </div>
                      <span className="font-mono text-lg tracking-widest">**** **** **** 4289</span>
                   </div>
                   <div className="flex justify-between items-end">
                      <div>
                         <p className="text-[10px] uppercase text-white/60 font-bold mb-0.5">Card Holder</p>
                         <p className="font-medium tracking-wide text-sm">{user.name.toUpperCase()}</p>
                      </div>
                      <div>
                         <p className="text-[10px] uppercase text-white/60 font-bold mb-0.5">Expires</p>
                         <p className="font-medium tracking-wide text-sm">12/26</p>
                      </div>
                   </div>
                </div>
             </div>
             {/* Gloss Effect */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-4">
             {[
               { icon: Send, label: 'Send', bg: 'bg-blue-50 dark:bg-blue-900/20', color: 'text-blue-600 dark:text-blue-400' },
               { icon: ArrowDownLeft, label: 'Request', bg: 'bg-green-50 dark:bg-green-900/20', color: 'text-green-600 dark:text-green-400' },
               { icon: Plus, label: 'Top Up', bg: 'bg-orange-50 dark:bg-orange-900/20', color: 'text-orange-600 dark:text-orange-400' },
               { icon: Scan, label: 'Scan', bg: 'bg-purple-50 dark:bg-purple-900/20', color: 'text-purple-600 dark:text-purple-400' },
             ].map((action, i) => (
               <div key={i} onClick={() => handleSendAction(action.label)} className="flex flex-col items-center gap-2 cursor-pointer group">
                  <div className={`w-14 h-14 ${action.bg} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                     <action.icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{action.label}</span>
               </div>
             ))}
          </div>
          
          {/* Currency Converter Trigger */}
          <button 
            onClick={() => setShowConverter(true)}
            className="w-full py-3 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowRightLeft className="w-5 h-5 text-[#ff1744]" /> Currency Converter
          </button>

          {/* Spending Analysis */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#ff1744]" /> Spending</h3>
                <select className="bg-gray-50 dark:bg-slate-800 border-none text-xs font-bold text-gray-500 rounded-lg py-1 px-2 focus:ring-0">
                  <option>This Week</option>
                  <option>Last Month</option>
                </select>
             </div>
             <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData}>
                     <defs>
                       <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#ff1744" stopOpacity={0.2}/>
                         <stop offset="95%" stopColor="#ff1744" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <Tooltip 
                        contentStyle={{backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', color: theme === 'dark' ? '#fff' : '#0f172a', fontWeight: 'bold'}} 
                        itemStyle={{color: '#ff1744'}}
                     />
                     <Area type="monotone" dataKey="balance" stroke="#ff1744" strokeWidth={3} fillOpacity={1} fill="url(#colorBal)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Savings Vaults */}
          <div>
            <div className="flex justify-between items-center mb-3 px-1">
               <h3 className="font-bold text-slate-800 dark:text-white">Savings Goals</h3>
               <Plus className="w-4 h-4 text-gray-400 cursor-pointer hover:text-[#ff1744]" />
            </div>
            <div className="space-y-3">
               <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-50 dark:bg-pink-900/20 rounded-xl flex items-center justify-center text-pink-500">
                     <Target className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between mb-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">New Laptop</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">$1,200 / $2,000</span>
                     </div>
                     <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500 w-[60%] rounded-full"></div>
                     </div>
                  </div>
               </div>
               <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-500">
                     <Compass className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between mb-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">Japan Trip</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">$850 / $3,500</span>
                     </div>
                     <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[24%] rounded-full"></div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
             <h3 className="font-bold text-slate-800 dark:text-white mb-3 px-1">Recent Activity</h3>
             <div className="space-y-3">
               {transactions.map(t => (
                 <div key={t.id} className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          t.type === 'received' || t.type === 'deposit' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'
                       }`}>
                          {t.type === 'received' ? <ArrowDownLeft className="w-5 h-5" /> : 
                           t.type === 'withdraw' ? <Wallet className="w-5 h-5" /> :
                           t.type === 'deposit' ? <Plus className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                       </div>
                       <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t.entity}</p>
                          <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">{t.date}</p>
                       </div>
                    </div>
                    <span className={`font-bold ${
                       t.type === 'received' || t.type === 'deposit' ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'
                    }`}>
                       {t.type === 'received' || t.type === 'deposit' ? '+' : '-'}${t.amount}
                    </span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-2 animate-in fade-in slide-in-from-right-4 duration-500">
           {[
             { id: 'personal', icon: UserIcon, label: 'Personal Information' },
             { id: 'security', icon: Shield, label: 'Login & Security' },
             { id: 'devices', icon: Smartphone, label: 'Linked Devices' },
             { id: 'appearance', icon: Zap, label: 'App Appearance' },
             { id: 'support', icon: HelpCircle, label: 'Help & Support' },
           ].map((item, i) => (
             <button 
               key={i} 
               onClick={() => setSubSection(item.id as any)}
               className="w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-100 dark:border-slate-800 shadow-sm transition-all group"
             >
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 group-hover:bg-[#ff1744]/10 flex items-center justify-center transition-colors">
                    <item.icon className={`w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-[#ff1744]`} />
                 </div>
                 <span className="text-slate-700 dark:text-slate-200 font-bold">{item.label}</span>
               </div>
               <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-600 group-hover:text-[#ff1744]" />
             </button>
           ))}
           <button 
             onClick={handleLogout}
             className="w-full mt-8 p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 border border-red-100 dark:border-red-900/20 flex items-center justify-center gap-2 text-red-500 dark:text-red-400 font-bold transition-colors"
           >
             <LogOut className="w-5 h-5" /> Sign Out
           </button>
        </div>
      )}

      {/* Currency Converter Modal */}
      {showConverter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Currency Converter</h3>
                <button onClick={() => setShowConverter(false)} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
             </div>
             
             <div className="space-y-4">
                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Amount</label>
                   <div className="relative">
                      <span className="absolute left-4 top-3.5 text-slate-400 font-bold">$</span>
                      <input 
                        type="number" 
                        value={convAmount}
                        onChange={(e) => setConvAmount(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl py-3 pl-8 pr-4 text-slate-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#ff1744]/20"
                      />
                   </div>
                </div>
                
                <div className="flex items-center gap-2">
                   <div className="flex-1">
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">From</label>
                      <select 
                        value={fromCurr}
                        onChange={(e) => setFromCurr(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-3 text-slate-900 dark:text-white font-bold focus:outline-none"
                      >
                         {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div className="w-10 h-10 flex items-center justify-center mt-5">
                       <ArrowRightLeft className="w-5 h-5 text-gray-400" />
                   </div>
                   <div className="flex-1">
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">To</label>
                       <select 
                        value={toCurr}
                        onChange={(e) => setToCurr(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-3 text-slate-900 dark:text-white font-bold focus:outline-none"
                      >
                         {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                </div>
                
                <div className="bg-[#ff1744]/5 p-4 rounded-xl border border-[#ff1744]/10 mt-2">
                   <p className="text-center text-sm text-gray-500 dark:text-slate-400 font-medium mb-1">Estimated Amount</p>
                   <p className="text-center text-3xl font-bold text-[#ff1744]">
                     {conversionResult} <span className="text-lg text-[#ff1744]/70">{toCurr}</span>
                   </p>
                </div>
                
                <button onClick={() => setShowConverter(false)} className="w-full py-3.5 bg-[#ff1744] text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:bg-red-600 transition-colors mt-2">
                   Done
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Send Money Modal with PIN Security */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl w-full max-w-sm h-[85vh] sm:h-auto overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
             
             {sendStep === 'input' && (
               <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white">Send Money</h3>
                     <button onClick={() => setShowSendModal(false)} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                       <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                     </button>
                  </div>
                  
                  <div className="flex-1 space-y-6">
                     <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Recipient</label>
                        <div className="relative">
                           <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                           <input 
                             type="text"
                             value={sendData.recipient}
                             onChange={(e) => setSendData({...sendData, recipient: e.target.value})}
                             placeholder="@username or phone"
                             className="w-full bg-gray-50 dark:bg-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#ff1744]/20"
                           />
                        </div>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Amount</label>
                        <div className="relative">
                           <span className="absolute left-4 top-3.5 text-2xl font-bold text-slate-400">$</span>
                           <input 
                             type="number"
                             value={sendData.amount}
                             onChange={(e) => setSendData({...sendData, amount: e.target.value})}
                             placeholder="0.00"
                             className="w-full bg-gray-50 dark:bg-slate-800 rounded-2xl py-3.5 pl-10 pr-4 text-3xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff1744]/20"
                           />
                        </div>
                     </div>
                     
                     <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-blue-500 shadow-sm">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase mb-0.5">Paying From</p>
                           <p className="text-slate-800 dark:text-white font-bold text-sm">Main Wallet ($2,450.30)</p>
                        </div>
                     </div>
                  </div>

                  <button 
                    disabled={!sendData.recipient || !sendData.amount}
                    onClick={() => setSendStep('security')}
                    className="w-full py-4 bg-[#ff1744] text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-auto"
                  >
                     Continue
                  </button>
               </div>
             )}

             {sendStep === 'security' && (
               <div className="p-6 flex flex-col h-full items-center">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Security Check</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-sm mb-8 text-center">Enter your payment PIN to confirm transfer of <span className="font-bold text-slate-900 dark:text-white">${sendData.amount}</span> to <span className="font-bold text-slate-900 dark:text-white">{sendData.recipient}</span></p>
                  
                  {/* PIN Dots */}
                  <div className="flex gap-4 mb-10">
                     {[0,1,2,3].map(i => (
                        <div key={i} className={`w-4 h-4 rounded-full transition-all duration-200 ${i < pin.length ? 'bg-[#ff1744] scale-110' : 'bg-gray-200 dark:bg-slate-700'}`}></div>
                     ))}
                  </div>

                  {/* NumPad */}
                  <div className="grid grid-cols-3 gap-4 w-full max-w-[280px] mb-8">
                     {[1,2,3,4,5,6,7,8,9].map(num => (
                        <button 
                          key={num}
                          onClick={() => handlePinInput(num.toString())}
                          className="w-16 h-16 rounded-full bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-2xl font-bold text-slate-800 dark:text-white transition-colors mx-auto flex items-center justify-center"
                        >
                           {num}
                        </button>
                     ))}
                     <div className="flex items-center justify-center">
                        <button 
                           onClick={handleBiometric}
                           className="w-16 h-16 rounded-full flex items-center justify-center text-[#ff1744]"
                           title="Use FaceID"
                        >
                           <Fingerprint className="w-8 h-8" />
                        </button>
                     </div>
                     <button 
                        onClick={() => handlePinInput('0')}
                        className="w-16 h-16 rounded-full bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-2xl font-bold text-slate-800 dark:text-white transition-colors mx-auto flex items-center justify-center"
                     >
                        0
                     </button>
                     <div className="flex items-center justify-center">
                        <button 
                           onClick={handleBackspace}
                           className="w-16 h-16 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600"
                        >
                           <Delete className="w-6 h-6" />
                        </button>
                     </div>
                  </div>

                  <button 
                     disabled={pin.length !== 4}
                     onClick={verifyTransaction}
                     className="w-full py-4 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-2xl shadow-lg hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-auto"
                  >
                     Confirm Payment
                  </button>
                  <button onClick={() => setSendStep('input')} className="mt-4 text-sm font-bold text-gray-400">Cancel</button>
               </div>
             )}

             {sendStep === 'success' && (
                <div className="p-8 flex flex-col items-center justify-center h-full text-center">
                   <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                      <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
                   </div>
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Transfer Sent!</h3>
                   <p className="text-gray-500 dark:text-slate-400 mb-8">You successfully sent <span className="font-bold text-slate-900 dark:text-white">${sendData.amount}</span> to <span className="font-bold text-slate-900 dark:text-white">{sendData.recipient}</span>.</p>
                   
                   <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl w-full mb-8">
                      <div className="flex justify-between mb-2">
                         <span className="text-xs text-gray-400 font-bold uppercase">Transaction ID</span>
                         <span className="text-xs text-slate-700 dark:text-slate-300 font-mono">#TRX-{Math.floor(Math.random()*100000)}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-xs text-gray-400 font-bold uppercase">Date</span>
                         <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">{new Date().toLocaleDateString()}</span>
                      </div>
                   </div>

                   <button 
                     onClick={() => setShowSendModal(false)}
                     className="w-full py-4 bg-[#ff1744] text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all"
                   >
                      Done
                   </button>
                </div>
             )}
           </div>
        </div>
      )}
    </div>
  );
};