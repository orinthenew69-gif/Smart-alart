
import React, { useState } from 'react';
import { EmergencyContact } from '../types';

interface ContactsPageProps {
  contacts: EmergencyContact[];
  setContacts: (contacts: EmergencyContact[]) => void;
}

const ContactsPage: React.FC<ContactsPageProps> = ({ contacts, setContacts }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      setError("Name and number required.");
      return;
    }
    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: newName.trim(),
      phone: newPhone.trim(),
    };
    setContacts([...contacts, newContact]);
    setNewName('');
    setNewPhone('');
    setIsAdding(false);
  };

  return (
    <div className="p-8 pb-32">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">My Circle</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Encrypted Guardians</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white w-14 h-14 rounded-3xl shadow-xl flex items-center justify-center">
          <i className="fa-solid fa-user-plus text-xl"></i>
        </button>
      </div>

      <div className="space-y-4">
        {contacts.map((contact) => (
          <div key={contact.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-xl font-black text-indigo-600">
                {contact.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-black text-slate-800 text-sm">{contact.name}</p>
                <p className="text-slate-400 text-[10px] font-mono">{contact.phone}</p>
              </div>
            </div>
            <button onClick={() => contact.id !== '999' && setContacts(contacts.filter(c => c.id !== contact.id))} className="text-slate-300 hover:text-red-500 p-2">
              <i className="fa-solid fa-trash-can"></i>
            </button>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-end justify-center p-6 z-[100]">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 animate-slide-up shadow-2xl">
            <h3 className="text-xl font-black mb-6 uppercase">Add Guardian</h3>
            <form onSubmit={handleAdd} className="space-y-6">
              <input className="w-full bg-slate-50 rounded-2xl px-5 py-4 text-sm" placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} />
              <input className="w-full bg-slate-50 rounded-2xl px-5 py-4 text-sm" placeholder="Phone" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
              <div className="flex gap-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 bg-slate-50 rounded-2xl text-[10px] font-black">CANCEL</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black">ADD</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
