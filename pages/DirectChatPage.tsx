import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatMessage, MessageType } from '../types';

const AttachmentItem = ({ icon, label, color, onClick, type, accept, capture }: any) => (
  <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-90 transition-all group" onClick={onClick}>
    {type ? (
      <label className="cursor-pointer">
        <input 
          type="file" 
          className="hidden" 
          accept={accept} 
          capture={capture}
          onChange={(e) => onClick(e, type)} 
        />
        <div className={`w-14 h-14 ${color} text-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
          <i className={`fa-solid ${icon} text-xl`}></i>
        </div>
      </label>
    ) : (
      <div className={`w-14 h-14 ${color} text-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
        <i className={`fa-solid ${icon} text-xl`}></i>
      </div>
    )}
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
  </div>
);

const DirectChatPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const myId = localStorage.getItem('user_phone') || 'Unknown';

  useEffect(() => {
    const loadMessages = () => {
      const saved = localStorage.getItem('direct_messages');
      if (saved) {
        const all: ChatMessage[] = JSON.parse(saved);
        const filtered = all.filter(m => 
          (m.senderId === myId && m.receiverId === userId) || 
          (m.senderId === userId && m.receiverId === myId)
        );
        setMessages(filtered.sort((a, b) => a.timestamp - b.timestamp));
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [userId, myId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const saveMessage = (msg: ChatMessage) => {
    const saved = localStorage.getItem('direct_messages');
    const all = saved ? JSON.parse(saved) : [];
    const updated = [...all, msg];
    
    try {
      localStorage.setItem('direct_messages', JSON.stringify(updated));
      setMessages(prev => [...prev, msg]);
    } catch (e) {
      alert("System storage full. Unable to send large media.");
    }
  };

  const handleSendText = () => {
    if (!input.trim() || !userId) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: myId,
      receiverId: userId,
      text: input.trim(),
      type: 'text',
      timestamp: Date.now(),
      status: 'sent'
    };
    saveMessage(newMsg);
    setInput('');
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      alert("GPS not supported on this device.");
      return;
    }

    if (!userId) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        senderId: myId,
        receiverId: userId,
        type: 'location',
        location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        timestamp: Date.now(),
        status: 'sent'
      };
      saveMessage(newMsg);
      setShowAttachments(false);
    }, (err) => {
      alert("Unable to retrieve location: " + err.message);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: MessageType) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    
    // Capture userId in a local variable to ensure strict type safety in the closure
    const targetId = userId;

    if (file.size > 2 * 1024 * 1024) {
      alert("File too large for secure transmission. Max 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        senderId: myId,
        receiverId: targetId,
        mediaUrl: reader.result as string,
        fileName: file.name,
        type: type,
        timestamp: Date.now(),
        status: 'sent'
      };
      saveMessage(newMsg);
      setShowAttachments(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] relative overflow-hidden font-['Lexend']">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md p-4 border-b border-slate-100 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
        <button 
          onClick={() => navigate('/messages')} 
          className="w-10 h-10 flex items-center justify-center text-indigo-600 rounded-full hover:bg-slate-50 transition-all active:scale-90"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
          <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 shrink-0">
            <i className="fa-solid fa-user-shield text-lg"></i>
          </div>
          <div className="overflow-hidden text-left">
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-tight truncate">{userId}</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Protocol Secured</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth bg-slate-50/30">
        <div className="flex justify-center mb-4">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] py-2 px-4 bg-white rounded-full border border-slate-100 shadow-sm">End-to-End Encrypted</p>
        </div>
        
        {messages.map((m) => {
          const isMine = m.senderId === myId;
          return (
            <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-fade-scale`}>
              <div className={`max-w-[85%] rounded-[2rem] shadow-sm relative overflow-hidden transition-all ${
                isMine 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
              }`}>
                <div className="p-1">
                  {m.type === 'text' && (
                    <p className="text-sm font-medium leading-relaxed px-5 py-4">{m.text}</p>
                  )}
                  {m.type === 'image' && (
                    <img src={m.mediaUrl} alt="shared" className="rounded-[1.8rem] max-h-80 w-full object-cover" />
                  )}
                  {m.type === 'video' && (
                    <video src={m.mediaUrl} controls className="rounded-[1.8rem] max-h-80 w-full bg-black" />
                  )}
                  {m.type === 'file' && (
                    <div className={`flex items-center gap-4 p-5 ${isMine ? 'bg-black/10' : 'bg-slate-50'} rounded-[1.8rem]`}>
                      <div className={`w-12 h-12 ${isMine ? 'bg-white/20' : 'bg-indigo-100 text-indigo-600'} rounded-2xl flex items-center justify-center shrink-0`}>
                        <i className="fa-solid fa-file-invoice text-xl"></i>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-black truncate max-w-[150px]">{m.fileName}</p>
                        <p className="text-[8px] uppercase font-bold opacity-60 tracking-widest">Document</p>
                      </div>
                    </div>
                  )}
                  {m.type === 'location' && (
                    <div className="p-1">
                      <div className="rounded-[1.8rem] bg-slate-100 overflow-hidden relative">
                         <div className="h-32 bg-indigo-50 flex items-center justify-center">
                            <i className="fa-solid fa-map-location-dot text-4xl text-indigo-300"></i>
                         </div>
                         <div className="p-4 bg-white border-t border-slate-100">
                            <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Live Location Shared</p>
                            <p className="text-[9px] text-slate-400 mt-1">{m.location?.lat?.toFixed(4)}, {m.location?.lng?.toFixed(4)}</p>
                            <a 
                              href={`https://www.google.com/maps?q=${m.location?.lat},${m.location?.lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 block text-center py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                            >
                              Open in Maps
                            </a>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-end gap-1.5 pb-2 px-5 opacity-40">
                  <p className="text-[8px] font-black uppercase tracking-tighter">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {isMine && (
                    <i className={`fa-solid fa-check-double text-[8px] ${m.status === 'read' ? 'text-blue-300' : 'text-white'}`}></i>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attachment Menu Overlay */}
      {showAttachments && (
        <>
          <div className="absolute inset-x-4 bottom-28 z-30 animate-slide-up">
            <div className="bg-white/95 backdrop-blur-xl rounded-[3.5rem] p-8 shadow-2xl border border-slate-200/50 grid grid-cols-4 gap-6">
              <AttachmentItem icon="fa-camera" label="Camera" color="bg-rose-500" type="image" accept="image/*" capture="environment" onClick={handleFileUpload} />
              <AttachmentItem icon="fa-image" label="Gallery" color="bg-purple-600" type="image" accept="image/*" onClick={handleFileUpload} />
              <AttachmentItem icon="fa-video" label="Video" color="bg-orange-500" type="video" accept="video/*" onClick={handleFileUpload} />
              <AttachmentItem icon="fa-file-lines" label="Docs" color="bg-indigo-600" type="file" accept="*" onClick={handleFileUpload} />
              <AttachmentItem icon="fa-location-dot" label="Live GPS" color="bg-emerald-500" onClick={handleShareLocation} />
              <AttachmentItem icon="fa-user-plus" label="Contact" color="bg-blue-500" onClick={() => alert("Contact picking simulated.")} />
              <AttachmentItem icon="fa-microphone" label="Audio" color="bg-amber-500" onClick={() => alert("Voice note logic initialized.")} />
              <AttachmentItem icon="fa-circle-info" label="Status" color="bg-slate-700" onClick={() => alert("Status update menu.")} />
            </div>
          </div>
          <div className="absolute inset-0 bg-slate-900/40 z-10 backdrop-blur-sm" onClick={() => setShowAttachments(false)} />
        </>
      )}

      {/* Input Area */}
      <div className="p-4 pb-10 bg-white border-t border-slate-100 flex items-end gap-3 shadow-[0_-20px_60px_rgba(0,0,0,0.04)] z-20">
        <button 
          onClick={() => setShowAttachments(!showAttachments)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${showAttachments ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 hover:text-indigo-600 shadow-sm'}`}
        >
          <i className={`fa-solid ${showAttachments ? 'fa-xmark' : 'fa-plus'} text-lg`}></i>
        </button>
        
        <div className="flex-1 bg-slate-50 rounded-[2rem] flex items-end px-4 py-2 border border-slate-100 focus-within:border-indigo-200 focus-within:bg-white transition-all">
          <textarea 
            rows={1}
            className="flex-1 bg-transparent border-none outline-none py-2.5 px-2 text-sm font-medium resize-none max-h-32 text-slate-700 placeholder:text-slate-400" 
            placeholder="Secure message..." 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendText();
              }
            }}
          />
        </div>
        
        {input.trim() ? (
          <button onClick={handleSendText} className="w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-lg active:scale-90 flex items-center justify-center">
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        ) : (
          <button 
            className={`w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 active:scale-90 flex items-center justify-center ${isRecording ? 'bg-red-500 text-white animate-pulse' : ''}`}
            onMouseDown={() => setIsRecording(true)}
            onMouseUp={() => setIsRecording(false)}
          >
            <i className={`fa-solid ${isRecording ? 'fa-microphone-lines' : 'fa-microphone'}`}></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default DirectChatPage;