import React, { useState, useEffect } from 'react';
import { UserRole, AppState } from './types';
import { storageService } from './services/storageService';
import Navbar from './components/Navbar';
import UserPanel from './components/UserPanel';
import Dashboard from './components/Dashboard';
import HistoryPanel from './components/HistoryPanel';
import Login from './components/Login';
import { ARCHITECTURE_NOTE } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(storageService.getState());
  const [view, setView] = useState<'LOGIN' | 'DASHBOARD' | 'SCANNER' | 'HISTORY'>('LOGIN');
  const [activeScan, setActiveScan] = useState<ScanResult | null>(null);

  useEffect(() => {
    console.log(ARCHITECTURE_NOTE);
    if (state.isLoggedIn) {
      setView('DASHBOARD');
    }
  }, [state.isLoggedIn, state.role]);

  const handleLogin = (role: UserRole) => {
    const newState = { ...state, role, isLoggedIn: true };
    setState(newState);
    storageService.saveState(newState);
    setView('DASHBOARD');
  };

  const handleLogout = () => {
    const newState = { ...state, role: UserRole.GUEST, isLoggedIn: false };
    setState(newState);
    storageService.saveState(newState);
    setActiveScan(null);
    setView('LOGIN');
  };

  const refreshState = () => {
    setState(storageService.getState());
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 select-none">
      <Navbar 
        role={state.role} 
        currentView={view}
        onLogout={handleLogout} 
        onNav={(v) => setView(v as any)} 
      />
      
      <main className="flex-1 pb-16">
        {view === 'LOGIN' && <Login onLogin={handleLogin} />}
        
        {view === 'DASHBOARD' && state.isLoggedIn && (
          <Dashboard onNavigate={(v) => setView(v)} />
        )}
        
        {view === 'SCANNER' && state.isLoggedIn && (
          <UserPanel activeScan={activeScan} setActiveScan={setActiveScan} />
        )}
        
        {view === 'HISTORY' && state.isLoggedIn && (
          <HistoryPanel onSelectScan={(scan) => {
            setActiveScan(scan);
            setView('SCANNER');
          }} />
        )}


      </main>

      <footer className="border-t border-slate-900/60 py-8 px-6 text-center bg-slate-950/40 backdrop-blur-md relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
          
          <div className="flex items-center w-full max-w-md gap-4">
            <div className="h-px bg-slate-800/60 flex-1"></div>
            <div className="text-sm tracking-widest uppercase">
              <span className="text-slate-500">Developed by </span>
              <span className="text-slate-200 font-bold ml-1">B A Fareed Ahamed</span>
            </div>
            <div className="h-px bg-slate-800/60 flex-1"></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <a 
              href="https://github.com/fareedahamed0425-code" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-6 py-3 bg-slate-900/50 hover:bg-slate-800/80 border border-slate-700/50 rounded-xl transition-all duration-300 group hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-200 transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold tracking-wider text-slate-300 group-hover:text-white transition-colors uppercase">GitHub</span>
            </a>

            <a 
              href="https://bafareedahamedportfolio.netlify.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-6 py-3 bg-slate-900/50 hover:bg-slate-800/80 border border-slate-700/50 rounded-xl transition-all duration-300 group hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span className="text-sm font-semibold tracking-wider text-slate-300 group-hover:text-white transition-colors uppercase">Portfolio</span>
            </a>
          </div>

          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.25em] mt-2">
            LUCIFER PROTOCOL V2 • AI-powered threat intelligence and forensics platform
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
