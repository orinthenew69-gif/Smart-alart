import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Message } from '../types';

const SafetyAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Safe Alert AI at your service. How can I help you stay safe?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      // Initialize with the environment variable as required
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          systemInstruction: 'You are the Safe Alert Safety Companion. Provide immediate, practical de-escalation and safety advice for women. Focus on situational awareness. Tone: Professional and calm. Keep responses short.',
        }
      });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm listening, but couldn't generate a response." }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', text: "Service unavailable. Please check your internet connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-white p-5 border-b border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center"><i className="fa-solid fa-robot"></i></div>
        <h3 className="font-black text-sm uppercase">Safety AI</h3>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-[2rem] ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-100'}`}>
              <p className="text-sm">{m.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-6 bg-white border-t flex gap-3">
        <input className="flex-1 bg-slate-100 rounded-2xl px-6 py-4 text-sm" placeholder="Ask anything..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
        <button onClick={handleSend} disabled={isLoading} className="w-14 h-14 bg-indigo-600 text-white rounded-2xl"><i className="fa-solid fa-paper-plane"></i></button>
      </div>
    </div>
  );
};

export default SafetyAssistant;