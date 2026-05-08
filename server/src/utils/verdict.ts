import { Verdict } from '../models/Scan';

export function mapVerdict(aiScore: number): Verdict {
  if (aiScore >= 0.85) return 'AI_GENERATED';
  if (aiScore >= 0.65) return 'LIKELY_AI';
  if (aiScore >= 0.40) return 'UNCERTAIN';
  if (aiScore >= 0.20) return 'LIKELY_REAL';
  return 'REAL';
}

export function verdictLabel(verdict: Verdict): string {
  const labels: Record<Verdict, string> = {
    AI_GENERATED: 'AI Generated',
    LIKELY_AI: 'Likely AI',
    UNCERTAIN: 'Uncertain',
    LIKELY_REAL: 'Likely Real',
    REAL: 'Real Photo',
  };
  return labels[verdict];
}

export function verdictColor(verdict: Verdict): string {
  const colors: Record<Verdict, string> = {
    AI_GENERATED: '#ef4444',
    LIKELY_AI: '#f97316',
    UNCERTAIN: '#f59e0b',
    LIKELY_REAL: '#84cc16',
    REAL: '#22c55e',
  };
  return colors[verdict];
}
