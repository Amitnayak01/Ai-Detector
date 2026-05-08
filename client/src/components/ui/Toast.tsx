import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface Props {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ICONS = {
  success: <CheckCircle size={14} className="text-green-400" />,
  error: <XCircle size={14} className="text-red-400" />,
  info: <Info size={14} className="text-blue-400" />,
};

export function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.9 }}
            className="glass-strong rounded-xl px-4 py-3 flex items-center gap-3 pointer-events-auto max-w-xs shadow-xl"
          >
            {ICONS[t.type]}
            <span className="text-xs text-gray-200 flex-1">{t.message}</span>
            <button onClick={() => onRemove(t.id)} className="text-gray-600 hover:text-gray-400 transition-colors">
              <X size={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
