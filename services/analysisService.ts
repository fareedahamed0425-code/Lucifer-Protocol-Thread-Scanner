
import { storageService } from './storageService';
import { ThreatLabel, ScanResult, DatasetEntry } from '../types';
import { analyzeThreatWithAI } from './geminiService';

export const analysisService = {
  // Enhanced IP resolution mocking
  resolveIp: (url: string): string => {
    const domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
    const hash = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Some domains resolve to known "bad" prefixes for testing
    if (domain.includes('bank') || domain.includes('secure')) {
      return `185.129.${hash % 255}.${(hash * 7) % 255}`;
    }
    return `104.28.${hash % 255}.${(hash * 3) % 255}`;
  },

  scanUrl: async (url: string): Promise<ScanResult> => {
    const state = storageService.getState();
    const resolvedIp = analysisService.resolveIp(url);

    // 1. Explicit trust/block checks
    if (state.allowlist.some(item => url.includes(item) || resolvedIp === item)) {
      return {
        url,
        resolvedIp,
        riskScore: 0,
        label: ThreatLabel.SAFE,
        attackType: "Allowlisted",
        evidence: "✓ VERIFIED SAFE: Manual trust override active. Entry found in global allowlist.",
        ipReputation: "Verified Infrastructure"
      };
    }

    if (state.blocklist.some(item => url.includes(item) || resolvedIp === item)) {
      return {
        url,
        resolvedIp,
        riskScore: 100,
        label: ThreatLabel.MALICIOUS,
        attackType: "Blocklisted",
        evidence: "⚠ CRITICAL THREAT: Immediate threat identification. Entry matches global blocklist.\nIP: " + resolvedIp + "\nStatus: Known Malicious Entity",
        ipReputation: "Known Malicious Entity"
      };
    }

    // 2. Exact match in historical threat records
    const exactMatch = state.threatRecords.find(r => r.url === url || r.ip === resolvedIp);
    if (exactMatch) {
      return {
        url,
        resolvedIp,
        riskScore: exactMatch.label === ThreatLabel.MALICIOUS ? 95 : 60,
        label: exactMatch.label,
        attackType: exactMatch.attackType,
        evidence: `${exactMatch.label === ThreatLabel.MALICIOUS ? '⚠ WARNING' : '⚡ ALERT'}: Direct match with dataset record: ${exactMatch.description || 'Verified threat intelligence.'}`,
        ipReputation: "Blacklisted in local dataset"
      };
    }

    // 3. Rule-based heuristic weighting
    const ruleResult = analysisService.performRuleAnalysis(url);
    
    // 4. Deep Forensic AI Analysis
    return await analyzeThreatWithAI(url, resolvedIp, ruleResult);
  },

  performRuleAnalysis: (url: string) => {
    let score = 0;
    const urlLower = url.toLowerCase();
    const warnings: string[] = [];
    
    // Pattern identification
    const highRiskKeywords = ['login', 'signin', 'verification', 'account-update', 'secure-bank', 'crypto-wallet', 'paypal', 'amazon-account', 'apple-id'];
    const technicalAnomalies = ['@', '::', 'xn--', '.zip', '.top', '.click', '.xyz', '.tk', '.ml'];
    
    if (url.length > 80) {
      score += 20;
      warnings.push("Excessive URL length detected (>80 chars)");
    }
    if (url.split('.').length > 4) {
      score += 15;
      warnings.push("Deep subdomain nesting (>4 levels)");
    }
    
    highRiskKeywords.forEach(keyword => {
      if (urlLower.includes(keyword)) {
        score += 25;
        warnings.push(`High-risk keyword detected: "${keyword}"`);
      }
    });
    
    technicalAnomalies.forEach(anomaly => {
      if (urlLower.includes(anomaly)) {
        score += 30;
        warnings.push(`Technical anomaly detected: "${anomaly}"`);
      }
    });
    
    // Check for IP-based URL
    const domainPart = url.replace(/https?:\/\//, '').split('/')[0];
    if (/^[0-9.]+$/.test(domainPart)) {
      score += 40;
      warnings.push("Suspicious IP-based URL instead of domain");
    }
    
    // Check for Unicode/Punycode spoofing
    if (urlLower.includes('xn--')) {
      score += 35;
      warnings.push("Punycode detected - possible homograph attack");
    }
    
    // Check for special characters in domain
    if (/[%@!#\$&\*\?]/.test(domainPart)) {
      score += 20;
      warnings.push("Special characters in domain (possible obfuscation)");
    }

    let label = ThreatLabel.SAFE;
    if (score >= 70) label = ThreatLabel.MALICIOUS;
    else if (score >= 35) label = ThreatLabel.SUSPICIOUS;

    const warningText = warnings.length > 0 ? warnings.map(w => `• ${w}`).join('\n') : 'No specific warnings';
    
    return { riskScore: Math.min(score, 100), label, warnings: warningText };
  }
};
