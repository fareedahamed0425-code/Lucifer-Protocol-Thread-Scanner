import React from 'react';
import { UserRole } from '../types';
import Logo from './Logo';

interface NavbarProps {
  role: UserRole;
  currentView: 'LOGIN' | 'DASHBOARD' | 'SCANNER' | 'HISTORY' | 'ADMIN';
  onLogout: () => void;
  onNav: (view: 'DASHBOARD' | 'SCANNER' | 'HISTORY' | 'ADMIN' | 'LOGIN') => void;
}

const Navbar: React.FC<NavbarProps> = ({ role, currentView, onLogout, onNav }) => {
  return (
    <nav className="border-b border-slate-900/60 px-6 py-4 flex justify-between items-center bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div 
        className="flex items-center gap-3 cursor-pointer group" 
        onClick={() => onNav(role === UserRole.ADMIN ? 'ADMIN' : 'DASHBOARD')}
      >
        <div className="w-10 h-10 relative">
          <div className="absolute inset-0 bg-red-600 rounded-lg blur-md opacity-0 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative z-10 w-full h-full">
            <Logo />
          </div>
        </div>
        <h1 className="text-xl font-black tracking-tight text-white uppercase">
          LUCIFER <span className="text-red-600 font-light group-hover:text-red-500 transition-colors">PROTOCOL</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-6">
        {role !== UserRole.GUEST && (
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-950/30 text-red-500 border border-red-900/30 tracking-widest uppercase hidden md:inline">
              {role}
            </span>
            
            <button 
              onClick={() => onNav('DASHBOARD')}
              className={`text-xs uppercase tracking-wider font-black px-3 py-1.5 rounded transition ${currentView === 'DASHBOARD' ? 'text-red-500 bg-red-950/10' : 'text-slate-400 hover:text-white'}`}
            >
              Dashboard
            </button>

            <button 
              onClick={() => onNav('SCANNER')}
              className={`text-xs uppercase tracking-wider font-black px-3 py-1.5 rounded transition ${currentView === 'SCANNER' ? 'text-red-500 bg-red-950/10' : 'text-slate-400 hover:text-white'}`}
            >
              Scanner
            </button>

            <button 
              onClick={() => onNav('HISTORY')}
              className={`text-xs uppercase tracking-wider font-black px-3 py-1.5 rounded transition ${currentView === 'HISTORY' ? 'text-red-500 bg-red-950/10' : 'text-slate-400 hover:text-white'}`}
            >
              History
            </button>

            {role === UserRole.ADMIN && (
              <button 
                onClick={() => onNav('ADMIN')}
                className={`text-xs uppercase tracking-wider font-black px-3 py-1.5 rounded transition ${currentView === 'ADMIN' ? 'text-red-500 bg-red-950/10' : 'text-slate-400 hover:text-white'}`}
              >
                Admin
              </button>
            )}

            <button 
              onClick={onLogout}
              className="text-xs uppercase tracking-wider bg-red-950/20 text-red-500 px-3.5 py-1.5 rounded border border-red-900/40 hover:bg-red-600 hover:text-white transition font-black active:scale-95 ml-2"
            >
              Exit
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
