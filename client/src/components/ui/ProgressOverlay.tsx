import { motion } from 'framer-motion';
import { Cpu, Upload } from 'lucide-react';

interface Props {
  progress: number;
  stage: 'uploading' | 'analyzing';
  preview?: string;
}

export function ProgressOverlay({ progress, stage, preview }: Props) {
  const isAnalyzing = stage === 'analyzing';
  const displayPct = isAnalyzing ? Math.round(50 + Math.random() * 45) : progress;

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Image preview with scan overlay */}
      {preview && (
        <div className="relative rounded-2xl overflow-hidden border border-border" style={{ minHeight: 220 }}>
          <img src={preview} alt="Scanning" className="w-full object-contain opacity-60" style={{ maxHeight: 280 }} />
          {isAnalyzing && (
            <div className="absolute inset-0 scan-overlay pointer-events-none" />
          )}
          {isAnalyzing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Cpu size={14} className="text-accent-light" />
                </motion.div>
                <span className="text-xs font-mono text-accent-light">Analyzing…</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-accent"
            />
            <span className="text-sm font-medium text-gray-200">
              {isAnalyzing ? 'Running AI analysis…' : 'Uploading image…'}
            </span>
          </div>
          <span className="font-mono text-xs text-accent-light">
            {isAnalyzing ? '~' : ''}{Math.min(displayPct, 99)}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: isAnalyzing
                ? 'linear-gradient(90deg, #6366f1, #818cf8, #6366f1)'
                : 'linear-gradient(90deg, #6366f1, #818cf8)',
              backgroundSize: isAnalyzing ? '200% 100%' : '100% 100%',
            }}
            initial={{ width: 0 }}
            animate={{
              width: isAnalyzing ? '75%' : `${progress}%`,
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Steps */}
        <div className="flex gap-4">
          {[
            { icon: Upload, label: 'Upload', done: true },
            { icon: Cpu, label: 'Analyze', done: false },
          ].map(({ icon: Icon, label, done }, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                (i === 0 || isAnalyzing)
                  ? 'bg-accent/20 border-accent/50'
                  : 'bg-border border-border'
              }`}>
                <Icon size={9} className={
                  (i === 0 || isAnalyzing) ? 'text-accent-light' : 'text-gray-600'
                } />
              </div>
              <span className={`text-xs ${
                (i === 0 || isAnalyzing) ? 'text-gray-300' : 'text-gray-600'
              }`}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
