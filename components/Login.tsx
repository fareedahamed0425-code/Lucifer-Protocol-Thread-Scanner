
import React, { useState } from 'react';
import { UserRole } from '../types';
import Logo from './Logo';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent, role: UserRole) => {
    e.preventDefault();
    onLogin(role);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="glass p-10 rounded-3xl max-w-md w-full border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="text-center mb-10 relative z-10">
          <div className="mb-6 group">
            <div className="w-32 h-32 mx-auto relative transform transition-transform duration-500 group-hover:scale-110">
              <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full animate-pulse"></div>
              <div className="relative z-10 w-full h-full drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                <Logo />
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Lucifer Protocol</h2>
          <div className="h-1 w-20 bg-red-600 mx-auto mt-2 rounded-full"></div>
          <p className="text-slate-400 mt-4 text-sm font-medium uppercase tracking-[0.2em]">Forensic Attack Identification</p>
        </div>

        <div className="space-y-4 relative z-10">
          <button 
            onClick={(e) => handleSubmit(e, UserRole.ADMIN)}
            className="group w-full bg-slate-900/80 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition border border-slate-800 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.9L10 .155 17.834 4.9a2 2 0 011.166 1.81v3.289c0 5.518-3.565 10.155-8.5 11.5-4.935-1.345-8.5-5.982-8.5-11.5V6.71a2 2 0 011.166-1.81zm9.117 6.19a3.501 3.501 0 11-2.566-2.567 3.5 3.5 0 012.566 2.567z" clipRule="evenodd" />
            </svg>
            <span className="tracking-widest uppercase text-xs">Admin Access</span>
          </button>
          
          <button 
            onClick={(e) => handleSubmit(e, UserRole.USER)}
            className="group w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl transition shadow-lg shadow-red-900/40 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="tracking-widest uppercase text-xs">Standard Entry</span>
          </button>
        </div>

        <p className="text-center text-slate-600 text-[10px] mt-10 font-bold uppercase tracking-[0.3em]">
          Project: Student Innovation Hackathon
        </p>
      </div>
    </div>
  );
};

export default Login;
