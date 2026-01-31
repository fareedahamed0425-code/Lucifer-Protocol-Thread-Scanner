
export const DATASET_SCHEMA = {
  columns: ['url', 'ip', 'label', 'attackType', 'description'],
  example: 'example-phish.com, 192.168.1.1, Malicious, Phishing, Fake login page'
};

export const INITIAL_STATE = {
  role: 'GUEST',
  isLoggedIn: false,
  datasets: [],
  threatRecords: [],
  allowlist: [],
  blocklist: [],
};

export const API_ENDPOINTS = {
  UPLOAD: '/api/admin/upload',
  SCAN: '/api/scan',
  TRAIN: '/api/admin/train',
  SETTINGS: '/api/admin/settings'
};

export const ARCHITECTURE_NOTE = `
SYSTEM ARCHITECTURE:
- Frontend: React 18 (SPA)
- Styling: Tailwind CSS
- Detection Engine: 
    1. Rule-based filter (Fallback)
    2. Local Dataset Matching (Uploaded by Admin)
    3. AI Threat Synthesis (Gemini API)
- Storage: In-memory/LocalStorage (Simulation of Database Persistence)
- Auth: Role-Based Access Control (RBAC)
`;
