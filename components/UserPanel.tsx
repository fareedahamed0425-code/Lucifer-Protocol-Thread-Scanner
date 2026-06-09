import React, { useState, useEffect } from 'react';
import { ScanResult } from '../types';

interface UserPanelProps {
  activeScan?: ScanResult | null;
  setActiveScan?: (scan: ScanResult | null) => void;
}

const UserPanel: React.FC<UserPanelProps> = ({ activeScan, setActiveScan }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanStep, setScanStep] = useState(0);

  const scanSteps = [
    "⚡ BOOTING LUCIFER FORENSIC CORE...",
    "🔍 PARSING URL STRUCTURE...",
    "🌐 RESOLVING IP INFRASTRUCTURE & GEOLOCATION...",
    "📡 MATCHING DATASET FINGERPRINTS...",
    "📦 AUDITING DNS RECORDS & SPF/DMARC POLICIES...",
    "🔒 VERIFYING SSL/TLS HANDSHAKE...",
    "📝 ANALYZING HTML FOR CREDENTIAL HARVESTING...",
    "📸 CAPTURING WEBPAGE SCREENSHOT...",
    "🧠 ENGAGING GEMINI MULTIMODAL VISION CORE...",
    "📊 AGGREGATING THREAT MAGNITUDE WEIGHTS..."
  ];

  // If a historical scan is active, render it
  useEffect(() => {
    if (activeScan) {
      setResult(activeScan);
      setUrl(activeScan.url);
    }
  }, [activeScan]);

  useEffect(() => {
    let interval: any;
    if (loading) {
      setScanStep(0);
      interval = setInterval(() => {
        setScanStep(prev => (prev < scanSteps.length - 1 ? prev + 1 : prev));
      }, 950);
    } else {
      setScanStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    setLoading(true);
    setResult(null);
    if (setActiveScan) setActiveScan(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseErr) {
        throw new Error(`Failed to communicate with scanning backend (Status: ${response.status}). Please make sure the Lucifer backend server is running on port 5000.`);
      }

      if (!response.ok) {
        throw new Error(responseData.error || 'Server error occurred');
      }

      setResult(responseData);
      if (setActiveScan) setActiveScan(responseData);
    } catch (err: any) {
      console.error("Forensic Scan Crash:", err);
      alert(`SYSTEM FAILURE: ${err.message || 'The Lucifer Protocol encountered an exception.'}`);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 20) return 'text-emerald-400';
    if (score <= 40) return 'text-teal-400';
    if (score <= 60) return 'text-amber-400';
    if (score <= 80) return 'text-orange-500';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score <= 20) return 'bg-emerald-950/40 text-emerald-400 border-emerald-800';
    if (score <= 40) return 'bg-teal-950/40 text-teal-400 border-teal-800';
    if (score <= 60) return 'bg-amber-950/40 text-amber-400 border-amber-800';
    if (score <= 80) return 'bg-orange-950/40 text-orange-400 border-orange-850';
    return 'bg-red-950/40 text-red-500 border-red-800';
  };

  const getCardBorder = (score: number) => {
    if (score <= 20) return 'border-emerald-950 hover:border-emerald-800/60';
    if (score <= 40) return 'border-teal-950 hover:border-teal-800/60';
    if (score <= 60) return 'border-amber-950 hover:border-amber-800/60';
    if (score <= 80) return 'border-orange-950 hover:border-orange-800/60';
    return 'border-red-950 hover:border-red-800/60';
  };

  const circumference = 502.65;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-12">
      
      {/* Title Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${result || loading ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`}></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {loading ? 'Scanning Core: Active' : result ? 'Telemetry: Ready' : 'Scanning Core: Standby'}
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
          LUCIFER <span className="text-red-600 font-light">SCANNER</span>
        </h2>
        <p className="text-slate-500 text-xs max-w-lg mx-auto font-bold uppercase tracking-wider">
          Deep deconstruction of URL attributes, DNS patterns, and host reputations
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleScan} className="relative group max-w-4xl mx-auto transition-all duration-500">
        <div className={`absolute -inset-1.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur transition duration-1000 ${loading ? 'opacity-40 animate-pulse' : 'opacity-10 group-hover:opacity-25'}`}></div>

        <div className="relative flex flex-col md:flex-row items-stretch md:items-center bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden p-2">
          <div className="flex-1 flex items-center px-4">
            <span className="text-red-600 font-black text-xl mr-3 select-none">://</span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter target URL for modular threat analysis..."
              className="w-full bg-transparent py-4 text-white outline-none text-base font-semibold placeholder:text-slate-700 font-mono"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-500 disabled:bg-slate-900 text-white font-black px-10 py-4 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-red-950/20 text-xs tracking-wider uppercase"
          >
            {loading ? 'DECONSTRUCTING...' : 'RESOLVE THREATS'}
          </button>
        </div>
      </form>

      {/* Timeline loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 animate-in fade-in max-w-lg mx-auto space-y-6">
          <p className="text-white text-xs font-black font-mono tracking-widest text-center animate-pulse">
            {scanSteps[scanStep]}
          </p>
          <div className="w-full h-1 bg-red-950/30 rounded-full relative overflow-hidden">
            <div 
              className="absolute h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-500"
              style={{ width: `${(scanStep + 1) * 10}%` }}
            ></div>
          </div>
          <div className="space-y-1 text-center text-[10px] font-mono text-slate-500">
            <p>Concurrently spawning 16 analytical threads...</p>
            <p>SSRF protections check completed.</p>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="animate-in slide-in-from-bottom-8 fade-in duration-500 space-y-8">
          
          {/* Executive Row (Gauge and AI Assessment) */}
          <div className="grid lg:grid-cols-3 gap-8 items-stretch">
            
            {/* Risk Gauge */}
            <div className="glass p-8 rounded-3xl border border-slate-900 bg-slate-950/20 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10 font-mono text-[8px] font-black tracking-widest uppercase text-slate-600 select-none">
                Risk Engine
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Threat Index</p>
              
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#10172a" strokeWidth="12" />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
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
                  <span className={`text-6xl font-black leading-none ${getScoreColor(result.riskScore)}`}>
                    {result.riskScore}
                  </span>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider mt-1.5">Score</span>
                </div>
              </div>
              
              <span className={`px-4 py-1 rounded border text-xs font-bold uppercase tracking-widest mt-6 ${getScoreBg(result.riskScore)}`}>
                {result.riskLevel}
              </span>
            </div>

            {/* AI Summary and recommendation */}
            <div className="lg:col-span-2 glass p-8 rounded-3xl border border-slate-900 bg-slate-950/20 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    AI Security Analyst Core
                  </span>
                  <a
                    href={`/api/report/pdf/${result.id}`}
                    download
                    className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition active:scale-95 shadow-lg shadow-red-950/15"
                  >
                    Export PDF Report
                  </a>
                </div>
                <h3 className="text-xl font-bold text-white leading-relaxed">{result.aiSummary}</h3>
              </div>

              <div className="p-4 bg-slate-900/30 rounded-2xl border border-slate-800 space-y-1">
                <h4 className="text-[9px] font-black text-red-500 uppercase tracking-widest">Recommendation</h4>
                <p className="text-slate-300 font-bold text-xs leading-normal">{result.recommendation}</p>
              </div>
            </div>
          </div>

          {/* Deep AI Site Profiler (Website Purpose, Data Collected, Threats Found) */}
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Website Purpose */}
            <div className="glass p-6 rounded-2xl border border-slate-900 bg-slate-950/10 space-y-3">
              <h4 className="text-[9px] font-black text-red-500 uppercase tracking-widest">Website Purpose Profile</h4>
              <p className="text-sm font-bold text-slate-200 leading-relaxed">
                {result.websitePurpose || 'Resolving physical purpose...'}
              </p>
            </div>

            {/* User Data Footprint */}
            <div className="glass p-6 rounded-2xl border border-slate-900 bg-slate-950/10 space-y-3">
              <h4 className="text-[9px] font-black text-red-500 uppercase tracking-widest">User Data Footprint</h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {result.dataCollected && result.dataCollected.length > 0 ? (
                  result.dataCollected.map((data, idx) => {
                    const isSensitive = ['password', 'credential', 'credit card', 'payment', 'ssn', 'identity'].some(kw => data.toLowerCase().includes(kw));
                    return (
                      <span 
                        key={idx} 
                        className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${isSensitive ? 'bg-red-950/30 text-red-400 border-red-900/40' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
                      >
                        {data}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-slate-500 text-xs italic">No collection vectors identified.</span>
                )}
              </div>
            </div>

            {/* Identified Risk Tags */}
            <div className="glass p-6 rounded-2xl border border-slate-900 bg-slate-950/10 space-y-3">
              <h4 className="text-[9px] font-black text-red-500 uppercase tracking-widest">Identified Attack Vectors</h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {result.threatsFound && result.threatsFound.length > 0 ? (
                  result.threatsFound.map((threat, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-orange-950/20 text-orange-400 border border-orange-900/30"
                    >
                      ⚠️ {threat}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-xs italic">No risk tags detected.</span>
                )}
              </div>
            </div>
          </div>

          {/* Explainable AI findings row */}
          {result.reasons && result.reasons.length > 0 && (
            <div className="glass p-6 rounded-2xl border border-slate-900 bg-slate-950/10 space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Explainable AI Risk Rationale</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {result.reasons.map((reason, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start text-xs font-bold">
                    <span className="text-red-500">✓</span>
                    <p className="text-slate-300 font-mono">{reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Screenshot and Brand Impersonation Card */}
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Visual Screenshot */}
            <div className="lg:col-span-2 glass p-6 rounded-3xl border border-slate-900 bg-slate-950/20 space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Forensic Screenshot Record</h4>
              <div className="border border-slate-900 rounded-2xl overflow-hidden bg-slate-950 h-72 relative flex items-center justify-center">
                {result.screenshotUrl ? (
                  <img 
                    src={result.screenshotUrl} 
                    alt="Web screenshot" 
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="text-center text-slate-600 text-xs italic p-6">Screenshot capture unavailable for allowlisted/blocklisted override scans.</div>
                )}
              </div>
            </div>

            {/* Brand Similarity Analysis Card */}
            <div className="glass p-6 rounded-3xl border border-slate-900 bg-slate-950/20 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Spoofing Analysis</h4>
                
                {result.modules?.visualSimilarity?.rawData?.impersonatedBrand ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-red-950/10 border-2 border-red-500/30 rounded-xl space-y-1">
                      <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Detected Mockup Target</p>
                      <p className="text-lg font-black text-white">{result.modules.visualSimilarity.rawData.impersonatedBrand} spoofing</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-300">
                        <span>Layout Similarity Metric</span>
                        <span className="text-red-500">{result.modules.visualSimilarity.rawData.visualSimilarityScore}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-600 rounded-full" 
                          style={{ width: `${result.modules.visualSimilarity.rawData.visualSimilarityScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-600 text-xs italic">No brand logo or portal structure spoofing identified.</div>
                )}
              </div>

              <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-500 leading-normal">
                <p className="font-bold uppercase text-red-500/60 mb-1 select-none">AI Vision Log</p>
                {result.modules?.visualSimilarity?.rawData?.details || 'No visual anomalies reported.'}
              </div>
            </div>
          </div>

          {/* Module Scorecards Section */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-slate-900 pb-2">Modular Scorecard Logs</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Module 1: URL Scorecard */}
              {result.modules?.url && (
                <div className={`glass p-6 rounded-2xl border bg-slate-900/10 hover:bg-slate-900/20 transition-all space-y-4 flex flex-col justify-between ${getCardBorder(result.modules.url.score)}`}>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">URL Structure</span>
                      <span className={`text-xs font-bold font-mono ${getScoreColor(result.modules.url.score)}`}>{result.modules.url.score}/100</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono space-y-1 pt-1.5">
                      <p><strong className="text-slate-500">Domain:</strong> {result.modules.url.rawData.domain}</p>
                      <p><strong className="text-slate-500">Subdomains:</strong> {result.modules.url.rawData.subdomain || 'None'}</p>
                      <p><strong className="text-slate-500">TLD:</strong> {result.modules.url.rawData.tld}</p>
                      <p><strong className="text-slate-500">Protocol:</strong> {result.modules.url.rawData.protocol}</p>
                    </div>
                  </div>
                  <div className="border-t border-slate-900/50 pt-3 space-y-1.5 text-[10px] text-slate-500 font-medium leading-relaxed">
                    {result.modules.url.findings.slice(0, 2).map((f: string, i: number) => (
                      <p key={i} className="truncate">• {f}</p>
                    )) || 'No red flags'}
                  </div>
                </div>
              )}

              {/* Module 2: Domain Scorecard */}
              {result.modules?.domain && (
                <div className={`glass p-6 rounded-2xl border bg-slate-900/10 hover:bg-slate-900/20 transition-all space-y-4 flex flex-col justify-between ${getCardBorder(result.modules.domain.score)}`}>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">WHOIS Registry</span>
                      <span className={`text-xs font-bold font-mono ${getScoreColor(result.modules.domain.score)}`}>{result.modules.domain.score}/100</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono space-y-1 pt-1.5">
                      <p><strong className="text-slate-500">Registrar:</strong> {result.modules.domain.rawData.registrar || 'N/A'}</p>
                      <p><strong className="text-slate-500">Domain Age:</strong> {result.modules.domain.rawData.domainAgeDays !== undefined ? `${result.modules.domain.rawData.domainAgeDays} days` : 'N/A'}</p>
                      <p><strong className="text-slate-500">Term Length:</strong> {result.modules.domain.rawData.registrationDurationDays !== undefined ? `${Math.round(result.modules.domain.rawData.registrationDurationDays / 365)} years` : 'N/A'}</p>
                      <p><strong className="text-slate-500">WHOIS Status:</strong> {result.modules.domain.rawData.isHiddenWhois ? 'Hidden / Redacted' : 'Public / Unredacted'}</p>
                    </div>
                  </div>
                  <div className="border-t border-slate-900/50 pt-3 space-y-1.5 text-[10px] text-slate-500 font-medium leading-relaxed">
                    {result.modules.domain.findings.slice(0, 2).map((f: string, i: number) => (
                      <p key={i} className="truncate">• {f}</p>
                    )) || 'No red flags'}
                  </div>
                </div>
              )}

              {/* Module 3: DNS Scorecard */}
              {result.modules?.dns && (
                <div className={`glass p-6 rounded-2xl border bg-slate-900/10 hover:bg-slate-900/20 transition-all space-y-4 flex flex-col justify-between ${getCardBorder(result.modules.dns.score)}`}>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">DNS Configurations</span>
                      <span className={`text-xs font-bold font-mono ${getScoreColor(result.modules.dns.score)}`}>{result.modules.dns.score}/100</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono space-y-1 pt-1.5">
                      <p><strong className="text-slate-500">A Records:</strong> {result.modules.dns.rawData.aRecords?.length || 0} resolved</p>
                      <p><strong className="text-slate-500">SPF Record:</strong> {result.modules.dns.rawData.securityChecks?.spf?.present ? '✓ Verified' : '⚠ Missing'}</p>
                      <p><strong className="text-slate-500">DMARC Record:</strong> {result.modules.dns.rawData.securityChecks?.dmarc?.present ? '✓ Verified' : '⚠ Missing'}</p>
                      <p><strong className="text-slate-500">DKIM Check:</strong> {result.modules.dns.rawData.securityChecks?.dkim?.present ? '✓ Detected' : 'No Selector Found'}</p>
                    </div>
                  </div>
                  <div className="border-t border-slate-900/50 pt-3 space-y-1.5 text-[10px] text-slate-500 font-medium leading-relaxed">
                    {result.modules.dns.findings.slice(0, 2).map((f: string, i: number) => (
                      <p key={i} className="truncate">• {f}</p>
                    )) || 'No red flags'}
                  </div>
                </div>
              )}

              {/* Module 4: IP Scorecard */}
              {result.modules?.ip && (
                <div className={`glass p-6 rounded-2xl border bg-slate-900/10 hover:bg-slate-900/20 transition-all space-y-4 flex flex-col justify-between ${getCardBorder(result.modules.ip.score)}`}>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">IP Geolocation</span>
                      <span className={`text-xs font-bold font-mono ${getScoreColor(result.modules.ip.score)}`}>{result.modules.ip.score}/100</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono space-y-1 pt-1.5">
                      <p><strong className="text-slate-500">IP:</strong> {result.resolvedIp}</p>
                      <p><strong className="text-slate-500">Country:</strong> {result.modules.ip.rawData.country || 'Unknown'}</p>
                      <p><strong className="text-slate-500">ASN:</strong> {result.modules.ip.rawData.asn || 'N/A'}</p>
                      <p><strong className="text-slate-500">Provider:</strong> {result.modules.ip.rawData.isp || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="border-t border-slate-900/50 pt-3 space-y-1.5 text-[10px] text-slate-500 font-medium leading-relaxed">
                    {result.modules.ip.findings.slice(0, 2).map((f: string, i: number) => (
                      <p key={i} className="truncate">• {f}</p>
                    )) || 'No red flags'}
                  </div>
                </div>
              )}

              {/* Module 5: SSL Scorecard */}
              {result.modules?.ssl && (
                <div className={`glass p-6 rounded-2xl border bg-slate-900/10 hover:bg-slate-900/20 transition-all space-y-4 flex flex-col justify-between ${getCardBorder(result.modules.ssl.score)}`}>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">SSL/TLS Certificates</span>
                      <span className={`text-xs font-bold font-mono ${getScoreColor(result.modules.ssl.score)}`}>{result.modules.ssl.score}/100</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono space-y-1 pt-1.5">
                      <p><strong className="text-slate-500">Issuer:</strong> {result.modules.ssl.rawData.issuer || 'N/A'}</p>
                      <p><strong className="text-slate-500">TLS Version:</strong> {result.modules.ssl.rawData.tlsVersion || 'N/A'}</p>
                      <p><strong className="text-slate-500">Algorithm:</strong> {result.modules.ssl.rawData.signatureAlgorithm || 'N/A'}</p>
                      <p><strong className="text-slate-500">Validity:</strong> {result.modules.ssl.rawData.daysRemaining !== undefined ? `${result.modules.ssl.rawData.daysRemaining} days left` : 'Expired'}</p>
                    </div>
                  </div>
                  <div className="border-t border-slate-900/50 pt-3 space-y-1.5 text-[10px] text-slate-500 font-medium leading-relaxed">
                    {result.modules.ssl.findings.slice(0, 2).map((f: string, i: number) => (
                      <p key={i} className="truncate">• {f}</p>
                    )) || 'No red flags'}
                  </div>
                </div>
              )}

              {/* Module 6: Content Scorecard */}
              {result.modules?.content && (
                <div className={`glass p-6 rounded-2xl border bg-slate-900/10 hover:bg-slate-900/20 transition-all space-y-4 flex flex-col justify-between ${getCardBorder(result.modules.content.score)}`}>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">HTML Content Audit</span>
                      <span className={`text-xs font-bold font-mono ${getScoreColor(result.modules.content.score)}`}>{result.modules.content.score}/100</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono space-y-1 pt-1.5">
                      <p><strong className="text-slate-500">Credential Form:</strong> {result.modules.content.rawData.hasPasswordFields ? '⚠ Password Input Detected' : '✓ None Found'}</p>
                      <p><strong className="text-slate-500">Hidden Inputs:</strong> {result.modules.content.rawData.hiddenFieldsCount || 0} fields</p>
                      <p><strong className="text-slate-500">Inline Frames (Iframes):</strong> {result.modules.content.rawData.iframeCount || 0} frame(s)</p>
                      <p><strong className="text-slate-500">Obfuscated JS:</strong> {result.modules.content.rawData.hasObfuscatedJS ? '⚠ High Risk Functions Found' : '✓ Safe syntax'}</p>
                    </div>
                  </div>
                  <div className="border-t border-slate-900/50 pt-3 space-y-1.5 text-[10px] text-slate-500 font-medium leading-relaxed">
                    {result.modules.content.findings.slice(0, 2).map((f: string, i: number) => (
                      <p key={i} className="truncate">• {f}</p>
                    )) || 'No red flags'}
                  </div>
                </div>
              )}

              {/* Module 8: Threat Feed Scorecard */}
              {result.modules?.threatIntel && (
                <div className={`glass p-6 rounded-2xl border bg-slate-900/10 hover:bg-slate-900/20 transition-all space-y-4 flex flex-col justify-between ${getCardBorder(result.modules.threatIntel.score)}`}>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Reputation Feeds</span>
                      <span className={`text-xs font-bold font-mono ${getScoreColor(result.modules.threatIntel.score)}`}>{result.modules.threatIntel.score}/100</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono space-y-1 pt-1.5">
                      <p><strong className="text-slate-500">VirusTotal Scan:</strong> {result.modules.threatIntel.rawData.vtReported ? '⚠ Blacklisted' : '✓ Harmless'}</p>
                      <p><strong className="text-slate-500">AbuseIPDB Score:</strong> {result.modules.threatIntel.rawData.abuseReportsCount > 0 ? '⚠ Reports Found' : '✓ 0 Reports'}</p>
                      <p><strong className="text-slate-500">OpenPhish Feed:</strong> {result.modules.threatIntel.rawData.openPhishListed ? '⚠ Active Listing' : '✓ Unregistered'}</p>
                      <p><strong className="text-slate-500">PhishTank DB:</strong> {result.modules.threatIntel.rawData.phishTankListed ? '⚠ Active Listing' : '✓ Unregistered'}</p>
                    </div>
                  </div>
                  <div className="border-t border-slate-900/50 pt-3 space-y-1.5 text-[10px] text-slate-500 font-medium leading-relaxed">
                    {result.modules.threatIntel.findings.slice(0, 2).map((f: string, i: number) => (
                      <p key={i} className="truncate">• {f}</p>
                    )) || 'No matches'}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPanel;
