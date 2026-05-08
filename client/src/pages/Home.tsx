import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Cpu, Eye } from 'lucide-react';
import { useUpload } from '../context/UploadContext';
import { DropZone } from '../components/ui/DropZone';
import { ProgressOverlay } from '../components/ui/ProgressOverlay';

const FEATURES = [
  { icon: Scan, label: 'AI Detection', desc: 'Advanced neural analysis' },
  { icon: Cpu, label: 'Deepfake Check', desc: 'Face manipulation detection' },
  { icon: Eye, label: 'Instant Results', desc: 'Analysis in seconds' },
];

export default function Home() {
  const { state, reset } = useUpload();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.stage === 'done') {
      navigate('/results', { replace: true });
    }
  }, [state.stage, navigate]);

  const isProcessing = state.stage === 'uploading' || state.stage === 'analyzing';

  return (
    <div className="min-h-screen pt-14 grid-bg">
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-accent/20 text-xs text-accent-light mb-2">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-accent"
            />
            Powered by Sightengine AI
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
            Is it real, or{' '}
            <span className="text-gradient">AI-generated?</span>
          </h1>

          <p className="text-gray-400 text-base max-w-lg mx-auto leading-relaxed">
            Upload any image and our advanced AI will detect whether it was created by a machine — including deepfakes.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-center gap-6 mt-8 mb-10"
        >
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex flex-col items-center gap-1 text-center">
              <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-1">
                <Icon size={15} className="text-accent-light" />
              </div>
              <p className="text-xs font-medium text-gray-200">{label}</p>
              <p className="text-[10px] text-gray-500">{desc}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProgressOverlay
                progress={(state as any).progress || 0}
                stage={state.stage as 'uploading' | 'analyzing'}
                preview={(state as any).preview}
              />
            </motion.div>
          ) : state.stage === 'error' ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass rounded-2xl p-8 text-center space-y-4">
              <p className="text-red-400 font-medium">Analysis failed</p>
              <p className="text-sm text-gray-500">{state.message}</p>
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg bg-accent/20 border border-accent/30 text-xs text-accent-light hover:bg-accent/30 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          ) : (
            <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DropZone />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
