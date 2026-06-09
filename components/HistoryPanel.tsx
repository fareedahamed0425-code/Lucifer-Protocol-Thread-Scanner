import React, { useState, useEffect } from 'react';
import { ScanResult } from '../types';

interface HistoryPanelProps {
  onSelectScan: (scan: ScanResult) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ onSelectScan }) => {
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    setLoading(true);
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching scan history:', err);
        setLoading(false);
      });
  };

  const handleClearHistory = () => {
    if (confirm("DANGER: Are you sure you want to permanently delete all scan records? This action cannot be undone.")) {
      setLoading(true);
      fetch('/api/admin/clear', {
        method: 'POST'
      })
      .then(res => {
        if (!res.ok) throw new Error('Clear history failed');
        setHistory([]);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error clearing scan history:', err);
        alert('SYSTEM ERROR: Could not clear database history.');
        setLoading(false);
      });
    }
  };

  const getScoreBg = (score: number) => {
    if (score <= 20) return 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60';
    if (score <= 40) return 'bg-teal-950/40 text-teal-400 border-teal-800/60';
    if (score <= 60) return 'bg-amber-950/40 text-amber-400 border-amber-800/60';
    if (score <= 80) return 'bg-orange-950/40 text-orange-400 border-orange-850/60';
    return 'bg-red-950/40 text-red-500 border-red-800/60';
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.url.toLowerCase().includes(search.toLowerCase()) || 
                          item.resolvedIp.toLowerCase().includes(search.toLowerCase()) ||
                          item.domain.toLowerCase().includes(search.toLowerCase());
    
    if (filterLevel === 'ALL') return matchesSearch;
    if (filterLevel === 'SAFE') return matchesSearch && item.riskScore <= 20;
    if (filterLevel === 'SUSPICIOUS') return matchesSearch && item.riskScore > 20 && item.riskScore <= 60;
    if (filterLevel === 'DANGEROUS') return matchesSearch && item.riskScore > 60;
    return matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <header className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            🛡️ Threat Scanner Database
          </h2>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mt-1">Audit log of all resolved threat evaluations</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchHistory}
            className="text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
          >
            🔄 Refresh
          </button>
          {history.length > 0 && (
            <button 
              onClick={handleClearHistory}
              className="text-red-500 hover:text-white bg-red-950/20 hover:bg-red-600 border border-red-900/30 hover:border-red-500 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
            >
              🗑️ Clear History
            </button>
          )}
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search logs by URL, Domain, or Resolved IP address..."
          className="bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-red-500 transition-all flex-1"
        />

        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 text-[10px] font-black uppercase tracking-wider">
          {['ALL', 'SAFE', 'SUSPICIOUS', 'DANGEROUS'].map(level => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`px-4 py-2 rounded-lg transition-all ${filterLevel === level ? 'bg-red-600 text-white shadow-lg shadow-red-950/20' : 'text-slate-400 hover:text-white'}`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">Loading Scan Ledger...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-900 rounded-3xl bg-slate-950/20">
          <p className="text-slate-600 italic text-sm">No threat logs matched the filter criteria.</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-slate-900 rounded-2xl shadow-xl bg-slate-950/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-900 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Threat Index</th>
                <th className="px-6 py-4">Target Domain & URL</th>
                <th className="px-6 py-4">Network Info</th>
                <th className="px-6 py-4">Scan Timestamp</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/10 transition group">
                  
                  {/* Score badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold border ${getScoreBg(item.riskScore)}`}>
                      {item.riskScore} • {item.riskLevel}
                    </span>
                  </td>

                  {/* Domain/URL */}
                  <td className="px-6 py-4 max-w-[280px]">
                    <div className="font-bold text-slate-200 text-sm truncate">{item.domain}</div>
                    <div className="text-[10px] text-slate-600 truncate font-medium mt-0.5">{item.url}</div>
                  </td>

                  {/* IP/Geo */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs font-mono text-slate-300">{item.resolvedIp}</div>
                    <div className="text-[10px] text-slate-600 font-bold uppercase mt-0.5">
                      📍 {item.modules?.ip?.rawData?.country || 'Unknown'}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                    {new Date(item.timestamp).toLocaleString()}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={() => onSelectScan(item)}
                      className="text-xs uppercase tracking-wider font-black text-red-500 hover:text-white bg-red-950/10 hover:bg-red-600 border border-red-950 hover:border-red-500 px-3 py-1.5 rounded-lg transition-all duration-300"
                    >
                      Inspect Report
                    </button>
                    
                    <a
                      href={`/api/report/pdf/${item.id}`}
                      download
                      className="inline-block text-xs uppercase tracking-wider font-black text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg transition-all"
                    >
                      Export PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
