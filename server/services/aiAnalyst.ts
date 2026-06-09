import { GoogleGenAI } from '@google/genai';
import { ModuleResult } from './urlAnalyzer';

interface AnalystResult {
  summary: string;
  recommendation: string;
  reasons: string[];
  websitePurpose: string;
  dataCollected: string[];
  threatsFound: string[];
}

export const aiAnalyst = {
  analyze: async (
    url: string,
    riskScore: number,
    riskLevel: string,
    allFindings: string[]
  ): Promise<AnalystResult> => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const nvidiaKey = process.env.VITE_NVIDIA_API_KEY;

    // Filter and sanitize findings to avoid duplicate listings
    const cleanFindings = Array.from(new Set(allFindings)).filter(f => f && f.trim().length > 0);

    // Heuristic template fallback (runs if offline or API keys are missing)
    const getHeuristicAnalyst = (): AnalystResult => {
      let summary = 'Website exhibits standard security configurations.';
      let recommendation = 'No immediate action required. Exercise caution when entering personal data.';
      let websitePurpose = 'Standard information landing page or generic code vertical.';
      let dataCollected: string[] = ['IP Address', 'Browser Headers', 'Session Cookies'];
      let threatsFound: string[] = ['No significant threats'];
      
      if (riskScore > 80) {
        summary = `This website exhibits multiple critical phishing indicators including domain spoofing, suspicious HTML form structures, and active listings in external threat feeds.`;
        recommendation = 'IMMEDIATE ACTION REQUIRED: Avoid interacting with this website. Do not submit any credentials or personal information.';
        websitePurpose = 'Credential collection portal masquerading as commercial service.';
        dataCollected = ['Username / Email', 'Cleartext Password', 'IP Address', 'Browser Fingerprint'];
        threatsFound = ['Credential Harvesting', 'Active Phishing Campaign', 'Brand Spoofing'];
      } else if (riskScore > 60) {
        summary = `High risk site detected. We identified suspicious domain age, hidden WHOIS metadata, or potential brand impersonation attempts.`;
        recommendation = 'Avoid interacting with this website. Verified safety checks were not completed successfully.';
        websitePurpose = 'Suspicious domain profile hosting authentication interfaces.';
        dataCollected = ['Session Cookies', 'Username / Email', 'Geographic Location'];
        threatsFound = ['Brand Impersonation', 'Suspicious WHOIS Profile', 'Weak TLS Encryption'];
      } else if (riskScore > 40) {
        summary = `Suspicious activity detected. The website exhibits mild structural anomalies or lacks standard email verification records (SPF/DMARC).`;
        recommendation = 'Exercise caution before accessing this website or entering any data.';
        websitePurpose = 'General content domain with insecure configuration.';
        dataCollected = ['Session Identification', 'IP Address'];
        threatsFound = ['Missing Email Authentication (SPF/DMARC)', 'Obfuscated Inline Scripts'];
      } else if (riskScore > 20) {
        summary = `Low risk site. A few non-critical configuration issues were detected (such as missing SPF/DMARC policies).`;
        recommendation = 'Normal usage permitted. Maintain standard security awareness.';
        websitePurpose = 'Legitimate web page lacking specific security configuration headers.';
        dataCollected = ['Standard Session Identifiers'];
        threatsFound = ['Missing DMARC policy'];
      }

      // Take top 5 findings as reasons
      const reasons = cleanFindings.slice(0, 6);
      if (reasons.length === 0) {
        reasons.push('Verified domain credentials and safe IP infrastructure');
      }

      return {
        summary,
        recommendation,
        reasons,
        websitePurpose,
        dataCollected,
        threatsFound
      };
    };

    if (!apiKey && !nvidiaKey) {
      return getHeuristicAnalyst();
    }

    try {
      const prompt = `
        You are a Senior Cyber Threat Intelligence Analyst. We scanned a URL: ${url}
        Overall Risk Score: ${riskScore}/100
        Classification: ${riskLevel}
        
        Our security engine compiled the following findings:
        ${cleanFindings.map(f => `- ${f}`).join('\n')}

        Synthesize these findings and provide:
        1. A concise, professional security analyst summary (max 2-3 sentences).
        2. A clear security recommendation (e.g. "Avoid interacting with this website", "Safe to visit").
        3. A curated list of human-readable findings (reasons) explaining the threat (max 5 items, prefix with "✓" or similar if appropriate).
        4. websitePurpose: A short sentence identifying what the website is about or purports to be (e.g. "Credential input portal masquerading as Google Login", "A secure open-source code repository", "Unknown landing page").
        5. dataCollected: A list of all types of data this website collects or attempts to collect from the user (e.g. ["Password", "Username/Email", "Credit Card Details", "Cookies", "IP Address", "Browser Telemetry"] or ["None detected"]).
        6. threatsFound: A list of threat tags/vulnerabilities identified (e.g. ["Phishing", "Credential Harvesting", "Brand Impersonation", "Expired TLS Certificate", "Missing DMARC Policy"] or ["No significant threats"]).

        Respond ONLY with a valid JSON object of the following format:
        {
          "summary": "<concise summary text>",
          "recommendation": "<clear recommendation text>",
          "reasons": ["reason 1", "reason 2", ...],
          "websitePurpose": "<purpose text>",
          "dataCollected": ["data 1", "data 2", ...],
          "threatsFound": ["threat 1", "threat 2", ...]
        }
      `;

      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3
          }
        });

        const text = response.text;
        if (!text) throw new Error('Empty AI response');
        return JSON.parse(text.trim());
      } else {
        // Fallback to NVIDIA NIM
        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${nvidiaKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "meta/llama-3.1-70b-instruct",
            messages: [
              { role: "system", content: "You are an AI Security Analyst. Respond only with JSON." },
              { role: "user", content: prompt }
            ],
            temperature: 0.2
          })
        });

        if (!response.ok) throw new Error('Nvidia API error');
        const resJson = await response.json();
        const content = resJson.choices[0].message.content;
        return JSON.parse(content.trim());
      }

    } catch (e) {
      // Return heuristic backup on failure
      return getHeuristicAnalyst();
    }
  }
};
