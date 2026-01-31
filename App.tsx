
import React, { useState, useEffect } from 'react';
import { UserRole, AppState } from './types';
import { storageService } from './services/storageService';
import Navbar from './components/Navbar';
import AdminPanel from './components/AdminPanel';
import UserPanel from './components/UserPanel';
import Login from './components/Login';
import { ARCHITECTURE_NOTE } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(storageService.getState());
  const [view, setView] = useState<'LOGIN' | 'ADMIN' | 'USER'>('LOGIN');

  useEffect(() => {
    console.log(ARCHITECTURE_NOTE);
    if (state.isLoggedIn) {
      setView(state.role === UserRole.ADMIN ? 'ADMIN' : 'USER');
    }
  }, [state.isLoggedIn, state.role]);

  const handleLogin = (role: UserRole) => {
    const newState = { ...state, role, isLoggedIn: true };
    setState(newState);
    storageService.saveState(newState);
    setView(role === UserRole.ADMIN ? 'ADMIN' : 'USER');
  };

  const handleLogout = () => {
    const newState = { ...state, role: UserRole.GUEST, isLoggedIn: false };
    setState(newState);
    storageService.saveState(newState);
    setView('LOGIN');
  };

  const refreshState = () => {
    setState(storageService.getState());
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar 
        role={state.role} 
        onLogout={handleLogout} 
        onNav={(v) => setView(v)} 
      />
      
      <main className="flex-1">
        {view === 'LOGIN' && <Login onLogin={handleLogin} />}
        {view === 'ADMIN' && state.role === UserRole.ADMIN && (
          <AdminPanel state={state} refresh={refreshState} />
        )}
        {view === 'USER' && (state.isLoggedIn || state.role === UserRole.USER) && (
          <UserPanel />
        )}
      </main>

      <footer className="border-t border-slate-900 py-8 px-6 text-center">
        <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">
          Lucifer Protocol: ID of URL-Based Attacks using IP Reputation
        </p>
      </footer>
    </div>
  );
};

export default App;
