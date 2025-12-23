
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, Plus, Heart, MessageCircle, Share2, 
  Users, ShoppingCart, ShoppingBag,
  Settings, Shield, Smartphone, HelpCircle, LogOut,
  Wallet, ArrowUpRight, ArrowDownLeft, QrCode,
  CreditCard, Send, Scan, Target,
  Zap, TrendingUp,
  Compass, User as UserIcon, ArrowRightLeft, X, Trash2,
  Lock, Fingerprint, Check,
  ChevronLeft, ChevronRight, Camera, Moon, Sun, ShieldCheck, Key,
  Layout, ListTodo, Calendar, Link, MoreHorizontal,
  UploadCloud, Tag, Star, Truck, MapPin, Globe, Loader2,
  Radio, Hash, Play, Pause, Flame, Landmark, Maximize2, Laptop, Monitor, Mail, ChevronDown,
  Bell, Eye, EyeOff, AlertTriangle, CircleDashed, CheckCircle2, XCircle, Copy, Terminal,
  History, Sparkles, Image as ImageIcon, Box, Layers, MapPin as MapPinIcon, Info as InfoIcon, Edit3, Save,
  Fingerprint as SecurityIcon, Shield as ShieldIcon, RefreshCcw, Languages, Accessibility, 
  MessageSquareHeart, Bug, BookOpen, ShieldAlert, Wallet as WalletIcon, ShoppingCart as MarketIcon,
  Package, Info, MapPin as LocationIcon, CheckCircle, Minus, ShoppingCart as CartIcon, MoveRight,
  Trophy, Rocket, Coffee, Palette, Gamepad2, Cpu, Type as TypeIcon, HardDrive, MonitorSmartphone,
  Phone, Video, PhoneMissed, VideoOff, SendHorizonal, Smile
} from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { Space, WorkspaceWidget, Product, Story, Transaction, AppSettings, CartItem, User, CallLog } from '../types';
import { useGlobalState, useGlobalDispatch } from '../store';
import { api } from '../services/api';
import { storageService } from '../services/storage';
import { notificationService } from '../services/notificationService';
import { supabase } from '../services/supabase';
import { getCurrencyConversion, CurrencyConversion } from '../services/geminiService';

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

interface UserStoryGroup {
  userId: string;
  userName: string;
  userAvatar: string;
  stories: Story[];
}

const StoryViewerModal: React.FC<{ 
  groups: UserStoryGroup[]; 
  initialGroupId: string;
  onClose: () => void;
}> = ({ groups, initialGroupId, onClose }) => {
  const [groupIndex, setGroupIndex] = useState(() => {
    const idx = groups.findIndex(g => g.userId === initialGroupId);
    return idx === -1 ? 0 : idx;
  });
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reply, setReply] = useState('');
  const dispatch = useGlobalDispatch();
  const progressTimerRef = useRef<any>(null);
  const touchStartTimeRef = useRef<number>(0);

  const activeGroup = groups[groupIndex];
  const activeStory = activeGroup?.stories[storyIndex];

  useEffect(() => {
    if (activeStory && !isPaused) {
      setProgress(0);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      
      const duration = 5000; // 5 seconds per story
      const interval = 50; 
      const step = (interval / duration) * 100;

      progressTimerRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            handleNext();
            return 100;
          }
          return p + step; 
        });
      }, interval);
    } else {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    }
    return () => clearInterval(progressTimerRef.current);
  }, [groupIndex, storyIndex, isPaused, groups.length]);

  const handleNext = () => {
    if (storyIndex < activeGroup.stories.length - 1) {
      setStoryIndex(storyIndex + 1);
      setProgress(0);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex(groupIndex + 1);
      setStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1);
      setProgress(0);
    } else if (groupIndex > 0) {
      const prevGroup = groups[groupIndex - 1];
      setGroupIndex(groupIndex - 1);
      setStoryIndex(prevGroup.stories.length - 1);
      setProgress(0);
    } else {
      setProgress(0);
    }
  };

  const handleDeleteStory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStory && window.confirm("Delete this story?")) {
      dispatch({ type: 'DELETE_STORY', payload: activeStory.id });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Story deleted' } });
      
      if (activeGroup.stories.length <= 1) {
        onClose();
      } else {
        handleNext();
      }
    }
  };

  const handleTouchStart = () => {
    touchStartTimeRef.current = Date.now();
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.MouseEvent | React.TouchEvent) => {
    const duration = Date.now() - touchStartTimeRef.current;
    setIsPaused(false);

    if (duration < 200) {
      const { clientX } = 'touches' in e ? e.touches[0] || (e as any).changedTouches[0] : e as React.MouseEvent;
      const screenWidth = window.innerWidth;
      if (clientX < screenWidth / 3) {
        handlePrev();
      } else {
        handleNext();
      }
    }
  };

  const handleSendReply = () => {
    if (!reply.trim()) return;
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Reply sent to ' + activeStory.userName } });
    setReply('');
    setIsPaused(false);
  };

  if (!activeStory) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300 select-none">
       <div 
         className="relative flex-1 flex items-center justify-center overflow-hidden"
         onMouseDown={handleTouchStart}
         onMouseUp={handleTouchEnd}
         onTouchStart={handleTouchStart}
         onTouchEnd={handleTouchEnd}
       >
          {activeStory.type === 'image' ? (
             <>
               <div className="absolute inset-0 blur-3xl opacity-30 scale-150">
                  <img src={activeStory.content} className="w-full h-full object-cover" alt="" />
               </div>
               <img src={activeStory.content} className="relative z-10 max-w-full max-h-full object-contain shadow-2xl" alt="Story" />
             </>
          ) : (
             <div className={`w-full h-full flex items-center justify-center p-12 text-center transition-all duration-500 ${activeStory.background || 'bg-gradient-to-br from-[#ff1744] to-purple-600'}`}>
                <h2 className="text-4xl font-black text-white leading-tight uppercase tracking-tighter drop-shadow-lg">{activeStory.content}</h2>
             </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-20 pointer-events-none"></div>

          <div className="absolute top-0 left-0 right-0 p-4 pt-6 z-30 flex flex-col gap-4">
             <div className="flex gap-1.5 px-2">
                {activeGroup.stories.map((_, idx) => (
                   <div key={idx} className="h-1 bg-white/20 rounded-full flex-1 overflow-hidden">
                      <div 
                        className="h-full bg-white transition-all duration-75" 
                        style={{ 
                          width: idx < storyIndex ? '100%' : idx === storyIndex ? `${progress}%` : '0%' 
                        }}
                      ></div>
                   </div>
                ))}
             </div>
             
             <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-3">
                   <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#ff1744] to-orange-400 shadow-lg">
                     <img src={activeGroup.userAvatar} className="w-10 h-10 rounded-full border-2 border-black object-cover" alt={activeGroup.userName} />
                   </div>
                   <div className="flex flex-col">
                      <h4 className="font-bold text-white text-sm tracking-tight leading-none mb-1">{activeGroup.userName}</h4>
                      <p className="text-[9px] text-white/60 font-black uppercase tracking-widest">{activeStory.timestamp}</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   {activeGroup.userId === 'me' && (
                     <button onClick={handleDeleteStory} className="p-2 text-white/80 hover:text-red-400 transition-colors">
                       <Trash2 className="w-5 h-5" />
                     </button>
                   )}
                   <button className="p-2 text-white/80 hover:text-white transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
                   <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md text-white transition-all">
                      <X className="w-5 h-5" />
                   </button>
                </div>
             </div>
          </div>
       </div>

       {activeStory.caption && activeStory.type === 'image' && (
         <div className="absolute bottom-24 left-0 right-0 px-8 flex justify-center text-center z-30 pointer-events-none">
            <p className="max-w-md text-white font-semibold text-lg drop-shadow-md">{activeStory.caption}</p>
         </div>
       )}

       <div className="p-4 pb-8 bg-black z-40">
          <div className="flex items-center gap-3">
             <div className="flex-1 flex items-center gap-3 bg-white/10 backdrop-blur-3xl px-4 py-2 rounded-full border border-white/10">
                <input 
                  type="text" 
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  placeholder="Send a message..." 
                  className="flex-1 bg-transparent text-white py-2 outline-none font-bold text-sm placeholder-white/40"
                />
                <button onClick={handleSendReply} className="text-[#ff1744] hover:scale-110 active:scale-95 transition-all">
                   <SendHorizonal className="w-5 h-5 fill-current" />
                </button>
             </div>
             <div className="flex gap-2">
                {['❤️', '🔥', '😂'].map(emoji => (
                   <button 
                      key={emoji}
                      onClick={() => {
                        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: `Reacted with ${emoji}` } });
                        handleNext();
                      }}
                      className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full text-xl hover:scale-125 transition-transform"
                   >
                      {emoji}
                   </button>
                ))}
             </div>
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
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Posted successfully' } });
      onClose();
      resetForm();
    } catch (e: any) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Post failed.' } });
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
                <Plus className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Add Story</h3>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Share with friends</p>
             </div>
          </div>

          <div className="flex gap-2 mb-8 bg-gray-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-800">
             <button onClick={() => setMode('image')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'image' ? 'bg-white dark:bg-slate-800 text-[#ff1744] shadow-sm' : 'text-slate-400'}`}>Photo</button>
             <button onClick={() => setMode('text')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'text' ? 'bg-white dark:bg-slate-800 text-[#ff1744] shadow-sm' : 'text-slate-400'}`}>Text</button>
          </div>

          {mode === 'image' ? (
             <div className="space-y-6">
                <div onClick={() => !uploading && fileInputRef.current?.click()} className="aspect-square bg-gray-50 dark:bg-slate-950 rounded-[2.5rem] overflow-hidden relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 group cursor-pointer hover:border-[#ff1744]/50 transition-colors">
                   {image ? <img src={image} className="w-full h-full object-cover" alt="Preview" /> : (
                      <>
                        <Camera className="w-10 h-10 text-slate-300 group-hover:text-[#ff1744] transition-colors mb-2" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Image</span>
                      </>
                   )}
                   <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                   {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>}
                </div>
                <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a caption..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-[#ff1744]/10 transition-all" />
             </div>
          ) : (
             <div className="space-y-6">
                <div className={`aspect-square rounded-[2.5rem] flex flex-col items-center justify-center p-8 transition-all duration-500 shadow-xl ${activeBg}`}>
                   <textarea 
                     value={textContent}
                     onChange={(e) => setTextContent(e.target.value)}
                     placeholder="What's on your mind?"
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
                 <span>Post Story</span>
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
  const [activeViewerId, setActiveViewerId] = useState<string | null>(null);

  const storyGroups = useMemo(() => {
    const grouped = stories.reduce((acc, story) => {
      if (!acc[story.userId]) {
        acc[story.userId] = {
          userId: story.userId,
          userName: story.userName,
          userAvatar: story.userAvatar,
          stories: []
        };
      }
      acc[story.userId].stories.push(story);
      return acc;
    }, {} as Record<string, UserStoryGroup>);
    
    return Object.values(grouped);
  }, [stories]);

  return (
    <div className="min-h-full bg-white dark:bg-slate-950 transition-colors pb-32 overflow-y-auto no-scrollbar">
      <AddStoryModal isOpen={showAddStory} onClose={() => setShowAddStory(false)} />
      {activeViewerId && (
        <StoryViewerModal 
          groups={storyGroups} 
          initialGroupId={activeViewerId}
          onClose={() => setActiveViewerId(null)} 
        />
      )}
      
      <div className="px-6 pt-6 pb-4">
        <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar -mx-2 px-2">
          <div className="flex flex-col items-center gap-3 shrink-0 cursor-pointer group" onClick={() => setShowAddStory(true)}>
             <div className="relative">
                <div className="w-[4.5rem] h-[4.5rem] rounded-[2rem] p-0.5 border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                   <img src={currentUser?.avatar} className="w-full h-full object-cover opacity-60 grayscale group-hover:scale-110 transition-transform" alt="Me" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#ff1744] rounded-xl border-4 border-white dark:border-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                  <Plus className="w-4 h-4 text-white" strokeWidth={4} />
                </div>
             </div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Add</span>
          </div>

          {storyGroups.map((group) => {
            const firstStory = group.stories[0];
            const allViewed = group.stories.every(s => s.viewed);
            
            return (
              <div key={group.userId} className="flex flex-col items-center gap-3 shrink-0 cursor-pointer group" onClick={() => setActiveViewerId(group.userId)}>
                <div className={`w-[4.5rem] h-[4.5rem] rounded-[2rem] p-1 ${allViewed ? 'bg-slate-200 dark:bg-slate-800' : 'bg-gradient-to-tr from-[#ff1744] to-red-400'}`}>
                  <div className="w-full h-full rounded-[1.8rem] overflow-hidden border-2 border-white dark:border-slate-950 bg-slate-100 dark:bg-slate-800">
                    {firstStory.type === 'image' ? (
                       <img src={firstStory.content} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={group.userName} />
                    ) : (
                       <div className={`w-full h-full flex items-center justify-center p-2 text-center text-[6px] font-black text-white ${firstStory.background}`}>
                          {firstStory.content.substring(0, 15)}...
                       </div>
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase truncate w-16 text-center">
                  {group.userId === 'me' ? 'Me' : group.userName.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-6 space-y-8 mt-4">
         <div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
               <Radio className="w-3 h-3 text-[#ff1744]" /> Friend Updates
            </h3>
            {storyGroups.filter(g => g.userId !== 'me').length === 0 ? (
               <div className="bg-gray-50 dark:bg-slate-900 rounded-[2.5rem] p-12 text-center opacity-40 border border-dashed border-gray-200 dark:border-slate-800">
                  <CircleDashed className="w-10 h-10 mx-auto mb-4 animate-spin duration-[5s]" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No updates yet</p>
               </div>
            ) : (
               <div className="grid gap-4">
                 {storyGroups.filter(g => g.userId !== 'me').map(group => {
                   const firstStory = group.stories[0];
                   const allViewed = group.stories.every(s => s.viewed);
                   
                   return (
                     <div key={group.userId + '_list'} onClick={() => setActiveViewerId(group.userId)} className="flex items-center gap-5 p-5 rounded-[2.25rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all group">
                         <div className="relative">
                            <img src={group.userAvatar} className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-110 transition-transform" alt={group.userName} />
                            {!allViewed && <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff1744] rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse"></div>}
                         </div>
                         <div className="flex-1">
                           <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-lg">{group.userName}</h4>
                           <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{group.stories.length} updates • {firstStory.timestamp}</span>
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
               <Globe className="w-3 h-3" /> Popular Stories
            </h3>
            <div className="grid grid-cols-2 gap-4">
               {[1, 2].map(i => (
                  <div key={i} className="aspect-[3/4] bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] relative overflow-hidden group shadow-sm border border-gray-100 dark:border-slate-800">
                     <img src={`https://picsum.photos/400/600?random=stream${i}`} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Discover" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                     <div className="absolute bottom-5 left-5 right-5">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-6 h-6 rounded-lg bg-[#ff1744] flex items-center justify-center shadow-lg"><Zap className="w-3 h-3 text-white fill-white" /></div>
                           <span className="text-[8px] font-black uppercase tracking-widest text-white/60">Story Channel</span>
                        </div>
                        <p className="text-white font-black uppercase tracking-tighter text-sm line-clamp-2">Exploring Tokyo's Virtual Districts</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

// Fixed: Added missing DiscoveryScreen export
export const DiscoveryScreen: React.FC = () => {
  return (
    <div className="min-h-full bg-white dark:bg-slate-950 p-6 overflow-y-auto no-scrollbar pb-32">
      <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 text-slate-900 dark:text-white">Discover</h2>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-3xl overflow-hidden relative group border border-gray-100 dark:border-slate-800 shadow-sm">
            <img src={`https://picsum.photos/400/400?random=discover${i}`} className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-500" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-4 left-4 right-4 translate-y-2 group-hover:translate-y-0 transition-transform">
              <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Trending Now</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Fixed: Added missing SpacesScreen export
export const SpacesScreen: React.FC<{ spaces: Space[] }> = ({ spaces }) => {
  return (
    <div className="min-h-full bg-white dark:bg-slate-950 p-6 overflow-y-auto no-scrollbar pb-32">
      <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 text-slate-900 dark:text-white">Explore Spaces</h2>
      <div className="grid gap-4">
        {spaces.length === 0 ? (
          <div className="py-20 text-center opacity-30">
            <Layers className="w-12 h-12 mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">No spaces found</p>
          </div>
        ) : spaces.map(space => (
          <div key={space.id} className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50">
                <img src={space.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{space.name}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{space.members.toLocaleString()} Active Nodes</p>
              </div>
            </div>
            <button className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all ${space.joined ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-500 border border-emerald-100 dark:border-emerald-900/20' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}>
              {space.joined ? 'Joined' : 'Link Up'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Fixed: Added missing MarketplaceScreen export
export const MarketplaceScreen: React.FC = () => {
  const { products } = useGlobalState();
  return (
    <div className="min-h-full bg-white dark:bg-slate-950 p-6 overflow-y-auto no-scrollbar pb-32">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Market</h2>
        <button className="p-2 bg-gray-50 dark:bg-slate-900 rounded-xl"><CartIcon className="w-5 h-5 text-[#ff1744]" /></button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {products.map(product => (
          <div key={product.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden group shadow-sm flex flex-col">
            <div className="aspect-square relative overflow-hidden">
              <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.title} />
              <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 shadow-sm">
                <span className="text-[9px] font-black uppercase text-[#ff1744] tracking-widest">${product.price}</span>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <h4 className="font-black text-slate-900 dark:text-white text-[10px] uppercase tracking-tight truncate mb-2">{product.title}</h4>
              <button className="w-full py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#ff1744] hover:text-white transition-all">Add to Bag</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Fixed: Added missing ProfileScreen export
export const ProfileScreen: React.FC = () => {
  const { currentUser, theme } = useGlobalState();
  const dispatch = useGlobalDispatch();
  return (
    <div className="min-h-full bg-white dark:bg-slate-950 p-6 overflow-y-auto no-scrollbar pb-32">
      <div className="flex flex-col items-center mb-10 mt-4">
        <div className="relative group mb-4">
           <div className="absolute -inset-1 bg-gradient-to-tr from-[#ff1744] to-orange-400 rounded-[2.5rem] blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
           <img src={currentUser?.avatar} className="w-28 h-28 rounded-[2.5rem] shadow-xl border-4 border-white dark:border-slate-900 relative z-10 object-cover" alt="" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{currentUser?.name}</h3>
        <div className="mt-1 px-4 py-1 bg-red-50 dark:bg-red-900/10 rounded-full border border-red-100 dark:border-red-900/20">
           <p className="text-[#ff1744] text-[9px] font-black uppercase tracking-[0.2em]">{currentUser?.status || 'Active Node'}</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
           <SettingRow icon={UserIcon} title="Account Data" subtitle="Personal info, username" />
           <SettingRow icon={Bell} title="Neural Notifications" subtitle="Alerts, sounds, vibrations" value={true} isToggle />
           <SettingRow icon={Shield} title="Link Security" subtitle="Biometrics, 2FA, encryption" />
           <SettingRow icon={theme === 'dark' ? Sun : Moon} title="Dark Synthesis" subtitle="Visual interface mode" value={theme === 'dark'} isToggle onClick={() => dispatch({ type: 'SET_THEME', payload: theme === 'dark' ? 'light' : 'dark' })} />
           <SettingRow icon={LogOut} title="Terminate Link" isDanger onClick={() => dispatch({ type: 'LOGOUT' })} />
        </div>
        
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-center">
           <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] mb-2">PingSpace Protocol v1.0.4</p>
           <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Encrypted. Decentralized. Neural.</p>
        </div>
      </div>
    </div>
  );
};
