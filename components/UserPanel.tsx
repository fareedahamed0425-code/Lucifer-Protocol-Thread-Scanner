
import React, { useState, useEffect } from 'react';
import { analysisService } from '../services/analysisService';
import { ScanResult, ThreatLabel } from '../types';

const UserPanel: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanStep, setScanStep] = useState(0);

  const scanSteps = [
    "BOOTING LUCIFER FORENSIC CORE...",
    "RESOLVING NETWORK INFRASTRUCTURE...",
    "MATCHING DATASET FINGERPRINTS...",
    "UPLOADING TO AI REASONING CLOUD...",
    "DECONSTRUCTING ATTACK VECTORS...",
    "GENERATING PROBABILITY MAGNITUDE..."
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      setScanStep(0);
      interval = setInterval(() => {
        setScanStep(prev => (prev < scanSteps.length - 1 ? prev + 1 : prev));
      }, 700);
    } else {
      setScanStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http') && !targetUrl.includes('://')) {
      targetUrl = 'https://' + targetUrl;
    }

    setLoading(true);
    setResult(null);
    try {
      const scanResult = await analysisService.scanUrl(targetUrl);
      setResult(scanResult);
    } catch (err) {
      console.error("Forensic Scan Crash:", err);
      alert("SYSTEM FAILURE: The Lucifer Protocol encountered a catastrophic exception.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-emerald-400';
    if (score < 70) return 'text-amber-400';
    return 'text-red-500';
  };

  const getLabelBadge = (label: ThreatLabel) => {
    switch (label) {
      case ThreatLabel.SAFE: return 'bg-emerald-900/40 text-emerald-400 border-emerald-800';
      case ThreatLabel.SUSPICIOUS: return 'bg-amber-900/40 text-amber-400 border-amber-800';
      case ThreatLabel.MALICIOUS: return 'bg-red-900/40 text-red-400 border-red-800';
      default: return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  };

  const circumference = 502.65;

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${result || loading ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`}></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {loading ? 'AI Link: Active' : result ? 'AI Link: Standby' : 'AI Link: Offline'}
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
          <span className="text-red-600">LUCIFER</span> <span className="font-light">SCANNER</span>
        </h2>
        <p className="text-slate-500 text-sm max-w-lg mx-auto font-medium uppercase tracking-wider">
          Student Innovation Hackathon Project BS4: Attack Identification using IP Data
        </p>
      </div>

      <form 
        onSubmit={handleScan} 
        className="relative group transition-all duration-500"
      >
        <div className={`absolute -inset-1 bg-gradient-to-r from-red-600 to-transparent rounded-2xl blur transition duration-1000 ${loading ? 'opacity-50 animate-pulse' : 'opacity-10 group-hover:opacity-30'}`}></div>
        
        <div className="relative flex flex-col md:flex-row items-stretch md:items-center bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
          <div className="flex-1 flex items-center px-4 md:px-6">
            <span className="text-red-500 font-black text-xl mr-2">://</span>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Inject target URL for deep deconstruction..."
              className="w-full bg-transparent py-6 text-white outline-none text-lg font-medium placeholder:text-slate-700 mono"
              required
            />
          </div>
          
          <div className="p-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-red-600 hover:bg-red-500 disabled:bg-slate-900 text-white font-black px-10 py-4 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-red-950/20"
            >
              {loading ? 'ANALYZING...' : 'INITIATE SCAN'}
            </button>
          </div>
        </div>
      </form>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 animate-in fade-in">
           <p className="text-white text-sm font-black mono tracking-widest animate-pulse">{scanSteps[scanStep]}</p>
           <div className="w-48 h-[1px] bg-red-900/30 mt-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-red-600 animate-slide"></div>
           </div>
           <style>{`
             @keyframes slide {
               0% { transform: translateX(-100%); }
               100% { transform: translateX(100%); }
             }
             .animate-slide { animation: slide 1.5s infinite linear; }
           `}</style>
        </div>
      )}

      {result && !loading && (
        <div className="animate-in slide-in-from-bottom-8 fade-in duration-500 space-y-6">
          {result.label === ThreatLabel.MALICIOUS && (
            <div className="glass p-6 rounded-2xl border-2 border-red-500 bg-red-950/30 animate-pulse shadow-lg shadow-red-950/50">
              <div className="flex items-start gap-3">
                <div className="text-red-500 text-3xl font-black mt-1">⚠</div>
                <div>
                  <h3 className="text-xl font-black text-red-400 uppercase tracking-wider mb-2">CRITICAL THREAT DETECTED</h3>
                  <p className="text-red-300 text-sm font-medium">This URL has been flagged as MALICIOUS. DO NOT ACCESS this website. It may contain malware, phishing, or other dangerous content.</p>
                </div>
              </div>
            </div>
          )}
          {result.label === ThreatLabel.SUSPICIOUS && (
            <div className="glass p-6 rounded-2xl border-2 border-amber-500 bg-amber-950/30 shadow-lg shadow-amber-950/30">
              <div className="flex items-start gap-3">
                <div className="text-amber-500 text-3xl font-black mt-1">⚡</div>
                <div>
                  <h3 className="text-xl font-black text-amber-400 uppercase tracking-wider mb-2">SUSPICIOUS ACTIVITY DETECTED</h3>
                  <p className="text-amber-300 text-sm font-medium">This URL shows suspicious characteristics. Exercise caution before accessing.</p>
                </div>
              </div>
            </div>
          )}
          <div className="glass p-8 rounded-3xl border-l-8 border-red-600 relative overflow-hidden shadow-2xl">
            <div className="flex flex-col lg:flex-row justify-between gap-10">
              <div className="flex-1 space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded text-[10px] font-black tracking-widest border uppercase ${getLabelBadge(result.label)}`}>
                      {result.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      Type: {result.attackType}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mono break-all tracking-tighter">{result.url}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Target IP</p>
                    <p className="text-lg text-white mono font-bold">{result.resolvedIp}</p>
                  </div>
                  <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Reputation</p>
                    <p className="text-sm text-slate-300 font-bold leading-tight">{result.ipReputation}</p>
                  </div>
                </div>

                <div className="p-6 bg-slate-900/20 rounded-2xl border border-slate-800/50">
                  <h4 className="text-[10px] font-black text-red-500/60 mb-3 uppercase tracking-widest">Forensic Evidence & Computational Output</h4>
                  <p className="text-slate-400 text-sm leading-relaxed mono whitespace-pre-wrap break-words">
                    {result.evidence}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-8 bg-slate-900/20 rounded-3xl border border-slate-800/50 min-w-[240px]">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Threat Magnitude</p>
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="85" fill="none" stroke="#0f172a" strokeWidth="12" />
                    <circle
                      cx="100"
                      cy="100"
                      r="85"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="12"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - (result.riskScore / 100) * circumference}
                      strokeLinecap="round"
                      className={`${getScoreColor(result.riskScore)} transition-all duration-1000 ease-out`}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className={`text-5xl font-black ${getScoreColor(result.riskScore)}`}>
                      {result.riskScore}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 font-black mt-6 tracking-[0.3em] uppercase">Score Matrix v2.0</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPanel;
