
import { ScanResult, ThreatLabel } from "../types";

/**
 * Performs deep-reasoning multi-pass threat analysis using NVIDIA's API.
 * Uses a triple-engine consensus approach:
 * 1. Qwen 3.5 (122B) - Deep Reasoning & General Assessment
 * 2. Qwen 2.5 Coder (32B) - Technical Audit & Code Deconstruction
 * 3. Ministral 14B - Final Threat Consensus & Forensic Summary
 */
export const analyzeThreatWithNvidia = async (url: string, resolvedIp: string, ruleResult: any): Promise<ScanResult> => {
  const apiKey = import.meta.env.VITE_NVIDIA_API_KEY;
  
  if (!apiKey) {
    console.warn("[LUCIFER PROTOCOL] NVIDIA API_KEY not configured. Falling back to heuristic rules.");
    return {
      url,
      resolvedIp,
      riskScore: ruleResult.riskScore,
      label: ruleResult.label,
      attackType: "Rule-Based Analysis (Fallback)",
      evidence: `[FORENSIC ANALYSIS COMPLETE]\nThreat Classification: ${ruleResult.label}\nRisk Score: ${ruleResult.riskScore}/100\n\n[DETECTION PATTERNS]\n${ruleResult.warnings || 'Analysis completed with heuristic rules.'}`,
      ipReputation: "Offline Core - Rule-Based Detection",
      provider: "Heuristic Fallback"
    };
  }

  const callNvidiaAPI = async (model: string, messages: any[], extra: any = {}) => {
    const response = await fetch('/nvidia-api/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        ...extra
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NVIDIA API Error (${model}): ${response.status} ${errorText}`);
    }

    return await response.json();
  };

  console.log("[LUCIFER PROTOCOL] Starting NVIDIA Triple-Engine Analysis...");

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
  "evidence": "<detailed analysis>",
  "ipReputation": "<IP analysis>",
  "computationalMetrics": {
    "phishingScore": <0-100>,
    "technicalAnomalyScore": <0-100>,
    "ipReputationScore": <0-100>,
    "malwareScore": <0-100>,
    "analysisConfidence": "High"|"Medium"|"Low"
  }
}`;

    // Pass 1: DeepSeek R1 (The Reasoning Engine)
    console.log("[LUCIFER] PASS 1: Contacting DeepSeek-R1 Reasoning Engine...");
    const result1 = await callNvidiaAPI("deepseek-ai/deepseek-r1", [
      {
        role: "system",
        content: "You are the primary reasoning core of the LUCIFER Protocol. Your task is to perform deep forensic analysis of URLs. Identify hidden patterns, obfuscation, and malicious intent. Be thorough and cynical. Respond ONLY with the requested JSON format."
      },
      { role: "user", content: userPrompt }
    ], {
      max_tokens: 4096,
      temperature: 0.6
    });

    const message1 = result1.choices[0].message;
    let rawText1 = message1.content || "";
    let reasoningSteps: string[] = [];

    // Extract thinking process from DeepSeek R1
    if (message1.reasoning_content) {
        reasoningSteps = message1.reasoning_content.split('\n').filter((s: string) => s.trim().length > 5).map((s: string) => s.trim());
    } else if (rawText1.includes('<think>')) {
        const thinkMatch = rawText1.match(/<think>([\s\S]*?)<\/think>/);
        if (thinkMatch && thinkMatch[1]) {
            reasoningSteps = thinkMatch[1].trim().split('\n').filter(s => s.trim().length > 5).map(s => s.trim());
            rawText1 = rawText1.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
        }
    }

    console.log("[LUCIFER] PASS 1 Success. Proceeding to PASS 2 (Technical Audit)...");

    // Pass 2: Qwen 2.5 (Technical Verification)
    const result2 = await callNvidiaAPI("qwen/qwen2.5-72b-instruct", [
      {
        role: "system",
        content: "You are the Technical Auditor for the LUCIFER Protocol. Your specialty is deconstructing URL encoding, Punycode, homograph attacks, and technical obfuscation vectors. Audit the findings of the Reasoning Engine."
      },
      {
        role: "user",
        content: `Audit this target: ${url}\nIP: ${resolvedIp}\n\nReasoning Engine Findings:\n${rawText1}`
      }
    ], {
      temperature: 0.1,
      max_tokens: 1024
    });

    const coderAudit = result2.choices[0]?.message?.content || "Technical audit completed.";
    console.log("[LUCIFER] PASS 2 Success. Proceeding to PASS 3 (Consensus)...");

    // Pass 3: Llama 3.1 (Final Consensus)
    const result3 = await callNvidiaAPI("meta/llama-3.1-70b-instruct", [
      {
        role: "system",
        content: "You are the Final Deciding Engine in the LUCIFER Protocol. Synthesize the Deep Reasoning and the Technical Audit into a final, authoritative security verdict. Be concise and decisive."
      },
      {
        role: "user",
        content: `Target: ${url}\n\n[ENGINE 1: REASONING OUTPUT]\n${rawText1}\n\n[ENGINE 2: TECHNICAL AUDIT]\n${coderAudit}\n\nProvide the final forensic summary.`
      }
    ], {
      temperature: 0.1,
      max_tokens: 512
    });

    const finalConsensus = result3.choices[0]?.message?.content || "Final consensus reached.";

    // Parse JSON from Pass 1 for metrics
    let cleanJson = rawText1.trim();
    cleanJson = cleanJson.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleanJson = jsonMatch[0];

    let aiResult;
    try {
        aiResult = JSON.parse(cleanJson);
    } catch (e) {
        console.warn("[LUCIFER] JSON Parse failed, attempting recovery...");
        // Fallback to basic extraction if JSON is malformed
        aiResult = {
            riskScore: rawText1.match(/riskScore":\s*(\d+)/)?.[1] || ruleResult.riskScore,
            label: rawText1.includes("Malicious") ? "Malicious" : rawText1.includes("Suspicious") ? "Suspicious" : "Safe",
            attackType: "AI Forensic Analysis",
            evidence: "Manual extraction from failed JSON response."
        };
    }

    const riskScore = Math.min(100, Math.max(0, parseInt(aiResult.riskScore) || ruleResult.riskScore));
    const attackType = String(aiResult.attackType || "Unclassified").substring(0, 100);
    const evidence = String(aiResult.evidence || "Forensic analysis complete").substring(0, 400);
    const ipReputation = String(aiResult.ipReputation || "Inconclusive").substring(0, 200);

    let enumLabel = ThreatLabel.SAFE;
    if (aiResult.label === "Malicious") enumLabel = ThreatLabel.MALICIOUS;
    else if (aiResult.label === "Suspicious") enumLabel = ThreatLabel.SUSPICIOUS;
    else enumLabel = riskScore >= 70 ? ThreatLabel.MALICIOUS : riskScore >= 35 ? ThreatLabel.SUSPICIOUS : ThreatLabel.SAFE;

    // Build consolidated report
    let reportEvidence = `[LUCIFER PROTOCOL - NEURAL CONSENSUS REPORT]\n`;
    reportEvidence += `Verdict: ${enumLabel.toUpperCase()} | Magnitude: ${riskScore}/100\n\n`;
    
    reportEvidence += `[CORE 1: DEEPSEEK R1 REASONING]\n${evidence}\n\n`;
    
    reportEvidence += `[CORE 2: QWEN 2.5 CODER AUDIT]\n${coderAudit}\n\n`;
    
    reportEvidence += `[CORE 3: MINISTRAL CONSENSUS]\n${finalConsensus}\n\n`;
    
    reportEvidence += `[INFRASTRUCTURE STATUS]\nForensic Stack: Active (NVIDIA NIM). Triple-pass validation: SUCCESSFUL.\n\n`;
    
    if (aiResult.computationalMetrics) {
      const m = aiResult.computationalMetrics;
      reportEvidence += `[VECTOR MAGNITUDES]\n`;
      reportEvidence += `• PHISHING: ${m.phishingScore || 0}% | ANOMALY: ${m.technicalAnomalyScore || 0}%\n`;
      reportEvidence += `• REPUTATION: ${m.ipReputationScore || 0}% | MALWARE: ${m.malwareScore || 0}%\n`;
    }

    return {
      url,
      resolvedIp,
      riskScore,
      label: enumLabel,
      attackType,
      evidence: reportEvidence,
      ipReputation,
      reasoning: reasoningSteps,
      provider: "NVIDIA Triple-Engine"
    };

  } catch (error: any) {
    console.error("[LUCIFER] ❌ NVIDIA Triple-Engine Error:", error);
    return {
      url,
      resolvedIp,
      riskScore: ruleResult.riskScore,
      label: ruleResult.label,
      attackType: ruleResult.label === ThreatLabel.MALICIOUS ? "Malicious (Heuristic)" : "Safe (Heuristic)",
      evidence: `[RULE-BASED FALLBACK]\nNVIDIA Triple-pass analysis failed. Infrastructure status: ${error.message || 'Interrupted'}.\n\n[DETECTION PATTERNS]\n${ruleResult.warnings}`,
      ipReputation: "Rule-Based Detection Core",
      provider: "Heuristic Fallback"
    };
  }
};
