import React, { useState, useEffect } from 'react';
import { UserRole, AppState } from './types';
import { storageService } from './services/storageService';
import Navbar from './components/Navbar';
import AdminPanel from './components/AdminPanel';
import UserPanel from './components/UserPanel';
import Dashboard from './components/Dashboard';
import HistoryPanel from './components/HistoryPanel';
import Login from './components/Login';
import { ARCHITECTURE_NOTE } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(storageService.getState());
  const [view, setView] = useState<'LOGIN' | 'DASHBOARD' | 'SCANNER' | 'HISTORY' | 'ADMIN'>('LOGIN');
  const [activeScan, setActiveScan] = useState<ScanResult | null>(null);

  useEffect(() => {
    console.log(ARCHITECTURE_NOTE);
    if (state.isLoggedIn) {
      setView(state.role === UserRole.ADMIN ? 'ADMIN' : 'DASHBOARD');
    }
  }, [state.isLoggedIn, state.role]);

  const handleLogin = (role: UserRole) => {
    const newState = { ...state, role, isLoggedIn: true };
    setState(newState);
    storageService.saveState(newState);
    setView(role === UserRole.ADMIN ? 'ADMIN' : 'DASHBOARD');
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
        onNav={(v) => setView(v)} 
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

        {view === 'ADMIN' && state.role === UserRole.ADMIN && (
          <AdminPanel state={state} refresh={refreshState} />
        )}
      </main>

      <footer className="border-t border-slate-900/60 py-6 px-6 text-center bg-slate-950/20">
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.25em]">
          LUCIFER PROTOCOL V2 • AI-powered threat intelligence and forensics platform
        </p>
      </footer>
    </div>
  );
};

export default App;
