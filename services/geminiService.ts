import { ScanResult, ThreatLabel } from "../types";
import { GoogleGenAI } from "@google/genai";

/**
 * Performs high-speed forensic analysis using Google Gemini 1.5 Flash.
 * This acts as the secondary high-performance neural core.
 */
export const analyzeThreatWithAI = async (url: string, resolvedIp: string, ruleResult: any): Promise<ScanResult> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  console.log("[LUCIFER PROTOCOL] Engaging Gemini 1.5 Flash Core...");

  if (!apiKey) {
    console.warn("[LUCIFER] Gemini API_KEY not configured. Falling back to heuristic rules.");
    return {
      url,
      resolvedIp,
      riskScore: ruleResult.riskScore,
      label: ruleResult.label,
      attackType: "Rule-Based Analysis (Fallback)",
      evidence: `[FORENSIC ANALYSIS COMPLETE]\nThreat Classification: ${ruleResult.label}\nRiskScore: ${ruleResult.riskScore}/100\n\n[DETECTION PATTERNS]\n${ruleResult.warnings}`,
      ipReputation: "Offline AI Core",
      provider: "Heuristic Core"
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Analyze this URL for security threats. Respond ONLY with a valid JSON object.

Target URL: ${url}
Resolved IP: ${resolvedIp}
Heuristic Risk Score: ${ruleResult.riskScore}

Your mission:
1. Identify phishing indicators (typosquatting, deceptive paths).
2. Spot technical anomalies (character obfuscation, punycode).
3. Evaluate IP reputation risks.
4. Provide a final risk score (0-100) and classification.

Response Format (JSON ONLY):
{
  "riskScore": <number>,
  "label": "Safe" | "Suspicious" | "Malicious",
  "attackType": "<string>",
  "evidence": "<detailed analysis text>",
  "ipReputation": "<string>",
  "reasoning": ["step 1", "step 2", ...],
  "computationalMetrics": {
    "phishingScore": <number>,
    "technicalAnomalyScore": <number>,
    "ipReputationScore": <number>,
    "malwareScore": <number>,
    "analysisConfidence": "High" | "Medium" | "Low"
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });

    const resultText = response.text;
    
    if (!resultText) {
      throw new Error("Empty response from Gemini Core");
    }

    const aiResult = JSON.parse(resultText);

    // Normalize and sanitize
    const riskScore = Math.min(100, Math.max(0, parseInt(aiResult.riskScore) || ruleResult.riskScore));
    const attackType = String(aiResult.attackType || "Neural Analysis").substring(0, 100);
    const evidence = String(aiResult.evidence || "Forensic analysis complete").substring(0, 500);
    const ipReputation = String(aiResult.ipReputation || "Verified Intelligence").substring(0, 200);

    let enumLabel = ThreatLabel.SAFE;
    if (aiResult.label === "Malicious") enumLabel = ThreatLabel.MALICIOUS;
    else if (aiResult.label === "Suspicious") enumLabel = ThreatLabel.SUSPICIOUS;
    else enumLabel = riskScore >= 70 ? ThreatLabel.MALICIOUS : riskScore >= 35 ? ThreatLabel.SUSPICIOUS : ThreatLabel.SAFE;

    // Build consolidated report
    let reportEvidence = `[GEMINI NEURAL FORENSICS]\n`;
    reportEvidence += `Status: ${enumLabel.toUpperCase()} | Risk: ${riskScore}/100\n\n`;
    reportEvidence += `[ANALYSIS SUMMARY]\n${evidence}\n\n`;
    reportEvidence += `[IP INTELLIGENCE]\n${ipReputation}\n\n`;

    if (aiResult.computationalMetrics) {
      const m = aiResult.computationalMetrics;
      reportEvidence += `[COMPUTATIONAL METRICS]\n`;
      reportEvidence += `• Phishing: ${m.phishingScore || 0}% | Anomaly: ${m.technicalAnomalyScore || 0}%\n`;
      reportEvidence += `• Reputation: ${m.ipReputationScore || 0}% | Malware: ${m.malwareScore || 0}%\n`;
      reportEvidence += `• Confidence: ${m.analysisConfidence || 'High'}\n`;
    }

    return {
      url,
      resolvedIp,
      riskScore,
      label: enumLabel,
      attackType,
      evidence: reportEvidence,
      ipReputation,
      reasoning: aiResult.reasoning || [],
      provider: "Gemini 1.5 Flash Core"
    };

  } catch (error: any) {
    console.error("[LUCIFER] Gemini Neural Core Error:", error);
    return {
      url,
      resolvedIp,
      riskScore: ruleResult.riskScore,
      label: ruleResult.label,
      attackType: ruleResult.label === ThreatLabel.MALICIOUS ? "Malicious (Heuristic)" : "Safe (Heuristic)",
      evidence: `[AI CORE FALLBACK]\nGemini analysis failed: ${error.message}\n\n[DETECTION PATTERNS]\n${ruleResult.warnings}`,
      ipReputation: "Heuristic Baseline",
      provider: "Lucifer Heuristic Core"
    };
  }
};
