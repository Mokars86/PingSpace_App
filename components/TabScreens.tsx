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
  Radio, Hash, Play, Flame, Landmark, Maximize2, Laptop, Monitor, Mail, ChevronDown,
  Bell, Eye, EyeOff, AlertTriangle
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

// ... (AddStoryModal, AddSpaceModal, StatusScreen, SpaceCard, DiscoveryScreen, SpacesScreen, SellItemModal, ProductDetailView, MarketplaceScreen remain unchanged) ...
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

// --- Space Card Component ---
const SpaceCard: React.FC<{ space: Space; onJoin: (id: string) => void }> = ({ space, onJoin }) => (
  <div className="min-w-[280px] md:min-w-[320px] bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm snap-center group">
    <div className="h-32 bg-gray-200 dark:bg-slate-800 relative overflow-hidden">
      <img src={space.image} alt={space.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div className="absolute bottom-3 left-3 text-white">
        <h3 className="font-bold text-lg">{space.name}</h3>
        <p className="text-xs opacity-90">{space.members.toLocaleString()} members</p>
      </div>
    </div>
    <div className="p-4">
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 line-clamp-2">{space.description}</p>
      <button 
        onClick={() => onJoin(space.id)}
        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
          space.joined 
            ? 'bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-white' 
            : 'bg-[#ff1744] text-white shadow-lg shadow-red-500/30'
        }`}
      >
        {space.joined ? 'Joined' : 'Join Space'}
      </button>
    </div>
  </div>
);

// --- Discovery Screen ---
export const DiscoveryScreen: React.FC = () => {
  const { spaces, products } = useGlobalState();
  const dispatch = useGlobalDispatch();

  return (
    <div className="h-full overflow-y-auto pb-24 bg-gray-50 dark:bg-slate-950">
      <div className="p-4 pt-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 font-[Poppins]">Discover</h1>
        
        {/* Search Bar */}
        <div className="relative mb-8">
           <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
           <input 
             type="text" 
             placeholder="Search people, spaces, items..." 
             className="w-full bg-white dark:bg-slate-900 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white shadow-sm border border-gray-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff1744]/20"
           />
        </div>

        {/* Trending Spaces */}
        <div className="mb-8">
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <Flame className="w-5 h-5 text-orange-500" /> Trending Spaces
              </h2>
              <button className="text-[#ff1744] text-xs font-bold">View All</button>
           </div>
           <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x no-scrollbar">
              {spaces.map(space => (
                 <SpaceCard key={space.id} space={space} onJoin={(id) => dispatch({ type: 'JOIN_SPACE', payload: id })} />
              ))}
           </div>
        </div>

        {/* For You */}
        <div>
           <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recommended For You</h2>
           <div className="grid grid-cols-2 gap-4">
              {products.slice(0, 4).map(product => (
                 <div key={product.id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm">
                    <div className="aspect-square bg-gray-100 dark:bg-slate-800 relative">
                       <img src={product.image} className="w-full h-full object-cover" />
                       <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-slate-900 dark:text-white">
                          ${product.price}
                       </div>
                    </div>
                    <div className="p-3">
                       <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{product.title}</h3>
                       <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">{product.category}</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Spaces Screen ---
export const SpacesScreen: React.FC<{ spaces: Space[] }> = ({ spaces }) => {
  const [showAddSpace, setShowAddSpace] = useState(false);
  const dispatch = useGlobalDispatch();

  return (
    <div className="h-full overflow-y-auto pb-24 bg-gray-50 dark:bg-slate-950">
       <AddSpaceModal isOpen={showAddSpace} onClose={() => setShowAddSpace(false)} />
       
       <div className="p-4 pt-6">
          <div className="flex justify-between items-center mb-6">
             <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-[Poppins]">Spaces</h1>
             <button onClick={() => setShowAddSpace(true)} className="p-2 bg-[#ff1744]/10 text-[#ff1744] rounded-full hover:bg-[#ff1744] hover:text-white transition-colors">
                <Plus className="w-6 h-6" />
             </button>
          </div>

          <div className="grid gap-6">
             {spaces.map(space => (
                <div key={space.id} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800 group cursor-pointer hover:shadow-md transition-shadow">
                   <div className="h-40 bg-gray-200 dark:bg-slate-800 relative">
                      <img src={space.image} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-5 w-full">
                         <div className="flex justify-between items-end">
                            <div>
                               <h3 className="text-xl font-bold text-white mb-1">{space.name}</h3>
                               <p className="text-white/80 text-sm line-clamp-1">{space.description}</p>
                            </div>
                            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                               <Users className="w-3 h-3" /> {space.members}
                            </span>
                         </div>
                      </div>
                   </div>
                   <div className="p-4 flex items-center justify-between">
                      <div className="flex -space-x-2">
                         {[1,2,3].map(i => (
                            <img key={i} src={`https://picsum.photos/100/100?random=${i + parseInt(space.id.replace(/\D/g,''))}`} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900" />
                         ))}
                         <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-gray-500">
                            +99
                         </div>
                      </div>
                      <button 
                         onClick={(e) => { e.stopPropagation(); dispatch({ type: 'JOIN_SPACE', payload: space.id }); }}
                         className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${
                            space.joined 
                              ? 'bg-gray-100 dark:bg-slate-800 text-slate-500' 
                              : 'bg-[#ff1744] text-white shadow-lg shadow-red-500/30'
                         }`}
                      >
                         {space.joined ? 'Joined' : 'Join'}
                      </button>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

// --- Sell Item Modal ---
const SellItemModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const dispatch = useGlobalDispatch();
  const [formData, setFormData] = useState({ title: '', price: '', category: '', condition: 'New', description: '', image: '' });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await storageService.uploadFile(e.target.files[0]);
        setFormData({ ...formData, image: url });
      } catch (e) {
         dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Upload failed' } });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleList = async () => {
     if(!formData.title || !formData.price || !formData.image) return;
     setLoading(true);
     try {
        const newProduct = await api.market.addProduct({ 
           ...formData, 
           price: parseFloat(formData.price) 
        });
        dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Item listed for sale!' } });
        onClose();
     } catch(e) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Failed to list item' } });
     } finally {
        setLoading(false);
     }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
       <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">List Item</h3>
             <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
               <X className="w-5 h-5 text-slate-500" />
             </button>
          </div>
          
          <div className="space-y-4">
             {/* Image Upload */}
             <div className="w-full h-40 bg-gray-100 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-700 relative flex flex-col items-center justify-center overflow-hidden group">
                {formData.image ? (
                   <img src={formData.image} className="w-full h-full object-cover" />
                ) : (
                   <div className="flex flex-col items-center text-gray-400">
                     {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-8 h-8 mb-2" />}
                     <span className="text-xs font-bold">{uploading ? 'Uploading...' : 'Add Photos'}</span>
                   </div>
                )}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} disabled={uploading} />
             </div>

             <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl font-bold border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-[#ff1744]" placeholder="What are you selling?" />
             </div>

             <div className="flex gap-4">
                <div className="space-y-1 flex-1">
                   <label className="text-xs font-bold text-gray-400 uppercase">Price</label>
                   <div className="relative">
                      <span className="absolute left-3 top-3 text-slate-500 font-bold">$</span>
                      <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full p-3 pl-7 bg-gray-50 dark:bg-slate-800 rounded-xl font-bold border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-[#ff1744]" placeholder="0.00" />
                   </div>
                </div>
                <div className="space-y-1 flex-1">
                   <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                   <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl font-bold border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-[#ff1744]">
                      <option value="">Select</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Home">Home</option>
                   </select>
                </div>
             </div>

             <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl font-medium border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-[#ff1744] resize-none" placeholder="Describe your item..." />
             </div>

             <button onClick={handleList} disabled={loading || !formData.title || !formData.price} className="w-full py-4 bg-[#ff1744] text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 hover:bg-red-600 disabled:opacity-50 transition-all">
                {loading ? 'Listing...' : 'List Item'}
             </button>
          </div>
       </div>
    </div>
  );
};

// --- Product Detail View ---
const ProductDetailView: React.FC<{ product: Product; onClose: () => void }> = ({ product, onClose }) => {
  const dispatch = useGlobalDispatch();
  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 overflow-y-auto animate-in slide-in-from-right duration-300">
       <div className="relative h-[40vh]">
          <img src={product.image} className="w-full h-full object-cover" />
          <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-white/50 backdrop-blur-md rounded-full text-slate-900 hover:bg-white transition-colors">
             <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="absolute top-4 right-4 flex gap-2">
             <button className="p-2 bg-white/50 backdrop-blur-md rounded-full text-slate-900 hover:bg-white transition-colors">
                <Share2 className="w-5 h-5" />
             </button>
             <button className="p-2 bg-white/50 backdrop-blur-md rounded-full text-slate-900 hover:bg-white transition-colors">
                <Heart className="w-5 h-5" />
             </button>
          </div>
       </div>
       
       <div className="-mt-6 bg-white dark:bg-slate-950 rounded-t-3xl relative p-6 min-h-[60vh]">
          <div className="w-12 h-1 bg-gray-200 dark:bg-slate-800 rounded-full mx-auto mb-6"></div>
          
          <div className="flex justify-between items-start mb-4">
             <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{product.title}</h1>
                <p className="text-gray-500 dark:text-slate-400 text-sm">{product.category} • {product.condition}</p>
             </div>
             <div className="text-2xl font-bold text-[#ff1744]">${product.price}</div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 mb-6">
             <div className="w-12 h-12 bg-gray-200 dark:bg-slate-800 rounded-full">
                <img src={`https://ui-avatars.com/api/?name=${product.seller}`} className="w-full h-full rounded-full" />
             </div>
             <div className="flex-1">
                <h4 className="font-bold text-slate-900 dark:text-white">{product.seller}</h4>
                <div className="flex items-center gap-1">
                   <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                   <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{product.rating}</span>
                </div>
             </div>
             <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold">Message</button>
          </div>

          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Description</h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-8">{product.description}</p>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 max-w-md mx-auto">
             <button 
                onClick={() => {
                   dispatch({ type: 'ADD_TO_CART', payload: product });
                   dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Added to cart' } });
                   onClose();
                }}
                className="w-full py-4 bg-[#ff1744] text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all flex items-center justify-center gap-2"
             >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
             </button>
          </div>
       </div>
    </div>
  );
};

// --- Marketplace Screen ---
export const MarketplaceScreen: React.FC = () => {
  const { products, cart, selectedProductId } = useGlobalState();
  const dispatch = useGlobalDispatch();
  const [showSellModal, setShowSellModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [filter, setFilter] = useState('All');

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="h-full overflow-y-auto pb-24 bg-gray-50 dark:bg-slate-950">
       <SellItemModal isOpen={showSellModal} onClose={() => setShowSellModal(false)} />
       
       {selectedProduct && (
          <ProductDetailView 
             product={selectedProduct} 
             onClose={() => dispatch({ type: 'SELECT_PRODUCT', payload: null })} 
          />
       )}

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
       
       <div className="p-4 pt-6">
          <div className="flex justify-between items-center mb-6">
             <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-[Poppins]">Market</h1>
             <div className="flex gap-2">
                <button 
                  onClick={() => setShowCart(true)} 
                  className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-[#ff1744]"
                >
                   <ShoppingCart className="w-6 h-6" />
                   {cart.length > 0 && <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ff1744] rounded-full border border-white dark:border-slate-950"></div>}
                </button>
                <button onClick={() => setShowSellModal(true)} className="flex items-center gap-1 px-4 py-2 bg-[#ff1744] text-white rounded-full font-bold text-sm shadow-lg shadow-red-500/30 hover:bg-red-600 transition-colors">
                   <Plus className="w-4 h-4" /> Sell
                </button>
             </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
             {['All', 'Electronics', 'Fashion', 'Home', 'Vehicles', 'Toys'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                     filter === cat 
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-gray-100 dark:border-slate-800'
                  }`}
                >
                   {cat}
                </button>
             ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
             {products.filter(p => filter === 'All' || p.category === filter).map(product => (
                <div 
                   key={product.id} 
                   onClick={() => dispatch({ type: 'SELECT_PRODUCT', payload: product.id })}
                   className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800 group cursor-pointer hover:shadow-md transition-all"
                >
                   <div className="aspect-[4/5] bg-gray-100 dark:bg-slate-800 relative overflow-hidden">
                      <img src={product.image} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <button className="absolute top-2 right-2 p-1.5 bg-white/50 backdrop-blur-md rounded-full text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-[#ff1744]">
                         <Heart className="w-4 h-4" />
                      </button>
                   </div>
                   <div className="p-3">
                      <div className="flex justify-between items-start mb-1">
                         <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate flex-1">{product.title}</h3>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="font-bold text-[#ff1744] text-sm">${product.price}</span>
                         <span className="text-[10px] text-gray-400">{product.condition}</span>
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

// --- Enhanced Wallet & Profile Screen ---
export const ProfileScreen: React.FC = () => {
  const { currentUser: user, transactions, theme, settings } = useGlobalState();
  const dispatch = useGlobalDispatch();
  const [activeTab, setActiveTab] = useState<'wallet' | 'account'>('wallet');
  const [subSection, setSubSection] = useState<'none' | 'personal' | 'security' | 'appearance' | 'devices' | 'support' | 'settings' | 'notifications' | 'privacy'>('none');
  
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

  // Delete Account Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleDeleteAccount = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Clear everything
    localStorage.clear();
    dispatch({ type: 'LOGOUT' });
    dispatch({ type: 'SET_LOADING', payload: false });
    window.location.reload(); // Hard reload to clear any memory state
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

  const updateSetting = (section: keyof typeof settings, key: string, value: any) => {
    dispatch({ type: 'UPDATE_SETTING', payload: { section, key, value } });
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

  if (subSection === 'settings') {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-slate-950">
         <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 sticky top-0 z-10">
           <button onClick={() => setSubSection('none')} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
              <ChevronLeft className="w-6 h-6" />
           </button>
           <h3 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h3>
         </div>
         <div className="p-4 space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
            {[
              { id: 'notifications', icon: Bell, label: 'Notifications' },
              { id: 'privacy', icon: Lock, label: 'Privacy & Data' },
              { id: 'devices', icon: Smartphone, label: 'Linked Devices' },
              { id: 'appearance', icon: Zap, label: 'App Appearance' },
              { id: 'security', icon: Shield, label: 'Security' },
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
         </div>
      </div>
    );
  }

  // --- NEW NOTIFICATIONS SCREEN ---
  if (subSection === 'notifications') {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-slate-950">
         <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 sticky top-0 z-10">
           <button onClick={() => setSubSection('settings')} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
              <ChevronLeft className="w-6 h-6" />
           </button>
           <h3 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h3>
         </div>
         <div className="p-4 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            {[
              { id: 'push', title: 'Push Notifications', desc: 'Receive messages and alerts' },
              { id: 'email', title: 'Email Notifications', desc: 'Get updates via email' },
              { id: 'transactions', title: 'Transaction Alerts', desc: 'Notify on all payments' },
              { id: 'marketing', title: 'Marketing', desc: 'Product updates and offers' },
            ].map((item, i) => (
               <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                  <div>
                     <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                     <p className="text-xs text-gray-500 dark:text-slate-500">{item.desc}</p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                     <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={settings.notifications[item.id as keyof typeof settings.notifications]}
                        onChange={(e) => updateSetting('notifications', item.id, e.target.checked)}
                     />
                     <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff1744]"></div>
                  </div>
               </div>
            ))}
         </div>
      </div>
    );
  }

  // --- NEW PRIVACY SCREEN ---
  if (subSection === 'privacy') {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-slate-950">
         {showDeleteModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
               <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl border border-gray-200 dark:border-slate-700">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                     <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Account?</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">This action cannot be undone. All your data will be permanently removed.</p>
                  <div className="flex gap-3">
                     <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                     <button onClick={handleDeleteAccount} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30">Delete</button>
                  </div>
               </div>
            </div>
         )}

         <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 sticky top-0 z-10">
           <button onClick={() => setSubSection('settings')} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
              <ChevronLeft className="w-6 h-6" />
           </button>
           <h3 className="text-xl font-bold text-slate-900 dark:text-white">Privacy</h3>
         </div>
         <div className="p-4 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
               <h4 className="font-bold text-slate-900 dark:text-white mb-4">Who can see my personal info</h4>
               <div className="space-y-3">
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Seen</span>
                     <select 
                        value={settings.privacy.lastSeen}
                        onChange={(e) => updateSetting('privacy', 'lastSeen', e.target.value)}
                        className="bg-gray-50 dark:bg-slate-800 border-none text-xs font-bold text-slate-500 rounded-lg py-1 px-2 focus:ring-0"
                     >
                        <option>Everyone</option>
                        <option>Contacts</option>
                        <option>Nobody</option>
                     </select>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile Photo</span>
                     <select 
                        value={settings.privacy.profilePhoto}
                        onChange={(e) => updateSetting('privacy', 'profilePhoto', e.target.value)}
                        className="bg-gray-50 dark:bg-slate-800 border-none text-xs font-bold text-slate-500 rounded-lg py-1 px-2 focus:ring-0"
                     >
                        <option>Everyone</option>
                        <option>Contacts</option>
                        <option>Nobody</option>
                     </select>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-slate-700 dark:text-slate-300">About</span>
                     <select 
                        value={settings.privacy.about}
                        onChange={(e) => updateSetting('privacy', 'about', e.target.value)}
                        className="bg-gray-50 dark:bg-slate-800 border-none text-xs font-bold text-slate-500 rounded-lg py-1 px-2 focus:ring-0"
                     >
                        <option>Everyone</option>
                        <option>Contacts</option>
                        <option>Nobody</option>
                     </select>
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
               <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Read Receipts</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-500">Show when you've read messages</p>
               </div>
               <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                     type="checkbox" 
                     className="sr-only peer" 
                     checked={settings.privacy.readReceipts}
                     onChange={(e) => updateSetting('privacy', 'readReceipts', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff1744]"></div>
               </div>
            </div>
            
            <button onClick={() => setShowDeleteModal(true)} className="w-full p-4 bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400 font-bold rounded-2xl border border-red-100 dark:border-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
               Delete Account
            </button>
         </div>
      </div>
    );
  }

  if (subSection === 'security') {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-slate-950">
         <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 sticky top-0 z-10">
           <button onClick={() => setSubSection('settings')} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
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
                  <input 
                     type="checkbox" 
                     className="sr-only peer" 
                     checked={settings.security.twoFactor}
                     onChange={(e) => updateSetting('security', 'twoFactor', e.target.checked)}
                  />
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
                  <input 
                     type="checkbox" 
                     className="sr-only peer" 
                     checked={settings.security.biometric}
                     onChange={(e) => updateSetting('security', 'biometric', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff1744]"></div>
               </div>
            </div>
         </div>
      </div>
    );
  }

   return (
    <div className="h-full overflow-y-auto pb-24 bg-gray-50 dark:bg-slate-950 transition-colors">
      
      {/* Send Money Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-slate-900 dark:text-white text-lg">Send Money</h3>
                 <button onClick={() => setShowSendModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>

              {sendStep === 'input' && (
                <div className="space-y-4">
                   <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">Recipient</label>
                      <input 
                        type="text" 
                        value={sendData.recipient}
                        onChange={(e) => setSendData({...sendData, recipient: e.target.value})}
                        placeholder="@username or email"
                        className="w-full mt-1 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl font-bold text-slate-900 dark:text-white border border-gray-100 dark:border-slate-700 focus:outline-none focus:border-[#ff1744]"
                      />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">Amount</label>
                      <div className="relative mt-1">
                         <span className="absolute left-4 top-3 text-xl font-bold text-gray-400">$</span>
                         <input 
                           type="number" 
                           value={sendData.amount}
                           onChange={(e) => setSendData({...sendData, amount: e.target.value})}
                           placeholder="0.00"
                           className="w-full p-3 pl-8 bg-gray-50 dark:bg-slate-800 rounded-xl font-bold text-slate-900 dark:text-white text-xl border border-gray-100 dark:border-slate-700 focus:outline-none focus:border-[#ff1744]"
                         />
                      </div>
                   </div>
                   <button 
                     onClick={() => { if(sendData.recipient && sendData.amount) setSendStep('security') }}
                     className="w-full py-3 bg-[#ff1744] text-white font-bold rounded-xl mt-2 shadow-lg shadow-red-500/30"
                   >
                     Continue
                   </button>
                </div>
              )}

              {sendStep === 'security' && (
                 <div className="text-center space-y-6">
                    <p className="text-slate-600 dark:text-slate-300">Enter PIN to confirm sending <span className="font-bold text-slate-900 dark:text-white">${sendData.amount}</span> to <span className="font-bold text-slate-900 dark:text-white">{sendData.recipient}</span></p>
                    
                    <div className="flex justify-center gap-4 my-4">
                       {[1,2,3,4].map((_, i) => (
                          <div key={i} className={`w-4 h-4 rounded-full border-2 ${pin.length > i ? 'bg-[#ff1744] border-[#ff1744]' : 'border-gray-300 dark:border-slate-600'}`}></div>
                       ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                       {[1,2,3,4,5,6,7,8,9].map(n => (
                          <button key={n} onClick={() => handlePinInput(n.toString())} className="h-12 rounded-full bg-gray-100 dark:bg-slate-800 font-bold text-lg hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white">{n}</button>
                       ))}
                       <div className="h-12 flex items-center justify-center">
                          <button onClick={handleBiometric}><Fingerprint className="w-8 h-8 text-[#ff1744]" /></button>
                       </div>
                       <button onClick={() => handlePinInput('0')} className="h-12 rounded-full bg-gray-100 dark:bg-slate-800 font-bold text-lg hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white">0</button>
                       <button onClick={handleBackspace} className="h-12 rounded-full flex items-center justify-center text-slate-500 hover:text-red-500"><Delete className="w-6 h-6" /></button>
                    </div>

                    <button 
                       onClick={verifyTransaction}
                       disabled={pin.length !== 4}
                       className="w-full py-3 bg-[#ff1744] text-white font-bold rounded-xl shadow-lg shadow-red-500/30 disabled:opacity-50 transition-all"
                    >
                       Confirm Payment
                    </button>
                 </div>
              )}

              {sendStep === 'success' && (
                 <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-2">
                       <Check className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Success!</h3>
                    <p className="text-slate-600 dark:text-slate-400">You successfully sent <span className="font-bold">${sendData.amount}</span> to {sendData.recipient}.</p>
                    <button onClick={() => setShowSendModal(false)} className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl mt-4">Done</button>
                 </div>
              )}
           </div>
        </div>
      )}

      {/* Header Profile Card */}
      <div className="bg-white dark:bg-slate-900 pb-2 rounded-b-[40px] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 flex gap-3 z-10">
          <button onClick={() => handleToggleTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
             {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={() => setSubSection('settings')} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
             <Settings className="w-5 h-5" />
          </button>
        </div>
        
        <div className="pt-8 px-6 flex flex-col items-center relative z-10">
           <div className="relative mb-3">
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden">
                 <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
              </div>
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-slate-900 rounded-full"></div>
           </div>
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">@alexnova • Standard Account</p>
           
           <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl w-full max-w-xs mb-4">
              <button 
                onClick={() => setActiveTab('wallet')} 
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'wallet' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Wallet
              </button>
              <button 
                onClick={() => setActiveTab('account')} 
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'account' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Account
              </button>
           </div>
        </div>
      </div>

      {activeTab === 'wallet' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Wallet Balance Card */}
          <div className="px-4 -mt-4 relative z-10 mb-6">
             <div className="bg-[#1a1a1a] dark:bg-black rounded-3xl p-6 shadow-xl text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff1744] rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                
                <div className="flex justify-between items-start mb-2">
                   <div>
                      <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Total Balance</p>
                      <h3 className="text-3xl font-bold font-mono">$2,450.80</h3>
                   </div>
                   <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                      <Wallet className="w-5 h-5 text-white" />
                   </div>
                </div>
                
                <div className="flex gap-2 mb-6">
                   <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                      <TrendingUp className="w-3 h-3" /> +12.5%
                   </span>
                   <span className="text-xs text-white/40">vs last month</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                   {[
                     { label: 'Send', icon: Send, action: 'Send' },
                     { label: 'Top Up', icon: Plus, action: 'Top Up' },
                     { label: 'Request', icon: ArrowDownLeft, action: 'Request' },
                     { label: 'Withdraw', icon: ArrowUpRight, action: 'Withdraw' },
                   ].map((btn) => (
                      <div key={btn.label} className="flex flex-col items-center gap-2 cursor-pointer group/btn" onClick={() => handleSendAction(btn.action)}>
                         <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover/btn:bg-[#ff1744] transition-colors">
                            <btn.icon className="w-5 h-5 text-white" />
                         </div>
                         <span className="text-[10px] font-bold text-white/80">{btn.label}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="px-4 mb-6">
             {/* Currency Converter Button */}
             <button 
                onClick={() => setShowConverter(true)}
                className="w-full py-3 mb-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
             >
                <ArrowRightLeft className="w-5 h-5 text-[#ff1744]" /> Currency Converter
             </button>

             {/* Analytics / Chart */}
             <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-slate-900 dark:text-white">Spending Activity</h3>
                   <select className="bg-gray-50 dark:bg-slate-800 border-none text-xs font-bold text-slate-500 rounded-lg py-1 px-2 focus:ring-0">
                      <option>This Week</option>
                      <option>This Month</option>
                   </select>
                </div>
                <div className="h-32 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                         <defs>
                            <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#ff1744" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#ff1744" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ stroke: '#ff1744', strokeWidth: 1, strokeDasharray: '3 3' }}
                         />
                         <Area type="monotone" dataKey="amt" stroke="#ff1744" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>

          {/* Transactions List */}
          <div className="px-4 mb-2">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
                <button className="text-[#ff1744] text-xs font-bold">See All</button>
             </div>
             <div className="space-y-3">
                {transactions.map(t => (
                   <div key={t.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                      <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            t.type === 'received' || t.type === 'deposit' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 
                            'bg-red-50 dark:bg-red-900/20 text-red-500'
                         }`}>
                            {t.type === 'received' || t.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                         </div>
                         <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t.entity}</h4>
                            <p className="text-[10px] text-gray-500 dark:text-slate-500 uppercase font-bold">{t.type} • {t.date}</p>
                         </div>
                      </div>
                      <span className={`font-bold ${
                         t.type === 'received' || t.type === 'deposit' ? 'text-green-500' : 'text-slate-900 dark:text-white'
                      }`}>
                         {t.type === 'received' || t.type === 'deposit' ? '+' : '-'}${t.amount}
                      </span>
                   </div>
                ))}
                {transactions.length === 0 && <p className="text-center text-gray-400 text-sm py-4">No transactions yet.</p>}
             </div>
          </div>
          
          {/* Utilities Grid */}
          <div className="px-4 mt-6">
             <h3 className="font-bold text-slate-900 dark:text-white mb-4">More Services</h3>
             <div className="grid grid-cols-4 gap-3">
                {[
                   { icon: CreditCard, label: 'Cards', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
                   { icon: Scan, label: 'Scan', color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
                   { icon: Target, label: 'Goals', color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
                   { icon: Radio, label: 'Data', color: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20' },
                ].map((item) => (
                   <div key={item.label} className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.color}`}>
                         <item.icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.label}</span>
                   </div>
                ))}
             </div>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
           {/* Account Tab Content */}
           {[
             { id: 'personal', icon: UserIcon, label: 'Personal Information' },
             { id: 'settings', icon: Settings, label: 'Settings & Privacy' }, // Merged for simplicity in this view
             { id: 'devices', icon: Smartphone, label: 'Linked Devices' },
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
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

    </div>
  );
};
