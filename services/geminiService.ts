
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
    // Simplified, effective prompt for OpenRouter
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

    console.log("[LUCIFER] Sending request to OpenRouter API");
    console.log("[LUCIFER] URL:", url);
    console.log("[LUCIFER] IP:", resolvedIp);
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lucifer-protocol.local",
        "X-Title": "LUCIFER Protocol Threat Scanner"
      },
      body: JSON.stringify({
        model: "tngtech/deepseek-r1t-chimera:free",
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
        temperature: 0.3,
        max_tokens: 1024,
        top_p: 0.9
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);
    console.log("[LUCIFER] OpenRouter Response Status:", response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("[LUCIFER] OpenRouter API Error:", response.status, errorData);
      throw new Error(`OpenRouter API returned ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    console.log("[LUCIFER] Raw OpenRouter Response:", JSON.stringify(data));
    
    // Extract message content
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("[LUCIFER] Invalid response structure:", data);
      throw new Error("Invalid OpenRouter response structure");
    }

    let rawText = data.choices[0].message.content;
    if (!rawText) {
      throw new Error("Empty content in OpenRouter response");
    }

    console.log("[LUCIFER] Raw response text:", rawText);

    // Parse JSON - handle various formats
    let cleanJson = rawText.trim();
    
    // Remove markdown code blocks
    cleanJson = cleanJson.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
    cleanJson = cleanJson.replace(/^```\s*/i, "").replace(/\s*```$/, "");
    
    // Extract JSON object
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanJson = jsonMatch[0];
    }

    console.log("[LUCIFER] Parsed JSON string:", cleanJson);
    
    const aiResult = JSON.parse(cleanJson);
    console.log("[LUCIFER] Successfully parsed AI result:", aiResult);
    
    // Validate and sanitize results
    const riskScore = Math.min(100, Math.max(0, parseInt(aiResult.riskScore) || ruleResult.riskScore));
    const attackType = String(aiResult.attackType || "Unknown Threat").substring(0, 100);
    const evidence = String(aiResult.evidence || "Analysis completed").substring(0, 500);
    const ipReputation = String(aiResult.ipReputation || "Inconclusive").substring(0, 200);
    
    // Normalize label
    let finalLabel = aiResult.label;
    if (!["Safe", "Suspicious", "Malicious"].includes(finalLabel)) {
      finalLabel = riskScore >= 70 ? "Malicious" : riskScore >= 30 ? "Suspicious" : "Safe";
    }

    // Map string labels to enum values
    let enumLabel = ThreatLabel.SAFE;
    if (finalLabel === "Malicious") enumLabel = ThreatLabel.MALICIOUS;
    else if (finalLabel === "Suspicious") enumLabel = ThreatLabel.SUSPICIOUS;
    else enumLabel = ThreatLabel.SAFE;

    // Build comprehensive report
    let reportEvidence = `[DEEPSEEK AI FORENSIC ANALYSIS]\n`;
    reportEvidence += `Classification: ${finalLabel} | Risk Score: ${riskScore}/100\n\n`;
    reportEvidence += `[THREAT ASSESSMENT]\n${evidence}\n\n`;
    reportEvidence += `[DETECTION RULES]\n${ruleResult.warnings || 'Standard analysis'}\n\n`;
    reportEvidence += `[IP ANALYSIS]\n${ipReputation}\n\n`;
    
    // Add detailed computational metrics
    if (aiResult.computationalMetrics) {
      const m = aiResult.computationalMetrics;
      reportEvidence += `[COMPUTATIONAL ANALYSIS METRICS]\n`;
      reportEvidence += `• Phishing Score: ${m.phishingScore || 0}/100\n`;
      reportEvidence += `• Technical Anomaly: ${m.technicalAnomalyScore || 0}/100\n`;
      reportEvidence += `• IP Reputation: ${m.ipReputationScore || 0}/100\n`;
      reportEvidence += `• Malware Risk: ${m.malwareScore || 0}/100\n`;
      reportEvidence += `• Analysis Confidence: ${m.analysisConfidence || 'Medium'}\n`;
    }

    const scanResult: ScanResult = {
      url,
      resolvedIp,
      riskScore,
      label: enumLabel,
      attackType,
      evidence: reportEvidence,
      ipReputation
    };
    
    console.log("[LUCIFER] ✓ Successfully analyzed with OpenRouter:", scanResult);
    return scanResult;

  } catch (error) {
    console.error("[LUCIFER] ❌ OpenRouter Analysis Error:", error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[LUCIFER] Error Details:", errorMsg);
    
    // Fallback to rule-based analysis
    return {
      url,
      resolvedIp,
      riskScore: ruleResult.riskScore,
      label: ruleResult.label,
      attackType: ruleResult.label === ThreatLabel.MALICIOUS ? "Malicious (Rule-Based)" : 
                  ruleResult.label === ThreatLabel.SUSPICIOUS ? "Suspicious Pattern" : "Safe",
      evidence: `[RULE-BASED FORENSIC ANALYSIS]\nClassification: ${ruleResult.label} | Risk Score: ${ruleResult.riskScore}/100\n\n[DETECTION PATTERNS]\n${ruleResult.warnings || 'No specific threats detected'}\n\nNote: AI analysis failed (${errorMsg}). Using local heuristic rules.`,
      ipReputation: "Rule-Based Detection Engine"
    };
  }
};
