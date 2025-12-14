import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Phone, Video, MoreVertical, Send, 
  Paperclip, Mic, Image as ImageIcon, DollarSign, 
  ShoppingBag, Check, CheckCheck, Loader2, Sparkles, PenTool, X, Share2, Save,
  Search, UserPlus, Users, ChevronRight, MapPin, Music, FileText, Plus, Play, Pause,
  Reply, Clock, Heart, Timer, StopCircle, Trash2
} from 'lucide-react';
import { User, Message, ChatSession, SummaryResult } from '../types';
import { sendMessageToGemini, generateChatSummary } from '../services/geminiService';
import { storageService } from '../services/storage';
import { useGlobalDispatch } from '../store';
import { api } from '../services/api';
import { socketService } from '../services/socket';

interface ChatListProps {
  chats: ChatSession[];
  contacts: User[];
  onSelectChat: (id: string) => void;
}

// Helper to format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper to format duration
const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

// Helper for date headers
const getDateLabel = (timestamp: number) => {
  if (!timestamp) return 'Recent';
  const date = new Date(timestamp);
  const now = new Date();
  
  // Reset hours to compare dates properly
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'long' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

// --- NEW CHAT / GROUP MODAL ---
const NewChatModal: React.FC<{ isOpen: boolean; onClose: () => void; contacts: User[]; onSelect: (userId: string) => void }> = ({ isOpen, onClose, contacts, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  
  const dispatch = useGlobalDispatch();

  if (!isOpen) return null;

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleContactSelection = (id: string) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(prev => prev.filter(c => c !== id));
    } else {
      setSelectedContacts(prev => [...prev, id]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedContacts.length === 0) return;
    setCreating(true);
    try {
      const newGroup = await api.chats.createGroup(groupName, selectedContacts);
      dispatch({ type: 'CREATE_GROUP', payload: newGroup });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: `Group "${groupName}" created` } });
      onClose();
      // Reset state
      setIsGroupMode(false);
      setGroupName('');
      setSelectedContacts([]);
    } catch (e) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Failed to create group' } });
    } finally {
      setCreating(false);
    }
  };

  const resetAndClose = () => {
    setIsGroupMode(false);
    setGroupName('');
    setSelectedContacts([]);
    setSearchTerm('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm h-[75vh] shadow-2xl p-0 flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2">
            {isGroupMode && (
              <button onClick={() => setIsGroupMode(false)} className="mr-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{isGroupMode ? 'New Group' : 'New Chat'}</h3>
          </div>
          <button onClick={resetAndClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Group Name Input (Only in Group Mode) */}
        {isGroupMode && (
          <div className="p-4 bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800">
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#ff1744]/10 flex items-center justify-center border-2 border-dashed border-[#ff1744]/30">
                   <Users className="w-6 h-6 text-[#ff1744]" />
                </div>
                <input 
                  type="text" 
                  placeholder="Group Name" 
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#ff1744]"
                />
             </div>
          </div>
        )}

        {/* Search */}
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search contacts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#ff1744]/20 transition-all font-medium" 
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          
          {/* Create Group Button (Only in Chat Mode) */}
          {!isGroupMode && !searchTerm && (
            <div 
              onClick={() => setIsGroupMode(true)}
              className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-2xl cursor-pointer transition-colors mb-2"
            >
               <div className="w-12 h-12 rounded-full bg-[#ff1744]/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#ff1744]" />
               </div>
               <div className="flex-1">
                 <h4 className="font-bold text-slate-900 dark:text-white">Create New Group</h4>
               </div>
               <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          )}

          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <UserPlus className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">No contacts found</p>
            </div>
          ) : (
            filteredContacts.map(contact => {
              const isSelected = selectedContacts.includes(contact.id);
              return (
                <div 
                  key={contact.id} 
                  onClick={() => { 
                    if (isGroupMode) {
                      toggleContactSelection(contact.id);
                    } else {
                      onSelect(contact.id); 
                      resetAndClose();
                    }
                  }} 
                  className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all ${isSelected && isGroupMode ? 'bg-[#ff1744]/10 border border-[#ff1744]/20' : 'hover:bg-gray-50 dark:hover:bg-slate-800 border border-transparent'}`}
                >
                  <div className="relative">
                    <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                    {contact.isOnline && !isGroupMode && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                    )}
                    {isGroupMode && isSelected && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#ff1744] rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                         <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">{contact.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{contact.status || 'Available'}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer (Only in Group Mode) */}
        {isGroupMode && (
           <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between mb-3">
                 <span className="text-sm font-bold text-slate-500">{selectedContacts.length} selected</span>
              </div>
              <button 
                onClick={handleCreateGroup}
                disabled={!groupName || selectedContacts.length === 0 || creating}
                className="w-full py-3.5 bg-[#ff1744] text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                Create Group
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

export const ChatList: React.FC<ChatListProps> = ({ chats, contacts, onSelectChat }) => {
  const [showNewChat, setShowNewChat] = useState(false);

  const handleContactSelect = (userId: string) => {
    const existingChat = chats.find(c => c.participant.id === userId && !c.isGroup);
    if (existingChat) {
      onSelectChat(existingChat.id);
    } else {
      // Logic for new chat creation would ideally happen here or via a dedicated action
      // For this demo, we assume selecting an existing contact implies starting a chat
      alert("In a full implementation, this would create a new conversation with " + userId);
    }
  };

  return (
    <div className="flex flex-col h-full pb-20 overflow-y-auto bg-gray-50 dark:bg-slate-950 transition-colors relative">
      <NewChatModal 
        isOpen={showNewChat} 
        onClose={() => setShowNewChat(false)} 
        contacts={contacts} 
        onSelect={handleContactSelect} 
      />

      {/* Pinned Chats */}
      <div className="px-4 py-4">
        <h3 className="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase mb-3 tracking-wider">Pinned</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {chats.filter(c => c.isPinned).map(chat => (
            <div key={chat.id} onClick={() => onSelectChat(chat.id)} className="flex flex-col items-center min-w-[64px] cursor-pointer group">
              <div className="relative">
                <img src={chat.participant.avatar} alt={chat.participant.name} className="w-14 h-14 rounded-full border-2 border-white dark:border-slate-800 shadow-md object-cover group-hover:border-[#ff1744] transition-colors" />
                {chat.participant.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                )}
              </div>
              <span className="text-xs mt-2 font-medium text-slate-700 dark:text-slate-300 truncate w-16 text-center">{chat.participant.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Chats */}
      <div className="px-4 py-2 flex-1 bg-white dark:bg-slate-900 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.02)] min-h-[500px]">
        <div className="w-12 h-1 bg-gray-200 dark:bg-slate-800 rounded-full mx-auto my-3 mb-6"></div>
        <h3 className="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase mb-4 px-2 tracking-wider">Recent Messages</h3>
        <div className="space-y-1">
          {chats.map(chat => (
            <div key={chat.id} onClick={() => onSelectChat(chat.id)} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 p-3 rounded-2xl transition-colors">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={chat.participant.avatar} alt={chat.participant.name} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                     {chat.participant.name}
                     {chat.isGroup && <Users className="w-3 h-3 text-slate-400" />}
                  </h4>
                  <p className={`text-sm truncate w-48 ${chat.unread > 0 ? 'text-slate-900 dark:text-white font-semibold' : 'text-gray-500 dark:text-slate-500'}`}>
                    {typeof chat.lastMessage === 'string' ? chat.lastMessage : 'Media message'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-gray-400 font-medium">{chat.lastTime}</span>
                {chat.unread > 0 && (
                  <div className="w-5 h-5 bg-[#ff1744] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {chat.unread}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* FAB */}
      <button onClick={() => setShowNewChat(true)} className="fixed bottom-24 right-6 w-14 h-14 bg-[#ff1744] rounded-2xl shadow-xl shadow-red-500/30 flex items-center justify-center text-white hover:scale-105 transition-transform z-10">
        <MoreVertical className="w-6 h-6 rotate-90" />
      </button>
    </div>
  );
};

interface ChatWindowProps {
  session: ChatSession;
  currentUser: User;
  onBack: () => void;
  onSendMessage: (sessionId: string, text: string, type?: Message['type'], metadata?: any, replyTo?: Message['replyTo'], expiresAt?: number) => void;
  onBotResponse: (sessionId: string, text: string) => void;
}

// --- SEND MONEY MODAL (Chat Specific) ---
const SendMoneyChatModal: React.FC<{ isOpen: boolean; onClose: () => void; onSend: (amount: number) => void }> = ({ isOpen, onClose, onSend }) => {
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'amount' | 'pin'>('amount');

  if (!isOpen) return null;

  const handleNext = () => {
    if (amount && parseFloat(amount) > 0) setStep('pin');
  };

  const handleConfirm = () => {
    if (pin.length === 4) {
      onSend(parseFloat(amount));
      onClose();
      // Reset
      setAmount('');
      setPin('');
      setStep('amount');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
       <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-slate-900 dark:text-white text-lg">Send Money</h3>
             <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          
          {step === 'amount' ? (
            <div className="space-y-6">
              <div className="relative">
                 <span className="absolute left-4 top-3 text-2xl font-bold text-gray-400">$</span>
                 <input 
                   type="number" 
                   value={amount}
                   onChange={(e) => setAmount(e.target.value)}
                   className="w-full bg-gray-50 dark:bg-slate-800 rounded-2xl py-3 pl-10 pr-4 text-3xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff1744]/20"
                   placeholder="0.00"
                   autoFocus
                 />
              </div>
              <button 
                onClick={handleNext}
                disabled={!amount}
                className="w-full py-3 bg-[#ff1744] text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:bg-red-600 disabled:opacity-50 transition-all"
              >
                Next
              </button>
            </div>
          ) : (
            <div className="space-y-6 text-center">
               <p className="text-sm text-gray-500">Enter PIN to confirm <span className="text-slate-900 dark:text-white font-bold">${amount}</span></p>
               <div className="flex justify-center gap-3">
                 {[1,2,3,4].map((_, i) => (
                    <div key={i} className={`w-4 h-4 rounded-full border-2 ${pin.length > i ? 'bg-[#ff1744] border-[#ff1744]' : 'border-gray-300 dark:border-slate-600'}`}></div>
                 ))}
               </div>
               <input 
                 type="password" 
                 maxLength={4}
                 value={pin}
                 onChange={(e) => setPin(e.target.value)}
                 className="w-full text-center bg-transparent text-transparent caret-transparent focus:outline-none h-1"
                 autoFocus
               />
               <div className="grid grid-cols-3 gap-3">
                  {[1,2,3,4,5,6,7,8,9].map(n => (
                    <button key={n} onClick={() => setPin(prev => (prev.length < 4 ? prev + n : prev))} className="h-12 rounded-full bg-gray-100 dark:bg-slate-800 font-bold text-lg hover:bg-gray-200 dark:hover:bg-slate-700">{n}</button>
                  ))}
                  <div className="h-12"></div>
                  <button onClick={() => setPin(prev => (prev.length < 4 ? prev + '0' : prev))} className="h-12 rounded-full bg-gray-100 dark:bg-slate-800 font-bold text-lg hover:bg-gray-200 dark:hover:bg-slate-700">0</button>
                  <button onClick={() => setPin(prev => prev.slice(0, -1))} className="h-12 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500"><X className="w-6 h-6" /></button>
               </div>
               <button 
                  onClick={handleConfirm}
                  disabled={pin.length !== 4}
                  className="w-full py-3 bg-[#ff1744] text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:bg-red-600 disabled:opacity-50 transition-all"
                >
                  Confirm Send
                </button>
            </div>
          )}
       </div>
    </div>
  );
};

// --- CHAT WINDOW ---
export const ChatWindow: React.FC<ChatWindowProps> = ({ session, currentUser, onBack, onSendMessage, onBotResponse }) => {
  const dispatch = useGlobalDispatch();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryResult | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  
  // Attachments & Features State
  const [showAttachments, setShowAttachments] = useState(false);
  const [showMoneyModal, setShowMoneyModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  const isBot = session.participant.id === 'ping-ai';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages, isTyping, replyingTo]);

  // Clean up expired disappearing messages
  useEffect(() => {
    const interval = setInterval(() => {
      // Dispatch checking for expiry if any message has expiresAt
      const hasExpiring = session.messages.some(m => m.expiresAt && m.expiresAt > 0);
      if (hasExpiring) {
        dispatch({ type: 'DELETE_EXPIRED_MESSAGES', payload: { sessionId: session.id } });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [session.messages, session.id, dispatch]);

  useEffect(() => {
    const handleTypingStatus = (data: any) => {
      if (data.chatId === session.id && data.userId !== currentUser.id) {
        setIsTyping(data.isTyping);
      }
    };
    socketService.on('typing_status', handleTypingStatus);
    return () => socketService.off('typing_status', handleTypingStatus);
  }, [session.id, currentUser.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
     const text = e.target.value;
     setInputText(text);

     if (text.trim().length > 0) {
        socketService.emit('typing_status', { chatId: session.id, userId: currentUser.id, isTyping: true });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
           socketService.emit('typing_status', { chatId: session.id, userId: currentUser.id, isTyping: false });
        }, 2000);
     } else {
        socketService.emit('typing_status', { chatId: session.id, userId: currentUser.id, isTyping: false });
     }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketService.emit('typing_status', { chatId: session.id, userId: currentUser.id, isTyping: false });
    
    const text = inputText;
    setInputText('');
    setReplyingTo(null);

    // Calculate expiry if mode enabled (e.g. 10 seconds for demo)
    const expiresAt = session.disappearingMode ? Date.now() + 10000 : undefined;
    
    // Construct reply payload
    const replyPayload = replyingTo ? {
      id: replyingTo.id,
      text: typeof replyingTo.text === 'string' ? replyingTo.text : 'Media',
      sender: replyingTo.senderId === currentUser.id ? 'You' : session.participant.name
    } : undefined;

    onSendMessage(session.id, text, 'text', undefined, replyPayload, expiresAt);

    if (isBot) {
      if (!navigator.onLine) {
         setTimeout(() => {
             onBotResponse(session.id, "PingAI: I'm currently offline. I'll respond when you're back online.");
         }, 500);
         return;
      }
      setIsTyping(true);
      const history = session.messages.map(m => ({
        role: m.senderId === currentUser.id ? 'user' as const : 'model' as const,
        parts: [{ text: m.text }]
      }));
      const response = await sendMessageToGemini(history, text);
      setIsTyping(false);
      onBotResponse(session.id, response);
    }
  };

  // Generalized Handler for Files (Images, Videos, Audio, Docs)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploading(true);
      setShowAttachments(false);
      try {
        const file = files[0];
        const url = await storageService.uploadFile(file);
        
        // Determine type
        let type: 'image' | 'video' | 'audio' | 'document' = 'document';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';
        else if (file.type.startsWith('audio/')) type = 'audio';

        // Send specialized message
        const messageText = type === 'image' ? 'Sent an image' : 
                            type === 'video' ? 'Sent a video' :
                            type === 'audio' ? 'Sent an audio clip' : 
                            `Sent file: ${file.name}`;

        const expiresAt = session.disappearingMode ? Date.now() + 10000 : undefined;

        onSendMessage(session.id, messageText, type, { 
          url, 
          fileName: file.name, 
          fileSize: formatFileSize(file.size),
          duration: 'Unknown' // Mock
        }, undefined, expiresAt);

      } catch (error) {
        console.error('Upload failed', error);
      } finally {
        setUploading(false);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = (send: boolean) => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        clearInterval(recordingTimerRef.current);
        const tracks = mediaRecorderRef.current?.stream.getTracks();
        tracks?.forEach(track => track.stop());

        if (send) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          // Convert Blob to File-like object for "storage service"
          const audioFile = new File([audioBlob], "voice_note.webm", { type: 'audio/webm' });
          
          setUploading(true);
          try {
             // Simulate upload
             const url = await storageService.uploadFile(audioFile);
             const expiresAt = session.disappearingMode ? Date.now() + 10000 : undefined;
             onSendMessage(session.id, "Voice Message", 'audio', {
               url,
               duration: formatDuration(recordingDuration)
             }, undefined, expiresAt);
          } catch(e) {
             console.error(e);
          } finally {
             setUploading(false);
          }
        }
      };
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingDuration(0);
    }
  };

  const handleLocationShare = () => {
     setShowAttachments(false);
     if (navigator.geolocation) {
        setUploading(true); // show loader
        navigator.geolocation.getCurrentPosition((position) => {
           const { latitude, longitude } = position.coords;
           
           // Send Location Message
           const meta = { lat: latitude, lng: longitude };
           const expiresAt = session.disappearingMode ? Date.now() + 10000 : undefined;
           onSendMessage(session.id, 'Shared Location', 'location', meta, undefined, expiresAt);
           
           setUploading(false);
        }, (err) => {
           console.error(err);
           setUploading(false);
           alert("Could not fetch location.");
        });
     }
  };

  const handleMoneyTransfer = (amount: number) => {
      // Create Transaction Record
      const meta = { amount, status: 'Completed' };
      const expiresAt = session.disappearingMode ? Date.now() + 10000 : undefined;
      onSendMessage(session.id, `Sent $${amount}`, 'payment', meta, undefined, expiresAt);
      
      // Update Wallet Balance (Mock)
      api.wallet.transfer(session.participant.name, amount);
  };

  const handleGenerateSummary = async () => {
    setShowSummary(true);
    setSummaryLoading(true);
    const history = session.messages.map(m => ({
      sender: m.senderId === currentUser.id ? 'Me' : session.participant.name,
      text: m.text
    }));
    
    const result = await generateChatSummary(history);
    setSummaryData(result);
    setSummaryLoading(false);
  };

  const toggleDisappearingMessages = () => {
    dispatch({ 
      type: 'TOGGLE_DISAPPEARING_MODE', 
      payload: { sessionId: session.id, enabled: !session.disappearingMode } 
    });
    setShowMenu(false);
    
    // Add system message
    const text = !session.disappearingMode ? "Disappearing messages turned ON (10s)." : "Disappearing messages turned OFF.";
    // Don't save system messages to disappear usually, but simple handling here
    dispatch({
        type: 'RECEIVE_MESSAGE',
        payload: {
            sessionId: session.id,
            message: {
                id: Date.now().toString(),
                senderId: 'system',
                text: text,
                timestamp: 'Just now',
                createdAt: Date.now(),
                type: 'system'
            }
        }
    });
  };

  const handleStartCall = (type: 'audio' | 'video') => {
    dispatch({ 
      type: 'START_CALL', 
      payload: { participant: session.participant, type } 
    });
  };

  // Group messages by date
  let lastDateLabel = '';

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-950 transition-colors">
      <SendMoneyChatModal isOpen={showMoneyModal} onClose={() => setShowMoneyModal(false)} onSend={handleMoneyTransfer} />
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 dark:border-slate-800 shadow-sm relative">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:text-[#ff1744]">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={session.participant.avatar} className="w-10 h-10 rounded-full border border-gray-100 dark:border-slate-800 object-cover shadow-sm" />
              {session.isGroup && (
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5">
                   <Users className="w-3 h-3 text-slate-500" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                {session.participant.name}
              </h3>
              <span className="text-xs text-[#ff1744] font-medium flex items-center gap-1">
                 {isTyping ? 'Typing...' : (session.isGroup ? session.participant.status : (session.participant.isOnline ? 'Online' : 'Offline'))}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 text-[#ff1744]">
          <button onClick={() => handleStartCall('audio')} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
             <Phone className="w-5 h-5" />
          </button>
          <button onClick={() => handleStartCall('video')} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
             <Video className="w-5 h-5" />
          </button>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-400 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-300">
               <MoreVertical className="w-5 h-5" />
            </button>
            {showMenu && (
               <div className="absolute right-0 top-12 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 w-56 overflow-hidden z-30 animate-in zoom-in-95 origin-top-right">
                  <button 
                    onClick={toggleDisappearingMessages}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
                     <Timer className="w-4 h-4" />
                     {session.disappearingMode ? 'Disable Disappearing' : 'Disappearing Messages'}
                  </button>
                  <button onClick={handleGenerateSummary} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                     <Sparkles className="w-4 h-4" /> AI Summary
                  </button>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-950">
        {session.messages.map((msg, index) => {
          const currentDateLabel = getDateLabel(msg.createdAt);
          const showDateHeader = currentDateLabel !== lastDateLabel;
          lastDateLabel = currentDateLabel;

          return (
            <React.Fragment key={msg.id}>
              {showDateHeader && (
                <div className="flex justify-center my-4 sticky top-0 z-10">
                   <span className="text-[10px] font-bold text-slate-500 bg-gray-200/80 dark:bg-slate-800/80 backdrop-blur px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                     {currentDateLabel}
                   </span>
                </div>
              )}
              
              {msg.type === 'system' ? (
                 <div className="flex justify-center my-4">
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">{msg.text}</span>
                 </div>
              ) : (
                <div className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'} group relative`}>
                  <div 
                    className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm relative ${
                      msg.senderId === currentUser.id 
                        ? 'bg-[#ff1744] text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-gray-100 dark:border-slate-700'
                    }`}
                    onDoubleClick={() => dispatch({type: 'ADD_REACTION', payload: { sessionId: session.id, messageId: msg.id, emoji: '❤️' }})}
                  >
                    
                    {/* Reply Context */}
                    {msg.replyTo && (
                       <div className={`mb-2 p-2 rounded-lg text-xs border-l-4 ${msg.senderId === currentUser.id ? 'bg-black/10 border-white/50' : 'bg-gray-100 dark:bg-slate-700 border-[#ff1744]'}`}>
                          <p className={`font-bold ${msg.senderId === currentUser.id ? 'text-white/90' : 'text-[#ff1744]'}`}>{msg.replyTo.sender}</p>
                          <p className={`truncate opacity-80 ${msg.senderId === currentUser.id ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>{msg.replyTo.text}</p>
                       </div>
                    )}

                    {/* --- RENDERERS FOR DIFFERENT TYPES --- */}
                    
                    {msg.type === 'image' && (
                       <div className="rounded-lg overflow-hidden mb-2">
                          <img src={msg.metadata?.url || 'https://picsum.photos/300/200'} className="w-full h-auto object-cover" />
                       </div>
                    )}
                    
                    {msg.type === 'video' && (
                       <div className="rounded-lg overflow-hidden mb-2 relative bg-black">
                          <video controls src={msg.metadata?.url} className="w-full max-h-60" />
                       </div>
                    )}

                    {msg.type === 'audio' && (
                       <div className="mb-2 min-w-[200px]">
                          <div className={`flex items-center gap-3 p-2 rounded-xl ${msg.senderId === currentUser.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-slate-700'}`}>
                             <div onClick={() => { /* Play Logic */ }} className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${msg.senderId === currentUser.id ? 'bg-white text-[#ff1744]' : 'bg-[#ff1744] text-white'}`}>
                                <Play className="w-5 h-5 ml-0.5" />
                             </div>
                             <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-center mb-1 px-1">
                                   <span className="text-[10px] font-bold opacity-80">Voice Message</span>
                                   <span className="text-[10px] opacity-80">{msg.metadata?.duration || '0:00'}</span>
                                </div>
                                <div className={`h-1 rounded-full ${msg.senderId === currentUser.id ? 'bg-white/40' : 'bg-gray-300 dark:bg-slate-600'}`}>
                                   <div className={`h-full w-0 rounded-full ${msg.senderId === currentUser.id ? 'bg-white' : 'bg-[#ff1744]'}`}></div>
                                </div>
                             </div>
                          </div>
                          <audio src={msg.metadata?.url} className="hidden" /> 
                       </div>
                    )}

                    {msg.type === 'document' && (
                       <div className={`flex items-center gap-3 p-3 rounded-xl mb-2 ${msg.senderId === currentUser.id ? 'bg-white/10 border border-white/20' : 'bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600'}`}>
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center shrink-0">
                             <FileText className="w-6 h-6" />
                          </div>
                          <div className="overflow-hidden">
                             <p className={`text-sm font-bold truncate ${msg.senderId === currentUser.id ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{msg.metadata?.fileName || 'Document'}</p>
                             <p className={`text-xs ${msg.senderId === currentUser.id ? 'text-white/70' : 'text-gray-500'}`}>{msg.metadata?.fileSize || 'Unknown size'}</p>
                          </div>
                       </div>
                    )}

                    {msg.type === 'location' && (
                       <div className="rounded-xl overflow-hidden mb-2 bg-gray-200 dark:bg-slate-700 relative group cursor-pointer">
                          {/* Placeholder for Static Map */}
                          <div className="w-full h-32 bg-slate-200 dark:bg-slate-700 flex items-center justify-center relative overflow-hidden">
                             <div className="absolute inset-0 opacity-50 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center"></div>
                             <div className="z-10 bg-[#ff1744] text-white p-2 rounded-full shadow-lg transform group-hover:-translate-y-1 transition-transform">
                                <MapPin className="w-5 h-5" />
                             </div>
                          </div>
                          <div className={`p-2 ${msg.senderId === currentUser.id ? 'bg-white/10' : 'bg-gray-50 dark:bg-slate-700'}`}>
                             <p className={`text-xs font-bold flex items-center gap-1 ${msg.senderId === currentUser.id ? 'text-white' : 'text-slate-700 dark:text-white'}`}>
                                <MapPin className="w-3 h-3"/> Location Shared
                             </p>
                             <p className={`text-[10px] ${msg.senderId === currentUser.id ? 'text-white/70' : 'text-gray-500'}`}>{msg.metadata?.lat?.toFixed(4)}, {msg.metadata?.lng?.toFixed(4)}</p>
                          </div>
                       </div>
                    )}

                    {msg.type === 'payment' && (
                      <div className={`p-3 rounded-xl mb-2 flex items-center gap-3 shadow-sm ${msg.senderId === currentUser.id ? 'bg-white/20' : 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800'}`}>
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <div className={`${msg.senderId === currentUser.id ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                          <p className="font-bold text-lg">${msg.metadata?.amount || '0.00'}</p>
                          <p className={`text-xs font-semibold uppercase ${msg.senderId === currentUser.id ? 'text-white/80' : 'text-green-600 dark:text-green-400'}`}>{msg.metadata?.status || 'Sent'}</p>
                        </div>
                      </div>
                    )}
                    
                     {msg.type === 'product' && (
                      <div className="bg-gray-50 dark:bg-slate-900 p-2 rounded-xl mb-2">
                        <img src={msg.metadata?.image} className="w-full h-24 object-cover rounded-lg mb-2" />
                        <div className="text-slate-800 dark:text-white">
                          <p className="font-bold truncate">{msg.metadata?.title}</p>
                          <p className="text-sm font-semibold text-[#ff1744]">${msg.metadata?.price}</p>
                        </div>
                        <button className="w-full mt-2 bg-slate-900 dark:bg-slate-700 text-white text-xs py-1.5 rounded-lg font-medium">View Product</button>
                      </div>
                    )}

                    {/* Text Content */}
                    {msg.text && (
                       <p className="whitespace-pre-wrap leading-relaxed text-[15px]">
                         {typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)}
                       </p>
                    )}
                    
                    {/* Reactions */}
                    {msg.reactions && msg.reactions.length > 0 && (
                       <div className={`absolute -bottom-2 ${msg.senderId === currentUser.id ? 'right-0' : 'left-0'} flex gap-1`}>
                          {msg.reactions.map((r, i) => (
                             <div key={i} className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-full px-1.5 py-0.5 text-[10px] shadow-sm flex items-center gap-0.5">
                                <span>{r.emoji}</span>
                                <span className="font-bold text-slate-500 dark:text-slate-300">{r.count}</span>
                             </div>
                          ))}
                       </div>
                    )}

                    <div className={`flex items-center justify-end gap-1 mt-1.5 ${msg.senderId === currentUser.id ? 'opacity-80' : 'opacity-40'}`}>
                      <span className="text-[10px] uppercase font-bold tracking-wide">{msg.timestamp}</span>
                      {msg.expiresAt && <Clock className="w-3 h-3 ml-1 animate-pulse" />}
                      {msg.senderId === currentUser.id && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                  
                  {/* Quick Actions Hover/LongPress */}
                  <button 
                    onClick={() => setReplyingTo(msg)}
                    className={`absolute top-1/2 -translate-y-1/2 ${msg.senderId === currentUser.id ? '-left-8' : '-right-8'} p-1.5 bg-gray-200 dark:bg-slate-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}
                  >
                     <Reply className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
              )}
            </React.Fragment>
          );
        })}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-slate-700 shadow-sm flex gap-1">
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 pb-6 relative transition-all">
        
        {/* Reply Preview */}
        {replyingTo && (
           <div className="flex items-center justify-between bg-gray-100 dark:bg-slate-800 p-2 rounded-t-2xl border-b border-gray-200 dark:border-slate-700 mb-2 mx-1">
              <div className="border-l-4 border-[#ff1744] pl-2">
                 <p className="text-xs font-bold text-[#ff1744]">Replying to {replyingTo.senderId === currentUser.id ? 'You' : session.participant.name}</p>
                 <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{typeof replyingTo.text === 'string' ? replyingTo.text : 'Media'}</p>
              </div>
              <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full">
                 <X className="w-4 h-4 text-slate-500" />
              </button>
           </div>
        )}

        {/* Attachment Menu Popup */}
        {showAttachments && (
           <div className="absolute bottom-20 left-4 bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 animate-in zoom-in-95 origin-bottom-left z-30 grid grid-cols-3 gap-4 w-64">
              {[
                 { id: 'image', icon: ImageIcon, label: 'Gallery', color: 'bg-purple-100 text-purple-600', accept: 'image/*' },
                 { id: 'video', icon: Video, label: 'Video', color: 'bg-pink-100 text-pink-600', accept: 'video/*' },
                 { id: 'document', icon: FileText, label: 'Document', color: 'bg-blue-100 text-blue-600', accept: '.pdf,.doc,.docx,.txt' },
                 { id: 'location', icon: MapPin, label: 'Location', color: 'bg-green-100 text-green-600', action: handleLocationShare },
                 { id: 'money', icon: DollarSign, label: 'Money', color: 'bg-emerald-100 text-emerald-600', action: () => { setShowAttachments(false); setShowMoneyModal(true); } },
              ].map((item) => (
                 <div 
                   key={item.id} 
                   className="flex flex-col items-center gap-2 cursor-pointer group"
                   onClick={() => {
                      if (item.action) {
                         item.action();
                      } else {
                         // Trigger file input with specific accept
                         if (fileInputRef.current) {
                            fileInputRef.current.accept = item.accept || '*';
                            fileInputRef.current.click();
                         }
                      }
                   }}
                 >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                       <item.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{item.label}</span>
                 </div>
              ))}
           </div>
        )}

        <div className="flex items-end gap-2 bg-gray-50 dark:bg-slate-800 p-2 rounded-[24px] border border-gray-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-[#ff1744]/20 transition-all">
           
           {/* Hidden File Input */}
           <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />

           {/* Add Attachment Button */}
           <button 
             onClick={() => setShowAttachments(!showAttachments)} 
             className={`p-2 rounded-full transition-all ${showAttachments ? 'bg-[#ff1744] text-white rotate-45' : 'bg-gray-200 dark:bg-slate-700 text-gray-500 hover:text-[#ff1744]'}`}
             disabled={uploading || isRecording}
           >
             {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
           </button>
           
           {/* Recording UI vs Text Input */}
           {isRecording ? (
             <div className="flex-1 flex items-center justify-between pl-2">
                <div className="flex items-center gap-2 text-[#ff1744] animate-pulse">
                   <div className="w-2 h-2 bg-[#ff1744] rounded-full"></div>
                   <span className="font-bold font-mono">{formatDuration(recordingDuration)}</span>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => stopRecording(false)} className="p-2 text-slate-500 hover:text-red-500">
                      <Trash2 className="w-5 h-5" />
                   </button>
                   <button onClick={() => stopRecording(true)} className="p-2 bg-[#ff1744] text-white rounded-full">
                      <Send className="w-5 h-5" />
                   </button>
                </div>
             </div>
           ) : (
             <>
               <textarea 
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder={session.disappearingMode ? "Disappearing messages ON (10s)..." : "Type a message..."}
                className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-gray-400 focus:outline-none max-h-32 p-2.5 resize-none text-base"
                rows={1}
               />
               {session.disappearingMode && <Clock className="w-4 h-4 text-[#ff1744] mb-3 animate-pulse" />}
               
               {inputText.trim() ? (
                 <button onClick={handleSend} className="p-2 bg-[#ff1744] text-white rounded-full hover:scale-110 transition-transform shadow-md shadow-red-500/30">
                   <Send className="w-5 h-5" />
                 </button>
               ) : (
                 <button onClick={startRecording} className="p-2 text-gray-400 hover:text-[#ff1744] hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-colors">
                   <Mic className="w-6 h-6" />
                 </button>
               )}
             </>
           )}
        </div>
      </div>
    </div>
  );
};
