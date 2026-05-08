import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ImageIcon, X, AlertCircle } from 'lucide-react';
import { useUpload } from '../../context/UploadContext';
import { formatBytes } from '../../utils/verdict';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024;

export function DropZone() {
  const { state, selectFile, submitUpload } = useUpload();
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (file: File): string | null => {
    if (!ACCEPTED.includes(file.type)) return 'Invalid type. Use JPEG, PNG, WEBP, or GIF.';
    if (file.size > MAX_SIZE) return `File too large. Max size is 5MB (got ${formatBytes(file.size)}).`;
    return null;
  };

  const handleFile = useCallback((file: File) => {
    const err = validate(file);
    if (err) { setError(err); return; }
    setError(null);
    selectFile(file);
  }, [selectFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);

  const isSelecting = state.stage === 'selecting';
  const preview = isSelecting ? (state as any).preview : null;
  const file = isSelecting ? (state as any).file : null;

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Drop zone */}
      <motion.div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !isSelecting && inputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden cursor-pointer ${
          dragOver
            ? 'drop-zone-active'
            : isSelecting
            ? 'border-accent/30 bg-accent/5 cursor-default'
            : 'border-border hover:border-accent/40 hover:bg-white/[0.02]'
        }`}
        style={{ minHeight: 280 }}
        whileHover={!isSelecting ? { scale: 1.005 } : {}}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <AnimatePresence mode="wait">
          {isSelecting && preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full"
            >
              <img
                src={preview}
                alt="Preview"
                className="w-full object-contain rounded-xl"
                style={{ maxHeight: 320 }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setError(null);
                  // Reset to idle via selecting a new file
                  inputRef.current?.click();
                }}
                className="absolute top-3 right-3 p-1.5 glass rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={14} className="text-gray-400" />
              </button>
              <div className="absolute bottom-3 left-3 glass rounded-lg px-2 py-1 flex items-center gap-1.5">
                <ImageIcon size={11} className="text-accent-light" />
                <span className="text-xs text-gray-300 font-mono truncate max-w-[180px]">{file?.name}</span>
                <span className="text-xs text-gray-500">·</span>
                <span className="text-xs text-gray-500">{formatBytes(file?.size || 0)}</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-12 gap-4"
            >
              <motion.div
                animate={dragOver ? { scale: 1.2 } : { scale: 1 }}
                className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center"
              >
                <Upload size={24} className={dragOver ? 'text-accent-light' : 'text-accent/60'} />
              </motion.div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-gray-200">
                  {dragOver ? 'Drop it!' : 'Drop an image or click to browse'}
                </p>
                <p className="text-xs text-gray-500">JPEG · PNG · WEBP · GIF · Max 5MB</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drag overlay glow */}
        {dragOver && (
          <div className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{ boxShadow: 'inset 0 0 60px rgba(99,102,241,0.1)' }} />
        )}
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <AlertCircle size={14} className="text-red-400 shrink-0" />
            <p className="text-xs text-red-300">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      <AnimatePresence>
        {isSelecting && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={submitUpload}
            className="w-full py-3 rounded-xl bg-accent hover:bg-accent-light font-display font-semibold text-sm text-white transition-all duration-200 glow-sm hover:glow-accent"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Analyze Image →
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
