
import React, { useState, useEffect, useRef } from 'react';
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
  Package, Info, MapPin as LocationIcon, CheckCircle, Minus, ShoppingCart as CartIcon, MoveRight
} from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { Space, WorkspaceWidget, Product, Story, Transaction, AppSettings, CartItem } from '../types';
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
  color?: string
}> = ({ icon: Icon, title, subtitle, value, onClick, isToggle, color = "text-slate-400" }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all group border-b border-gray-50 dark:border-slate-800/50 last:border-0"
  >
    <div className="flex items-center gap-4">
      <div className={`w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-transform group-hover:scale-110 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-left">
        <h4 className="font-black uppercase text-[10px] tracking-widest text-slate-700 dark:text-slate-200">{title}</h4>
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
          <ChevronRight className="w-4 h-4 text-slate-300" />
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
const StoryViewerModal: React.FC<{ story: Story | null; onClose: () => void }> = ({ story, onClose }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (story) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            onClose();
            return 100;
          }
          return p + 1.5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [story, onClose]);

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
       <div className="absolute top-0 left-0 right-0 p-6 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex gap-1.5 mb-5">
             <div className="h-1 bg-white/20 rounded-full flex-1 overflow-hidden">
                <div className="h-full bg-white transition-all shadow-[0_0_8px_white]" style={{ width: `${progress}%` }}></div>
             </div>
          </div>
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#ff1744] to-orange-400">
                  <img src={story.userAvatar} className="w-11 h-11 rounded-full border-2 border-black object-cover" alt={story.userName} />
                </div>
                <div>
                   <h4 className="font-bold text-white text-base tracking-tight">{story.userName}</h4>
                   <p className="text-xs text-white/60 font-medium">{story.timestamp}</p>
                </div>
             </div>
             <button onClick={onClose} className="p-2.5 bg-white/10 hover:bg-[#ff1744] rounded-full backdrop-blur-md text-white transition-all">
                <X className="w-6 h-6" />
             </button>
          </div>
       </div>
       <img src={story.image} className="w-full h-full object-contain bg-black" alt="Story" />
       {story.caption && (
         <div className="absolute bottom-10 left-0 right-0 p-10 flex justify-center text-center">
            <div className="max-w-md px-6 py-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
               <p className="text-white font-medium text-lg leading-relaxed italic">"{story.caption}"</p>
            </div>
         </div>
       )}
    </div>
  );
};

const AddStoryModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const dispatch = useGlobalDispatch();
  const [image, setImage] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handlePost = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const newStory = await api.stories.addStory(image, caption);
      dispatch({ type: 'ADD_STORY', payload: newStory });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Status shared!' } });
      onClose();
      setImage(''); setCaption('');
    } catch (e: any) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Failed to post.' } });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xl animate-in fade-in p-4">
       <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-sm p-6 relative shadow-2xl border border-white/20 dark:border-slate-800">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-slate-800 rounded-full z-10"><X className="w-5 h-5 text-slate-500" /></button>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Post Status</h3>
          <div onClick={() => !uploading && fileInputRef.current?.click()} className="aspect-[4/5] bg-gray-50 dark:bg-slate-950 rounded-3xl mb-6 overflow-hidden relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800">
             {image ? <img src={image} className="w-full h-full object-cover" alt="Preview" /> : <Camera className="w-10 h-10 text-slate-300" />}
             <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </div>
          <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a caption..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white mb-6" />
          <button onClick={handlePost} disabled={!image || loading || uploading} className="w-full py-5 bg-[#ff1744] text-white font-black rounded-3xl shadow-xl shadow-red-500/30">
             {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Share Moment'}
          </button>
       </div>
    </div>
  );
};

export const StatusScreen: React.FC = () => {
  const { stories, currentUser } = useGlobalState();
  const [showAddStory, setShowAddStory] = useState(false);
  const [viewStory, setViewStory] = useState<Story | null>(null);

  return (
    <div className="min-h-full bg-white dark:bg-slate-950 transition-colors pb-32">
      <AddStoryModal isOpen={showAddStory} onClose={() => setShowAddStory(false)} />
      <StoryViewerModal story={viewStory} onClose={() => setViewStory(null)} />
      <div className="px-6 pt-8 pb-4">
        <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar -mx-2 px-2">
          <div className="flex flex-col items-center gap-3 shrink-0 cursor-pointer group" onClick={() => setShowAddStory(true)}>
             <div className="relative">
                <div className="w-[4.5rem] h-[4.5rem] rounded-[1.75rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-50 dark:bg-slate-900 overflow-hidden">
                  <img src={currentUser?.avatar} className="w-full h-full object-cover opacity-60 grayscale" alt="Me" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#ff1744] rounded-xl border-4 border-white dark:border-slate-950 flex items-center justify-center shadow-lg"><Plus className="w-4 h-4 text-white" strokeWidth={4} /></div>
             </div>
             <span className="text-[10px] font-black text-slate-400 uppercase">Me</span>
          </div>
          {stories.map(story => (
            <div key={story.id} className="flex flex-col items-center gap-3 shrink-0 cursor-pointer" onClick={() => setViewStory(story)}>
              <div className={`w-[4.5rem] h-[4.5rem] rounded-[1.75rem] p-0.5 ${story.viewed ? 'bg-slate-200' : 'bg-gradient-to-tr from-[#ff1744] to-orange-400 p-[3px]'}`}>
                <div className="w-full h-full rounded-[1.6rem] overflow-hidden border-2 border-white dark:border-slate-950 bg-slate-100 dark:bg-slate-800">
                  <img src={story.userAvatar} className="w-full h-full object-cover" alt={story.userName} />
                </div>
              </div>
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase truncate w-[4.5rem] text-center">{story.userName.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="px-6 space-y-4">
         <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Recent Updates</h3>
         {stories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
               <CircleDashed className="w-12 h-12 mb-2 text-gray-300" />
               <p className="text-xs font-bold uppercase">No updates from friends</p>
            </div>
         ) : (
            <div className="grid gap-4">
              {stories.map(story => (
                <div key={story.id + '_list'} onClick={() => setViewStory(story)} className="flex items-center gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer hover:shadow-md transition-all">
                    <img src={story.userAvatar} className="w-14 h-14 rounded-2xl object-cover" alt={story.userName} />
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900 dark:text-white">{story.userName}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{story.timestamp}</p>
                    </div>
                </div>
              ))}
            </div>
         )}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xl animate-in fade-in p-4">
       <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-sm p-6 relative shadow-2xl border border-white/20 dark:border-slate-800">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-slate-800 rounded-full z-10"><X className="w-5 h-5 text-slate-500" /></button>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Create Space</h3>
          <div onClick={() => !uploading && fileInputRef.current?.click()} className="aspect-video bg-gray-50 dark:bg-slate-950 rounded-3xl mb-6 overflow-hidden relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800">
             {image ? <img src={image} className="w-full h-full object-cover" alt="Preview" /> : <Camera className="w-8 h-8 text-[#ff1744]" />}
             <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Space Name" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white mb-4" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white mb-6 resize-none h-24" />
          <button onClick={handleCreate} disabled={!name || !description || !image || loading || uploading} className="w-full py-5 bg-[#ff1744] text-white font-black rounded-3xl shadow-xl shadow-red-500/30">
             {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Launch Space'}
          </button>
       </div>
    </div>
  );
};

export const SpacesScreen: React.FC<{ spaces: Space[] }> = ({ spaces }) => {
  const [showAddSpace, setShowAddSpace] = useState(false);
  const dispatch = useGlobalDispatch();

  return (
    <div className="p-4 overflow-y-auto h-full pb-32 bg-gray-50 dark:bg-slate-950 transition-colors">
      <AddSpaceModal isOpen={showAddSpace} onClose={() => setShowAddSpace(false)} />
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Global Spaces</h3>
        <button onClick={() => setShowAddSpace(true)} className="p-2.5 bg-[#ff1744] text-white rounded-2xl shadow-xl shadow-red-500/20 hover:scale-110 transition-transform"><Plus className="w-6 h-6" /></button>
      </div>
      <div className="grid grid-cols-1 gap-5">
        {spaces.map(space => (
          <div key={space.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-5 group hover:shadow-lg transition-all">
            <img src={space.image} className="w-24 h-24 rounded-3xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt={space.name} />
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-slate-900 dark:text-white group-hover:text-[#ff1744] transition-colors">{space.name}</h3>
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2">{space.members.toLocaleString()} members</p>
              <button onClick={() => dispatch({ type: 'JOIN_SPACE', payload: space.id })} className={`mt-3 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${space.joined ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}>{space.joined ? 'Joined' : 'Join'}</button>
            </div>
          </div>
        ))}
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
       <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-sm h-[80vh] flex flex-col relative shadow-2xl border border-white/20 dark:border-slate-800 animate-in zoom-in-95">
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

      {/* Header Area */}
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

        {/* Search */}
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

        {/* Categories */}
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

      {/* Grid */}
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

// --- ProfileScreen Navigation Logic ---
type ProfileView = 'main' | 'privacy' | 'notifications' | 'accessibility' | 'language' | 'help' | 'wallet';

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
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser && !isEditing) {
      setEditName(currentUser.name || '');
      setEditStatus(currentUser.status || '');
      setEditBio(currentUser.bio || '');
    }
  }, [currentUser, isEditing]);

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

  const updateSetting = (section: keyof AppSettings, key: string, value: any) => {
    dispatch({ type: 'UPDATE_SETTING', payload: { section, key, value } });
  };

  // --- SUB-VIEWS ---

  const renderWallet = () => (
    <div className="animate-in slide-in-from-right duration-300">
      <SettingSubHeader title="Wealth Terminal" onBack={() => setActiveView('main')} />
      
      {/* Wallet Balance Card */}
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
    <div className="animate-in slide-in-from-right duration-300">
      <SettingSubHeader title="Linguistic Grid" onBack={() => setActiveView('main')} />
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
        {['Neo-English', 'Global Spanish', 'Citadel French', 'Sector German', 'Void Japanese', 'Pulse Mandarin'].map((lang, idx) => (
          <button key={lang} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border-b border-gray-50 dark:border-slate-800 last:border-0">
             <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${idx === 0 ? 'border-[#ff1744] bg-[#ff1744]/10' : 'border-slate-200 dark:border-slate-700'}`}>
                   {idx === 0 && <div className="w-3 h-3 rounded-full bg-[#ff1744]"></div>}
                </div>
                <span className={`text-xs font-black uppercase tracking-widest ${idx === 0 ? 'text-[#ff1744]' : 'text-slate-500'}`}>{lang}</span>
             </div>
             {idx === 0 && <span className="text-[10px] font-black text-[#ff1744] uppercase tracking-widest">Active</span>}
          </button>
        ))}
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
    <div className="animate-in fade-in duration-500">
      <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
      
      {/* Profile Identity Card */}
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
            <input type="text" value={editStatus} onChange={(e) => setEditStatus(e.target.value)} placeholder="Status Phrase" className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 text-slate-700 dark:text-slate-300" />
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
        {/* Settings Hub Cards */}
        <div className="space-y-4">
           <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-2">Control Terminal</h3>
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
              <SettingRow icon={Lock} title="Privacy Grid" subtitle="Identity & visibility masks" onClick={() => setActiveView('privacy')} />
              <SettingRow icon={Bell} title="Transmissions" subtitle="Notification sensory alerts" onClick={() => setActiveView('notifications')} />
              <SettingRow icon={Accessibility} title="Neural Interface" subtitle="Accessibility & UX modifiers" onClick={() => setActiveView('accessibility')} />
              <SettingRow icon={Languages} title="Linguistic Grid" subtitle="Regional semantic translation" onClick={() => setActiveView('language')} />
              <SettingRow icon={HelpCircle} title="Support Hub" subtitle="Help Center & diagnostics" onClick={() => setActiveView('help')} />
           </div>
        </div>

        {/* Display Control */}
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

        <button onClick={() => dispatch({ type: 'LOGOUT' })} className="w-full py-5 bg-red-50 dark:bg-red-950/20 text-[#ff1744] font-black rounded-3xl border border-red-100 dark:border-red-900/30 uppercase tracking-[0.2em] transition-all hover:bg-[#ff1744] hover:text-white flex items-center justify-center gap-3">
           <LogOut className="w-5 h-5" />
           Disconnect Session
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 overflow-y-auto h-full pb-32 bg-gray-50 dark:bg-slate-950 transition-colors no-scrollbar">
      {activeView === 'main' && renderMain()}
      {activeView === 'wallet' && renderWallet()}
      {activeView === 'privacy' && renderPrivacy()}
      {activeView === 'notifications' && renderNotifications()}
      {activeView === 'accessibility' && renderAccessibility()}
      {activeView === 'language' && renderLanguage()}
      {activeView === 'help' && renderHelp()}
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
       <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md p-6 relative shadow-2xl border border-white/20 dark:border-slate-800 my-auto">
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
