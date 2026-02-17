
import React, { useEffect, useState, useRef } from 'react';

const SOSOverlay: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
  const [seconds, setSeconds] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    const interval = setInterval(() => {
      const now = ctx.currentTime;
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.5);
      osc.frequency.exponentialRampToValueAtTime(440, now + 1);
      setSeconds(s => s + 1);
    }, 1000);
    return () => { clearInterval(interval); osc.stop(); ctx.close(); };
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] bg-red-600 flex flex-col items-center justify-between p-10 text-white">
      <h2 className="text-4xl font-black mt-20">SOS ACTIVE</h2>
      <div className="w-44 h-44 rounded-full border-8 border-white/20 flex items-center justify-center bg-white/10">
        <span className="text-5xl font-mono font-black">{seconds}s</span>
      </div>
      <button onClick={onCancel} className="w-full max-w-xs bg-white text-red-600 py-6 rounded-[2rem] font-black text-2xl uppercase shadow-2xl">I AM SAFE</button>
    </div>
  );
};

export default SOSOverlay;
