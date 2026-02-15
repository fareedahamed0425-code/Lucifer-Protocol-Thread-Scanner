
import { ScanResult, ThreatLabel } from "../types";

/**
 * Performs deep-reasoning threat analysis using DeepSeek AI.
 * DeepSeek provides sophisticated URL threat detection with computational metrics.
 */
export const analyzeThreatWithAI = async (url: string, resolvedIp: string, ruleResult: any): Promise<ScanResult> => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  console.log("[LUCIFER PROTOCOL] Starting OpenRouter analysis for URL:", url);
  console.log("[LUCIFER] API Key Available:", !!apiKey);

  if (!apiKey) {
    console.warn("[LUCIFER PROTOCOL] OpenRouter API_KEY not configured. Using rule-based analysis.");
    return {
      url,
      resolvedIp,
      riskScore: ruleResult.riskScore,
      label: ruleResult.label,
      attackType: "Rule-Based Analysis",
      evidence: `[FORENSIC ANALYSIS COMPLETE]\nThreat Classification: ${ruleResult.label}\nRisk Score: ${ruleResult.riskScore}/100\n\n[DETECTION PATTERNS]\n${ruleResult.warnings || 'Analysis completed with heuristic rules.'}`,
      ipReputation: "Offline AI Core - Rule-Based Detection"
    };
  }

  try {
    const userPrompt = `Analyze this URL for security threats. Respond ONLY with JSON.

URL: ${url}
IP: ${resolvedIp}
Initial Score: ${ruleResult.riskScore}

Evaluate:
1. Phishing signs (domain spoofing, credential harvesting)
2. Technical red flags (special chars, obfuscation)
3. IP reputation (C2, malware hosting)
4. Overall malware/exploit risk

Return ONLY this JSON:
{
  "riskScore": <0-100>,
  "label": "Safe"|"Suspicious"|"Malicious",
  "attackType": "<threat type>",
  "evidence": "<analysis>",
  "ipReputation": "<IP analysis>",
  "computationalMetrics": {
    "phishingScore": <0-100>,
    "technicalAnomalyScore": <0-100>,
    "ipReputationScore": <0-100>,
    "malwareScore": <0-100>,
    "analysisConfidence": "High"|"Medium"|"Low"
  }
}`;

    const headers = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://lucifer-protocol.local",
      "X-Title": "LUCIFER Protocol Threat Scanner"
    };

    console.log("[LUCIFER] Step 1: Sending initial analysis request to OpenRouter");

    // First API call with reasoning enabled
    const response1 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "openai/gpt-oss-120b:free",
        messages: [
          {
            role: "system",
            content: "You are a cybersecurity expert. Analyze URLs for threats. Respond ONLY with valid JSON, no markdown or explanations."
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        reasoning: { enabled: true },
        temperature: 0.3,
        max_tokens: 1024
      })
    });

    if (!response1.ok) {
      const errorMsg = await response1.text();
      throw new Error(`OpenRouter Step 1 failed: ${response1.status} - ${errorMsg}`);
    }

    const result1 = await response1.json();
    const message1 = result1.choices[0].message;

    console.log("[LUCIFER] Step 2: Sending verification request with reasoning details");

    // Second API call - model continues reasoning from where it left off
    const response2 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "openai/gpt-oss-120b:free",
        messages: [
          {
            role: "system",
            content: "You are a cybersecurity expert. Analyze URLs for threats. Respond ONLY with valid JSON, no markdown or explanations."
          },
          {
            role: "user",
            content: userPrompt
          },
          {
            role: "assistant",
            content: message1.content,
            reasoning_details: message1.reasoning_details // Pass back unmodified
          },
          {
            role: "user",
            content: "Are you sure? Think carefully and verify your analysis for accuracy. Ensure the output is ONLY a valid JSON object matching the requested schema."
          }
        ],
        temperature: 0.2
      })
    });

    if (!response2.ok) {
      const errorMsg = await response2.text();
      throw new Error(`OpenRouter Step 2 failed: ${response2.status} - ${errorMsg}`);
    }

    const result2 = await response2.json();
    let rawText = result2.choices[0].message.content;

    if (!rawText) {
      throw new Error("Empty content in OpenRouter verification response");
    }

    // Parse JSON - handle various formats
    let cleanJson = rawText.trim();
    cleanJson = cleanJson.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
    cleanJson = cleanJson.replace(/^```\s*/i, "").replace(/\s*```$/, "");

    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanJson = jsonMatch[0];
    }

    const aiResult = JSON.parse(cleanJson);
    console.log("[LUCIFER] Successfully parsed verified AI result:", aiResult);

    // Normalize and sanitize
    const riskScore = Math.min(100, Math.max(0, parseInt(aiResult.riskScore) || ruleResult.riskScore));
    const attackType = String(aiResult.attackType || "Unclassified Threat").substring(0, 100);
    const evidence = String(aiResult.evidence || "Forensic analysis complete").substring(0, 500);
    const ipReputation = String(aiResult.ipReputation || "Inconclusive").substring(0, 200);

    let enumLabel = ThreatLabel.SAFE;
    if (aiResult.label === "Malicious") enumLabel = ThreatLabel.MALICIOUS;
    else if (aiResult.label === "Suspicious") enumLabel = ThreatLabel.SUSPICIOUS;
    else enumLabel = riskScore >= 70 ? ThreatLabel.MALICIOUS : riskScore >= 35 ? ThreatLabel.SUSPICIOUS : ThreatLabel.SAFE;

    // Build report
    let reportEvidence = `[GPT-OSS DEEP REASONING ANALYSIS]\n`;
    reportEvidence += `Classification: ${enumLabel.toUpperCase()} | Risk Score: ${riskScore}/100\n\n`;
    reportEvidence += `[THREAT ASSESSMENT]\n${evidence}\n\n`;
    reportEvidence += `[VERIFICATION STATUS]\nDouble-checked reasoning path confirmed threat profile.\n\n`;
    reportEvidence += `[IP ANALYSIS]\n${ipReputation}\n\n`;

    if (aiResult.computationalMetrics) {
      const m = aiResult.computationalMetrics;
      reportEvidence += `[COMPUTATIONAL ANALYSIS METRICS]\n`;
      reportEvidence += `• Phishing Score: ${m.phishingScore || 0}/100\n`;
      reportEvidence += `• Tech Anomaly: ${m.technicalAnomalyScore || 0}/100\n`;
      reportEvidence += `• IP Reputation: ${m.ipReputationScore || 0}/100\n`;
      reportEvidence += `• Malware Risk: ${m.malwareScore || 0}/100\n`;
      reportEvidence += `• Confidence: ${m.analysisConfidence || 'Medium'}\n`;
    }

    return {
      url,
      resolvedIp,
      riskScore,
      label: enumLabel,
      attackType,
      evidence: reportEvidence,
      ipReputation
    };

  } catch (error) {
    console.error("[LUCIFER] ❌ OpenRouter Analysis Error:", error);
    const errorMsg = error instanceof Error ? error.message : String(error);

    return {
      url,
      resolvedIp,
      riskScore: ruleResult.riskScore,
      label: ruleResult.label,
      attackType: ruleResult.label === ThreatLabel.MALICIOUS ? "Malicious (Heuristic)" : "Safe (Heuristic)",
      evidence: `[RULE-BASED FALLBACK]\nAI Analysis failed (${errorMsg}). Using local heuristic patterns.\n\n[DETECTION PATTERNS]\n${ruleResult.warnings}`,
      ipReputation: "Rule-Based Detection Core"
    };
  }
};

