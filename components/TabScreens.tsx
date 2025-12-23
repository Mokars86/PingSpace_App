
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, Plus, Heart, MessageCircle, Share2, 
  Users, ShoppingCart, ShoppingBag,
  Settings, Shield, Smartphone, HelpCircle, LogOut,
  Wallet, ArrowUpRight, ArrowDownLeft, QrCode,
  CreditCard, Send, Scan, Target,
  Zap, TrendingUp,
  Compass, User as UserIcon, ArrowRightLeft, X, Trash2,
  Lock, Fingerprint, Delete, Check,
  ChevronLeft, ChevronRight, Camera, Moon, Sun, ShieldCheck, Key,
  Layout, ListTodo, Calendar, Link, MoreHorizontal,
  UploadCloud, Tag, Star, Truck, MapPin, Globe, Loader2,
  Radio, Hash, Play, Flame, Landmark, Maximize2, Laptop, Monitor, Mail, ChevronDown,
  Bell, Eye, EyeOff, AlertTriangle, CircleDashed, CheckCircle2, XCircle, Copy, Terminal,
  History, Sparkles, Image as ImageIcon, Box, Layers, MapPin as MapPinIcon, Info as InfoIcon, Edit3, Save,
  Fingerprint as SecurityIcon, Shield as ShieldIcon, RefreshCcw, Languages, Accessibility, 
  MessageSquareHeart, Bug, BookOpen, ShieldAlert, Wallet as WalletIcon, ShoppingCart as MarketIcon,
  Package, Info, MapPin as LocationIcon, CheckCircle, Minus, ShoppingCart as CartIcon, MoveRight,
  Trophy, Rocket, Coffee, Palette, Gamepad2, Cpu, Type as TypeIcon, HardDrive, MonitorSmartphone
} from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { Space, WorkspaceWidget, Product, Story, Transaction, AppSettings, CartItem, User } from '../types';
import { useGlobalState, useGlobalDispatch } from '../store';
import { api } from '../services/api';
import { storageService } from '../services/storage';
import { notificationService } from '../services/notificationService';
import { supabase } from '../services/supabase';
import { getCurrencyConversion, CurrencyConversion } from '../services/geminiService';

// --- Shared Setting Components ---
const SettingRow: React.FC<{ 
  icon: React.ElementType, 
  title: string, 
  subtitle?: string, 
  value?: string | boolean, 
  onClick?: () => void,
  isToggle?: boolean,
  color?: string,
  isDanger?: boolean
}> = ({ icon: Icon, title, subtitle, value, onClick, isToggle, color = "text-slate-400", isDanger }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-5 transition-all group border-b border-gray-50 dark:border-slate-800/50 last:border-0 ${isDanger ? 'hover:bg-red-50 dark:hover:bg-red-900/10' : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${isDanger ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-slate-100 dark:bg-slate-800 ' + color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-left">
        <h4 className={`font-black uppercase text-[10px] tracking-widest ${isDanger ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>{title}</h4>
        {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="flex items-center gap-3">
      {isToggle ? (
        <div className={`w-12 h-6 rounded-full relative transition-all ${value ? 'bg-[#ff1744]' : 'bg-slate-200 dark:bg-slate-700'}`}>
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${value ? 'left-7' : 'left-1'}`}></div>
        </div>
      ) : (
        <>
          {value && <span className="text-[10px] font-black text-[#ff1744] uppercase tracking-widest">{value}</span>}
          <ChevronRight className={`w-4 h-4 ${isDanger ? 'text-red-300' : 'text-slate-300'}`} />
        </>
      )}
    </div>
  </button>
);

const SettingSubHeader: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <div className="flex items-center gap-4 mb-8 sticky top-0 bg-gray-50/80 dark:bg-slate-950/80 backdrop-blur-xl z-20 py-2">
    <button onClick={onBack} className="p-2.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
      <ChevronLeft className="w-5 h-5" />
    </button>
    <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">{title}</h2>
  </div>
);

// --- Story Components ---
const StoryViewerModal: React.FC<{ stories: Story[]; onClose: () => void }> = ({ stories, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [reply, setReply] = useState('');
  const dispatch = useGlobalDispatch();
  const timerRef = useRef<any>(null);

  const activeStory = stories[currentIndex];

  useEffect(() => {
    if (activeStory) {
      setProgress(0);
      if (timerRef.current) clearInterval(timerRef.current);
      
      timerRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            handleNext();
            return 100;
          }
          return p + 1.2; 
        });
      }, 50);
    }
    return () => clearInterval(timerRef.current);
  }, [currentIndex, stories.length]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setProgress(0);
    }
  };

  const handleSendReply = () => {
    if (!reply.trim()) return;
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Transmission sent to ' + activeStory.userName } });
    setReply('');
    onClose();
  };

  if (!activeStory) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in fade-in duration-500">
       {/* Tap Zones for Navigation */}
       <div className="absolute inset-0 z-10 flex">
          <div className="w-1/3 h-full" onClick={handlePrev}></div>
          <div className="w-1/3 h-full" onClick={onClose}></div>
          <div className="w-1/3 h-full" onClick={handleNext}></div>
       </div>

       <div className="absolute top-0 left-0 right-0 p-6 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
          {/* Multi-segment Progress Bars */}
          <div className="flex gap-1.5 mb-5">
             {stories.map((_, idx) => (
                <div key={idx} className="h-1 bg-white/20 rounded-full flex-1 overflow-hidden">
                   <div 
                     className="h-full bg-white transition-all shadow-[0_0_12px_white]" 
                     style={{ 
                       width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
                     }}
                   ></div>
                </div>
             ))}
          </div>
          <div className="flex justify-between items-center pointer-events-auto">
             <div className="flex items-center gap-3">
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#ff1744] to-orange-400">
                  <img src={activeStory.userAvatar} className="w-11 h-11 rounded-full border-2 border-black object-cover" alt={activeStory.userName} />
                </div>
                <div>
                   <h4 className="font-bold text-white text-base tracking-tight">{activeStory.userName}</h4>
                   <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">{activeStory.timestamp}</p>
                </div>
             </div>
             <button onClick={onClose} className="p-2.5 bg-white/10 hover:bg-[#ff1744] rounded-full backdrop-blur-md text-white transition-all">
                <X className="w-6 h-6" />
             </button>
          </div>
       </div>

       <div className="flex-1 flex items-center justify-center p-4">
          {activeStory.type === 'image' ? (
             <img src={activeStory.content} className="max-w-full max-h-[80vh] object-contain rounded-3xl shadow-2xl" alt="Story" />
          ) : (
             <div className={`w-full aspect-[9/16] max-w-sm rounded-[3rem] flex items-center justify-center p-12 text-center shadow-2xl ${activeStory.background || 'bg-gradient-to-br from-[#ff1744] to-purple-600'}`}>
                <h2 className="text-3xl font-black text-white leading-tight uppercase tracking-tighter">{activeStory.content}</h2>
             </div>
          )}
       </div>

       {activeStory.caption && activeStory.type === 'image' && (
         <div className="px-8 pb-32 flex justify-center text-center z-20 pointer-events-none">
            <div className="max-w-md px-6 py-4 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10">
               <p className="text-white font-medium text-lg italic leading-relaxed">"{activeStory.caption}"</p>
            </div>
         </div>
       )}

       <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent pb-10 z-30">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-2xl p-2 rounded-[2rem] border border-white/10">
             <input 
               type="text" 
               value={reply}
               onChange={(e) => setReply(e.target.value)}
               placeholder="Transmit reply..." 
               className="flex-1 bg-transparent text-white px-4 py-3 outline-none font-bold text-sm"
             />
             <button 
               onClick={handleSendReply}
               className="p-3 bg-[#ff1744] text-white rounded-full shadow-lg shadow-red-500/30"
             >
                <Send className="w-5 h-5" />
             </button>
          </div>
       </div>
    </div>
  );
};

const AddStoryModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const dispatch = useGlobalDispatch();
  const [mode, setMode] = useState<'image' | 'text'>('image');
  const [image, setImage] = useState('');
  const [textContent, setTextContent] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeBg, setActiveBg] = useState('bg-gradient-to-br from-[#ff1744] to-purple-600');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const gradients = [
    'bg-gradient-to-br from-[#ff1744] to-purple-600',
    'bg-gradient-to-br from-indigo-500 to-emerald-500',
    'bg-gradient-to-br from-orange-400 to-rose-400',
    'bg-slate-900',
    'bg-gradient-to-br from-blue-600 to-indigo-700'
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await storageService.uploadFile(e.target.files[0]);
        setImage(url);
      } catch (error: any) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Upload failed.' } });
      } finally {
        setUploading(false);
      }
    }
  };

  const handlePost = async () => {
    if (mode === 'image' && !image) return;
    if (mode === 'text' && !textContent) return;
    
    setLoading(true);
    try {
      const content = mode === 'image' ? image : textContent;
      const newStory: Story = {
        id: Date.now().toString(),
        userId: 'me',
        userName: 'Me',
        userAvatar: 'https://ui-avatars.com/api/?name=Me&background=ff1744&color=fff',
        type: mode,
        content: content,
        timestamp: 'Just now',
        viewed: false,
        caption: mode === 'image' ? caption : undefined,
        background: mode === 'text' ? activeBg : undefined
      };
      dispatch({ type: 'ADD_STORY', payload: newStory });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Neural Sync Complete' } });
      onClose();
      resetForm();
    } catch (e: any) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Sync failed.' } });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setImage(''); setTextContent(''); setCaption(''); setMode('image');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-2xl animate-in fade-in p-4 overflow-y-auto no-scrollbar">
       <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-sm p-8 relative shadow-2xl border border-white/10 animate-in zoom-in-95 my-auto">
          <button onClick={onClose} className="absolute top-8 right-8 p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:rotate-90 transition-transform"><X className="w-5 h-5 text-slate-500" /></button>
          
          <div className="flex items-center gap-4 mb-8">
             <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-[#ff1744]">
                <Flame className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Neural Sync</h3>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Share Transmission</p>
             </div>
          </div>

          <div className="flex gap-2 mb-8 bg-gray-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-800">
             <button onClick={() => setMode('image')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'image' ? 'bg-white dark:bg-slate-800 text-[#ff1744] shadow-sm' : 'text-slate-400'}`}>Visual</button>
             <button onClick={() => setMode('text')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'text' ? 'bg-white dark:bg-slate-800 text-[#ff1744] shadow-sm' : 'text-slate-400'}`}>Thought</button>
          </div>

          {mode === 'image' ? (
             <div className="space-y-6">
                <div onClick={() => !uploading && fileInputRef.current?.click()} className="aspect-square bg-gray-50 dark:bg-slate-950 rounded-[2.5rem] overflow-hidden relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 group cursor-pointer hover:border-[#ff1744]/50 transition-colors">
                   {image ? <img src={image} className="w-full h-full object-cover" alt="Preview" /> : (
                      <>
                        <Camera className="w-10 h-10 text-slate-300 group-hover:text-[#ff1744] transition-colors mb-2" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Capture Visual</span>
                      </>
                   )}
                   <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                   {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>}
                </div>
                <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Neural caption..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-[#ff1744]/10 transition-all" />
             </div>
          ) : (
             <div className="space-y-6">
                <div className={`aspect-square rounded-[2.5rem] flex flex-col items-center justify-center p-8 transition-all duration-500 shadow-xl ${activeBg}`}>
                   <textarea 
                     value={textContent}
                     onChange={(e) => setTextContent(e.target.value)}
                     placeholder="Enter neural thought..."
                     className="w-full bg-transparent text-white text-center text-2xl font-black placeholder-white/40 border-none outline-none resize-none uppercase tracking-tighter"
                     rows={4}
                   />
                </div>
                <div className="flex justify-center gap-3">
                   {gradients.map(g => (
                      <button 
                        key={g} 
                        onClick={() => setActiveBg(g)} 
                        className={`w-8 h-8 rounded-full border-4 transition-all ${activeBg === g ? 'border-white scale-125' : 'border-transparent scale-90'} ${g}`} 
                      />
                   ))}
                </div>
             </div>
          )}

          <button onClick={handlePost} disabled={loading || uploading || (mode === 'image' ? !image : !textContent)} className="w-full mt-10 py-5 bg-[#ff1744] text-white font-black rounded-[2rem] shadow-xl shadow-red-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
             {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
               <>
                 <span>Broadcast Sync</span>
                 <Sparkles className="w-4 h-4" />
               </>
             )}
          </button>
       </div>
    </div>
  );
};

export const StatusScreen: React.FC = () => {
  const { stories, currentUser } = useGlobalState();
  const [showAddStory, setShowAddStory] = useState(false);
  const [viewStories, setViewStories] = useState<Story[] | null>(null);

  // Group stories by userId for combined viewing
  const groupedStories = useMemo(() => {
    return stories.reduce((acc, story) => {
      if (!acc[story.userId]) acc[story.userId] = [];
      acc[story.userId].push(story);
      return acc;
    }, {} as Record<string, Story[]>);
  }, [stories]);

  const userIds = useMemo(() => Object.keys(groupedStories), [groupedStories]);

  return (
    <div className="min-h-full bg-white dark:bg-slate-950 transition-colors pb-32">
      <AddStoryModal isOpen={showAddStory} onClose={() => setShowAddStory(false)} />
      {viewStories && <StoryViewerModal stories={viewStories} onClose={() => setViewStories(null)} />}
      
      <div className="px-6 pt-6 pb-4">
        <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar -mx-2 px-2">
          {/* My Status Trigger */}
          <div className="flex flex-col items-center gap-3 shrink-0 cursor-pointer group" onClick={() => setShowAddStory(true)}>
             <div className="relative">
                <div className="w-[4.5rem] h-[4.5rem] rounded-[2rem] p-0.5 border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                   <img src={currentUser?.avatar} className="w-full h-full object-cover opacity-60 grayscale group-hover:scale-110 transition-transform" alt="Me" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#ff1744] rounded-xl border-4 border-white dark:border-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                  <Plus className="w-4 h-4 text-white" strokeWidth={4} />
                </div>
             </div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Sync</span>
          </div>

          {/* Grouped Horizontal Stories */}
          {userIds.map((uid) => {
            const userStories = groupedStories[uid];
            const firstStory = userStories[0];
            const allViewed = userStories.every(s => s.viewed);
            
            return (
              <div key={uid} className="flex flex-col items-center gap-3 shrink-0 cursor-pointer group" onClick={() => setViewStories(userStories)}>
                <div className={`w-[4.5rem] h-[4.5rem] rounded-[2rem] p-1 ${allViewed ? 'bg-slate-200 dark:bg-slate-800' : 'bg-gradient-to-tr from-[#ff1744] to-red-400'}`}>
                  <div className="w-full h-full rounded-[1.8rem] overflow-hidden border-2 border-white dark:border-slate-950 bg-slate-100 dark:bg-slate-800">
                    {firstStory.type === 'image' ? (
                       <img src={firstStory.content} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={firstStory.userName} />
                    ) : (
                       <div className={`w-full h-full flex items-center justify-center p-2 text-center text-[6px] font-black text-white ${firstStory.background}`}>
                          {firstStory.content.substring(0, 15)}...
                       </div>
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase truncate w-16 text-center">
                  {uid === 'me' ? 'Me' : firstStory.userName.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-6 space-y-8 mt-4">
         <div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
               <Radio className="w-3 h-3 text-[#ff1744]" /> Primary Sync
            </h3>
            {userIds.filter(uid => uid !== 'me').length === 0 ? (
               <div className="bg-gray-50 dark:bg-slate-900 rounded-[2.5rem] p-12 text-center opacity-40 border border-dashed border-gray-200 dark:border-slate-800">
                  <CircleDashed className="w-10 h-10 mx-auto mb-4 animate-spin duration-[5s]" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Neural Inputs</p>
               </div>
            ) : (
               <div className="grid gap-4">
                 {userIds.filter(uid => uid !== 'me').map(uid => {
                   const userStories = groupedStories[uid];
                   const firstStory = userStories[0];
                   const allViewed = userStories.every(s => s.viewed);
                   
                   return (
                     <div key={uid + '_list'} onClick={() => setViewStories(userStories)} className="flex items-center gap-5 p-5 rounded-[2.25rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all group">
                         <div className="relative">
                            <img src={firstStory.userAvatar} className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-110 transition-transform" alt={firstStory.userName} />
                            {!allViewed && <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff1744] rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse"></div>}
                         </div>
                         <div className="flex-1">
                           <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-lg">{firstStory.userName}</h4>
                           <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{userStories.length} Updates • {firstStory.timestamp}</span>
                           </div>
                         </div>
                         <div className="w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-[#ff1744] transition-colors">
                            <ChevronRight className="w-5 h-5" />
                         </div>
                     </div>
                   );
                 })}
               </div>
            )}
         </div>

         <div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
               <Globe className="w-3 h-3" /> Public Broadcasts
            </h3>
            <div className="grid grid-cols-2 gap-4">
               {[1, 2].map(i => (
                  <div key={i} className="aspect-[3/4] bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] relative overflow-hidden group shadow-sm border border-gray-100 dark:border-slate-800">
                     <img src={`https://picsum.photos/400/600?random=stream${i}`} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Discover" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                     <div className="absolute bottom-5 left-5 right-5">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-6 h-6 rounded-lg bg-[#ff1744] flex items-center justify-center shadow-lg"><Zap className="w-3 h-3 text-white fill-white" /></div>
                           <span className="text-[8px] font-black uppercase tracking-widest text-white/60">Flash Stream</span>
                        </div>
                        <p className="text-white font-black uppercase tracking-tighter text-sm line-clamp-2">Exploring Neo-Tokyo's Virtual Districts</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export const DiscoveryScreen: React.FC = () => {
  return (
    <div className="p-4 overflow-y-auto h-full pb-24 bg-gray-50 dark:bg-slate-950 transition-colors">
      <div className="relative mb-8">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Explore PingSpace..." className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#ff1744]/20 shadow-sm" />
      </div>
      <div className="space-y-10">
        <div>
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Trending Topics</h3>
              <button className="text-[10px] font-black text-[#ff1744] uppercase tracking-widest">See All</button>
           </div>
           <div className="flex flex-wrap gap-2">
             {['#CryptoPing', '#AIArt', '#PingSpace', '#Web3Trade', '#DigitalNomad'].map(tag => (
               <span key={tag} className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm">{tag}</span>
             ))}
           </div>
        </div>
        <div className="bg-gradient-to-br from-[#ff1744] to-orange-500 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-red-500/20">
           <Zap className="absolute right-[-10%] top-[-10%] w-48 h-48 opacity-10 rotate-12" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-80">Flash Announcement</p>
           <h3 className="text-2xl font-black mb-3">PingPlus Beta Access</h3>
           <p className="text-sm text-white/80 mb-6 font-medium leading-relaxed">Early adopters get zero-fee trading for 12 months. Limited slots available for testers.</p>
           <button className="bg-white text-[#ff1744] px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl">Secure Slot</button>
        </div>
      </div>
    </div>
  );
};

const AddSpaceModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const dispatch = useGlobalDispatch();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await storageService.uploadFile(e.target.files[0]);
        setImage(url);
      } catch (error: any) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Upload failed.' } });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleCreate = async () => {
    if (!name || !description || !image) return;
    setLoading(true);
    try {
      const newSpace = await api.spaces.create({ name, description, image });
      dispatch({ type: 'ADD_SPACE', payload: newSpace });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: `Space "${name}" created!` } });
      onClose();
      setName(''); setDescription(''); setImage('');
    } catch (e: any) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Failed to create space.' } });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xl animate-in fade-in p-4 overflow-y-auto no-scrollbar">
       <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-sm p-8 relative shadow-2xl border border-white/20 dark:border-slate-800 my-auto animate-in zoom-in-95">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-slate-800 rounded-full z-10 hover:rotate-90 transition-transform"><X className="w-5 h-5 text-slate-500" /></button>
          
          <div className="flex items-center gap-4 mb-8">
             <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-500">
                <Rocket className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Launch Space</h3>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Protocol Initialize</p>
             </div>
          </div>

          <div onClick={() => !uploading && fileInputRef.current?.click()} className="aspect-video bg-gray-50 dark:bg-slate-950 rounded-3xl mb-8 overflow-hidden relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 group cursor-pointer hover:border-[#ff1744]/50 transition-colors">
             {image ? (
               <>
                 <img src={image} className="w-full h-full object-cover" alt="Preview" />
                 <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <RefreshCcw className="w-8 h-8 text-white" />
                 </div>
               </>
             ) : (
               <>
                 <Camera className="w-10 h-10 text-slate-300 group-hover:text-[#ff1744] transition-colors mb-2" />
                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Add Neural Visual</span>
               </>
             )}
             <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
             {uploading && <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>}
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
               <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.25em] ml-2">Identity Name</label>
               <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Neo Tokyo Explorers" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
            </div>

            <div className="space-y-1.5">
               <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.25em] ml-2">Mission Parameters</label>
               <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the collective purpose..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white font-medium resize-none h-24 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm" />
            </div>
          </div>

          <button 
             onClick={handleCreate} 
             disabled={!name || !description || !image || loading || uploading} 
             className="w-full mt-8 py-5 bg-[#ff1744] text-white font-black rounded-[2rem] shadow-xl shadow-red-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
          >
             {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
               <>
                 <span>Initiate Launch</span>
                 <Rocket className="w-4 h-4" />
               </>
             )}
          </button>
       </div>
    </div>
  );
};

export const SpacesScreen: React.FC<{ spaces: Space[] }> = ({ spaces }) => {
  const [showAddSpace, setShowAddSpace] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useGlobalDispatch();

  const categories = [
    { name: 'All', icon: Globe },
    { name: 'Tech', icon: Cpu },
    { name: 'Gaming', icon: Gamepad2 },
    { name: 'Art', icon: Palette },
    { name: 'Social', icon: Coffee },
    { name: 'Trading', icon: TrendingUp }
  ];

  const filteredSpaces = spaces.filter(s => {
     const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase());
     return matchesSearch;
  });

  const heroSpace = spaces.length > 0 ? spaces[0] : null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 transition-colors pb-32 overflow-hidden">
      <AddSpaceModal isOpen={showAddSpace} onClose={() => setShowAddSpace(false)} />
      
      <div className="px-6 pt-6 pb-2 space-y-6 shrink-0">
        <div className="flex items-center justify-between">
           <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Spaces</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Neural Collective Network</p>
           </div>
           <button onClick={() => setShowAddSpace(true)} className="p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.75rem] shadow-xl hover:scale-110 active:scale-95 transition-all">
              <Plus className="w-6 h-6" strokeWidth={3} />
           </button>
        </div>

        <div className="relative group">
           <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-[#ff1744] transition-colors" />
           <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query the collective..." 
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] py-4 pl-12 pr-4 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#ff1744]/10 transition-all shadow-sm" 
           />
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-6 px-6">
           {categories.map(cat => (
             <button 
                key={cat.name} 
                onClick={() => setActiveCategory(cat.name)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                  activeCategory === cat.name 
                    ? 'bg-[#ff1744] text-white border-[#ff1744] shadow-lg shadow-red-500/20' 
                    : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-gray-100 dark:border-slate-800 hover:border-slate-300'
                }`}
             >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.name}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-4 no-scrollbar space-y-8 pb-20">
        {heroSpace && !searchQuery && (
          <div className="relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
             <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800">
                <div className="aspect-[21/9] relative overflow-hidden">
                   <img src={heroSpace.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={heroSpace.name} />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                   <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#ff1744] rounded-xl flex items-center gap-2">
                      <Flame className="w-3 h-3 text-white fill-white" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-white">Trending Hub</span>
                   </div>
                </div>
                <div className="p-6">
                   <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{heroSpace.name}</h3>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg">
                         <Users className="w-3 h-3 text-slate-400" />
                         <span className="text-[10px] font-black text-slate-500">{heroSpace.members.toLocaleString()}</span>
                      </div>
                   </div>
                   <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6 line-clamp-2">{heroSpace.description}</p>
                   <button 
                      onClick={() => dispatch({ type: 'JOIN_SPACE', payload: heroSpace.id })} 
                      className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        heroSpace.joined 
                          ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 border border-emerald-100 dark:border-emerald-900/20' 
                          : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl'
                      }`}
                   >
                      {heroSpace.joined ? 'Active Participant' : 'Initiate Connection'}
                   </button>
                </div>
             </div>
          </div>
        )}

        <div className="space-y-4">
           <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Network Nodes</h3>
              <span className="text-[10px] font-black text-slate-300">{filteredSpaces.length} Available</span>
           </div>
           
           {filteredSpaces.length === 0 ? (
              <div className="py-20 text-center opacity-30">
                 <CircleDashed className="w-12 h-12 mx-auto mb-4 animate-spin duration-[3s]" />
                 <p className="text-xs font-black uppercase tracking-widest">No active sectors found</p>
              </div>
           ) : (
              <div className="grid gap-5">
                 {filteredSpaces.filter(s => s.id !== (heroSpace && !searchQuery ? heroSpace.id : null)).map(space => (
                    <div 
                       key={space.id} 
                       className="bg-white dark:bg-slate-900 rounded-[2.25rem] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-slate-800 group hover:shadow-2xl hover:border-slate-200 dark:hover:border-slate-700 transition-all flex items-center gap-5"
                    >
                       <div className="relative shrink-0">
                          <img src={space.image} className="w-20 h-20 rounded-[1.75rem] object-cover shadow-lg group-hover:scale-105 transition-transform duration-500" alt={space.name} />
                          {space.joined && (
                             <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-emerald-500 rounded-xl border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
                             </div>
                          )}
                       </div>
                       <div className="flex-1 min-w-0">
                          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate group-hover:text-[#ff1744] transition-colors">{space.name}</h3>
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-4">{space.members.toLocaleString()} members</p>
                          
                          <div className="flex items-center justify-between">
                             <div className="flex -space-x-2">
                                {[1,2,3].map(i => (
                                   <img key={i} src={`https://picsum.photos/50/50?random=${space.id}${i}`} className="w-6 h-6 rounded-lg border-2 border-white dark:border-slate-900 object-cover" alt="Member" />
                                ))}
                                <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-black text-slate-400">+5</div>
                             </div>
                             <button 
                                onClick={() => dispatch({ type: 'JOIN_SPACE', payload: space.id })} 
                                className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                   space.joined 
                                      ? 'bg-slate-50 dark:bg-slate-800 text-slate-400' 
                                      : 'bg-[#ff1744] text-white shadow-lg shadow-red-500/20'
                                }`}
                             >
                                {space.joined ? 'Member' : 'Join'}
                             </button>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

// --- MARKETPLACE COMPONENTS ---

const ProductDetailModal: React.FC<{ product: Product | null; onClose: () => void; onAddToCart: (p: Product) => void }> = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xl animate-in fade-in">
       <div className="bg-white dark:bg-slate-900 rounded-t-[3rem] sm:rounded-[3rem] w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[85vh] overflow-hidden flex flex-col relative shadow-2xl animate-in slide-in-from-bottom-10">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white z-10 transition-all active:scale-90"><X className="w-6 h-6" /></button>
          
          <div className="w-full aspect-square relative shrink-0">
             <img src={product.image} className="w-full h-full object-cover" alt={product.title} />
             <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white dark:from-slate-900 to-transparent"></div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 pt-0 no-scrollbar">
             <div className="flex items-center justify-between mb-4">
                <div className="px-3 py-1 bg-[#ff1744]/10 rounded-lg">
                   <span className="text-[10px] font-black uppercase tracking-widest text-[#ff1744]">{product.category || 'General'}</span>
                </div>
                <div className="flex items-center gap-1">
                   <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                   <span className="text-sm font-black text-slate-700 dark:text-slate-200">{product.rating}</span>
                </div>
             </div>

             <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 leading-tight uppercase tracking-tighter">{product.title}</h2>
             <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-black text-[#ff1744]">${product.price}</span>
                {product.condition && <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 rounded-md tracking-widest">{product.condition}</span>}
             </div>

             <div className="space-y-6">
                <div>
                   <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Intelligence Report</h3>
                   <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                      {product.description || "No neural description provided for this asset."}
                   </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 shadow-sm"><UserIcon className="w-5 h-5" /></div>
                      <div>
                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Entity</p>
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200 truncate">{product.seller}</p>
                      </div>
                   </div>
                   <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 shadow-sm"><MapPinIcon className="w-5 h-5" /></div>
                      <div>
                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Sector</p>
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200 truncate">{product.location || 'Global'}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="p-8 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex gap-4">
             <button className="w-16 h-16 rounded-[2rem] border-2 border-gray-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#ff1744] transition-colors"><Heart className="w-6 h-6" /></button>
             <button 
                onClick={() => { onAddToCart(product); onClose(); }}
                className="flex-1 h-16 bg-[#ff1744] text-white font-black rounded-[2rem] shadow-xl shadow-red-500/30 flex items-center justify-center gap-3 uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
             >
                <ShoppingBag className="w-5 h-5" />
                Capture Asset
             </button>
          </div>
       </div>
    </div>
  );
};

const CartModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { cart } = useGlobalState();
  const dispatch = useGlobalDispatch();
  const [checkingOut, setCheckingOut] = useState(false);

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setCheckingOut(true);
    setTimeout(() => {
      dispatch({ type: 'CLEAR_CART' });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Transmission Successful! Assets dispatched.' } });
      setCheckingOut(false);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl animate-in fade-in p-4">
       <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-sm h-[80vh] flex flex-col relative shadow-2xl border border-white/20 dark:border-slate-800 animate-in zoom-in-95">
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
             <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Supply Hub</h3>
             <button onClick={onClose} className="p-2 bg-gray-50 dark:bg-slate-800 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
             {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                   <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-6">
                      <ShoppingBag className="w-10 h-10 text-slate-400" />
                   </div>
                   <p className="text-xs font-black uppercase tracking-widest text-slate-500">Grid empty</p>
                </div>
             ) : (
                <div className="space-y-4">
                   {cart.map(item => (
                      <div key={item.id} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl items-center animate-in slide-in-from-right duration-300">
                         <img src={item.image} className="w-16 h-16 rounded-2xl object-cover shadow-sm" alt={item.title} />
                         <div className="flex-1 min-w-0">
                            <h4 className="font-black text-slate-900 dark:text-white text-xs truncate mb-1 uppercase tracking-tighter">{item.title}</h4>
                            <p className="text-[#ff1744] font-black text-sm">${item.price}</p>
                         </div>
                         <div className="flex items-center gap-3">
                            <button onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.id })} className="p-2 bg-white dark:bg-slate-700 rounded-xl text-slate-400 hover:text-red-500 transition-colors shadow-sm"><Trash2 className="w-4 h-4" /></button>
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>

          <div className="p-8 bg-gray-50 dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 rounded-b-[3rem] space-y-6">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Aggregate Total</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">${total.toFixed(2)}</span>
             </div>
             <button 
                onClick={handleCheckout}
                disabled={cart.length === 0 || checkingOut}
                className="w-full py-5 bg-[#ff1744] text-white font-black rounded-3xl shadow-xl shadow-red-500/30 flex items-center justify-center gap-3 uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
             >
                {checkingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>Confirm Order</span>
                    <MoveRight className="w-4 h-4" />
                  </>
                )}
             </button>
          </div>
       </div>
    </div>
  );
};

export const MarketplaceScreen: React.FC = () => {
  const { products, cart } = useGlobalState();
  const dispatch = useGlobalDispatch();
  const [showSellModal, setShowSellModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Electronics', 'Fashion', 'Collectibles', 'Gaming', 'Other'];

  const filteredProducts = products.filter(p => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 transition-colors pb-32">
      <SellProductModal isOpen={showSellModal} onClose={() => setShowSellModal(false)} />
      <CartModal isOpen={showCartModal} onClose={() => setShowCartModal(false)} />
      <ProductDetailModal 
         product={selectedProduct} 
         onClose={() => setSelectedProduct(null)} 
         onAddToCart={(p) => {
            dispatch({ type: 'ADD_TO_CART', payload: p });
            dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Asset added to hub' } });
         }}
      />

      <div className="px-6 pt-6 pb-2 space-y-6">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-2xl text-[#ff1744]">
                 <MarketIcon className="w-6 h-6" />
              </div>
              <div>
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Market</h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Asset Exchange Protocol</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowCartModal(true)}
                className="p-3 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl relative text-slate-600 dark:text-slate-300 hover:scale-110 active:scale-95 transition-all shadow-sm"
              >
                <CartIcon className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#ff1744] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 shadow-md">
                    {cart.length}
                  </span>
                )}
              </button>
              <button onClick={() => setShowSellModal(true)} className="p-3 bg-[#ff1744] text-white rounded-2xl shadow-lg shadow-red-500/20 hover:scale-110 active:scale-95 transition-all">
                <Plus className="w-6 h-6" />
              </button>
           </div>
        </div>

        <div className="relative group">
           <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-[#ff1744] transition-colors" />
           <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets..." 
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] py-3.5 pl-12 pr-4 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#ff1744]/10 transition-all shadow-sm" 
           />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6">
           {categories.map(cat => (
             <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                  activeCategory === cat 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg' 
                    : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-gray-100 dark:border-slate-800 hover:border-[#ff1744]'
                }`}
             >
                {cat}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-4 no-scrollbar">
        {filteredProducts.length === 0 ? (
           <div className="h-64 flex flex-col items-center justify-center text-center opacity-30 animate-in fade-in">
              <Package className="w-12 h-12 mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">No assets found in this sector</p>
           </div>
        ) : (
           <div className="grid grid-cols-2 gap-4 pb-20">
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  onClick={() => setSelectedProduct(product)}
                  className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-slate-800 group cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all animate-in zoom-in-95"
                >
                   <div className="aspect-[4/5] overflow-hidden relative">
                     <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.title} />
                     <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                        <button className="p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-2xl shadow-xl text-[#ff1744] hover:scale-110 active:scale-90 transition-all"><Heart className="w-4 h-4 fill-current" /></button>
                     </div>
                     {product.condition && (
                        <div className="absolute bottom-4 left-4 px-2.5 py-1 bg-black/60 backdrop-blur-md text-[7px] font-black text-white rounded-lg uppercase tracking-[0.2em]">
                           {product.condition}
                        </div>
                     )}
                   </div>
                   <div className="p-5">
                     <div className="flex items-center justify-between mb-1.5 min-h-[16px]">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 truncate w-24">{product.category || 'ASSET'}</span>
                        <div className="flex items-center gap-0.5 text-amber-400">
                           <Star className="w-2.5 h-2.5 fill-current" />
                           <span className="text-[8px] font-black text-slate-700 dark:text-slate-300">{product.rating}</span>
                        </div>
                     </div>
                     <h4 className="font-black text-slate-900 dark:text-white text-xs truncate mb-3 uppercase tracking-tighter">{product.title}</h4>
                     <div className="flex justify-between items-center">
                       <span className="text-[#ff1744] font-black tracking-tight text-base">${product.price}</span>
                       <button 
                          onClick={(e) => {
                             e.stopPropagation();
                             dispatch({ type: 'ADD_TO_CART', payload: product });
                             dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Asset captured' } });
                          }}
                          className="p-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:bg-[#ff1744] hover:dark:bg-[#ff1744] hover:dark:text-white transition-all shadow-md active:scale-90"
                       >
                          <Plus className="w-4 h-4" strokeWidth={3} />
                       </button>
                     </div>
                   </div>
                </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );
};

type ProfileView = 'main' | 'privacy' | 'notifications' | 'accessibility' | 'language' | 'help' | 'wallet' | 'devices';

export const ProfileScreen: React.FC = () => {
  const { currentUser, theme, settings, transactions } = useGlobalState();
  const dispatch = useGlobalDispatch();
  
  const [activeView, setActiveView] = useState<ProfileView>('main');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [tempLang, setTempLang] = useState(settings.language);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser && !isEditing) {
      setEditName(currentUser.name || '');
      setEditStatus(currentUser.status || '');
      setEditBio(currentUser.bio || '');
    }
  }, [currentUser, isEditing]);

  useEffect(() => {
    if (activeView === 'language') {
      setTempLang(settings.language);
    }
  }, [activeView, settings.language]);

  const handleAvatarClick = () => avatarInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingAvatar(true);
      try {
        const file = e.target.files[0];
        const publicUrl = await storageService.uploadFile(file);
        const updatedUser = await api.auth.updateProfile({ avatar: publicUrl });
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Profile updated!' } });
      } catch (err: any) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Upload failed' } });
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const updatedUser = await api.auth.updateProfile({ name: editName, status: editStatus, bio: editBio });
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      setIsEditing(false);
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Profile saved!' } });
    } catch (err: any) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Failed to save' } });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLanguage = () => {
    dispatch({ type: 'UPDATE_SETTING', payload: { section: 'language' as any, key: '', value: tempLang } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Semantic protocol updated: ' + tempLang } });
    setActiveView('main');
  };

  const handleLogout = async () => {
    dispatch({ type: 'LOGOUT' });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'info', message: 'Disconnecting session...' } });
    try {
      api.auth.logout().catch(err => console.error("Server signout ignored as local state cleared", err));
    } catch (err: any) {
      console.warn("Sign out request error", err);
    }
  };

  const updateSetting = (section: keyof AppSettings, key: string, value: any) => {
    dispatch({ type: 'UPDATE_SETTING', payload: { section, key, value } });
  };

  // --- SUB-VIEWS ---

  const renderDevices = () => (
    <div className="animate-in slide-in-from-right duration-300">
      <SettingSubHeader title="Linked Grid" onBack={() => setActiveView('main')} />
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
           <div className="p-6 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-500">
                    <Smartphone className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">This Device</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">iPhone 15 Pro • Active</p>
                 </div>
              </div>
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></div>
           </div>
           
           <div className="p-6 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                    <Monitor className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">Citadel Desktop</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">MacOS • Last synced 2h ago</p>
                 </div>
              </div>
              <button className="p-2 text-slate-300 hover:text-red-500 transition-colors"><XCircle className="w-5 h-5" /></button>
           </div>

           <div className="p-6 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                    <Laptop className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">Work Terminal</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Linux • Last synced 1d ago</p>
                 </div>
              </div>
              <button className="p-2 text-slate-300 hover:text-red-500 transition-colors"><XCircle className="w-5 h-5" /></button>
           </div>
        </div>

        <button className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-3xl uppercase tracking-widest text-[10px] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
           <QrCode className="w-5 h-5" />
           Link Neural Node
        </button>

        <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-900/20 flex gap-4">
           <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
           <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase leading-relaxed tracking-tight">Managing linked devices ensures your identity remains secure. Log out of unknown nodes immediately.</p>
        </div>
      </div>
    </div>
  );

  const renderWallet = () => (
    <div className="animate-in slide-in-from-right duration-300">
      <SettingSubHeader title="Wealth Terminal" onBack={() => setActiveView('main')} />
      
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl mb-8 border border-white/5">
        <Sparkles className="absolute right-[-5%] top-[-5%] w-32 h-32 opacity-10 rotate-12 text-amber-400" />
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 opacity-60">Aggregate Assets</p>
          <h3 className="text-4xl font-black mb-1">$24,580.00</h3>
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" /> +12.4% Neural Growth
          </p>
        </div>
        
        <div className="mt-8 grid grid-cols-3 gap-4 relative z-10">
           <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:bg-[#ff1744] transition-all">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">Dispatch</span>
           </button>
           <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 transition-all">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">Acquire</span>
           </button>
           <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:bg-blue-500 transition-all">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">Inject</span>
           </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
           <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Ledger Logs</h3>
           <History className="w-4 h-4 text-slate-300" />
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
          {transactions.length === 0 ? (
            <div className="p-10 text-center opacity-30">
               <Landmark className="w-10 h-10 mx-auto mb-2" />
               <p className="text-[10px] font-black uppercase">No recent activity</p>
            </div>
          ) : (
            transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all border-b border-gray-50 dark:border-slate-800 last:border-0">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${tx.type === 'received' || tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-[#ff1744]'}`}>
                    {tx.type === 'received' || tx.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-[10px] tracking-widest text-slate-700 dark:text-slate-200">{tx.entity}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-xs ${tx.type === 'received' || tx.type === 'deposit' ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'}`}>
                    {tx.type === 'received' || tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </p>
                  <p className="text-[9px] font-black uppercase opacity-40">Settled</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
  
  const renderPrivacy = () => (
    <div className="animate-in slide-in-from-right duration-300">
      <SettingSubHeader title="Privacy Grid" onBack={() => setActiveView('main')} />
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <SettingRow icon={Eye} title="Last Seen" subtitle="Control visibility of activity" value={settings.privacy.lastSeen} onClick={() => {}} />
        <SettingRow icon={UserIcon} title="Profile Photo" subtitle="Who can see your avatar" value={settings.privacy.profilePhoto} onClick={() => {}} />
        <SettingRow 
          icon={CheckCircle2} 
          title="Read Receipts" 
          subtitle="Allow others to see when you've read" 
          isToggle 
          value={settings.privacy.readReceipts} 
          onClick={() => updateSetting('privacy', 'readReceipts', !settings.privacy.readReceipts)}
        />
        <SettingRow icon={SecurityIcon} title="Biometric Unlock" subtitle="Secure access with facial/touch ID" isToggle value={true} onClick={() => {}} />
        <SettingRow icon={ShieldCheck} title="Blocked Grid" subtitle="Managed filtered entities" onClick={() => {}} />
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="animate-in slide-in-from-right duration-300">
      <SettingSubHeader title="Transmissions" onBack={() => setActiveView('main')} />
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <SettingRow 
          icon={Bell} 
          title="Push Alerts" 
          subtitle="Real-time sensory feedback" 
          isToggle 
          value={settings.notifications.push} 
          onClick={() => updateSetting('notifications', 'push', !settings.notifications.push)}
        />
        <SettingRow 
          icon={Mail} 
          title="Email Sync" 
          subtitle="Backup notification layer" 
          isToggle 
          value={settings.notifications.email} 
          onClick={() => updateSetting('notifications', 'email', !settings.notifications.email)}
        />
        <SettingRow 
          icon={Landmark} 
          title="Financial Ops" 
          subtitle="Transaction specific alerts" 
          isToggle 
          value={settings.notifications.transactions} 
          onClick={() => updateSetting('notifications', 'transactions', !settings.notifications.transactions)}
        />
        <SettingRow 
          icon={CircleDashed} 
          title="Status Updates" 
          subtitle="Notify for neural thought streams" 
          isToggle 
          value={true} 
          onClick={() => {}} 
        />
      </div>
    </div>
  );

  const renderAccessibility = () => (
    <div className="animate-in slide-in-from-right duration-300">
      <SettingSubHeader title="Neural Interface" onBack={() => setActiveView('main')} />
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <SettingRow icon={Maximize2} title="Text Scale" subtitle="Adjust typography density" value="Default" onClick={() => {}} />
        <SettingRow 
          icon={Sparkles} 
          title="Reduced Motion" 
          subtitle="Minimize kinetic transitions" 
          isToggle 
          value={false} 
          onClick={() => {}} 
        />
        <SettingRow 
          icon={Box} 
          title="High Contrast" 
          subtitle="Maximize visual distinction" 
          isToggle 
          value={false} 
          onClick={() => {}} 
        />
      </div>
    </div>
  );

  const renderLanguage = () => (
    <div className="animate-in slide-in-from-right duration-300 flex flex-col h-full">
      <SettingSubHeader title="Linguistic Grid" onBack={() => setActiveView('main')} />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
          {['UK English', 'Spanish', 'Arabic', 'US English', 'French', 'German'].map((lang) => (
            <button 
              key={lang} 
              onClick={() => setTempLang(lang)}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border-b border-gray-50 dark:border-slate-800 last:border-0"
            >
               <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${tempLang === lang ? 'border-[#ff1744] bg-[#ff1744]/10 scale-110' : 'border-slate-200 dark:border-slate-700'}`}>
                     {tempLang === lang && <div className="w-3 h-3 rounded-full bg-[#ff1744] animate-in zoom-in duration-300"></div>}
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest ${tempLang === lang ? 'text-[#ff1744]' : 'text-slate-500'}`}>{lang}</span>
               </div>
               {tempLang === lang && <span className="text-[10px] font-black text-[#ff1744] uppercase tracking-widest">Selected</span>}
            </button>
          ))}
        </div>
      </div>
      
      <div className="fixed bottom-32 left-4 right-4 z-20">
         <button 
            onClick={handleSaveLanguage}
            disabled={tempLang === settings.language}
            className={`w-full py-5 bg-[#ff1744] text-white font-black rounded-3xl uppercase tracking-widest text-[10px] shadow-2xl shadow-red-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:grayscale disabled:scale-100`}
         >
            <Save className="w-5 h-5" />
            Save Configuration
         </button>
      </div>
    </div>
  );

  const renderHelp = () => (
    <div className="animate-in slide-in-from-right duration-300">
      <SettingSubHeader title="Support Hub" onBack={() => setActiveView('main')} />
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm mb-6">
        <SettingRow icon={BookOpen} title="Knowledge Grid" subtitle="View technical documentation" onClick={() => {}} />
        <SettingRow icon={MessageSquareHeart} title="Direct Support" subtitle="Open sync channel with human" onClick={() => {}} />
        <SettingRow icon={Bug} title="Report Anomaly" subtitle="Submit bug telemetry" color="text-amber-500" onClick={() => {}} />
      </div>
      <div className="bg-slate-100 dark:bg-slate-900 rounded-[2rem] p-6 text-center">
         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">PingSpace Engine v4.2.0</p>
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Developed by CyberCore Systems</p>
      </div>
    </div>
  );

  const renderMain = () => (
    <div className="animate-in fade-in duration-500 pb-12">
      <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
      
      <div className="flex flex-col items-center py-10 relative">
        <button 
          onClick={() => setActiveView('wallet')}
          className="absolute top-10 right-4 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 text-[#ff1744] hover:scale-110 active:scale-95 transition-all z-10"
        >
          <WalletIcon className="w-5 h-5" />
        </button>

        <div className="relative mb-6 group">
           <div onClick={handleAvatarClick} className={`w-32 h-32 rounded-[2.5rem] p-1.5 bg-gradient-to-tr from-[#ff1744] to-orange-400 shadow-2xl cursor-pointer transition-transform hover:scale-105 relative overflow-hidden`}>
              <img src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'U')}&background=ff1744&color=fff`} className={`w-full h-full rounded-[2.2rem] border-4 border-white dark:border-slate-950 object-cover ${uploadingAvatar ? 'opacity-30' : ''}`} alt="Profile" />
              {uploadingAvatar && <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>}
              {isEditing && !uploadingAvatar && <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="w-8 h-8 text-white" /></div>}
           </div>
           {!isEditing && <button onClick={handleAvatarClick} className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 text-[#ff1744] hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors z-10"><Camera className="w-5 h-5" /></button>}
        </div>
        {isEditing ? (
          <div className="w-full max-sm space-y-6">
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Display Name" className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 font-bold text-slate-900 dark:text-white" />
            <input type="text" value={editStatus} onChange={(e) => setEditStatus(e.target.value)} placeholder="Status Phrase" className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 text-slate-700 dark:text-slate-300" />
            <button onClick={handleSaveProfile} disabled={saving} className="w-full py-5 bg-[#ff1744] text-white font-black rounded-3xl uppercase tracking-widest shadow-2xl shadow-red-500/30">{saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Apply Identity'}</button>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex items-center justify-center gap-3"><h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{currentUser?.name}</h2><button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-[#ff1744]"><Edit3 className="w-4 h-4" /></button></div>
            <p className="text-xs text-[#ff1744] font-black uppercase tracking-[0.25em] mt-2 mb-4">{currentUser?.status || 'Elite Contributor'}</p>
          </div>
        )}
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
           <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-2">Control Terminal</h3>
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
              <SettingRow icon={Lock} title="Privacy Grid" subtitle="Identity & visibility masks" onClick={() => setActiveView('privacy')} />
              <SettingRow icon={Bell} title="Transmissions" subtitle="Notification sensory alerts" onClick={() => setActiveView('notifications')} />
              <SettingRow icon={MonitorSmartphone} title="Linked Nodes" subtitle="Manage active hardware sessions" onClick={() => setActiveView('devices')} />
              <SettingRow icon={Accessibility} title="Neural Interface" subtitle="Accessibility & UX modifiers" onClick={() => setActiveView('accessibility')} />
              <SettingRow icon={Languages} title="Linguistic Grid" subtitle="Regional semantic translation" onClick={() => setActiveView('language')} />
              <SettingRow icon={HelpCircle} title="Support Hub" subtitle="Help Center & diagnostics" onClick={() => setActiveView('help')} />
              <SettingRow 
                icon={LogOut} 
                title="Sign Out" 
                subtitle="Disconnect active session" 
                isDanger 
                onClick={handleLogout} 
              />
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
           <SettingRow 
             icon={theme === 'light' ? Sun : Moon} 
             title="Visual Spectrum" 
             subtitle={theme === 'light' ? 'Light mode calibrated' : 'Dark mode active'} 
             isToggle 
             value={theme === 'dark'} 
             onClick={() => dispatch({ type: 'SET_THEME', payload: theme === 'light' ? 'dark' : 'light' })}
             color={theme === 'light' ? 'text-amber-500' : 'text-purple-400'}
           />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 overflow-y-auto h-full pb-40 bg-gray-50 dark:bg-slate-950 transition-colors no-scrollbar">
      {activeView === 'main' && renderMain()}
      {activeView === 'wallet' && renderWallet()}
      {activeView === 'privacy' && renderPrivacy()}
      {activeView === 'notifications' && renderNotifications()}
      {activeView === 'accessibility' && renderAccessibility()}
      {activeView === 'language' && renderLanguage()}
      {activeView === 'help' && renderHelp()}
      {activeView === 'devices' && renderDevices()}
    </div>
  );
};

// --- Other screens ---
const Maximize2Icon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
);

const SellProductModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const dispatch = useGlobalDispatch();
  const { currentUser } = useGlobalState();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [condition, setCondition] = useState('New');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['Electronics', 'Fashion', 'Home', 'Collectibles', 'Gaming', 'Other'];
  const conditions = ['New', 'Like New', 'Used - Good', 'Used - Fair'];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await storageService.uploadFile(e.target.files[0]);
        setImage(url);
      } catch (error: any) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Upload failed.' } });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleList = async () => {
    if (!title || !price || !image) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').insert({
          title, 
          price: parseFloat(price), 
          image_url: image, 
          seller_name: currentUser?.name || 'User',
          description,
          category,
          condition,
          location
      }).select().single();
      
      if (error) throw error;
      
      dispatch({ 
        type: 'ADD_PRODUCT', 
        payload: { 
          id: data.id, 
          title, 
          price: parseFloat(price), 
          image, 
          seller: currentUser?.name || 'Me', 
          rating: 5,
          description,
          category,
          condition,
          location
        } 
      });
      
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Item listed successfully!' } });
      onClose();
      resetForm();
    } catch (e: any) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Failed to list item.' } });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle(''); setPrice(''); setImage(''); setDescription(''); 
    setCategory('Electronics'); setCondition('New'); setLocation('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl animate-in fade-in p-4 overflow-y-auto no-scrollbar">
       <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-md p-6 relative shadow-2xl border border-white/20 dark:border-slate-800 my-auto">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-slate-800 rounded-full z-10"><X className="w-5 h-5 text-slate-500" /></button>
          
          <div className="flex items-center gap-3 mb-6">
             <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-2xl text-[#ff1744]">
                <Package className="w-6 h-6" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Sell Item</h3>
          </div>

          <div onClick={() => !uploading && fileInputRef.current?.click()} className="aspect-video bg-gray-50 dark:bg-slate-950 rounded-3xl mb-6 overflow-hidden relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 group cursor-pointer transition-colors hover:border-[#ff1744]/50">
             {image ? (
               <>
                 <img src={image} className="w-full h-full object-cover" alt="Preview" />
                 <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <RefreshCcw className="w-8 h-8 text-white" />
                 </div>
               </>
             ) : (
               <>
                 <Camera className="w-8 h-8 text-[#ff1744] mb-2" />
                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Add Product Image</span>
               </>
             )}
             <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
             {uploading && <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>}
          </div>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 no-scrollbar">
            <div className="space-y-1.5">
               <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Product Title</label>
               <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What are you selling?" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#ff1744]/20 transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Price ($)</label>
                  <div className="relative">
                    <div className="absolute left-4 top-4 text-[#ff1744] font-black">$</div>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-8 pr-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#ff1744]/20 transition-all" />
                  </div>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Category</label>
                  <div className="relative">
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#ff1744]/20 transition-all text-sm">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-4.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Condition</label>
               <div className="flex flex-wrap gap-2">
                  {conditions.map(cond => (
                    <button key={cond} onClick={() => setCondition(cond)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${condition === cond ? 'bg-[#ff1744] text-white shadow-lg shadow-red-500/30' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border border-slate-100 dark:border-slate-800 hover:bg-slate-100'}`}>
                      {cond}
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Detailed Description</label>
               <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your item, features, and why it's a great deal..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white mb-2 resize-none h-28 focus:outline-none focus:ring-2 focus:ring-[#ff1744]/20 transition-all text-sm leading-relaxed" />
            </div>

            <div className="space-y-1.5">
               <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Sync Location</label>
               <div className="relative">
                  <LocationIcon className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-10 pr-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#ff1744]/20 transition-all" />
               </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
             <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Secure listing authenticated</p>
             </div>
             <button onClick={handleList} disabled={!title || !price || !image || loading || uploading} className="w-full py-5 bg-[#ff1744] text-white font-black rounded-3xl shadow-xl shadow-red-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 group">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>Publish Listing</span>
                    <ArrowRightLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
             </button>
          </div>
       </div>
    </div>
  );
};
