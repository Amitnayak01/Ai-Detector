import { motion } from 'framer-motion';

interface Props {
  label: string;
  value: number;
  color: string;
  delay?: number;
}

export function ConfidenceBar({ label, value, color, delay = 0 }: Props) {
  const pct = Math.round(value * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="font-mono text-xs font-medium" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>
    </div>
  );
}
