interface QualityScore {
  score: number; // 0-100
  reason: string;
}

export const evaluateQuality = (source: string, content: string): QualityScore => {
  let score = 50; // Base score
  let reason = 'Baseline score.';

  // Source-based scoring
  if (source.includes('edu') || source.includes('gov') || source.includes('org')) {
    score += 30;
    reason += ' Reputable source (edu/gov/org).';
  } else if (source.includes('wikipedia.org')) {
    score += 20;
    reason += ' Wikipedia source (generally reliable but editable).';
  } else {
    score -= 20;
    reason += ' Unknown or less reputable source.';
  }

  // Content-based scoring
  if (content.length < 100) {
    score -= 10;
    reason += ' Content is too short to be reliable.';
  }
  if (content.toLowerCase().includes('opinion') || content.toLowerCase().includes('speculation')) {
    score -= 15;
    reason += ' Content contains speculative language.';
  }

  return { score: Math.max(0, Math.min(100, score)), reason };
};
