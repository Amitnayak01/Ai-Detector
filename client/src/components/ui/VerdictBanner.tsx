import { motion } from 'framer-motion';
import { Bot, ShieldCheck, HelpCircle, AlertTriangle, ImageIcon } from 'lucide-react';
import { Verdict } from '../../types';
import { getVerdictMeta } from '../../utils/verdict';

const ICONS = { Bot, ShieldCheck, HelpCircle, AlertTriangle, ImageIcon };

interface Props {
  verdict: Verdict;
  confidence: number;
}

export function VerdictBanner({ verdict, confidence }: Props) {
  const meta = getVerdictMeta(verdict);
  const Icon = ICONS[meta.icon as keyof typeof ICONS] || ShieldCheck;
  const pct = Math.round(confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
      className={`relative rounded-2xl border p-6 overflow-hidden ${meta.bgClass} ${meta.borderClass}`}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${meta.color}, transparent 70%)`,
        }}
      />

      <div className="relative flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: `${meta.color}20`, border: `1px solid ${meta.color}40` }}
        >
          <Icon size={26} style={{ color: meta.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3">
            <h2 className={`font-display text-2xl font-bold ${meta.textClass}`}>{meta.label}</h2>
            <span className="font-mono text-sm text-gray-400">{pct}% confidence</span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">{meta.description}</p>
        </div>
      </div>
    </motion.div>
  );
}
