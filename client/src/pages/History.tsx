import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronLeft, ChevronRight, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { getHistory, deleteScan, clearHistory } from '../utils/api';
import { HistoryScan, PaginationInfo } from '../types';
import { getVerdictMeta, formatBytes, formatMs } from '../utils/verdict';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';

export default function History() {
  const [scans, setScans] = useState<HistoryScan[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await getHistory(p, 12);
      setScans(res.scans);
      setPagination(res.pagination);
    } catch {
      addToast('Failed to load history', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteScan(id);
      setScans((prev) => prev.filter((s) => (s as any)._id !== id && s.id !== id));
      addToast('Scan deleted', 'success');
      if (scans.length === 1 && page > 1) setPage((p) => p - 1);
      else load(page);
    } catch {
      addToast('Failed to delete scan', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Delete all scan history? This cannot be undone.')) return;
    setClearing(true);
    try {
      await clearHistory();
      setScans([]);
      setPagination(null);
      setPage(1);
      addToast('All history cleared', 'success');
    } catch {
      addToast('Failed to clear history', 'error');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="min-h-screen pt-14 grid-bg">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Scan History</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {pagination ? `${pagination.total} total scan${pagination.total !== 1 ? 's' : ''}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => load(page)}
              disabled={loading}
              className="p-2 rounded-lg glass border border-border hover:border-gray-600 transition-all text-gray-400 hover:text-gray-200 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            {scans.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={clearing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
              >
                <Trash2 size={12} />
                {clearing ? 'Clearing…' : 'Clear All'}
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-border">
                <div className="aspect-video shimmer-loading" />
                <div className="p-3 space-y-2">
                  <div className="h-3 shimmer-loading rounded w-2/3" />
                  <div className="h-2 shimmer-loading rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : scans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-border flex items-center justify-center">
              <Clock size={24} className="text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No scans yet</p>
            <p className="text-sm text-gray-600">Upload an image to start scanning</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {scans.map((scan, i) => {
                const id = (scan as any)._id || scan.id;
                const meta = getVerdictMeta(scan.verdict);
                const isDeleting = deletingId === id;

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.04 }}
                    className={`glass rounded-2xl overflow-hidden border transition-all duration-300 group ${
                      isDeleting ? 'opacity-40 scale-95' : 'border-border hover:border-accent/30'
                    }`}
                  >
                    {/* Image */}
                    <div className="relative aspect-video bg-surface overflow-hidden">
                      <img
                        src={scan.imageUrl}
                        alt={scan.originalName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Verdict badge */}
                      <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-medium border ${meta.bgClass} ${meta.borderClass} ${meta.textClass}`}>
                        {meta.label}
                      </div>
                      {/* Delete btn */}
                      <button
                        onClick={() => handleDelete(id)}
                        disabled={isDeleting}
                        className="absolute top-2 right-2 p-1.5 glass rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                      >
                        <Trash2 size={11} className="text-red-400" />
                      </button>
                      {/* Deepfake warning */}
                      {scan.is_deepfake && (
                        <div className="absolute bottom-2 left-2 p-1 rounded-md bg-red-500/20 border border-red-500/30">
                          <AlertTriangle size={10} className="text-red-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 space-y-1.5">
                      <p className="text-xs font-medium text-gray-200 truncate">{scan.originalName}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-gray-500">
                          {Math.round(scan.confidence_ai * 100)}% AI
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-600">{formatBytes(scan.fileSize)}</span>
                        <span className="text-[10px] text-gray-600">{formatMs(scan.scan_time_ms)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!pagination.hasPrev || loading}
              className="p-2 rounded-lg glass border border-border disabled:opacity-40 hover:border-accent/40 transition-all"
            >
              <ChevronLeft size={14} className="text-gray-400" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let p = i + 1;
                if (pagination.pages > 5) {
                  if (page <= 3) p = i + 1;
                  else if (page >= pagination.pages - 2) p = pagination.pages - 4 + i;
                  else p = page - 2 + i;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                      p === page
                        ? 'bg-accent text-white'
                        : 'glass border border-border text-gray-400 hover:border-accent/40'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNext || loading}
              className="p-2 rounded-lg glass border border-border disabled:opacity-40 hover:border-accent/40 transition-all"
            >
              <ChevronRight size={14} className="text-gray-400" />
            </button>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
