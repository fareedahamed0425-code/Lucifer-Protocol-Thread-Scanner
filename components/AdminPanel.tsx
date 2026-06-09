import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { AppState, DatasetEntry, ThreatLabel } from '../types';
import { DATASET_SCHEMA } from '../constants';

interface AdminPanelProps {
  state: AppState;
  refresh: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ state, refresh }) => {
  const [allowlistInput, setAllowlistInput] = useState(state.allowlist.join(', '));
  const [blocklistInput, setBlocklistInput] = useState(state.blocklist.join(', '));
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('Uploading and Indexing records on backend...');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const records: DatasetEntry[] = [];

      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length >= 3) {
          records.push({
            url: parts[0],
            ip: parts[1],
            label: parts[2] as ThreatLabel,
            attackType: parts[3] || 'Generic',
            description: parts[4] || ''
          });
        }
      }

      // Send to Express Backend
      fetch('/api/admin/dataset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records })
      })
      .then(res => {
        if (!res.ok) throw new Error('Backend upload failed');
        return res.json();
      })
      .then(data => {
        // Also update local state fallback
        storageService.addDataset({
          filename: file.name,
          recordCount: records.length,
          uploadTime: new Date().toLocaleString()
        }, records);

        setUploadStatus(`Successfully indexed ${records.length} threat records in backend.`);
        refresh();
      })
      .catch(err => {
        console.error('Dataset import crash:', err);
        setUploadStatus('SYSTEM ERROR: Could not sync dataset to backend server.');
      });
    };
    reader.readAsText(file);
  };

  const saveLists = () => {
    const al = allowlistInput.split(',').map(i => i.trim()).filter(i => i);
    const bl = blocklistInput.split(',').map(i => i.trim()).filter(i => i);
    
    // Sync to Express Backend
    fetch('/api/admin/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allowlist: al, blocklist: bl })
    })
    .then(res => {
      if (!res.ok) throw new Error('Backend update failed');
      
      // Save local fallback
      storageService.updateLists(al, bl);
      alert('Global routing rules updated successfully in backend database.');
      refresh();
    })
    .catch(err => {
      console.error('Failed to sync global rules:', err);
      alert('SYSTEM ERROR: Could not update scoring rules on server.');
    });
  };

  const clearEntireDatabase = () => {
    if (confirm("DANGER: This will wipe all threat scan history, uploaded datasets, and custom logs in the server database. Continue?")) {
      fetch('/api/admin/clear', {
        method: 'POST'
      })
      .then(() => {
        storageService.clearData();
        alert('Lucifer database wiped clean.');
        refresh();
      })
      .catch(err => {
        console.error('Clear DB failed:', err);
        alert('Failed to clear database on server.');
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight">Admin Intelligence Terminal</h2>
        <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider font-semibold">Configuring threat ledgers, blocklists, and detection rules</p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border-l-4 border-red-600 bg-slate-900/10">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Threat Indexes</h3>
          <p className="text-4xl font-black text-white">{state.threatRecords.length}</p>
        </div>
        <div className="glass p-6 rounded-2xl border-l-4 border-amber-600 bg-slate-900/10">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 font-semibold">Local Data Repositories</h3>
          <p className="text-4xl font-black text-white">{state.datasets.length}</p>
        </div>
        <div className="glass p-6 rounded-2xl border-l-4 border-emerald-600 bg-slate-900/10">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 font-semibold">Latest Synchronized Upload</h3>
          <p className="text-sm font-bold text-white truncate mt-1">
            {state.datasets.length > 0 ? state.datasets[state.datasets.length-1].uploadTime : 'N/A'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Upload Section */}
        <section className="glass p-8 rounded-3xl bg-slate-950/20 space-y-6">
          <h3 className="text-lg font-black text-white uppercase tracking-wider">Index New Threat Datasets</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800">
              <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">CSV Schema Required</h4>
              <p className="text-xs font-mono text-slate-500">{DATASET_SCHEMA.columns.join(' | ')}</p>
              <p className="text-[10px] italic text-slate-600 mt-1">Example: {DATASET_SCHEMA.example}</p>
            </div>
            
            <div className="relative group">
              <input 
                type="file" 
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="border border-dashed border-slate-800 bg-slate-900/10 rounded-2xl p-8 text-center group-hover:border-red-500 transition-colors">
                <div className="text-red-500 mb-2">
                  <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </div>
                <p className="text-slate-300 font-bold text-sm">Click or drag CSV here to upload</p>
                <p className="text-slate-600 text-xs mt-1">Select structured cybersecurity intelligence</p>
              </div>
            </div>
            {uploadStatus && (
              <p className="text-xs text-emerald-400 font-bold animate-pulse">{uploadStatus}</p>
            )}
          </div>

          <div className="pt-4">
            <h4 className="text-[10px] font-black text-slate-500 mb-3 uppercase tracking-wider">Recent Repository Imports</h4>
            <div className="space-y-2">
              {state.datasets.length === 0 ? (
                <p className="text-slate-600 italic text-xs">No datasets indexed.</p>
              ) : (
                state.datasets.slice(-3).reverse().map((d, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-300 font-bold truncate max-w-[150px]">{d.filename}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{d.recordCount} entries • {d.uploadTime}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Global Rules Section */}
        <section className="glass p-8 rounded-3xl bg-slate-950/20 space-y-6">
          <h3 className="text-lg font-black text-white uppercase tracking-wider">Manual Score Adjustments</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">Global Safe Allowlist (Comma Separated)</label>
              <textarea 
                value={allowlistInput}
                onChange={(e) => setAllowlistInput(e.target.value)}
                placeholder="e.g., google.com, 8.8.8.8, trusted-internal-corp.io"
                className="w-full h-24 bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-red-500 outline-none text-xs transition font-mono"
              />
            </div>
            
            <div>
              <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">Global Threat Blocklist (Comma Separated)</label>
              <textarea 
                value={blocklistInput}
                onChange={(e) => setBlocklistInput(e.target.value)}
                placeholder="e.g., malicious-phish.ru, 185.129.1.5, bad-domain.top"
                className="w-full h-24 bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-red-500 outline-none text-xs transition font-mono"
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={saveLists}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black text-xs py-3.5 px-6 rounded-xl transition uppercase tracking-wider"
              >
                Sync Rules to Server
              </button>
            </div>

            <button 
              onClick={clearEntireDatabase}
              className="w-full border border-red-900/30 text-red-500/80 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-950/20 transition-all duration-300"
            >
              Reset server database
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPanel;
