
import React, { useState, useEffect } from 'react';

const FakeCallOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [status, setStatus] = useState<'ringing' | 'connected'>('ringing');
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (status === 'connected') {
      const i = setInterval(() => setTime(t => t + 1), 1000);
      return () => clearInterval(i);
    }
  }, [status]);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col items-center justify-between py-20 px-8 text-white">
      <div className="text-center">
        <div className="w-24 h-24 bg-slate-700 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl"><i className="fa-solid fa-user"></i></div>
        <h2 className="text-3xl font-medium">Guardian Contact</h2>
        <p className="opacity-60 mt-2">{status === 'ringing' ? 'Incoming...' : `${Math.floor(time/60)}:${(time%60).toString().padStart(2,'0')}`}</p>
      </div>
      {status === 'ringing' ? (
        <div className="flex gap-20">
          <button onClick={onClose} className="w-20 h-20 bg-red-500 rounded-full text-3xl"><i className="fa-solid fa-phone-slash rotate-[135deg]"></i></button>
          <button onClick={() => setStatus('connected')} className="w-20 h-20 bg-green-500 rounded-full text-3xl animate-bounce"><i className="fa-solid fa-phone"></i></button>
        </div>
      ) : (
        <button onClick={onClose} className="w-20 h-20 bg-red-500 rounded-full text-3xl"><i className="fa-solid fa-phone-slash rotate-[135deg]"></i></button>
      )}
    </div>
  );
};

export default FakeCallOverlay;
