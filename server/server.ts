import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dns from 'dns/promises';
import dotenv from 'dotenv';

// Load Environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config();

// Import Services
import { urlAnalyzer } from './services/urlAnalyzer';
import { whoisService } from './services/whoisService';
import { dnsService } from './services/dnsService';
import { ipService } from './services/ipService';
import { sslService } from './services/sslService';
import { contentAnalyzer } from './services/contentAnalyzer';
import { threatIntelService } from './services/threatIntelService';
import { screenshotEngine } from './services/screenshotEngine';
import { visualSimilarity } from './services/visualSimilarity';
import { riskEngine } from './services/riskEngine';
import { aiAnalyst } from './services/aiAnalyst';
import { reportGenerator } from './services/reportGenerator';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve Static Screenshots
app.use('/public/screenshots', express.static(path.join(__dirname, 'public/screenshots')));

// Database File Path
const isVercel = !!process.env.VERCEL;
const DB_PATH = isVercel 
  ? path.join('/tmp', 'database.json') 
  : path.join(__dirname, 'database.json');

// Interface definition for DB structure
interface DBStructure {
  scans: any[];
  allowlist: string[];
  blocklist: string[];
}

// Initial DB template
const initialDb: DBStructure = {
  scans: [],
  allowlist: ['google.com', 'microsoft.com', 'github.com', 'paypal.com'],
  blocklist: ['phish-login-alert.xyz', 'paypal-secure-update.ru', '127.0.0.1']
};

// Helper: Read DB
const readDb = (): DBStructure => {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return initialDb;
  }
};

// Helper: Write DB
const writeDb = (data: DBStructure) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// Helper: Check if IP is private (SSRF Prevention)
const isPrivateIp = (ip: string): boolean => {
  if (ip === '127.0.0.1' || ip === '::1' || ip === '0.0.0.0') return true;
  
  // IPv4 Private blocks: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16
  const parts = ip.split('.').map(Number);
  if (parts.length === 4) {
    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
  }

  // IPv6 Private blocks: fc00::/7 (Unique Local), fe80::/10 (Link Local)
  if (ip.toLowerCase().startsWith('fc') || ip.toLowerCase().startsWith('fd') || ip.toLowerCase().startsWith('fe8')) return true;

  return false;
};

// Route 1: Scan URL
app.post('/api/scan', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  // 1. Parse URL & domain
  let domain = '';
  try {
    const parsed = new URL(targetUrl);
    domain = parsed.hostname;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // 2. SSRF check by resolving DNS
  let resolvedIp = '';
  try {
    const ips = await dns.resolve4(domain);
    if (ips.length > 0) {
      resolvedIp = ips[0];
    }
  } catch (e) {
    // try IPv6 or keep empty (handled later)
  }

  if (resolvedIp && isPrivateIp(resolvedIp)) {
    return res.status(403).json({ error: 'SSRF Attack Blocked: Scans targeting private IP networks are prohibited.' });
  }

  // 3. Cache check (Check if scanned in last 12 hours)
  const db = readDb();
  const cacheDurationMs = 12 * 60 * 60 * 1000;
  const now = new Date();

  const cachedScan = db.scans.find(s => 
    s.url.toLowerCase() === targetUrl.toLowerCase() && 
    (now.getTime() - new Date(s.timestamp).getTime()) < cacheDurationMs
  );

  if (cachedScan) {
    console.log(`[LUCIFER] Serving cached scan results for: ${targetUrl}`);
    return res.json(cachedScan);
  }

  // 4. Check global allowlist/blocklist manual overrides
  if (db.allowlist.some(item => targetUrl.includes(item) || resolvedIp === item)) {
    const safeResult = {
      id: Math.random().toString(36).substring(2, 11),
      url: targetUrl,
      domain,
      resolvedIp: resolvedIp || '104.28.16.2',
      riskScore: 0,
      riskLevel: 'Safe',
      timestamp: now.toISOString(),
      aiSummary: 'This domain was manually allowlisted by system administrators. Verified Safe Infrastructure.',
      recommendation: 'Safe to access. No threat patterns detected.',
      reasons: ['✓ Found in administrative global trust list (Allowlisted)'],
      websitePurpose: 'Manually verified trusted landing portal.',
      dataCollected: ['Standard session parameters'],
      threatsFound: ['No threats detected'],
      findings: ['Manually Allowlisted'],
      modules: {
        url: { score: 0, findings: [], rawData: {} },
        domain: { score: 0, findings: [], rawData: {} },
        dns: { score: 0, findings: [], rawData: {} },
        ip: { score: 0, findings: [], rawData: { country: 'Local Admin', isp: 'Global Trust' } },
        ssl: { score: 0, findings: [], rawData: {} },
        content: { score: 0, findings: [], rawData: {} },
        threatIntel: { score: 0, findings: [], rawData: {} }
      },
      screenshotUrl: null
    };

    db.scans.push(safeResult);
    writeDb(db);
    return res.json(safeResult);
  }

  if (db.blocklist.some(item => targetUrl.includes(item) || resolvedIp === item)) {
    const maliciousResult = {
      id: Math.random().toString(36).substring(2, 11),
      url: targetUrl,
      domain,
      resolvedIp: resolvedIp || '185.129.41.9',
      riskScore: 100,
      riskLevel: 'Critical',
      timestamp: now.toISOString(),
      aiSummary: 'Critical block list match. This domain was flagged as hosting active, dangerous attack campaigns.',
      recommendation: 'Avoid visiting this website immediately. Connection is blocked.',
      reasons: ['⚠ Matches administrator global threat blocklist'],
      websitePurpose: 'Malicious threat node blocked by server override.',
      dataCollected: ['Data collection blocked by security protocol'],
      threatsFound: ['Manual Blocklist Association'],
      findings: ['Manually Blocklisted'],
      modules: {
        url: { score: 100, findings: [], rawData: {} },
        domain: { score: 100, findings: [], rawData: {} },
        dns: { score: 100, findings: [], rawData: {} },
        ip: { score: 100, findings: [], rawData: { country: 'Blocked Range', isp: 'Blocked' } },
        ssl: { score: 100, findings: [], rawData: {} },
        content: { score: 100, findings: [], rawData: {} },
        threatIntel: { score: 100, findings: [], rawData: {} }
      },
      screenshotUrl: null
    };

    db.scans.push(maliciousResult);
    writeDb(db);
    return res.json(maliciousResult);
  }

  console.log(`[LUCIFER] Initiating deep modular threat deconstruction for: ${targetUrl}`);

  try {
    // Run Module 1: URL Analyzer (Heuristic checks)
    const urlRes = urlAnalyzer.analyze(targetUrl);

    // Run Network and Web services concurrently for maximum speed (average scan under 5s)
    const [domainRes, dnsRes, ipRes, sslRes, contentRes] = await Promise.all([
      whoisService.analyze(domain),
      dnsService.analyze(domain),
      ipService.analyze(domain),
      sslService.analyze(domain),
      contentAnalyzer.analyze(targetUrl, domain)
    ]);

    const activeIp = ipRes.rawData.ipAddress || resolvedIp || '104.28.16.2';

    // Threat Feeds (VT, AbuseIPDB, PhishTank)
    const threatRes = await threatIntelService.analyze(targetUrl, domain, activeIp);

    // Screenshot Engine (Captures screenshot, stores it, makes thumbnail)
    const screenshotRes = await screenshotEngine.capture(targetUrl);

    // Visual Similarity analysis using base64 and Gemini Multimodal
    const visualRes = await visualSimilarity.analyze(
      screenshotRes.screenshotPath,
      domain,
      contentRes.rawData.brandImpersonation?.brand || 'Login Page'
    );

    // Final Risk calculations
    const finalRisk = riskEngine.calculate({
      urlScore: urlRes.score,
      domainScore: domainRes.score,
      dnsScore: dnsRes.score,
      ipScore: ipRes.score,
      sslScore: sslRes.score,
      // We combine HTML Content indicators and Visual Similarity checks into the Content Score
      contentScore: Math.min(100, Math.round(contentRes.score * 0.7 + visualRes.score * 0.3)),
      threatIntelScore: threatRes.score
    });

    // Consolidate findings list from all modules
    const allFindings = [
      ...urlRes.findings,
      ...domainRes.findings,
      ...dnsRes.findings,
      ...ipRes.findings,
      ...sslRes.findings,
      ...contentRes.findings,
      ...visualRes.findings,
      ...threatRes.findings
    ];

    // AI summary and recommendations generator (Module 12 & 13)
    const aiRes = await aiAnalyst.analyze(
      targetUrl,
      finalRisk.score,
      finalRisk.level,
      allFindings
    );

    // Build consolidated final output
    const scanId = Math.random().toString(36).substring(2, 11);
    const finalReport = {
      id: scanId,
      url: targetUrl,
      domain,
      resolvedIp: activeIp,
      riskScore: finalRisk.score,
      riskLevel: finalRisk.level,
      timestamp: now.toISOString(),
      aiSummary: aiRes.summary,
      recommendation: aiRes.recommendation,
      reasons: aiRes.reasons,
      websitePurpose: aiRes.websitePurpose,
      dataCollected: aiRes.dataCollected,
      threatsFound: aiRes.threatsFound,
      findings: allFindings,
      modules: {
        url: urlRes,
        domain: domainRes,
        dns: dnsRes,
        ip: ipRes,
        ssl: sslRes,
        content: contentRes,
        visualSimilarity: visualRes,
        threatIntel: threatRes
      },
      screenshotUrl: screenshotRes.screenshotUrl
    };

    // Save scan to DB history
    db.scans.push(finalReport);
    writeDb(db);

    console.log(`[LUCIFER] Scan Complete for ${targetUrl} | Risk Level: ${finalRisk.level} | Score: ${finalRisk.score}`);
    return res.json(finalReport);

  } catch (err: any) {
    console.error(`[LUCIFER ERROR] Catastrophic scanner failure: ${err.message}`, err);
    return res.status(500).json({ error: ` Catastrophic Scan Exception: ${err.message}` });
  }
});

// Route 2: Scan History
app.get('/api/history', (req, res) => {
  const db = readDb();
  res.json(db.scans.reverse()); // return newest first
});

// Route 3: Dashboard Analytics
app.get('/api/dashboard', (req, res) => {
  const db = readDb();
  const scans = db.scans;

  const total = scans.length;
  const safe = scans.filter(s => s.riskLevel === 'Safe').length;
  const suspicious = scans.filter(s => s.riskLevel === 'Suspicious' || s.riskLevel === 'Low Risk').length;
  const dangerous = scans.filter(s => s.riskLevel === 'High Risk' || s.riskLevel === 'Critical').length;

  // Most Targeted Brands distribution
  const targetedBrandsMap: { [key: string]: number } = {};
  scans.forEach(s => {
    const brand = s.modules?.content?.rawData?.brandImpersonation?.brand || 
                  s.modules?.visualSimilarity?.rawData?.impersonatedBrand;
    if (brand) {
      targetedBrandsMap[brand] = (targetedBrandsMap[brand] || 0) + 1;
    }
  });

  // Country Geolocation distribution
  const countriesMap: { [key: string]: number } = {};
  scans.forEach(s => {
    const country = s.modules?.ip?.rawData?.country;
    if (country && country !== 'Unknown') {
      countriesMap[country] = (countriesMap[country] || 0) + 1;
    }
  });

  // Risk Distribution (intervals of 20)
  const riskDistribution = {
    safeRange: scans.filter(s => s.riskScore <= 20).length,
    lowRange: scans.filter(s => s.riskScore > 20 && s.riskScore <= 40).length,
    suspRange: scans.filter(s => s.riskScore > 40 && s.riskScore <= 60).length,
    highRange: scans.filter(s => s.riskScore > 60 && s.riskScore <= 80).length,
    critRange: scans.filter(s => s.riskScore > 80).length
  };

  // Threat trends (group counts by date)
  const trendsMap: { [key: string]: { safe: number; suspicious: number; dangerous: number } } = {};
  scans.slice(-20).forEach(s => {
    const dateStr = new Date(s.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (!trendsMap[dateStr]) {
      trendsMap[dateStr] = { safe: 0, suspicious: 0, dangerous: 0 };
    }
    if (s.riskLevel === 'Safe') trendsMap[dateStr].safe++;
    else if (s.riskLevel === 'Suspicious' || s.riskLevel === 'Low Risk') trendsMap[dateStr].suspicious++;
    else trendsMap[dateStr].dangerous++;
  });

  const threatTrends = Object.entries(trendsMap).map(([date, counts]) => ({
    date,
    ...counts
  }));

  res.json({
    metrics: {
      totalScans: total,
      safeSites: safe,
      suspiciousSites: suspicious,
      dangerousSites: dangerous
    },
    targetedBrands: Object.entries(targetedBrandsMap).map(([brand, count]) => ({ brand, count })),
    countries: Object.entries(countriesMap).map(([country, count]) => ({ country, count })),
    riskDistribution,
    threatTrends
  });
});

// Route 4: Export PDF Report
app.get('/api/report/pdf/:scanId', async (req, res) => {
  const { scanId } = req.params;
  const db = readDb();
  const scan = db.scans.find(s => s.id === scanId);

  if (!scan) {
    return res.status(404).json({ error: 'Scan report not found' });
  }

  // Set response headers for PDF download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=LUCIFER_REPORT_${scan.domain}.pdf`);

  // Translate relative screenshot path to local absolute file path
  let absoluteScreenshotPath = '';
  if (scan.screenshotUrl) {
    absoluteScreenshotPath = path.join(__dirname, 'public/screenshots', path.basename(scan.screenshotUrl));
  }

  try {
    const tempDir = isVercel ? '/tmp' : __dirname;
    const pdfPath = path.join(tempDir, `temp_report_${scanId}.pdf`);
    
    // Generate PDF to temp file
    await reportGenerator.generate({
      ...scan,
      screenshotPath: absoluteScreenshotPath
    }, pdfPath);

    // Send file as attachment with domain name and delete it on completion/error
    res.download(pdfPath, `LUCIFER_REPORT_${scan.domain}.pdf`, (err) => {
      fs.unlink(pdfPath, () => {});
      if (err && !res.headersSent) {
        console.error(`[LUCIFER ERROR] Error sending PDF file: ${err.message}`);
      }
    });
  } catch (err: any) {
    console.error(`[LUCIFER ERROR] PDF compilation crashed: ${err.message}`);
    res.status(500).json({ error: `PDF Compilation failed: ${err.message}` });
  }
});

// Route 5: Update Allow/Blocklist (Admin)
app.post('/api/admin/rules', (req, res) => {
  const { allowlist, blocklist } = req.body;
  const db = readDb();
  if (Array.isArray(allowlist)) db.allowlist = allowlist;
  if (Array.isArray(blocklist)) db.blocklist = blocklist;
  writeDb(db);
  res.json({ message: 'Rules updated successfully' });
});

// Route 6: Import Dataset Records
app.post('/api/admin/dataset', (req, res) => {
  const { records } = req.body;
  if (!Array.isArray(records)) {
    return res.status(400).json({ error: 'Records array is required' });
  }

  const db = readDb();
  // We can convert dataset items to mock scans so they populate in dashboard and search!
  records.forEach(rec => {
    const score = rec.label === 'Malicious' ? 95 : rec.label === 'Suspicious' ? 60 : 5;
    const level = rec.label === 'Malicious' ? 'Critical' : rec.label === 'Suspicious' ? 'Suspicious' : 'Safe';
    
    db.scans.push({
      id: Math.random().toString(36).substring(2, 11),
      url: rec.url.startsWith('http') ? rec.url : `https://${rec.url}`,
      domain: rec.url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0],
      resolvedIp: rec.ip || '8.8.8.8',
      riskScore: score,
      riskLevel: level,
      timestamp: new Date().toISOString(),
      aiSummary: `Imported dataset record classification. Threat type: ${rec.attackType || 'Generic'}. Description: ${rec.description || 'N/A'}.`,
      recommendation: level === 'Critical' ? 'Avoid interacting with this domain.' : 'Standard protocols active.',
      reasons: [`Dataset Match: Flagged as ${rec.label}`],
      findings: [`Dataset import: ${rec.description || 'Flagged threat'}`],
      modules: {
        url: { score, findings: [], rawData: {} },
        domain: { score, findings: [], rawData: {} },
        dns: { score, findings: [], rawData: {} },
        ip: { score, findings: [], rawData: { country: 'Imported', isp: 'Dataset Source' } },
        ssl: { score, findings: [], rawData: {} },
        content: { score, findings: [], rawData: {} },
        threatIntel: { score, findings: [], rawData: {} }
      },
      screenshotUrl: null
    });
  });

  writeDb(db);
  res.json({ message: `Successfully imported ${records.length} records into scanning history` });
});

// Route 7: Clear All History
app.post('/api/admin/clear', (req, res) => {
  const db = readDb();
  db.scans = [];
  writeDb(db);
  res.json({ message: 'Database history reset successfully' });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[LUCIFER PROTOCOL] Threat Intelligence server listening on port ${PORT}`);
  });
}

export default app;
