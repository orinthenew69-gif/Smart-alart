import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FIRST_AID_DATA = [
  { id: 'cpr', title: 'Adult CPR', icon: 'fa-heart-pulse', color: 'bg-red-500', steps: ['Scene safety', 'Check response', 'Call 911', 'Compressions 100-120/min'] },
  { id: 'bleeding', title: 'Bleeding', icon: 'fa-droplet', color: 'bg-rose-600', steps: ['Gloves', 'Direct pressure', 'Don\'t remove soak', 'Maintain pressure'] },
  { id: 'panic', title: 'Panic Attack', icon: 'fa-brain', color: 'bg-indigo-500', steps: ['Calm speech', 'Deep breathing', '5-4-3-2-1 Grounding'] }
];

const FirstAidPage: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<any>(null);
  return (
    <div className="h-full bg-slate-50">
      <div className="p-4 bg-white border-b flex items-center gap-4">
        <button onClick={() => selected ? setSelected(null) : navigate(-1)}><i className="fa-solid fa-arrow-left text-indigo-600"></i></button>
        <h2 className="text-xl font-bold">{selected ? selected.title : 'Safe Kit'}</h2>
      </div>
      <div className="p-6">
        {!selected ? FIRST_AID_DATA.map(g => (
          <button key={g.id} onClick={() => setSelected(g)} className="w-full bg-white p-5 rounded-2xl mb-4 flex items-center gap-4 border">
            <div className={`w-12 h-12 ${g.color} text-white rounded-xl flex items-center justify-center`}><i className={`fa-solid ${g.icon}`}></i></div>
            <div className="font-bold">{g.title}</div>
          </button>
        )) : (
          <div className="space-y-6">
            {selected.steps.map((s: string, i: number) => <div key={i} className="flex gap-4"><div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold">{i+1}</div><p>{s}</p></div>)}
          </div>
        )}
      </div>
    </div>
  );
};

export default FirstAidPage;