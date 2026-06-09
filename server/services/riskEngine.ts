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
    // URL Analysis = 15%
    // Domain Analysis = 15%
    // DNS Analysis = 10%
    // IP Analysis = 10%
    // SSL Analysis = 10%
    // Content Analysis = 15%
    // Threat Intelligence = 25%

    const urlWeight = 0.15;
    const domainWeight = 0.15;
    const dnsWeight = 0.10;
    const ipWeight = 0.10;
    const sslWeight = 0.10;
    const contentWeight = 0.15;
    const threatIntelWeight = 0.25;

    const weightedScore =
      scores.urlScore * urlWeight +
      scores.domainScore * domainWeight +
      scores.dnsScore * dnsWeight +
      scores.ipScore * ipWeight +
      scores.sslScore * sslWeight +
      scores.contentScore * contentWeight +
      scores.threatIntelScore * threatIntelWeight;

    const finalScore = Math.min(100, Math.max(0, Math.round(weightedScore)));

    let level: 'Safe' | 'Low Risk' | 'Suspicious' | 'High Risk' | 'Critical';
    if (finalScore <= 20) {
      level = 'Safe';
    } else if (finalScore <= 40) {
      level = 'Low Risk';
    } else if (finalScore <= 60) {
      level = 'Suspicious';
    } else if (finalScore <= 80) {
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
