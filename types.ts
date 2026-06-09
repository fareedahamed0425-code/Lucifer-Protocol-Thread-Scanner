
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}

export enum ThreatLabel {
  SAFE = 'Safe',
  SUSPICIOUS = 'Suspicious',
  MALICIOUS = 'Malicious'
}

export interface DatasetEntry {
  url: string;
  ip: string;
  label: ThreatLabel;
  attackType: string;
  description?: string;
}

export interface DatasetMetadata {
  filename: string;
  recordCount: number;
  uploadTime: string;
}

export interface ScanResult {
  id: string;
  url: string;
  domain: string;
  resolvedIp: string;
  riskScore: number;
  riskLevel: 'Safe' | 'Low Risk' | 'Suspicious' | 'High Risk' | 'Critical';
  timestamp: string;
  aiSummary: string;
  recommendation: string;
  reasons: string[];
  findings: string[];
  modules: {
    url: any;
    domain: any;
    dns: any;
    ip: any;
    ssl: any;
    content: any;
    visualSimilarity?: any;
    threatIntel: any;
  };
  screenshotUrl: string | null;
  websitePurpose?: string;
  dataCollected?: string[];
  threatsFound?: string[];
}

export interface AppState {
  role: UserRole;
  isLoggedIn: boolean;
  datasets: DatasetMetadata[];
  threatRecords: DatasetEntry[];
  allowlist: string[];
  blocklist: string[];
}
