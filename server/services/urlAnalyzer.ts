import { URL } from 'url';

export interface ModuleResult {
  score: number;
  findings: string[];
  rawData: any;
}

export const urlAnalyzer = {
  analyze: (urlString: string): ModuleResult => {
    const findings: string[] = [];
    let score = 0;

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(urlString);
    } catch (e) {
      return {
        score: 100,
        findings: ['Invalid URL format'],
        rawData: { error: 'Invalid URL format' }
      };
    }

    const protocol = parsedUrl.protocol.replace(':', '');
    const hostname = parsedUrl.hostname.toLowerCase();
    const pathname = parsedUrl.pathname;
    const searchParams = parsedUrl.search;

    // Check 1: Unsecure Protocol
    if (protocol === 'http') {
      score += 25;
      findings.push('Uses unsecure HTTP protocol instead of HTTPS');
    }

    // Check 2: IP-based Hostname
    const isIpHost = /^[0-9.]+$/.test(hostname) || hostname.includes(':'); // simple ipv4 or ipv6 check
    if (isIpHost) {
      score += 45;
      findings.push('Uses IP address instead of domain name');
    }

    // Extract subdomains and TLD
    const parts = hostname.split('.');
    let domain = hostname;
    let subdomain = '';
    let tld = '';

    if (parts.length >= 2 && !isIpHost) {
      tld = parts[parts.length - 1];
      domain = parts.slice(-2).join('.');
      subdomain = parts.slice(0, -2).join('.');
    }

    // Check 3: Excessive Subdomains
    if (parts.length > 4 && !isIpHost) {
      score += 20;
      findings.push(`Excessive subdomain nesting (${parts.length - 2} subdomains)`);
    }

    // Check 4: URL Length
    if (urlString.length > 80) {
      score += 15;
      findings.push(`Excessive URL length (${urlString.length} characters)`);
    }

    // Check 5: Suspicious Keywords
    const suspiciousKeywords = [
      'login', 'signin', 'verify', 'verification', 'account', 'secure', 'update',
      'confirm', 'banking', 'wallet', 'crypto', 'paypal', 'amazon', 'netflix',
      'apple', 'google', 'facebook', 'instagram', 'security', 'billing', 'support'
    ];

    const urlLower = urlString.toLowerCase();
    const matchedKeywords: string[] = [];
    suspiciousKeywords.forEach(keyword => {
      // Check if keyword is in host (especially subdomains or domain part) or path
      if (urlLower.includes(keyword)) {
        // Don't flag if it's the official domain (e.g., login.microsoft.com is suspicious if microsoft is not microsoft.com)
        // But for generic URL analysis, we count it.
        matchedKeywords.push(keyword);
      }
    });

    if (matchedKeywords.length > 0) {
      score += Math.min(40, matchedKeywords.length * 15);
      findings.push(`Contains suspicious keywords: ${matchedKeywords.join(', ')}`);
    }

    // Check 6: URL Shorteners
    const shorteners = [
      'bit.ly', 't.co', 'tinyurl.com', 'is.gd', 'buff.ly', 'adf.ly', 'ow.ly',
      'lnkd.in', 'goo.gl', 'rebrand.ly', 'tiny.cc'
    ];
    if (shorteners.some(s => hostname === s || hostname.endsWith('.' + s))) {
      score += 30;
      findings.push('Uses URL shortener service');
    }

    // Check 7: Special/Encoded Characters
    const unusualSymbols = ['@', '::', 'xn--', '_'];
    const foundSymbols = unusualSymbols.filter(sym => urlLower.includes(sym));
    if (foundSymbols.length > 0) {
      score += foundSymbols.length * 20;
      if (urlLower.includes('xn--')) {
        findings.push('Punycode detected - potential internationalized domain name (IDN) homograph attack');
      } else {
        findings.push(`Contains unusual URL symbols: ${foundSymbols.filter(s => s !== 'xn--').join(', ')}`);
      }
    }

    if (/%[0-9a-fA-F]{2}/.test(urlString)) {
      score += 15;
      findings.push('Contains URL-encoded characters');
    }

    // Check 8: Redirect parameters
    const redirectParams = ['redirect', 'url', 'next', 'to', 'r', 'dest', 'destination', 'return'];
    const queryKeys = Array.from(parsedUrl.searchParams.keys()).map(k => k.toLowerCase());
    const matchedRedirects = queryKeys.filter(k => redirectParams.includes(k));
    if (matchedRedirects.length > 0) {
      score += 15;
      findings.push(`Potential redirect parameters detected in query: ${matchedRedirects.join(', ')}`);
    }

    return {
      score: Math.min(100, score),
      findings,
      rawData: {
        protocol,
        domain,
        subdomain,
        tld,
        path: pathname,
        queryParameters: Object.fromEntries(parsedUrl.searchParams.entries()),
        length: urlString.length
      }
    };
  }
};
