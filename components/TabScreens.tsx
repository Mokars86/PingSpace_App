

import React, { useState, useEffect, useRef } from 'react';
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
  Layout, ListTodo, Calendar, Link, MoreHorizontal,
  UploadCloud, Tag, Star, Truck, MapPin, Globe, Loader2,
  Radio, Hash, Play, Flame, Landmark, Maximize2, Laptop, Monitor, Mail, ChevronDown
} from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { Space, WorkspaceWidget, Product, Story } from '../types';
import { useGlobalState, useGlobalDispatch } from '../store';
import { api } from '../services/api';
import { storageService } from '../services/storage';

// --- Story Viewer Modal ---
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
          return p + 2; // Speed of progress
        });
      }, 100); // 100ms * 50 steps = 5 seconds

      return () => clearInterval(interval);
    }
  }, [story, onClose]);

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
       <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex gap-1 mb-2">
             <div className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden">
                <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
             </div>
          </div>
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-3">
                <img src={story.userAvatar} className="w-10 h-10 rounded-full border border-white/20 object-cover" alt={story.userName} />
                <div>
                   <h4 className="font-bold text-white text-sm">{story.userName}</h4>
                   <p className="text-xs text-white/70">{story.timestamp}</p>
                </div>
             </div>
             <button onClick={onClose} className="p-2 bg-white/20 rounded-full backdrop-blur-sm text-white hover:bg-white/30">
                <X className="w-5 h-5" />
             </button>
          </div>
       </div>

       <img src={story.image} className="w-full h-full object-contain" alt="Story" />

       {story.caption && (
         <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <p className="text-white text-center font-medium text-lg leading-relaxed">{story.caption}</p>
         </div>
       )}
    </div>
  );
};

// --- Add Story Modal ---
const AddStoryModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const dispatch = useGlobalDispatch();
  const [image, setImage] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await storageService.uploadFile(e.target.files[0]);
        setImage(url);
      } catch (error) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Upload failed' } });
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
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Story added!' } });
      onClose();
      setImage('');
      setCaption('');
    } catch (e) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Failed to post story' } });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
       <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-slate-800 rounded-full z-10">
             <X className="w-5 h-5 text-slate-500" />
          </button>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Add to Status</h3>
          
          <div className="aspect-[9/16] bg-gray-100 dark:bg-slate-800 rounded-2xl mb-4 overflow-hidden relative flex flex-col items-center justify-center group border-2 border-dashed border-gray-300 dark:border-slate-700">
             {image ? (
                <>
                  <img src={image} className="w-full h-full object-cover" alt="Preview" />
                  <div className="absolute bottom-0 w-full p-2 bg-gradient-to-t from-black/60 to-transparent">
                     {/* Overlay for aesthetic */}
                  </div>
                </>
             ) : (
                <div className="flex flex-col items-center text-gray-400">
                   {uploading ? <div className="w-8 h-8 border-4 border-[#ff1744]/30 border-t-[#ff1744] rounded-full animate-spin"></div> : <Camera className="w-10 h-10 mb-2" />}
                   <span className="text-xs font-bold">{uploading ? 'Uploading...' : 'Tap to Upload'}</span>
                </div>
             )}
             <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} disabled={uploading} />
          </div>

          <div className="mb-4">
            <input 
               type="text" 
               value={caption}
               onChange={(e) => setCaption(e.target.value)}
               placeholder="Add a caption..." 
               className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl p-3 text-slate-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff1744]/20"
            />
          </div>

          <button 
             onClick={handlePost} 
             disabled={!image || loading}
             className="w-full py-4 bg-[#ff1744] text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
             {loading ? 'Posting...' : 'Share Status'}
          </button>
       </div>
    </div>
  );
};

// --- Add Space Modal ---
const AddSpaceModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const dispatch = useGlobalDispatch();
  const [formData, setFormData] = useState({ name: '', description: '', image: '' });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await storageService.uploadFile(e.target.files[0]);
        setFormData({ ...formData, image: url });
      } catch (error) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Upload failed' } });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.description) return;
    setLoading(true);
    try {
      const newSpace = await api.spaces.create(formData);
      dispatch({ type: 'ADD_SPACE', payload: newSpace });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Space created successfully!' } });
      onClose();
      setFormData({ name: '', description: '', image: '' });
    } catch (e) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Failed to create space' } });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create Space</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="w-full h-32 bg-gray-100 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-700 relative flex flex-col items-center justify-center overflow-hidden group">
            {formData.image ? (
               <img src={formData.image} className="w-full h-full object-cover" alt="Banner" />
            ) : (
               <div className="flex flex-col items-center text-gray-400">
                 {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-8 h-8 mb-2" />}
                 <span className="text-xs font-bold">{uploading ? 'Uploading...' : 'Upload Banner'}</span>
               </div>
            )}
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} disabled={uploading} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Space Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Design Team"
              className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#ff1744]" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="What's this space about?"
              rows={3}
              className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#ff1744] resize-none" 
            />
          </div>

          <button 
            onClick={handleCreate}
            disabled={loading || !formData.name || !formData.description}
            className="w-full py-4 bg-[#ff1744] text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
          >
            {loading ? 'Creating...' : 'Create Space'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Status Screen ---
export const StatusScreen: React.FC = () => {
  const { stories, currentUser } = useGlobalState();
  const [showAddStory, setShowAddStory] = useState(false);
  const [viewStory, setViewStory] = useState<Story | null>(null);

  return (
    <div className="p-4 overflow-y-auto h-full pb-24 bg-gray-50 dark:bg-slate-950 transition-colors">
      <AddStoryModal isOpen={showAddStory} onClose={() => setShowAddStory(false)} />
      <StoryViewerModal story={viewStory} onClose={() => setViewStory(null)} />
      
      <h2 className="text-2xl font-bold font-[Poppins] mb-4 text-slate-900 dark:text-white">Status</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {/* Add Story Button */}
        <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setShowAddStory(true)}>
           <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm hover:border-[#ff1744] transition-colors">
             <Plus className="w-6 h-6 text-[#ff1744]" />
           </div>
           <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Add Story</span>
        </div>

        {/* Stories List (Avatars) */}
        {stories.map(story => (
          <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setViewStory(story)}>
            <div className={`w-16 h-16 rounded-full p-[2px] ${story.viewed ? 'bg-gray-300 dark:bg-slate-700' : 'bg-gradient-to-tr from-[#ff1744] to-orange-400'}`}>
              <img src={story.userAvatar} className="w-full h-full rounded-full border-2 border-white dark:border-slate-900 object-cover" alt={story.userName} />
            </div>
            <span className="text-xs text-slate-700 dark:text-slate-300 truncate w-16 text-center">{story.userName.split(' ')[0]}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-6 space-y-4">
         <h3 className="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Recent Updates</h3>
         {stories.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No recent updates.</p>
         ) : (
            stories.map(story => (
              <div key={story.id + '_list'} onClick={() => setViewStory(story)} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className={`w-12 h-12 rounded-full p-[2px] ${story.viewed ? 'bg-gray-300 dark:bg-slate-700' : 'bg-gradient-to-tr from-[#ff1744] to-orange-400'}`}>
                    <img src={story.userAvatar} className="w-full h-full rounded-full border-2 border-white dark:border-slate-900 object-cover" alt={story.userName} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{story.userName}</h4>
                    <p className="text-xs text-gray-500 dark:text-slate-500">{story.timestamp}</p>
                    {story.caption && <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1 italic">"{story.caption}"</p>}
                  </div>
              </div>
            ))
         )}
      </div>
    </div>
  );
};

// --- Discovery Screen ---
export const DiscoveryScreen: React.FC = () => {
  const { products } = useGlobalState();
  const [activeTab, setActiveTab] = useState('All');
  const [following, setFollowing] = useState<string[]>([]);
  const [likes, setLikes] = useState<string[]>([]);

  const toggleFollow = (id: string) => {
    setFollowing(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleLike = (id: string) => {
    setLikes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const trendingTags = [
    { name: 'Tech', count: '12k' },
    { name: 'Crypto', count: '8.4k' },
    { name: 'Art', count: '5k' },
    { name: 'Music', count: '3.2k' },
    { name: 'Gaming', count: '15k' }
  ];

  const liveUsers = [
    { id: 'l1', name: 'Alice Tech', viewers: 1200, avatar: 'https://picsum.photos/100/100?random=50' },
    { id: 'l2', name: 'Crypto King', viewers: 850, avatar: 'https://picsum.photos/100/100?random=51' },
    { id: 'l3', name: 'Design Daily', viewers: 2300, avatar: 'https://picsum.photos/100/100?random=52' },
  ];

  return (
    <div className="h-full overflow-y-auto pb-24 bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-30 p-4 border-b border-gray-100 dark:border-slate-800">
        <div className="relative shadow-sm rounded-2xl">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search trends, people..." 
            className="w-full bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#ff1744]/20 transition-all placeholder-gray-500 font-bold" 
          />
        </div>
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
          {['All', 'Live', 'People', 'Media', 'Shop'].map(filter => (
            <button 
              key={filter} 
              onClick={() => setActiveTab(filter)}
              className={`px-5 py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
                activeTab === filter 
                ? 'bg-[#ff1744] text-white border-[#ff1744] shadow-md shadow-red-500/20' 
                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#ff1744]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-8">
        
        {/* Happening Now (Live) */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-5 h-5 text-[#ff1744] animate-pulse" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Happening Now</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {liveUsers.map(user => (
              <div key={user.id} className="relative flex-shrink-0 cursor-pointer group">
                <div className="w-20 h-20 rounded-2xl p-[2px] bg-gradient-to-tr from-[#ff1744] to-purple-600 relative">
                  <img src={user.avatar} className="w-full h-full rounded-[14px] border-2 border-white dark:border-slate-900 object-cover" alt={user.name} />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#ff1744] text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Users className="w-2 h-2" /> {(user.viewers/1000).toFixed(1)}k
                  </div>
                </div>
                <p className="text-xs font-bold text-center mt-3 text-slate-700 dark:text-slate-300">{user.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Hero Banner */}
        <section className="relative w-full aspect-[2/1] rounded-3xl overflow-hidden shadow-lg group cursor-pointer">
           <img src="https://picsum.photos/800/400?random=88" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Featured" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
              <span className="bg-[#ff1744] text-white text-[10px] font-bold px-2 py-1 rounded-md w-fit mb-2">FEATURED EVENT</span>
              <h2 className="text-2xl font-bold text-white mb-1">The Future of AI Art</h2>
              <p className="text-gray-200 text-sm line-clamp-2">Join top creators discussing the impact of generative AI on digital art.</p>
           </div>
        </section>

        {/* Trending Tags */}
        <section>
           <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3 flex items-center gap-2">
             <Flame className="w-5 h-5 text-orange-500" /> Trending Topics
           </h3>
           <div className="flex flex-wrap gap-2">
             {trendingTags.map((tag, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-[#ff1744] cursor-pointer transition-colors group">
                   <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 group-hover:bg-[#ff1744]/10 group-hover:text-[#ff1744]">
                      <Hash className="w-4 h-4" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-[#ff1744]">{tag.name}</p>
                      <p className="text-[10px] text-gray-400">{tag.count} posts</p>
                   </div>
                </div>
             ))}
           </div>
        </section>

        {/* Masonry Grid (Explore) */}
        <section>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Explore For You</h3>
          <div className="columns-2 gap-4 space-y-4">
             {/* Mix of Posts and Products */}
             {[1,2,3,4,5,6].map((i) => (
               <div key={i} className="break-inside-avoid bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                  <div className="relative">
                     <img src={`https://picsum.photos/400/${i % 2 === 0 ? '500' : '300'}?random=${i+100}`} className="w-full h-auto object-cover" alt="Content" />
                     <button 
                       onClick={(e) => { e.stopPropagation(); toggleLike(`p_${i}`); }}
                       className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#ff1744] transition-colors"
                     >
                       <Heart className={`w-4 h-4 ${likes.includes(`p_${i}`) ? 'fill-white' : ''}`} />
                     </button>
                     {i % 3 === 0 && (
                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                           <Play className="w-3 h-3 text-white fill-white" />
                           <span className="text-[10px] text-white font-bold">0:30</span>
                        </div>
                     )}
                  </div>
                  <div className="p-3">
                     <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 mb-2">
                        {i % 2 === 0 ? 'Futuristic architecture design concepts 🏙️' : 'Summer vibes only ☀️ #travel'}
                     </h4>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <img src={`https://picsum.photos/50/50?random=${i+200}`} className="w-6 h-6 rounded-full" alt="User" />
                           <span className="text-xs text-gray-500 font-medium truncate w-16">User_{i}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                           <Heart className="w-3 h-3" /> <span className="text-[10px]">{i * 42}</span>
                        </div>
                     </div>
                  </div>
               </div>
             ))}
             
             {/* Insert a Product Card in the grid */}
             {products.slice(0, 1).map(p => (
               <div key={p.id} className="break-inside-avoid bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm relative">
                  <div className="absolute top-3 left-3 bg-[#ff1744] text-white text-[10px] font-bold px-2 py-1 rounded-md z-10">SPONSORED</div>
                  <img src={p.image} className="w-full aspect-square object-cover" alt={p.title} />
                  <div className="p-3">
                     <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.title}</h4>
                     <div className="flex justify-between items-center mt-1">
                        <span className="text-[#ff1744] font-bold">${p.price}</span>
                        <button className="p-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-[#ff1744] hover:text-white transition-colors">
                           <ShoppingCart className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </section>

      </div>
    </div>
  );
};

// --- Spaces Screen ---
export const SpacesScreen: React.FC<{spaces: Space[]}> = ({ spaces }) => {
  const [activeView, setActiveView] = useState<'community' | 'desk'>('community');
  const [showAddSpace, setShowAddSpace] = useState(false);
  const { workspaceWidgets } = useGlobalState();
  const dispatch = useGlobalDispatch();

  const joinedSpaces = spaces.filter(s => s.joined);
  const discoverSpaces = spaces.filter(s => !s.joined);

  const handleJoin = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.spaces.join(id);
      dispatch({ type: 'JOIN_SPACE', payload: id });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Space updated' } });
    } catch (err) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Action failed' } });
    }
  };

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

  const SpaceCard = ({ space, isJoined }: { space: Space, isJoined?: boolean }) => (
    <div className="relative h-48 rounded-3xl overflow-hidden group cursor-pointer shadow-md">
      <img src={space.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={space.name} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end">
        <h3 className="font-bold text-xl text-white mb-1">{space.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-200 line-clamp-1 w-2/3">{space.description}</span>
          <div className="flex gap-2">
             <span className="text-xs font-bold bg-white/20 backdrop-blur-md text-white px-2.5 py-1 rounded-lg flex items-center gap-1">
               <Users className="w-3 h-3" /> {(space.members / 1000).toFixed(1)}k
             </span>
             <button 
                onClick={(e) => handleJoin(space.id, e)}
                className={`w-7 h-6 rounded-lg flex items-center justify-center transition-colors ${isJoined ? 'bg-[#ff1744] text-white' : 'bg-white text-slate-900 hover:bg-gray-200'}`}
             >
                {isJoined ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
             </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto pb-24 p-4 bg-gray-50 dark:bg-slate-950 transition-colors">
      <AddSpaceModal isOpen={showAddSpace} onClose={() => setShowAddSpace(false)} />

      <div className="flex justify-between items-end mb-6">
         <div>
            <h2 className="text-2xl font-bold font-[Poppins] text-slate-900 dark:text-white">Spaces</h2>
            <p className="text-gray-500 dark:text-slate-500 text-sm mt-1">Your digital HQ</p>
         </div>
         <button 
           onClick={() => setShowAddSpace(true)}
           className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center border border-gray-100 dark:border-slate-700 hover:bg-[#ff1744] hover:text-white group transition-colors"
         >
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
        <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
          
          {joinedSpaces.length > 0 && (
            <section>
               <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Joined Spaces</h3>
               <div className="grid grid-cols-1 gap-4">
                  {joinedSpaces.map(space => <SpaceCard key={space.id} space={space} isJoined={true} />)}
               </div>
            </section>
          )}

          <section>
             <div className="flex items-center justify-between mb-3 px-1">
               <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Explore</h3>
               <div className="flex items-center gap-1 text-[#ff1744] text-xs font-bold">
                  <Globe className="w-3 h-3" /> Global
               </div>
             </div>
             <div className="grid grid-cols-1 gap-5">
               {discoverSpaces.map(space => <SpaceCard key={space.id} space={space} isJoined={false} />)}
               {discoverSpaces.length === 0 && <p className="text-gray-400 text-sm italic">No new spaces to discover.</p>}
             </div>
          </section>

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

// --- Sell Item Modal ---
const SellItemModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const dispatch = useGlobalDispatch();
  const [formData, setFormData] = useState({ 
    title: '', 
    price: '', 
    image: '',
    category: 'Electronics',
    condition: 'New',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await storageService.uploadFile(e.target.files[0]);
        setFormData({ ...formData, image: url });
      } catch (error) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Image upload failed' } });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.image) return;

    setLoading(true);
    try {
      const newProduct = await api.market.addProduct({
        title: formData.title,
        price: parseFloat(formData.price),
        image: formData.image,
        category: formData.category,
        condition: formData.condition,
        description: formData.description
      });
      dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Product listed successfully!' } });
      onClose();
      // Reset form
      setFormData({ title: '', price: '', image: '', category: 'Electronics', condition: 'New', description: '' });
    } catch (error) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Failed to list product' } });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl w-full max-w-sm h-[85vh] sm:h-auto sm:max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Sell Item</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 flex-1 overflow-y-auto pr-2">
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Product Image</label>
            <div className={`w-full aspect-video rounded-2xl border-2 border-dashed ${formData.image ? 'border-transparent' : 'border-gray-300 dark:border-slate-700'} bg-gray-50 dark:bg-slate-800 flex flex-col items-center justify-center relative overflow-hidden group`}>
               {formData.image ? (
                 <>
                   <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-bold text-sm">Change Image</p>
                   </div>
                 </>
               ) : (
                 <div className="text-gray-400 flex flex-col items-center gap-2">
                   {uploading ? <div className="w-8 h-8 border-4 border-[#ff1744]/30 border-t-[#ff1744] rounded-full animate-spin"></div> : <UploadCloud className="w-8 h-8" />}
                   <span className="text-xs font-bold">{uploading ? 'Uploading...' : 'Tap to Upload'}</span>
                 </div>
               )}
               <input 
                 type="file" 
                 accept="image/*" 
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 onChange={handleImageUpload}
                 disabled={uploading}
               />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Title</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Vintage Camera"
              className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#ff1744]" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
               <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#ff1744]"
               >
                  <option>Electronics</option>
                  <option>Fashion</option>
                  <option>Home</option>
                  <option>Toys</option>
                  <option>Sports</option>
               </select>
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold text-gray-400 uppercase">Condition</label>
               <select 
                  value={formData.condition}
                  onChange={(e) => setFormData({...formData, condition: e.target.value})}
                  className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#ff1744]"
               >
                  <option>New</option>
                  <option>Like New</option>
                  <option>Good</option>
                  <option>Fair</option>
               </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your item..."
              rows={3}
              className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#ff1744] resize-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Price ($)</label>
            <div className="relative">
               <span className="absolute left-4 top-4 text-slate-400 font-bold">$</span>
               <input 
                 type="number" 
                 value={formData.price}
                 onChange={(e) => setFormData({...formData, price: e.target.value})}
                 placeholder="0.00"
                 className="w-full p-4 pl-8 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#ff1744]" 
               />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !formData.title || !formData.price || !formData.image}
            className="w-full py-4 bg-[#ff1744] text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
          >
            {loading ? 'Listing Item...' : 'List Item'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Product Detail View ---
const ProductDetailView: React.FC<{ productId: string, onBack: () => void }> = ({ productId, onBack }) => {
  const { products } = useGlobalState();
  const dispatch = useGlobalDispatch();
  const product = products.find(p => p.id === productId);

  if (!product) return <div className="p-4 text-center">Product not found</div>;

  return (
    <div className="h-full bg-white dark:bg-slate-950 flex flex-col overflow-y-auto pb-24">
       {/* Sticky Header */}
       <div className="sticky top-0 z-20 flex justify-between items-center p-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
         <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-900 dark:text-white" />
         </button>
         <div className="flex gap-2">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
              <Heart className="w-5 h-5" />
            </button>
         </div>
       </div>

       {/* Hero Image */}
       <div className="relative w-full aspect-square md:aspect-video bg-gray-100 dark:bg-slate-900">
          <img src={product.image} className="w-full h-full object-cover" alt={product.title} />
          <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
             <span className="text-white text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Seller
             </span>
          </div>
       </div>

       {/* Info Section */}
       <div className="p-6 space-y-6">
          <div>
            <div className="flex justify-between items-start mb-2">
               <h1 className="text-2xl font-bold font-[Poppins] text-slate-900 dark:text-white leading-tight flex-1">{product.title}</h1>
               <div className="flex flex-col items-end">
                  <span className="text-2xl font-bold text-[#ff1744]">${product.price}</span>
                  {/* Mock shipping info */}
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-bold flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded mt-1">
                    <Truck className="w-3 h-3" /> Free Delivery
                  </span>
               </div>
            </div>
            
            {/* Condition & Category Tags */}
            <div className="flex gap-2 mb-2">
                {product.category && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded font-bold">{product.category}</span>}
                {product.condition && <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded font-bold">{product.condition}</span>}
            </div>

            <div className="flex items-center gap-2 mt-2">
               <div className="flex items-center text-orange-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
               </div>
               <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">{product.rating} (124 reviews)</span>
            </div>
          </div>

          {/* Seller Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
             <img src={`https://picsum.photos/60/60?random=${product.id}seller`} className="w-12 h-12 rounded-full object-cover" alt={product.seller} />
             <div className="flex-1">
                <h4 className="font-bold text-slate-900 dark:text-white">{product.seller}</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400">Member since 2023 • 98% Positive</p>
             </div>
             <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                Contact
             </button>
          </div>

          {/* Description */}
          <div className="space-y-3">
             <h3 className="font-bold text-lg text-slate-900 dark:text-white">Description</h3>
             <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
               {product.description || `Experience premium quality with this ${product.title}. Meticulously designed for performance and style, it features top-tier materials that ensure durability. Perfect for daily use or as a gift.`}
               <br/><br/>
               • Authentic and verified
               <br/>
               • 30-day money-back guarantee
             </p>
          </div>

          {/* Reviews Preview */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-800">
             <h3 className="font-bold text-lg text-slate-900 dark:text-white">Customer Reviews</h3>
             {[1, 2].map(i => (
                <div key={i} className="space-y-2">
                   <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-700"></div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">User{i * 342}</span>
                      <div className="flex text-orange-400 ml-auto">
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                   </div>
                   <p className="text-xs text-gray-500 dark:text-slate-400 italic">"Absolutely amazing product! Arrived faster than expected and the quality is top notch."</p>
                </div>
             ))}
             <button className="text-[#ff1744] text-xs font-bold hover:underline">View all 124 reviews</button>
          </div>
       </div>

       {/* Sticky Bottom Action Bar */}
       <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex gap-3 z-30 max-w-md mx-auto">
          <button 
             onClick={() => {
                dispatch({ type: 'ADD_TO_CART', payload: product });
                dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Added to cart' } });
             }}
             className="flex-1 py-3.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
             <ShoppingCart className="w-4 h-4" /> Add to Cart
          </button>
          <button 
             onClick={() => dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Proceeding to checkout...' } })}
             className="flex-1 py-3.5 rounded-xl bg-[#ff1744] text-white font-bold text-sm shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors"
          >
             Buy Now
          </button>
       </div>
    </div>
  );
};

// --- Marketplace Screen ---
export const MarketplaceScreen: React.FC = () => {
  const { products, cart, selectedProductId } = useGlobalState();
  const dispatch = useGlobalDispatch();
  const [showCart, setShowCart] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // If a product is selected, show details view
  if (selectedProductId) {
    return (
      <ProductDetailView 
        productId={selectedProductId} 
        onBack={() => dispatch({ type: 'SELECT_PRODUCT', payload: null })} 
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-24 bg-gray-50 dark:bg-slate-950 transition-colors relative">
       <SellItemModal isOpen={showSellModal} onClose={() => setShowSellModal(false)} />

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
           <div 
             key={product.id} 
             className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all group flex flex-col cursor-pointer"
             onClick={() => dispatch({ type: 'SELECT_PRODUCT', payload: product.id })}
           >
             <div className="relative h-40">
               <img src={product.image} className="w-full h-full object-cover" alt={product.title} />
               <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // Like logic here
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-full flex items-center justify-center text-slate-900 dark:text-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#ff1744]"
               >
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
                 <img src={`https://picsum.photos/50/50?random=${product.id}`} className="w-5 h-5 rounded-full object-cover" alt={product.seller} />
                 <span className="text-xs text-gray-500 dark:text-slate-400 truncate font-medium">{product.seller}</span>
               </div>
               <button 
                onClick={(e) => {
                  e.stopPropagation();
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
       
       <button 
         onClick={() => setShowSellModal(true)}
         className="fixed bottom-24 right-6 bg-[#ff1744] text-white px-5 py-3.5 rounded-full font-bold shadow-xl shadow-red-500/30 flex items-center gap-2 z-10 hover:scale-105 transition-transform"
       >
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
  const [subSection, setSubSection] = useState<'none' | 'personal' | 'security' | 'appearance' | 'devices' | 'support'>('none');
  
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

  // Top Up Modal State
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money'>('card');

  // Withdraw Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'bank' | 'mobile_money'>('bank');
  const [withdrawDetails, setWithdrawDetails] = useState({ accountName: '', accountNumber: '' });

  // Request Money Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({ recipient: '', amount: '' });

  // Personal Info Edit State
  const [editName, setEditName] = useState(user?.name || '');
  const [editBio, setEditBio] = useState('Digital enthusiast living in the future.');
  const [editPhone, setEditPhone] = useState('+1 (555) 000-0000');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    // Sync local state when user updates (e.g. after save)
    if (user) {
      setEditName(user.name);
      setEditAvatar(user.avatar);
    }
  }, [user]);

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingAvatar(true);
      try {
        const url = await storageService.uploadFile(e.target.files[0]);
        setEditAvatar(url);
      } catch (error) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Failed to upload image' } });
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const updatedUser = await api.auth.updateProfile({ 
        name: editName, 
        avatar: editAvatar 
      });
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Profile updated successfully!' } });
      setSubSection('none');
    } catch (error) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Failed to update profile' } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
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
    } else if (actionLabel === 'Top Up') {
      setTopUpAmount('');
      setShowTopUpModal(true);
    } else if (actionLabel === 'Request') {
      setRequestData({ recipient: '', amount: '' });
      setShowRequestModal(true);
    } else if (actionLabel === 'Withdraw') {
      setWithdrawAmount('');
      setWithdrawDetails({ accountName: '', accountNumber: '' });
      setShowWithdrawModal(true);
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

  const handleTopUp = async () => {
     if(!topUpAmount) return;
     dispatch({ type: 'SET_LOADING', payload: true });
     try {
        const newTx = await api.wallet.deposit(parseFloat(topUpAmount), paymentMethod);
        dispatch({
            type: 'ADD_TRANSACTION',
            payload: newTx
        });
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Funds added successfully!' } });
        setShowTopUpModal(false);
     } catch (e) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Failed to add funds' } });
     } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
     }
  };

  const handleWithdraw = async () => {
     if (!withdrawAmount || !withdrawDetails.accountNumber) return;
     dispatch({ type: 'SET_LOADING', payload: true });
     try {
       const newTx = await api.wallet.withdraw(parseFloat(withdrawAmount), withdrawMethod);
       dispatch({ 
          type: 'ADD_TRANSACTION', 
          payload: newTx
       });
       dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Withdrawal initiated successfully!' } });
       setShowWithdrawModal(false);
     } catch (e) {
       dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Withdrawal failed.' } });
     } finally {
       dispatch({ type: 'SET_LOADING', payload: false });
     }
  };

  const handleRequestFunds = () => {
     if(!requestData.recipient || !requestData.amount) return;
     dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: `Request sent to ${requestData.recipient}` } });
     setShowRequestModal(false);
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
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                   <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-md overflow-hidden relative">
                      <img src={editAvatar} className="w-full h-full object-cover" alt="Profile" />
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-white text-xs font-bold">Change</span>
                      </div>
                   </div>
                   <button className="absolute bottom-0 right-0 p-2 bg-[#ff1744] text-white rounded-full shadow-sm hover:scale-105 transition-transform">
                      <Camera className="w-4 h-4" />
                   </button>
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleAvatarUpload} 
                      disabled={uploadingAvatar}
                   />
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

  if (subSection === 'devices') {
     return (
       <div className="h-full flex flex-col bg-gray-50 dark:bg-slate-950">
          <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 sticky top-0 z-10">
            <button onClick={() => setSubSection('none')} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
               <ChevronLeft className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Linked Devices</h3>
          </div>
          <div className="p-4 space-y-6">
             {/* Scan QR Area */}
             <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-[#ff1744]/10 rounded-full flex items-center justify-center mb-4">
                   <QrCode className="w-8 h-8 text-[#ff1744]" />
                </div>
                <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Link a Device</h4>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-6 max-w-[200px]">Go to web.pingspace.app on your computer and scan the QR code.</p>
                <button className="w-full py-3 bg-[#ff1744] text-white font-bold rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors">
                   Link a Device
                </button>
             </div>

             {/* Device List */}
             <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 ml-2">Active Sessions</h4>
                <div className="space-y-3">
                   <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                            <Smartphone className="w-5 h-5 text-green-500" />
                         </div>
                         <div>
                            <h5 className="font-bold text-slate-900 dark:text-white text-sm">iPhone 14 Pro</h5>
                            <p className="text-xs text-green-500 font-bold">This Device • Online</p>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                            <Laptop className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                         </div>
                         <div>
                            <h5 className="font-bold text-slate-900 dark:text-white text-sm">MacBook Air</h5>
                            <p className="text-xs text-gray-500 dark:text-slate-500">Last active today at 10:30 AM</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => dispatch({type: 'ADD_NOTIFICATION', payload: {type: 'success', message: 'Logged out from MacBook Air'}})}
                        className="text-red-500 text-xs font-bold hover:underline"
                      >
                         Log Out
                      </button>
                   </div>

                   <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                            <Monitor className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                         </div>
                         <div>
                            <h5 className="font-bold text-slate-900 dark:text-white text-sm">Windows PC (Chrome)</h5>
                            <p className="text-xs text-gray-500 dark:text-slate-500">Last active yesterday</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => dispatch({type: 'ADD_NOTIFICATION', payload: {type: 'success', message: 'Logged out from Windows PC'}})}
                        className="text-red-500 text-xs font-bold hover:underline"
                      >
                         Log Out
                      </button>
                   </div>
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

  if (subSection === 'support') {
     return (
       <div className="h-full flex flex-col bg-gray-50 dark:bg-slate-950">
          <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 sticky top-0 z-10">
            <button onClick={() => setSubSection('none')} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
               <ChevronLeft className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Help & Support</h3>
          </div>
          <div className="p-4 space-y-6 overflow-y-auto">
             
             {/* Contact Support */}
             <div className="bg-[#ff1744]/5 p-5 rounded-2xl border border-[#ff1744]/10 text-center">
                <div className="w-12 h-12 bg-[#ff1744]/10 rounded-full flex items-center justify-center mx-auto mb-3 text-[#ff1744]">
                   <MessageCircle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white">Need help?</h4>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Our support team is available 24/7 to assist you with any issues.</p>
                <button className="px-6 py-2 bg-[#ff1744] text-white font-bold rounded-xl text-sm shadow-md hover:bg-red-600 transition-colors">
                   Chat with Support
                </button>
             </div>

             {/* FAQs */}
             <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 ml-2">Frequently Asked Questions</h4>
                <div className="space-y-3">
                   {[
                      { q: "How do I verify my identity?", a: "Go to Personal Info > Identity Verification and upload your ID." },
                      { q: "Are payments secure?", a: "Yes, we use bank-grade encryption and 2FA for all transactions." },
                      { q: "How do I list an item?", a: "Go to the Market tab and tap the + button to start selling." },
                      { q: "Can I use PingSpace on desktop?", a: "Yes! Use the Linked Devices section to scan a QR code on our website." }
                   ].map((faq, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm group cursor-pointer">
                         <div className="flex justify-between items-center">
                            <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">{faq.q}</h5>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                         </div>
                         <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 leading-relaxed hidden group-hover:block animate-in fade-in slide-in-from-top-1">
                            {faq.a}
                         </p>
                      </div>
                   ))}
                </div>
             </div>

             <div className="text-center pt-4">
                <p className="text-xs text-gray-400">App Version 2.4.0</p>
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
               { icon: ArrowUpRight, label: 'Withdraw', bg: 'bg-purple-50 dark:bg-purple-900/20', color: 'text-purple-600 dark:text-purple-400' },
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
                           t.type === 'withdraw' ? <ArrowUpRight className="w-5 h-5" /> :
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

      {/* Top Up Modal */}
      {showTopUpModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Top Up Wallet</h3>
                  <button onClick={() => setShowTopUpModal(false)} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                    <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  </button>
               </div>
               
               <div className="space-y-6">
                  <div>
                     <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Amount</label>
                     <div className="relative">
                        <span className="absolute left-4 top-3.5 text-2xl font-bold text-slate-400">$</span>
                        <input 
                          type="number"
                          value={topUpAmount}
                          onChange={(e) => setTopUpAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-gray-50 dark:bg-slate-800 rounded-2xl py-3.5 pl-10 pr-4 text-3xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff1744]/20"
                        />
                     </div>
                     <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                        {[10, 50, 100, 500].map(amt => (
                           <button 
                             key={amt}
                             onClick={() => setTopUpAmount(amt.toString())}
                             className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-gray-200 dark:hover:border-slate-600 transition-all"
                           >
                             ${amt}
                           </button>
                        ))}
                     </div>
                  </div>
                  
                  <div>
                     <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Payment Method</label>
                     <div className="grid grid-cols-2 gap-3">
                        <button 
                           onClick={() => setPaymentMethod('card')}
                           className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'card' ? 'bg-[#ff1744]/5 border-[#ff1744] text-[#ff1744]' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                        >
                           <CreditCard className="w-6 h-6" />
                           <span className="text-xs font-bold">Bank Card</span>
                        </button>
                        <button 
                           onClick={() => setPaymentMethod('mobile_money')}
                           className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'mobile_money' ? 'bg-[#ff1744]/5 border-[#ff1744] text-[#ff1744]' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                        >
                           <Smartphone className="w-6 h-6" />
                           <span className="text-xs font-bold">Mobile Money</span>
                        </button>
                     </div>
                  </div>

                  <button 
                    onClick={handleTopUp}
                    disabled={!topUpAmount}
                    className="w-full py-4 bg-[#ff1744] text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                     Confirm Top Up
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">Withdraw Funds</h3>
                 <button onClick={() => setShowWithdrawModal(false)} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                   <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                 </button>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Withdrawal Method</label>
                    <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl mb-4">
                       <button 
                         onClick={() => setWithdrawMethod('bank')}
                         className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${withdrawMethod === 'bank' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400'}`}
                       >
                         Bank Transfer
                       </button>
                       <button 
                         onClick={() => setWithdrawMethod('mobile_money')}
                         className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${withdrawMethod === 'mobile_money' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400'}`}
                       >
                         Mobile Money
                       </button>
                    </div>
                    
                    {withdrawMethod === 'bank' ? (
                       <div className="space-y-3">
                          <input 
                             type="text"
                             placeholder="Bank Name"
                             value={withdrawDetails.accountName} // Reusing field for Bank Name for simplicity in this mock
                             onChange={(e) => setWithdrawDetails({...withdrawDetails, accountName: e.target.value})}
                             className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-3.5 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff1744]/20"
                          />
                          <input 
                             type="text"
                             placeholder="Account Number"
                             value={withdrawDetails.accountNumber}
                             onChange={(e) => setWithdrawDetails({...withdrawDetails, accountNumber: e.target.value})}
                             className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-3.5 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff1744]/20"
                          />
                       </div>
                    ) : (
                       <div className="space-y-3">
                          <select className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-3.5 font-bold text-slate-900 dark:text-white focus:outline-none">
                             <option>MTN Mobile Money</option>
                             <option>Vodafone Cash</option>
                             <option>AirtelTigo Money</option>
                          </select>
                          <input 
                             type="tel"
                             placeholder="Phone Number"
                             value={withdrawDetails.accountNumber}
                             onChange={(e) => setWithdrawDetails({...withdrawDetails, accountNumber: e.target.value})}
                             className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-3.5 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff1744]/20"
                          />
                       </div>
                    )}
                 </div>

                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Amount</label>
                    <div className="relative">
                       <span className="absolute left-4 top-3.5 text-2xl font-bold text-slate-400">$</span>
                       <input 
                         type="number"
                         value={withdrawAmount}
                         onChange={(e) => setWithdrawAmount(e.target.value)}
                         placeholder="0.00"
                         className="w-full bg-gray-50 dark:bg-slate-800 rounded-2xl py-3.5 pl-10 pr-4 text-3xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff1744]/20"
                       />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-right">Available Balance: $2,450.30</p>
                 </div>

                 <button 
                   onClick={handleWithdraw}
                   disabled={!withdrawAmount || !withdrawDetails.accountNumber}
                   className="w-full py-4 bg-[#ff1744] text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                 >
                    Confirm Withdrawal
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Request Funds Modal */}
      {showRequestModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Request Money</h3>
                  <button onClick={() => setShowRequestModal(false)} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                    <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  </button>
               </div>
               
               <div className="space-y-6">
                  <div>
                     <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Request From</label>
                     <div className="relative">
                        <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input 
                           type="text"
                           value={requestData.recipient}
                           onChange={(e) => setRequestData({...requestData, recipient: e.target.value})}
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
                          value={requestData.amount}
                          onChange={(e) => setRequestData({...requestData, amount: e.target.value})}
                          placeholder="0.00"
                          className="w-full bg-gray-50 dark:bg-slate-800 rounded-2xl py-3.5 pl-10 pr-4 text-3xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff1744]/20"
                        />
                     </div>
                  </div>

                  <button 
                    onClick={handleRequestFunds}
                    disabled={!requestData.recipient || !requestData.amount}
                    className="w-full py-4 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-2xl shadow-lg hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                     Send Request
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
                        <p className="text-xs text-gray-400 mt-2 text-right">Available Balance: $2,450.30</p>
                     </div>
                  </div>

                  <button 
                    onClick={() => {
                       if(sendData.recipient && sendData.amount) setSendStep('security');
                    }}
                    disabled={!sendData.recipient || !sendData.amount}
                    className="w-full py-4 bg-[#ff1744] text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
                  >
                     Continue
                  </button>
               </div>
             )}

             {sendStep === 'security' && (
               <div className="p-6 flex flex-col h-full bg-slate-900 text-white">
                  <div className="flex justify-center mb-6">
                     <div className="w-16 h-1 bg-slate-700 rounded-full"></div>
                  </div>
                  
                  <div className="text-center mb-8">
                     <h3 className="text-xl font-bold mb-2">Enter PIN</h3>
                     <p className="text-slate-400 text-sm">Verify transfer of <span className="text-white font-bold">${sendData.amount}</span></p>
                  </div>

                  <div className="flex justify-center gap-4 mb-8">
                     {[1, 2, 3, 4].map((_, i) => (
                        <div key={i} className={`w-4 h-4 rounded-full border-2 border-slate-600 ${pin.length > i ? 'bg-[#ff1744] border-[#ff1744]' : 'bg-transparent'}`}></div>
                     ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mb-6">
                     {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button 
                          key={num} 
                          onClick={() => handlePinInput(num.toString())}
                          className="w-16 h-16 rounded-full bg-slate-800 text-white font-bold text-xl hover:bg-slate-700 transition-colors flex items-center justify-center"
                        >
                           {num}
                        </button>
                     ))}
                     <button className="w-16 h-16 flex items-center justify-center" onClick={handleBiometric}>
                        <Fingerprint className="w-8 h-8 text-[#ff1744]" />
                     </button>
                     <button 
                       onClick={() => handlePinInput('0')}
                       className="w-16 h-16 rounded-full bg-slate-800 text-white font-bold text-xl hover:bg-slate-700 transition-colors flex items-center justify-center"
                     >
                        0
                     </button>
                     <button onClick={handleBackspace} className="w-16 h-16 flex items-center justify-center text-slate-400 hover:text-white">
                        <Delete className="w-6 h-6" />
                     </button>
                  </div>

                  <button 
                    onClick={verifyTransaction}
                    disabled={pin.length !== 4}
                    className="w-full py-4 bg-[#ff1744] text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-auto"
                  >
                     Confirm Payment
                  </button>
               </div>
             )}

             {sendStep === 'success' && (
                <div className="p-6 flex flex-col items-center justify-center h-full text-center">
                   <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                      <Check className="w-12 h-12 text-white" />
                   </div>
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Transfer Successful!</h3>
                   <p className="text-gray-500 dark:text-slate-400 mb-8">You sent <span className="font-bold text-slate-900 dark:text-white">${sendData.amount}</span> to {sendData.recipient}</p>
                   
                   <button 
                     onClick={() => setShowSendModal(false)}
                     className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-all"
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