import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUpload } from '../context/UploadContext';
import { VerdictBanner } from '../components/ui/VerdictBanner';
import { ResultsCard } from '../components/ui/ResultsCard';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';

export default function Results() {
  const { state, reset } = useUpload();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    if (state.stage !== 'done') {
      navigate('/', { replace: true });
    }
  }, [state.stage, navigate]);

  if (state.stage !== 'done') return null;

  const { result } = state;

  const handleShare = async () => {
    const text = `PixelTruth Analysis: "${result.verdict.replace('_', ' ')}" — ${Math.round(result.confidence_ai * 100)}% AI confidence`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'PixelTruth Analysis', text, url: result.imageUrl });
      } else {
        await navigator.clipboard.writeText(`${text}\n${result.imageUrl}`);
        addToast('Copied to clipboard!', 'success');
      }
    } catch {
      addToast('Could not share', 'error');
    }
  };

  const handleReset = () => {
    reset();
    navigate('/');
  };

  return (
    <div className="min-h-screen pt-14 grid-bg">
      <div className="max-w-xl mx-auto px-4 py-10 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-2"
        >
          <h1 className="font-display text-xl font-bold text-white">Scan Results</h1>
          <span className="text-xs text-gray-500 font-mono">
            {new Date(result.createdAt).toLocaleString()}
          </span>
        </motion.div>

        <VerdictBanner verdict={result.verdict} confidence={result.confidence_ai} />
        <ResultsCard result={result} onShare={handleShare} onReset={handleReset} />
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
