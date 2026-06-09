import { reportGenerator } from './services/reportGenerator';
import path from 'path';

const mockData = {
  domain: 'httpbin.org',
  url: 'https://httpbin.org',
  timestamp: new Date().toISOString(),
  riskScore: 27,
  riskLevel: 'Low Risk',
  websitePurpose: 'Technical HTTP Request/Response Testing Tool',
  dataCollected: ['HTTP Request Headers', 'IP Address', 'User Agent Info'],
  threatsFound: ['None Identified'],
  resolvedIp: '54.210.142.148',
  recommendation: 'It is safe to visit and utilize this website for technical request testing.',
  reasons: [
    'No active phishing or brand spoofing indications found.',
    'Domain is well-established.'
  ],
  aiSummary: 'The scanned website, httpbin.org, is assessed as Low Risk.',
  modules: {
    url: { score: 0, findings: ['Safe URL structure'], rawData: {} },
    domain: { score: 10, findings: ['Domain age is safe'], rawData: {} },
    dns: { score: 40, findings: ['Missing DMARC policy record'], rawData: {} },
    ip: { score: 10, findings: ['Hosted in US'], rawData: {} },
    ssl: { score: 10, findings: ['Valid TLS certificate'], rawData: {} },
    content: { score: 10, findings: ['No password fields found'], rawData: {} },
    visualSimilarity: { score: 0, findings: ['No impersonation detected'], rawData: {} },
    threatIntel: { score: 0, findings: ['Clean VirusTotal score'], rawData: {} }
  },
  screenshotPath: ''
};

async function test() {
  console.log("Generating test PDF...");
  const outputPath = path.join(__dirname, 'test_report.pdf');
  try {
    await reportGenerator.generate(mockData, outputPath);
    console.log("PDF generated successfully at:", outputPath);
  } catch (e: any) {
    console.error("PDF generation failed:", e.message, e);
  }
}

test();
