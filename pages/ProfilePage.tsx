
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Anonymous Defender',
    email: '',
    phone: localStorage.getItem('user_phone') || 'Unknown',
    emergencyNote: 'Please contact my primary circle immediately if SOS is triggered.',
    avatar: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('user_profile', JSON.stringify(profile));
      setIsEditing(false);
      setLoading(false);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 800);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8 pb-40 min-h-full bg-[#F8FAFC]">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Identity</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Biometric Encrypted</p>
          </div>
        </div>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
            isEditing 
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' 
              : 'bg-white text-indigo-600 border border-indigo-100 shadow-sm'
          }`}
        >
          {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : (isEditing ? 'Save Profile' : 'Edit Identity')}
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="flex flex-col items-center relative z-10">
          <div className="relative group">
            <div className="w-28 h-28 bg-indigo-100 rounded-[2.5rem] flex items-center justify-center text-4xl text-indigo-600 overflow-hidden border-4 border-white shadow-xl">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <i className="fa-solid fa-user-shield"></i>
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-lg active:scale-90 transition-all border-4 border-white">
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                <i className="fa-solid fa-camera text-xs"></i>
              </label>
            )}
          </div>
          <h3 className="mt-6 text-xl font-black text-slate-800 uppercase tracking-tight">{profile.name}</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">{profile.phone}</p>
        </div>
      </div>

      {/* Profile Details Form */}
      <div className="space-y-4">
        <ProfileField 
          label="Full Name" 
          value={profile.name} 
          icon="fa-id-card" 
          isEditing={isEditing} 
          onChange={(v) => setProfile({...profile, name: v})} 
        />
        <ProfileField 
          label="Email Protocol" 
          value={profile.email} 
          placeholder="email@secure.link"
          icon="fa-envelope" 
          isEditing={isEditing} 
          onChange={(v) => setProfile({...profile, email: v})} 
        />
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
           <div className="flex items-center gap-3 mb-4">
              <i className="fa-solid fa-comment-medical text-rose-500"></i>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Emergency Safety Note</p>
           </div>
           {isEditing ? (
             <textarea 
               className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-2 border-transparent focus:border-indigo-100 outline-none transition-all resize-none h-32"
               value={profile.emergencyNote}
               onChange={(e) => setProfile({...profile, emergencyNote: e.target.value})}
               placeholder="Add any medical info or specific emergency instructions..."
             />
           ) : (
             <p className="text-sm font-medium text-slate-700 leading-relaxed px-1">
               {profile.emergencyNote || "No specific instructions provided."}
             </p>
           )}
        </div>

        {/* Protocol Status */}
        <div className="bg-indigo-950 p-8 rounded-[3rem] shadow-2xl shadow-indigo-200 mt-6 border border-white/10 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
           <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                   <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em]">Security Token</p>
                   <p className="text-white font-black text-xl tracking-tighter mt-1 uppercase">V2.4.9 ACTIVE</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                  <i className="fa-solid fa-microchip text-indigo-300"></i>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[94%] animate-pulse"></div>
                 </div>
                 <span className="text-[10px] font-black text-indigo-300">94% SECURE</span>
              </div>
              <p className="text-white/40 text-[8px] font-black uppercase tracking-widest mt-6 text-center">Protocol Synchronized with Global Safety Grid</p>
           </div>
        </div>

        <button 
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="w-full py-6 mt-4 text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-rose-50 rounded-[2.5rem] transition-all"
        >
          Terminate Protocol & Wipe Cache
        </button>
      </div>
    </div>
  );
};

const ProfileField: React.FC<{ 
  label: string, 
  value: string, 
  icon: string, 
  isEditing: boolean, 
  placeholder?: string,
  onChange: (v: string) => void 
}> = ({ label, value, icon, isEditing, placeholder, onChange }) => (
  <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6">
    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-slate-100 shrink-0">
      <i className={`fa-solid ${icon} text-xl`}></i>
    </div>
    <div className="flex-1 overflow-hidden">
       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
       {isEditing ? (
         <input 
           className="w-full bg-slate-50 rounded-xl px-4 py-2 text-sm font-bold border-2 border-transparent focus:border-indigo-100 outline-none transition-all"
           value={value}
           placeholder={placeholder}
           onChange={(e) => onChange(e.target.value)}
         />
       ) : (
         <p className="text-sm font-black text-slate-800 truncate">{value || "Not Set"}</p>
       )}
    </div>
  </div>
);

export default ProfilePage;
