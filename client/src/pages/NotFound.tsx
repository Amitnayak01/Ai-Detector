import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen pt-14 flex items-center justify-center grid-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 px-4"
      >
        <div className="font-display text-8xl font-bold text-gradient">404</div>
        <p className="text-gray-400">Page not found</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/20 border border-accent/30 text-sm text-accent-light hover:bg-accent/30 transition-all"
        >
          <Home size={14} />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
