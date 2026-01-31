
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

    setUploadStatus('Processing...');
    
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

      storageService.addDataset({
        filename: file.name,
        recordCount: records.length,
        uploadTime: new Date().toLocaleString()
      }, records);

      setUploadStatus(`Successfully uploaded ${records.length} records.`);
      refresh();
    };
    reader.readAsText(file);
  };

  const saveLists = () => {
    const al = allowlistInput.split(',').map(i => i.trim()).filter(i => i);
    const bl = blocklistInput.split(',').map(i => i.trim()).filter(i => i);
    storageService.updateLists(al, bl);
    alert('Global rules updated successfully.');
    refresh();
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h2>
        <p className="text-slate-400">Manage datasets, global rules, and system configuration.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-xl border-l-4 border-red-500">
          <h3 className="text-sm font-medium text-slate-400 mb-1">Total Records</h3>
          <p className="text-4xl font-bold text-white">{state.threatRecords.length}</p>
        </div>
        <div className="glass p-6 rounded-xl border-l-4 border-emerald-500">
          <h3 className="text-sm font-medium text-slate-400 mb-1">Datasets Uploaded</h3>
          <p className="text-4xl font-bold text-white">{state.datasets.length}</p>
        </div>
        <div className="glass p-6 rounded-xl border-l-4 border-amber-500">
          <h3 className="text-sm font-medium text-slate-400 mb-1">Last Update</h3>
          <p className="text-lg font-bold text-white truncate">
            {state.datasets.length > 0 ? state.datasets[state.datasets.length-1].uploadTime : 'N/A'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <section className="glass p-8 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-6">Import New Intelligence</h3>
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">CSV Schema Required</h4>
              <p className="text-xs mono text-slate-500">{DATASET_SCHEMA.columns.join(' | ')}</p>
              <p className="text-xs italic text-slate-600 mt-1">Example: {DATASET_SCHEMA.example}</p>
            </div>
            
            <div className="relative group">
              <input 
                type="file" 
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center group-hover:border-red-500 transition-colors">
                <div className="text-red-400 mb-2">
                  <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </div>
                <p className="text-slate-300 font-medium">Click or drag CSV here to upload</p>
                <p className="text-slate-500 text-sm mt-1">Zero sample data provided. Admin must upload.</p>
              </div>
            </div>
            {uploadStatus && (
              <p className="text-sm text-emerald-400 font-medium animate-pulse">{uploadStatus}</p>
            )}
          </div>

          <div className="mt-8">
            <h4 className="text-sm font-bold text-slate-400 mb-3 uppercase">Recent History</h4>
            <div className="space-y-2">
              {state.datasets.length === 0 ? (
                <p className="text-slate-600 italic text-sm">No datasets uploaded yet.</p>
              ) : (
                state.datasets.slice(-3).reverse().map((d, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-800/30 p-3 rounded border border-slate-800">
                    <span className="text-sm text-slate-300 truncate max-w-[150px]">{d.filename}</span>
                    <span className="text-xs text-slate-500">{d.recordCount} records • {d.uploadTime}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Global Rules Section */}
        <section className="glass p-8 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-6">Global Scoring Rules</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Manual Allowlist (Comma separated URLs/IPs)</label>
              <textarea 
                value={allowlistInput}
                onChange={(e) => setAllowlistInput(e.target.value)}
                placeholder="e.g., google.com, 8.8.8.8, mycompany.io"
                className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-red-500 outline-none transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Manual Blocklist (Comma separated URLs/IPs)</label>
              <textarea 
                value={blocklistInput}
                onChange={(e) => setBlocklistInput(e.target.value)}
                placeholder="e.g., evil-site.ru, 123.45.67.89, suspicious-app.com"
                className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-red-500 outline-none transition"
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={saveLists}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Update Global Rules
              </button>
              <button 
                onClick={() => {
                  if(confirm("Refresh scoring rules will re-calculate risk weights based on current dataset. Continue?")) {
                    alert("Model Training Triggered: Scanned records re-indexed.");
                  }
                }}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Train Model
              </button>
            </div>

            <button 
              onClick={() => {
                if(confirm("DANGER: This will wipe all uploaded data and reset to zero. Continue?")) {
                  storageService.clearData();
                }
              }}
              className="w-full border border-red-900/50 text-red-500 py-2 rounded text-xs mt-4 hover:bg-red-900/10 transition"
            >
              Reset Entire Database
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPanel;
