
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChatPreview, ChatMessage, MessageType } from '../types';

const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [previews, setPreviews] = useState<ChatPreview[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const myId = localStorage.getItem('user_phone') || 'Unknown';

  useEffect(() => {
    const updatePreviews = () => {
      const savedMessages = localStorage.getItem('direct_messages');
      if (savedMessages) {
        const allMsgs: ChatMessage[] = JSON.parse(savedMessages);
        const map = new Map<string, ChatPreview>();
        
        allMsgs.sort((a, b) => b.timestamp - a.timestamp);
        
        allMsgs.forEach(m => {
          const otherId = m.senderId === myId ? m.receiverId : m.senderId;
          if (!map.has(otherId)) {
            let previewText = m.text || '';
            if (m.type === 'image') previewText = '📷 Photo';
            else if (m.type === 'video') previewText = '🎥 Video';
            else if (m.type === 'file') previewText = '📄 Document';
            else if (m.type === 'location') previewText = '📍 Location Shared';

            map.set(otherId, {
              otherUserId: otherId,
              lastMessage: previewText,
              timestamp: m.timestamp,
              unreadCount: 0,
              lastMessageType: m.type
            });
          }
        });
        setPreviews(Array.from(map.values()));
      }
    };

    updatePreviews();
    const interval = setInterval(updatePreviews, 5000);
    return () => clearInterval(interval);
  }, [myId]);

  const handleStartChat = () => {
    if (newUserId.trim()) {
      navigate(`/messages/${newUserId.trim()}`);
    }
  };

  return (
    <div className="p-8 pb-32 min-h-full bg-slate-50">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Messages</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Safe Network Online</p>
          </div>
        </div>
        <button 
          onClick={() => setShowNewChat(true)} 
          className="bg-indigo-600 text-white w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center active:scale-95 transition-all shadow-indigo-100"
        >
          <i className="fa-solid fa-plus text-lg"></i>
        </button>
      </div>

      <div className="space-y-3">
        {previews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-slate-200/50 rounded-[2rem] flex items-center justify-center text-slate-300 mb-6">
              <i className="fa-solid fa-message text-3xl"></i>
            </div>
            <p className="font-black uppercase tracking-widest text-[10px] text-slate-400">No active secure channels</p>
            <button 
              onClick={() => setShowNewChat(true)}
              className="mt-6 text-indigo-600 text-[10px] font-black uppercase tracking-widest"
            >
              Start New Protocol
            </button>
          </div>
        ) : (
          previews.map((p) => (
            <Link 
              to={`/messages/${p.otherUserId}`} 
              key={p.otherUserId} 
              className="bg-white p-5 rounded-[2.2rem] shadow-sm border border-slate-100 flex items-center gap-4 active:bg-slate-50 transition-all border-b-2"
            >
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-xl font-black text-indigo-600 shrink-0 border border-slate-200">
                <i className={`fa-solid ${p.lastMessageType === 'location' ? 'fa-location-dot' : 'fa-shield-halved'} text-lg`}></i>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-0.5">
                  <p className="font-black text-slate-800 text-sm truncate pr-2 uppercase tracking-tight">{p.otherUserId}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter whitespace-nowrap">
                    {new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <p className={`text-xs truncate font-medium ${p.lastMessageType !== 'text' ? 'text-indigo-500 italic' : 'text-slate-400'}`}>
                  {p.lastMessage}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>

      {showNewChat && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end justify-center p-6 z-[100] animate-fade-scale">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 animate-slide-up shadow-2xl">
            <div className="w-16 h-1 bg-slate-200 rounded-full mx-auto mb-8"></div>
            <h3 className="text-2xl font-black mb-2 uppercase tracking-tight text-slate-800">New Connection</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-8">Enter Recipient Protocol ID</p>
            
            <div className="space-y-6">
              <div className="relative">
                <i className="fa-solid fa-hashtag absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input 
                  autoFocus
                  className="w-full bg-slate-100 rounded-2xl pl-14 pr-6 py-5 text-sm font-black border-2 border-transparent outline-none focus:border-indigo-300 focus:bg-white transition-all text-slate-700" 
                  placeholder="+8801XXXXXXXXX" 
                  value={newUserId} 
                  onChange={e => setNewUserId(e.target.value)} 
                />
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => { setShowNewChat(false); setNewUserId(''); }} 
                  className="flex-1 py-5 bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleStartChat}
                  disabled={!newUserId.trim()}
                  className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all disabled:opacity-50"
                >
                  Authorize
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
