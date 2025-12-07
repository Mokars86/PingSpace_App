

import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Phone, Video, MoreVertical, Send, 
  Paperclip, Mic, Image as ImageIcon, DollarSign, 
  ShoppingBag, Check, CheckCheck, Loader2, Sparkles, PenTool, X, Share2, Save
} from 'lucide-react';
import { User, Message, ChatSession, SummaryResult } from '../types';
import { sendMessageToGemini, generateChatSummary } from '../services/geminiService';
import { storageService } from '../services/storage';

interface ChatListProps {
  chats: ChatSession[];
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({ chats, onSelectChat, onNewChat }) => {
  return (
    <div className="flex flex-col h-full pb-20 overflow-y-auto bg-gray-50 dark:bg-slate-950 transition-colors">
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
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">{chat.participant.name}</h4>
                  <p className={`text-sm truncate w-48 ${chat.unread > 0 ? 'text-slate-900 dark:text-white font-semibold' : 'text-gray-500 dark:text-slate-500'}`}>
                    {chat.lastMessage}
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
      <button onClick={onNewChat} className="fixed bottom-24 right-6 w-14 h-14 bg-[#ff1744] rounded-2xl shadow-xl shadow-red-500/30 flex items-center justify-center text-white hover:scale-105 transition-transform z-10">
        <MoreVertical className="w-6 h-6 rotate-90" />
      </button>
    </div>
  );
};

interface ChatWindowProps {
  session: ChatSession;
  currentUser: User;
  onBack: () => void;
  onSendMessage: (sessionId: string, text: string) => void;
  onBotResponse: (sessionId: string, text: string) => void;
}

// --- AI SUMMARY MODAL ---
const SummaryModal: React.FC<{ isOpen: boolean; onClose: () => void; summary: SummaryResult | null; loading: boolean }> = ({ isOpen, onClose, summary, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl p-6 relative animate-in zoom-in-95">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
          <X className="w-4 h-4 text-slate-500" />
        </button>
        
        <div className="flex items-center gap-2 mb-4 text-[#ff1744]">
          <Sparkles className="w-6 h-6" />
          <h3 className="text-xl font-bold">Smart Summary</h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
             <Loader2 className="w-8 h-8 text-[#ff1744] animate-spin" />
             <p className="text-sm font-medium text-gray-500">PingAI is analyzing conversation...</p>
          </div>
        ) : summary ? (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
             <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
               <h4 className="font-bold text-blue-700 dark:text-blue-300 text-sm uppercase mb-1">Overview</h4>
               <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">{summary.summary}</p>
             </div>
             
             {summary.decisions.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase mb-2">Key Decisions</h4>
                  <ul className="space-y-2">
                    {summary.decisions.map((d, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                         <Check className="w-4 h-4 text-green-500 shrink-0" /> {d}
                      </li>
                    ))}
                  </ul>
                </div>
             )}

             {summary.actionItems.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase mb-2">Action Items</h4>
                   <ul className="space-y-2">
                    {summary.actionItems.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                         <div className="w-4 h-4 rounded border border-gray-300 dark:border-slate-600 shrink-0"></div> {item}
                      </li>
                    ))}
                  </ul>
                </div>
             )}
          </div>
        ) : (
           <p className="text-center text-gray-500">Failed to generate summary.</p>
        )}
      </div>
    </div>
  );
};

// --- WHITEBOARD MODAL ---
const WhiteboardModal: React.FC<{ isOpen: boolean; onClose: () => void; onShare: (dataUrl: string) => void }> = ({ isOpen, onClose, onShare }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth * 0.9; // Responsive width
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
      }
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
     setIsDrawing(true);
     const canvas = canvasRef.current;
     if(!canvas) return;
     const ctx = canvas.getContext('2d');
     if(!ctx) return;
     
     const rect = canvas.getBoundingClientRect();
     const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
     const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
     ctx.beginPath();
     ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if(!isDrawing) return;
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
    
    ctx.strokeStyle = color;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const handleShare = () => {
    if(canvasRef.current) {
       onShare(canvasRef.current.toDataURL());
       onClose();
    }
  };

  if(!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
       <div className="bg-white rounded-3xl w-full max-w-md p-4 flex flex-col items-center">
          <div className="flex justify-between w-full mb-4 items-center">
             <h3 className="font-bold text-slate-900 flex items-center gap-2"><PenTool className="w-5 h-5 text-[#ff1744]" /> Whiteboard</h3>
             <button onClick={onClose}><X className="w-6 h-6 text-slate-500" /></button>
          </div>
          
          <canvas 
            ref={canvasRef} 
            className="border border-gray-200 rounded-xl bg-white touch-none cursor-crosshair shadow-inner"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          
          <div className="flex gap-4 mt-4 w-full">
             <div className="flex gap-2 flex-1 items-center">
                {['#000000', '#ff1744', '#3b82f6', '#22c55e'].map(c => (
                   <button 
                     key={c} 
                     onClick={() => setColor(c)}
                     className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                     style={{backgroundColor: c}}
                   />
                ))}
             </div>
             <button onClick={handleShare} className="bg-[#ff1744] text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-500/30">
                <Share2 className="w-4 h-4" /> Share
             </button>
          </div>
       </div>
    </div>
  );
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ session, currentUser, onBack, onSendMessage, onBotResponse }) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryResult | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBot = session.participant.id === 'ping-ai';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const text = inputText;
    setInputText('');
    onSendMessage(session.id, text);

    if (isBot) {
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await storageService.uploadFile(e.target.files[0]);
        onSendMessage(session.id, `Sent an attachment: ${url}`);
      } catch (error) {
        console.error('Upload failed', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleGenerateSummary = async () => {
    setShowSummary(true);
    setSummaryLoading(true);
    // Convert messages to simple format for AI
    const history = session.messages.map(m => ({
      sender: m.senderId === currentUser.id ? 'Me' : session.participant.name,
      text: m.text
    }));
    
    const result = await generateChatSummary(history);
    setSummaryData(result);
    setSummaryLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-950 transition-colors">
      <SummaryModal isOpen={showSummary} onClose={() => setShowSummary(false)} summary={summaryData} loading={summaryLoading} />
      <WhiteboardModal isOpen={showWhiteboard} onClose={() => setShowWhiteboard(false)} onShare={(url) => {
         onSendMessage(session.id, 'Shared a whiteboard session');
         // In a real app, send actual image. Here we just simulate text trigger or we could send a custom type.
      }} />

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:text-[#ff1744]">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <img src={session.participant.avatar} className="w-10 h-10 rounded-full border border-gray-100 dark:border-slate-800 object-cover shadow-sm" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">{session.participant.name}</h3>
              <span className="text-xs text-[#ff1744] font-medium">{isTyping ? 'Typing...' : (session.participant.isOnline ? 'Online' : 'Offline')}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 text-[#ff1744]">
          <button onClick={handleGenerateSummary} title="AI Summary" className="hover:text-red-700">
             <Sparkles className="w-5 h-5" />
          </button>
           <button onClick={() => setShowWhiteboard(true)} title="Whiteboard" className="hover:text-red-700">
             <PenTool className="w-5 h-5" />
          </button>
          <MoreVertical className="w-5 h-5 text-gray-400 dark:text-slate-600 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-950">
        {session.messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl p-3.5 shadow-sm ${
                isMe 
                  ? 'bg-[#ff1744] text-white rounded-tr-none' 
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-gray-100 dark:border-slate-700'
              }`}>
                {msg.type === 'image' && (
                   <img src={msg.metadata?.url || 'https://picsum.photos/300/200'} className="rounded-lg mb-2 w-full h-auto" />
                )}
                {msg.type === 'payment' && (
                  <div className="bg-white/95 dark:bg-slate-900/95 p-3 rounded-xl mb-2 flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div className="text-slate-800 dark:text-white">
                      <p className="font-bold text-lg">${msg.metadata?.amount || '0.00'}</p>
                      <p className="text-xs font-semibold uppercase text-green-600 dark:text-green-400">{msg.metadata?.status || 'Sent'}</p>
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
                <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.text}</p>
                <div className={`flex items-center justify-end gap-1 mt-1.5 ${isMe ? 'opacity-80' : 'opacity-40'}`}>
                  <span className="text-[10px] uppercase font-bold tracking-wide">{msg.timestamp}</span>
                  {isMe && <CheckCheck className="w-3 h-3" />}
                </div>
              </div>
            </div>
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

      {/* Input */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 pb-6">
        <div className="flex items-end gap-2 bg-gray-50 dark:bg-slate-800 p-2 rounded-[20px] border border-gray-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-[#ff1744]/20 transition-all">
           <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
           <button 
             onClick={() => fileInputRef.current?.click()} 
             className="p-2 text-gray-400 hover:text-[#ff1744] transition-colors"
             disabled={uploading}
           >
             {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
           </button>
           <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
             <DollarSign className="w-6 h-6" />
           </button>
           <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-gray-400 focus:outline-none max-h-32 p-2.5 resize-none text-base"
            rows={1}
           />
           {inputText.trim() ? (
             <button onClick={handleSend} className="p-2 bg-[#ff1744] text-white rounded-full hover:scale-110 transition-transform shadow-md shadow-red-500/30">
               <Send className="w-5 h-5" />
             </button>
           ) : (
             <button className="p-2 text-gray-400 hover:text-slate-600">
               <Mic className="w-6 h-6" />
             </button>
           )}
        </div>
      </div>
    </div>
  );
};