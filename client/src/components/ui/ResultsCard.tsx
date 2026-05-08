import { motion } from 'framer-motion';
import { Users, Shield, ShieldOff, Clock, ExternalLink, Share2, RotateCcw } from 'lucide-react';
import { ScanResult } from '../../types';
import { getVerdictMeta, formatMs, formatBytes } from '../../utils/verdict';
import { ConfidenceBar } from './ConfidenceBar';

interface Props {
  result: ScanResult;
  onShare?: () => void;
  onReset?: () => void;
}

export function ResultsCard({ result, onShare, onReset }: Props) {
  const meta = getVerdictMeta(result.verdict);

  const stats = [
    {
      icon: result.is_deepfake ? ShieldOff : Shield,
      label: 'Deepfake',
      value: result.is_deepfake ? 'Detected' : 'None',
      color: result.is_deepfake ? '#ef4444' : '#22c55e',
    },
    {
      icon: Users,
      label: 'Faces',
      value: result.face_count === 0 ? 'None' : `${result.face_count}`,
      color: '#6366f1',
    },
    {
      icon: Clock,
      label: 'Scan Time',
      value: formatMs(result.scan_time_ms),
      color: '#94a3b8',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="glass rounded-2xl p-6 space-y-5"
    >
      {/* Image */}
      <div className="relative rounded-xl overflow-hidden border border-border aspect-video bg-surface flex items-center justify-center">
        <img
          src={result.imageUrl}
          alt="Scanned"
          className="max-w-full max-h-64 object-contain"
        />
        <a
          href={result.imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 right-2 p-1.5 glass rounded-lg hover:bg-white/10 transition-colors"
        >
          <ExternalLink size={12} className="text-gray-400" />
        </a>
      </div>

      {/* Confidence bars */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</h3>
        <ConfidenceBar label="AI Generated" value={result.confidence_ai} color="#ef4444" delay={0.1} />
        <ConfidenceBar label="Real Photo" value={result.confidence_real} color="#22c55e" delay={0.2} />
        {result.deepfake_score > 0 && (
          <ConfidenceBar label="Deepfake" value={result.deepfake_score} color="#f97316" delay={0.3} />
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-surface/50 rounded-xl p-3 text-center border border-border/50">
            <Icon size={16} className="mx-auto mb-1.5" style={{ color }} />
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-medium text-gray-200 mt-0.5" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Deepfake badge */}
      {result.is_deepfake && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
        >
          <ShieldOff size={13} className="text-red-400" />
          <span className="text-xs text-red-300 font-medium">
            Deepfake detected — {Math.round(result.deepfake_score * 100)}% confidence
          </span>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-xs text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-all"
        >
          <RotateCcw size={12} />
          Scan Another
        </button>
        <button
          onClick={onShare}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent/20 border border-accent/30 text-xs text-accent-light hover:bg-accent/30 transition-all"
        >
          <Share2 size={12} />
          Share
        </button>
      </div>
    </motion.div>
  );
}
