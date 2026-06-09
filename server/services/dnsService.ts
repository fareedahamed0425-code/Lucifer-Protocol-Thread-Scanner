import dns from 'dns/promises';
import { ModuleResult } from './urlAnalyzer';

export const dnsService = {
  analyze: async (domain: string): Promise<ModuleResult> => {
    const findings: string[] = [];
    let score = 0;

    // Check if domain is IP address
    const isIp = /^[0-9.]+$/.test(domain) || domain.includes(':');
    if (isIp) {
      return {
        score: 0,
        findings: ['Skipped DNS record analysis for raw IP address'],
        rawData: { isIp: true }
      };
    }

    const records: {
      A: string[];
      AAAA: string[];
      MX: any[];
      TXT: string[][];
      NS: string[];
      CNAME: string[];
    } = {
      A: [],
      AAAA: [],
      MX: [],
      TXT: [],
      NS: [],
      CNAME: []
    };

    // Helper to run resolvers safely without throwing error on missing records
    const resolveSafely = async (type: 'A' | 'AAAA' | 'MX' | 'TXT' | 'NS' | 'CNAME', host: string) => {
      try {
        switch (type) {
          case 'A': records.A = await dns.resolve4(host); break;
          case 'AAAA': records.AAAA = await dns.resolve6(host); break;
          case 'MX': records.MX = await dns.resolveMx(host); break;
          case 'TXT': records.TXT = await dns.resolveTxt(host); break;
          case 'NS': records.NS = await dns.resolveNs(host); break;
          case 'CNAME': records.CNAME = await dns.resolveCname(host); break;
        }
      } catch (e) {
        // Record type not found or DNS error, normal behavior
      }
    };

    // Execute all DNS lookups in parallel
    await Promise.all([
      resolveSafely('A', domain),
      resolveSafely('AAAA', domain),
      resolveSafely('MX', domain),
      resolveSafely('TXT', domain),
      resolveSafely('NS', domain),
      resolveSafely('CNAME', domain)
    ]);

    // Check 1: Missing A/AAAA records (domain does not resolve)
    if (records.A.length === 0 && records.AAAA.length === 0 && records.CNAME.length === 0) {
      score += 30;
      findings.push('Domain does not resolve to any active IP address (No A, AAAA, or CNAME records)');
    }

    // Check 2: SPF policy verification
    let hasSPF = false;
    const flatTxtRecords = records.TXT.map(r => r.join(' '));
    flatTxtRecords.forEach(rec => {
      if (rec.toLowerCase().startsWith('v=spf1')) {
        hasSPF = true;
      }
    });

    if (!hasSPF) {
      score += 25;
      findings.push('Missing SPF (Sender Policy Framework) record - domain vulnerable to spoofing');
    }

    // Check 3: DMARC policy verification
    let hasDMARC = false;
    let dmarcRecord = '';
    try {
      const dmarcTxt = await dns.resolveTxt(`_dmarc.${domain}`);
      const flatDmarc = dmarcTxt.map(r => r.join(' '));
      flatDmarc.forEach(rec => {
        if (rec.toLowerCase().startsWith('v=dmarc1')) {
          hasDMARC = true;
          dmarcRecord = rec;
        }
      });
    } catch (e) {
      // DMARC record not found
    }

    if (!hasDMARC) {
      score += 25;
      findings.push('Missing DMARC (Domain-based Message Authentication) record - high risk of email impersonation');
    }

    // Check 4: DKIM verification check (look up common default selectors)
    let hasDKIM = false;
    const commonSelectors = ['default', 'google', 'k1', 'mail'];
    for (const selector of commonSelectors) {
      try {
        const dkimTxt = await dns.resolveTxt(`${selector}._domainkey.${domain}`);
        if (dkimTxt.length > 0) {
          hasDKIM = true;
          break;
        }
      } catch (e) {}
    }

    if (!hasDKIM) {
      // Don't penalize too heavily since we check blindly, but note it in rawData
    }

    // Check 5: Suspicious Name Servers
    const suspiciousNsDomains = ['.tk', '.ml', '.cf', '.ga', '.gq', 'private', 'anonymous'];
    const matchedSuspiciousNs = records.NS.filter(ns => 
      suspiciousNsDomains.some(susp => ns.toLowerCase().includes(susp))
    );
    if (matchedSuspiciousNs.length > 0) {
      score += 20;
      findings.push(`Domain uses suspicious nameservers: ${matchedSuspiciousNs.join(', ')}`);
    }

    if (records.NS.length === 0 && records.A.length > 0) {
      score += 15;
      findings.push('Missing Name Server (NS) records in query');
    }

    return {
      score: Math.min(100, score),
      findings,
      rawData: {
        aRecords: records.A,
        aaaaRecords: records.AAAA,
        mxRecords: records.MX,
        txtRecords: flatTxtRecords,
        nsRecords: records.NS,
        cnameRecords: records.CNAME,
        securityChecks: {
          spf: { present: hasSPF },
          dmarc: { present: hasDMARC, record: dmarcRecord || null },
          dkim: { present: hasDKIM, status: hasDKIM ? 'Verified common selector' : 'Undetected on default selectors' }
        }
      }
    };
  }
};
