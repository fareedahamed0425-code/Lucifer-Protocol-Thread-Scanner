
import React from 'react';
import { UserRole } from '../types';
import Logo from './Logo';

interface NavbarProps {
  role: UserRole;
  onLogout: () => void;
  onNav: (view: 'USER' | 'ADMIN' | 'LOGIN') => void;
}

const Navbar: React.FC<NavbarProps> = ({ role, onLogout, onNav }) => {
  return (
    <nav className="border-b border-slate-800 px-6 py-4 flex justify-between items-center glass sticky top-0 z-50">
      <div 
        className="flex items-center gap-3 cursor-pointer group" 
        onClick={() => onNav(role === UserRole.ADMIN ? 'ADMIN' : 'USER')}
      >
        <div className="w-10 h-10 relative">
          <div className="absolute inset-0 bg-red-600 rounded-lg blur-md opacity-0 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative z-10 w-full h-full">
            <Logo />
          </div>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          Lucifer <span className="text-red-600 font-light group-hover:text-red-500 transition-colors">Protocol</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-6">
        {role !== UserRole.GUEST && (
           <div className="flex items-center gap-4">
            <span className="text-[10px] font-black px-2 py-1 rounded bg-slate-900 text-red-500 border border-red-900/30 tracking-widest uppercase">
              {role}
            </span>
            <button 
              onClick={() => onNav('USER')}
              className="text-sm text-slate-400 hover:text-white transition font-medium"
            >
              Scanner
            </button>
            {role === UserRole.ADMIN && (
              <button 
                onClick={() => onNav('ADMIN')}
                className="text-sm text-slate-400 hover:text-white transition font-medium"
              >
                Admin
              </button>
            )}
            <button 
              onClick={onLogout}
              className="text-sm bg-red-950/20 text-red-500 px-3 py-1.5 rounded border border-red-900/30 hover:bg-red-900/40 transition font-bold"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
