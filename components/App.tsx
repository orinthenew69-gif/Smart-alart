import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AppStatus, EmergencyContact } from '../types';
import Dashboard from '../pages/Dashboard';
import ContactsPage from '../pages/ContactsPage';
import TrackingPage from '../pages/TrackingPage';
import ProfilePage from '../pages/ProfilePage';
import SafetyAssistant from '../pages/SafetyAssistant';
import FirstAidPage from '../pages/FirstAidPage';
import LoginPage from '../pages/LoginPage';
import MessagesPage from '../pages/MessagesPage';
import DirectChatPage from '../pages/DirectChatPage';
import SOSOverlay from './SOSOverlay';
import FakeCallOverlay from './FakeCallOverlay';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isFakeCallActive, setIsFakeCallActive] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('emergency_contacts');
    if (saved) {
      setContacts(JSON.parse(saved));
    } else {
      const defaultContacts: EmergencyContact[] = [{ id: '999', name: 'Emergency Police', phone: '999', isPrimary: true }];
      setContacts(defaultContacts);
      localStorage.setItem('emergency_contacts', JSON.stringify(defaultContacts));
    }

    const auth = localStorage.getItem('is_authenticated');
    setIsAuthenticated(auth === 'true');
  }, []);

  const updateContacts = useCallback((newContacts: EmergencyContact[]) => {
    const hasPrimary = newContacts.some(c => c.id === '999');
    const finalContacts = hasPrimary 
      ? newContacts 
      : [{ id: '999', name: 'Emergency Police', phone: '999', isPrimary: true }, ...newContacts];
    
    setContacts(finalContacts);
    localStorage.setItem('emergency_contacts', JSON.stringify(finalContacts));
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.start();
    } catch (err) {
      console.warn("Evidence recording failed: Permission denied or hardware unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        console.log("Recording stopped. Chunks captured:", audioChunksRef.current.length);
      } catch (e) {
        console.error("Failed to stop recorder gracefully", e);
      }
    }
  };

  const triggerSOS = useCallback(() => {
    setStatus(AppStatus.EMERGENCY);
    if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
    startRecording();
  }, []);

  const cancelSOS = useCallback(() => {
    setStatus(AppStatus.IDLE);
    stopRecording();
    if (navigator.vibrate) navigator.vibrate(200);
  }, []);

  const toggleGuardMode = useCallback(() => {
    const nextStatus = status === AppStatus.TRACKING ? AppStatus.IDLE : AppStatus.TRACKING;
    setStatus(nextStatus);
    if (navigator.vibrate) navigator.vibrate(100);
  }, [status]);

  const handleLogout = () => {
    localStorage.removeItem('is_authenticated');
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) return null;

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <div className="flex flex-col h-screen overflow-hidden bg-slate-50 relative animate-fade-scale">
        <div className="bg-indigo-950 text-white/30 text-[8px] py-1 text-center font-black uppercase tracking-[0.5em] shrink-0 z-[60]">
          Safe Alert • Protected System
        </div>

        <header className="bg-indigo-700 text-white px-6 py-5 flex justify-between items-center shadow-xl shrink-0 z-20 border-b border-indigo-600/50">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2.5 rounded-2xl shadow-inner border border-white/5">
              <i className="fa-solid fa-shield-heart text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Safe Alert</h1>
              <p className="text-[8px] font-black uppercase tracking-widest text-indigo-300 mt-1">Satellite Link: Secure</p>
            </div>
          </div>
          <div className="flex gap-2">
             <Link to="/assistant" className="w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/5 shadow-sm active:scale-90">
              <i className="fa-solid fa-robot"></i>
             </Link>
             <button onClick={handleLogout} className="w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/5 shadow-sm active:scale-90">
              <i className="fa-solid fa-power-off"></i>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative bg-slate-100">
          <Routes>
            <Route path="/" element={
              <Dashboard 
                status={status}
                triggerSOS={triggerSOS} 
                toggleGuardMode={toggleGuardMode}
                onFakeCall={() => setIsFakeCallActive(true)} 
              />
            } />
            <Route path="/contacts" element={<ContactsPage contacts={contacts} setContacts={updateContacts} />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:userId" element={<DirectChatPage />} />
            <Route path="/tracking" element={<TrackingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/assistant" element={<SafetyAssistant />} />
            <Route path="/first-aid" element={<FirstAidPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          {status === AppStatus.EMERGENCY && <SOSOverlay onCancel={cancelSOS} />}
          {isFakeCallActive && <FakeCallOverlay onClose={() => setIsFakeCallActive(false)} />}
        </main>

        <nav className="bg-white border-t border-slate-200 py-4 px-6 flex justify-around items-end shrink-0 z-20 shadow-[0_-20px_60px_rgba(0,0,0,0.06)] rounded-t-[3.5rem]">
          <BottomTab to="/" icon="fa-house" label="Home" />
          <BottomTab to="/contacts" icon="fa-users" label="Circle" />
          <BottomTab to="/messages" icon="fa-comment-dots" label="Chat" />
          <BottomTab to="/tracking" icon="fa-location-crosshairs" label="Live" />
          <BottomTab to="/profile" icon="fa-user-gear" label="Profile" />
        </nav>
      </div>
    </Router>
  );
};

const BottomTab: React.FC<{ to: string, icon: string, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to) && (to !== '/' || location.pathname === '/');
  return (
    <Link to={to} className={`flex flex-col items-center gap-2 transition-all duration-300 pb-1 ${isActive ? 'text-indigo-600' : 'text-slate-300 hover:text-indigo-400'}`}>
      <div className={`w-10 h-1.5 rounded-full mb-1 transition-all duration-500 ${isActive ? 'bg-indigo-600 scale-x-100' : 'bg-transparent scale-x-0'}`}></div>
      <i className={`fa-solid ${icon} text-2xl ${isActive ? 'scale-110' : 'scale-100'}`}></i>
      <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
    </Link>
  );
};

export default App;