import React, { useState, useEffect } from 'react';

interface DashboardData {
  metrics: {
    totalScans: number;
    safeSites: number;
    suspiciousSites: number;
    dangerousSites: number;
  };
  targetedBrands: { brand: string; count: number }[];
  countries: { country: string; count: number }[];
  riskDistribution: {
    safeRange: number;
    lowRange: number;
    suspRange: number;
    highRange: number;
    critRange: number;
  };
  threatTrends: { date: string; safe: number; suspicious: number; dangerous: number }[];
}

interface DashboardProps {
  onNavigate: (view: 'SCANNER' | 'HISTORY' | 'ADMIN' | 'DASHBOARD') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching dashboard metrics:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-red-500 font-bold uppercase tracking-widest text-xs animate-pulse">Synchronizing Threat Intelligence...</p>
        </div>
      </div>
    );
  }

  if (!data || data.metrics.totalScans === 0) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-full border border-dashed border-red-950 flex items-center justify-center mx-auto bg-red-950/10">
          <span className="text-red-500 text-2xl">⚡</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">No Security Data Logs Found</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">The Lucifer Protocol scanning ledger is currently empty. Run your first threat scan to populate the security dashboard.</p>
        </div>
        <button
          onClick={() => onNavigate('SCANNER')}
          className="bg-red-600 hover:bg-red-500 text-white font-black px-8 py-3 rounded-lg text-xs tracking-widest uppercase transition-all duration-300"
        >
          Initiate Scanner
        </button>
      </div>
    );
  }

  const { metrics, targetedBrands, countries, riskDistribution, threatTrends } = data;

  // Safe vs Dangerous Donut calculations
  const total = metrics.totalScans;
  const safePercentage = Math.round((metrics.safeSites / total) * 100) || 0;
  const suspPercentage = Math.round((metrics.suspiciousSites / total) * 100) || 0;
  const dangPercentage = Math.round((metrics.dangerousSites / total) * 100) || 0;

  // Donut values (radius 35, circumference 220)
  const circ = 220;
  const dangOffset = circ - (dangPercentage / 100) * circ;
  const suspOffset = circ - ((dangPercentage + suspPercentage) / 100) * circ;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            Threat Intelligence Command Center
          </h2>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">Real-time analysis ledger & forensic telemetry</p>
        </div>
        <button
          onClick={() => onNavigate('SCANNER')}
          className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-6 py-3 rounded-xl uppercase tracking-widest transition duration-300 shadow-xl shadow-red-950/20 active:scale-95 border border-red-500/20"
        >
          New Deep Scan
        </button>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Total scans */}
        <div className="glass p-6 rounded-2xl border-l-4 border-slate-700 bg-slate-900/10 flex flex-col justify-between">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Scans Resolved</p>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-4xl md:text-5xl font-black text-white">{metrics.totalScans}</span>
            <span className="text-slate-600 text-xs font-bold uppercase">Hosts</span>
          </div>
        </div>

        {/* Safe Sites */}
        <div className="glass p-6 rounded-2xl border-l-4 border-emerald-600 bg-slate-900/10 flex flex-col justify-between">
          <p className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest">Clean / Safe Verticals</p>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-4xl md:text-5xl font-black text-emerald-400">{metrics.safeSites}</span>
            <span className="text-emerald-950 text-xs font-black uppercase tracking-wider">{safePercentage}%</span>
          </div>
        </div>

        {/* Suspicious Sites */}
        <div className="glass p-6 rounded-2xl border-l-4 border-amber-600 bg-slate-900/10 flex flex-col justify-between">
          <p className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest">Suspicious Logins</p>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-4xl md:text-5xl font-black text-amber-400">{metrics.suspiciousSites}</span>
            <span className="text-amber-950 text-xs font-black uppercase tracking-wider">{suspPercentage}%</span>
          </div>
        </div>

        {/* Dangerous Sites */}
        <div className="glass p-6 rounded-2xl border-l-4 border-red-600 bg-slate-900/10 flex flex-col justify-between">
          <p className="text-[10px] font-black text-red-500/80 uppercase tracking-widest">Malicious threat vectors</p>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-4xl md:text-5xl font-black text-red-500">{metrics.dangerousSites}</span>
            <span className="text-red-950 text-xs font-black uppercase tracking-wider">{dangPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Trends and Target Brands */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart (2/3 width) */}
        <div className="lg:col-span-2 glass p-6 rounded-3xl border border-slate-900 bg-slate-950/30 space-y-6">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Historical Threat Trend Velocity</h3>
            <p className="text-slate-500 text-xs mt-0.5">Chronological mapping of resolved risk profiles</p>
          </div>
          
          {/* SVG Line / Area Chart */}
          <div className="relative h-60 w-full">
            <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="safeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3"/>
              <line x1="0" y1="100" x2="500" y2="100" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3"/>
              <line x1="0" y1="150" x2="500" y2="150" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3"/>

              {/* Dynamic Path Calculation */}
              {(() => {
                const count = threatTrends.length;
                if (count < 2) return null;
                const pointsSafe: string[] = [];
                const pointsThreat: string[] = [];
                
                // Map values to coordinates
                const step = 500 / (count - 1);
                
                // Find max y value to scale chart
                const maxVal = Math.max(...threatTrends.map(t => t.safe + t.suspicious + t.dangerous), 5);
                
                threatTrends.forEach((t, i) => {
                  const x = i * step;
                  // Safe y-coord
                  const ySafe = 180 - (t.safe / maxVal) * 150;
                  pointsSafe.push(`${x},${ySafe}`);
                  
                  // Malicious + Suspicious (Threat) y-coord
                  const yThreat = 180 - ((t.dangerous + t.suspicious) / maxVal) * 150;
                  pointsThreat.push(`${x},${yThreat}`);
                });

                const dSafe = `M${pointsSafe.join(' L')}`;
                const dThreat = `M${pointsThreat.join(' L')}`;
                
                const areaSafe = `${dSafe} L500,180 L0,180 Z`;
                const areaThreat = `${dThreat} L500,180 L0,180 Z`;

                return (
                  <>
                    {/* Areas */}
                    <path d={areaSafe} fill="url(#safeGrad)" />
                    <path d={areaThreat} fill="url(#threatGrad)" />
                    
                    {/* Lines */}
                    <path d={dSafe} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                    <path d={dThreat} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                  </>
                );
              })()}
            </svg>
            
            {/* Legend */}
            <div className="absolute bottom-1 left-2 flex gap-4 text-[9px] font-black uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-emerald-500 rounded"></span>
                <span className="text-emerald-400">Clean Logs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-red-600 rounded"></span>
                <span className="text-red-500">Threat / Cyber Vectors</span>
              </div>
            </div>
          </div>
          
          {/* Trend dates row */}
          <div className="flex justify-between text-[9px] font-bold text-slate-600 uppercase tracking-widest px-2">
            {threatTrends.map((t, idx) => (
              <span key={idx} className={idx % 2 === 0 ? '' : 'hidden md:inline'}>{t.date}</span>
            ))}
          </div>
        </div>

        {/* Safe vs Danger Donut Gauge (1/3 width) */}
        <div className="glass p-6 rounded-3xl border border-slate-900 bg-slate-950/30 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Threat Index Ratio</h3>
            <p className="text-slate-500 text-xs mt-0.5">Scanned entities by integrity level</p>
          </div>

          <div className="flex justify-center py-6 relative">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
              {/* Outer Ring */}
              <circle cx="50" cy="50" r="35" fill="none" stroke="#1e293b" strokeWidth="8" />
              
              {/* Emerald Ring (Safe) */}
              <circle 
                cx="50" 
                cy="50" 
                r="35" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="8" 
                strokeDasharray={circ} 
                strokeDashoffset={circ - (safePercentage / 100) * circ}
                strokeLinecap="round"
              />
              
              {/* Amber Ring (Suspicious) */}
              {suspPercentage > 0 && (
                <circle 
                  cx="50" 
                  cy="50" 
                  r="35" 
                  fill="none" 
                  stroke="#f59e0b" 
                  strokeWidth="8" 
                  strokeDasharray={circ} 
                  strokeDashoffset={suspOffset}
                  strokeLinecap="round"
                />
              )}

              {/* Red Ring (Dangerous) */}
              {dangPercentage > 0 && (
                <circle 
                  cx="50" 
                  cy="50" 
                  r="35" 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="8" 
                  strokeDasharray={circ} 
                  strokeDashoffset={dangOffset}
                  strokeLinecap="round"
                />
              )}
            </svg>

            {/* Centered label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white leading-none">{dangPercentage}%</span>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Malicious</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-black uppercase tracking-wider">
            <div className="p-2 bg-slate-900/30 rounded border border-slate-900">
              <p className="text-emerald-500">Clean</p>
              <p className="text-white text-xs font-bold mt-1">{safePercentage}%</p>
            </div>
            <div className="p-2 bg-slate-900/30 rounded border border-slate-900">
              <p className="text-amber-500">Susp.</p>
              <p className="text-white text-xs font-bold mt-1">{suspPercentage}%</p>
            </div>
            <div className="p-2 bg-slate-900/30 rounded border border-slate-900">
              <p className="text-red-500">Danger</p>
              <p className="text-white text-xs font-bold mt-1">{dangPercentage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Second Grid: Brands, Geolocation, Risk Distribution */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Most Targeted Brands */}
        <div className="glass p-6 rounded-3xl border border-slate-900 bg-slate-950/30 space-y-4">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Spoofed Brands Matrix</h3>
            <p className="text-slate-500 text-xs">Phishing frequency by high-value trademark</p>
          </div>

          <div className="space-y-3 pt-2">
            {targetedBrands.length === 0 ? (
              <p className="text-slate-600 text-xs italic">No brand spoofing instances indexed.</p>
            ) : (
              targetedBrands.slice(0, 5).map((tb, idx) => {
                const maxCount = Math.max(...targetedBrands.map(b => b.count), 1);
                const barWidth = Math.round((tb.count / maxCount) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">{tb.brand}</span>
                      <span className="text-red-500">{tb.count} Scans</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-600 to-red-600 rounded-full"
                        style={{ width: `${barWidth}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Countries Hosting Threats */}
        <div className="glass p-6 rounded-3xl border border-slate-900 bg-slate-950/30 space-y-4">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Host Infrastructure Origin</h3>
            <p className="text-slate-500 text-xs">Attack nodes resolved by physical country</p>
          </div>

          <div className="space-y-3 pt-2">
            {countries.length === 0 ? (
              <p className="text-slate-600 text-xs italic">No physical nodes resolved.</p>
            ) : (
              countries.slice(0, 5).map((co, idx) => {
                const maxCount = Math.max(...countries.map(c => c.count), 1);
                const barWidth = Math.round((co.count / maxCount) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <span className="text-red-500">📍</span>
                        {co.country}
                      </span>
                      <span className="text-slate-400">{co.count} Nodes</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-600 rounded-full"
                        style={{ width: `${barWidth}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Risk Distribution curve */}
        <div className="glass p-6 rounded-3xl border border-slate-900 bg-slate-950/30 space-y-4">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Magnitude Distribution Curve</h3>
            <p className="text-slate-500 text-xs">Histogram representing scan risk counts</p>
          </div>

          {/* SVG Histograms */}
          <div className="flex items-end justify-between h-36 pt-4 px-2 relative">
            {(() => {
              const ranges = [
                { label: 'Safe', count: riskDistribution.safeRange, color: 'bg-emerald-500' },
                { label: 'Low', count: riskDistribution.lowRange, color: 'bg-teal-500' },
                { label: 'Susp.', count: riskDistribution.suspRange, color: 'bg-amber-500' },
                { label: 'High', count: riskDistribution.highRange, color: 'bg-orange-600' },
                { label: 'Crit.', count: riskDistribution.critRange, color: 'bg-red-600' }
              ];
              const maxCount = Math.max(...ranges.map(r => r.count), 1);

              return ranges.map((r, idx) => {
                const barHeight = Math.round((r.count / maxCount) * 85); // max 85% height
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-[9px] font-black text-slate-500">{r.count}</span>
                    <div className="w-8 bg-slate-900/50 rounded-t-md relative overflow-hidden flex items-end h-24">
                      <div 
                        className={`w-full ${r.color} rounded-t-md transition-all duration-500`}
                        style={{ height: `${barHeight}%` }}
                      ></div>
                    </div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{r.label}</span>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
