
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppStatus } from '../types';

interface DashboardProps {
  status: AppStatus;
  triggerSOS: () => void;
  toggleGuardMode: () => void;
  onFakeCall: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ status, triggerSOS, toggleGuardMode, onFakeCall }) => {
  const navigate = useNavigate();
  const [pressProgress, setPressProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const isGuarding = status === AppStatus.TRACKING;

  const handleStart = () => {
    setIsPressing(true);
    startTimeRef.current = Date.now();
    if (navigator.vibrate) navigator.vibrate(50);
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min((elapsed / 2000) * 100, 100);
      setPressProgress(progress);
      if (progress >= 100) {
        clearInterval(timerRef.current!);
        setIsPressing(false);
        setPressProgress(0);
        triggerSOS();
      }
    }, 30);
  };

  const handleEnd = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPressing(false);
    setPressProgress(0);
  };

  return (
    <div className="p-8 pb-32 flex flex-col items-center justify-center gap-10 min-h-full bg-slate-100">
      <div className="text-center animate-fade-scale">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">
          {isGuarding ? "System Armed" : "Protocol Standby"}
        </h2>
        <div className="flex items-center justify-center gap-2 mt-2">
           <span className={`w-2 h-2 rounded-full ${isGuarding ? 'bg-indigo-600 animate-pulse' : 'bg-green-500'}`}></span>
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
            {isGuarding ? "Satellite Uplink Active" : "Internal Diagnostics OK"}
           </p>
        </div>
      </div>

      <div className="relative w-80 h-80 flex items-center justify-center">
        <svg className="absolute w-full h-full -rotate-90">
          <circle cx="160" cy="160" r="148" fill="transparent" stroke={isGuarding ? "#e0f2fe" : "#fff"} strokeWidth="16" />
          <circle cx="160" cy="160" r="148" fill="transparent" stroke="#ef4444" strokeWidth="16" strokeDasharray={930} strokeDashoffset={930 - (930 * pressProgress) / 100} strokeLinecap="round" className="transition-all duration-75 ease-linear" />
        </svg>

        <button
          onMouseDown={handleStart} onMouseUp={handleEnd} onMouseLeave={handleEnd}
          onTouchStart={handleStart} onTouchEnd={handleEnd}
          className={`w-64 h-64 bg-red-600 rounded-full flex flex-col items-center justify-center text-white shadow-[0_40px_80px_rgba(239,68,68,0.4)] active:scale-90 transition-all z-10 ${isPressing ? 'scale-110' : 'sos-pulse'}`}
        >
          <i className="fa-solid fa-shield-virus text-6xl mb-4"></i>
          <span className="text-6xl font-black tracking-tighter">SOS</span>
          <span className="text-[10px] font-black opacity-60 mt-3 uppercase tracking-widest">Hold for 2s</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-5 w-full max-w-sm px-2 animate-slide-up">
        <DashboardBtn icon="fa-phone-volume" label="Fake Call" color="bg-emerald-500" onClick={onFakeCall} />
        <DashboardBtn icon={isGuarding ? "fa-circle-stop" : "fa-shield-heart"} label={isGuarding ? "Stop Guard" : "Guard Me"} color={isGuarding ? "bg-slate-900" : "bg-indigo-600"} onClick={toggleGuardMode} />
        <DashboardBtn icon="fa-map-location-dot" label="Safety Map" color="bg-amber-500" onClick={() => navigate('/tracking')} />
        <DashboardBtn icon="fa-briefcase-medical" label="Safe Kit" color="bg-purple-600" onClick={() => navigate('/first-aid')} />
      </div>

      {isGuarding && (
        <div className="fixed bottom-36 left-8 right-8 bg-indigo-950/95 backdrop-blur-2xl text-white p-5 rounded-[2.5rem] flex items-center gap-5 shadow-2xl border border-white/10 animate-fade-scale">
           <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
              <i className="fa-solid fa-tower-broadcast animate-pulse text-indigo-300 text-xl"></i>
           </div>
           <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Guardian Protocol</p>
              <p className="text-sm font-black mt-0.5 tracking-tight">Active GPS Synchronization...</p>
           </div>
        </div>
      )}
    </div>
  );
};

const DashboardBtn: React.FC<{ icon: string, label: string, color: string, onClick: () => void }> = ({ icon, label, color, onClick }) => (
  <button onClick={onClick} className={`${color} text-white p-6 rounded-[2.5rem] flex flex-col items-center gap-3 shadow-xl active:scale-95 transition-all border border-black/5`}>
    <i className={`fa-solid ${icon} text-2xl opacity-90`}></i>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default Dashboard;
