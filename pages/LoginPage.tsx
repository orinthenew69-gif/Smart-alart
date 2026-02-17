
import React, { useState, useEffect, useRef } from 'react';

const COUNTRY_CODES = [
  { name: 'Bangladesh', code: '+880', flag: '🇧🇩' },
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'Pakistan', code: '+92', flag: '🇵🇰' },
  { name: 'UAE', code: '+971', flag: '🇦🇪' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
];

const LoginPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSms, setShowSms] = useState(false);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 7) return;

    setLoading(true);
    setTimeout(() => {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      setStep(2);
      setLoading(false);
      
      setTimeout(() => {
        setShowSms(true);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        setTimeout(() => setShowSms(false), 10000);
      }, 1500);
    }, 1800);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join('') === generatedOtp) {
      setLoading(true);
      setTimeout(() => {
        localStorage.setItem('is_authenticated', 'true');
        localStorage.setItem('user_phone', `${selectedCountry.code}${phone}`);
        onLogin();
      }, 1200);
    } else {
      alert("Verification failed. Please check your SIM messages.");
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-indigo-950 flex flex-col items-center justify-center z-[500] p-10 text-center">
        <div className="relative mb-12 animate-fade-scale">
          <div className="absolute inset-0 bg-indigo-500/30 blur-[100px] rounded-full scale-150 animate-pulse"></div>
          <div className="w-36 h-36 bg-white rounded-[3rem] flex items-center justify-center shadow-2xl relative z-10 rotate-2">
            <i className="fa-solid fa-shield-heart text-indigo-600 text-7xl"></i>
          </div>
        </div>
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-2">Safe Alert</h1>
        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.6em] opacity-80">Security Protocol V2</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0c0e1a] relative overflow-hidden">
      {showSms && (
        <div className="fixed top-8 left-4 right-4 z-[600] animate-in slide-in-from-top-full duration-700">
          <div className="bg-[#1a1b26]/95 backdrop-blur-3xl rounded-[2rem] p-5 shadow-2xl border border-white/10 flex items-start gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0 border border-white/5 shadow-xl">
              <i className="fa-solid fa-comment-sms text-xl"></i>
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Messages • Now</p>
              <p className="text-sm font-black text-white">Verification Code</p>
              <p className="text-xs text-white/60 mt-0.5 tracking-tight">Code is <span className="text-indigo-400 font-black tracking-widest">{generatedOtp}</span>.</p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[3.5rem] p-10 py-16 shadow-2xl border border-white/10 relative z-10 animate-fade-scale">
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
            <i className="fa-solid fa-fingerprint text-4xl"></i>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Identity Gate</h2>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-8">
            <div className="relative flex items-center bg-slate-100 rounded-2xl p-1.5 transition-all">
               <div className="relative">
                 <select 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    onChange={(e) => {
                      const found = COUNTRY_CODES.find(c => c.code === e.target.value);
                      if (found) setSelectedCountry(found);
                    }}
                    value={selectedCountry.code}
                 >
                    {COUNTRY_CODES.map(c => (
                      <option key={`${c.name}-${c.code}`} value={c.code}>{c.flag} {c.name}</option>
                    ))}
                 </select>
                 <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-2 shadow-sm border border-slate-100">
                    <span className="text-xl">{selectedCountry.flag}</span>
                    <span className="font-black text-slate-700 text-sm">{selectedCountry.code}</span>
                 </div>
               </div>
               <input
                 type="tel"
                 placeholder="Phone Number"
                 className="flex-1 bg-transparent border-none outline-none font-black text-slate-700 px-4 py-3 text-lg"
                 value={phone}
                 onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                 required
               />
            </div>
            <button
              disabled={loading || phone.length < 7}
              className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] shadow-xl hover:bg-indigo-700 transition-all"
            >
              {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <span className="uppercase tracking-widest text-xs">Request Entry</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-12">
            <div className="flex justify-between gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { otpRefs.current[i] = el; }}
                  type="text"
                  maxLength={1}
                  className="w-full h-16 bg-slate-100 border-2 border-transparent rounded-2xl text-center text-2xl font-black text-slate-800 outline-none transition-all"
                  value={digit}
                  onChange={e => {
                    const val = e.target.value.slice(-1);
                    if (!/^\d*$/.test(val)) return;
                    const next = [...otp]; next[i] = val; setOtp(next);
                    if (val && i < 5) otpRefs.current[i+1]?.focus();
                  }}
                  onKeyDown={e => e.key === 'Backspace' && !otp[i] && i > 0 && otpRefs.current[i-1]?.focus()}
                  autoFocus={i === 0}
                />
              ))}
            </div>
            <button
              disabled={loading || otp.some(d => !d)}
              className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] shadow-xl hover:bg-indigo-700 transition-all"
            >
               {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <span className="uppercase tracking-widest text-xs">Authorize</span>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
