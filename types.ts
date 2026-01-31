
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
  url: string;
  resolvedIp: string;
  riskScore: number;
  label: ThreatLabel;
  attackType: string;
  evidence: string;
  ipReputation: string;
}

export interface AppState {
  role: UserRole;
  isLoggedIn: boolean;
  datasets: DatasetMetadata[];
  threatRecords: DatasetEntry[];
  allowlist: string[];
  blocklist: string[];
}
