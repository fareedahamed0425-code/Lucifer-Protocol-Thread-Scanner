export interface RiskReport {
  score: number;
  level: 'Safe' | 'Low Risk' | 'Suspicious' | 'High Risk' | 'Critical';
}

export const riskEngine = {
  calculate: (scores: {
    urlScore: number;
    domainScore: number;
    dnsScore: number;
    ipScore: number;
    sslScore: number;
    contentScore: number;
    threatIntelScore: number;
  }): RiskReport => {
    // Weights:
    // URL Analysis       = 15%
    // Domain Analysis    = 15%
    // DNS Analysis       = 12%  (raised: missing SPF/DMARC is a strong signal)
    // IP Analysis        = 10%
    // SSL Analysis       = 10%
    // Content Analysis   = 18%  (raised: credential harvesting is very telling)
    // Threat Intelligence = 20%

    const urlWeight = 0.15;
    const domainWeight = 0.15;
    const dnsWeight = 0.12;
    const ipWeight = 0.10;
    const sslWeight = 0.10;
    const contentWeight = 0.18;
    const threatIntelWeight = 0.20;

    const weightedScore =
      scores.urlScore * urlWeight +
      scores.domainScore * domainWeight +
      scores.dnsScore * dnsWeight +
      scores.ipScore * ipWeight +
      scores.sslScore * sslWeight +
      scores.contentScore * contentWeight +
      scores.threatIntelScore * threatIntelWeight;

    // ── Peak-Signal Escalation ─────────────────────────────────────────────
    // If ANY single module scores very high, the site cannot hide behind a
    // low weighted average.  We take the maximum individual module score and
    // blend it in so a critical signal always propagates to the final score.
    const allModuleScores = [
      scores.urlScore,
      scores.domainScore,
      scores.dnsScore,
      scores.ipScore,
      scores.sslScore,
      scores.contentScore,
      scores.threatIntelScore
    ];
    const maxModuleScore = Math.max(...allModuleScores);

    // Count how many modules are elevated (≥ 40)
    const elevatedModules = allModuleScores.filter(s => s >= 40).length;

    // Blend: 60 % weighted average  +  40 % peak signal
    // This prevents a single bad module from being diluted to nothing.
    let blendedScore = weightedScore * 0.60 + maxModuleScore * 0.40;

    // Corroboration bonus: multiple elevated modules confirms a real threat
    if (elevatedModules >= 3) {
      blendedScore += 15;
    } else if (elevatedModules === 2) {
      blendedScore += 7;
    }

    const finalScore = Math.min(100, Math.max(0, Math.round(blendedScore)));

    // ── Risk Level Bands ───────────────────────────────────────────────────
    // Tightened 'Safe' ceiling from 20 → 15 so marginal signals aren't ignored.
    let level: 'Safe' | 'Low Risk' | 'Suspicious' | 'High Risk' | 'Critical';
    if (finalScore <= 15) {
      level = 'Safe';
    } else if (finalScore <= 35) {
      level = 'Low Risk';
    } else if (finalScore <= 55) {
      level = 'Suspicious';
    } else if (finalScore <= 75) {
      level = 'High Risk';
    } else {
      level = 'Critical';
    }

    return {
      score: finalScore,
      level
    };
  }
};
