import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scan, History, Zap } from 'lucide-react';

// Import Server Status Indicator
import ServerStatusIndicator from '../ui/ServerStatusIndicator';

export function Navbar() {
  const { pathname } = useLocation();

  const links = [
    { to: '/', label: 'Scan', icon: Scan },
    { to: '/history', label: 'History', icon: History },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
            <Zap size={14} className="text-accent-light" />
          </div>

          <span className="font-display font-semibold text-white text-sm tracking-tight">
            Pixel<span className="text-gradient">Truth</span>
          </span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          
          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => {
              const active =
                pathname === to ||
                (to !== '/' && pathname.startsWith(to));

              return (
                <Link key={to} to={to} className="relative">
                  <motion.div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? 'text-white bg-accent/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon size={13} />
                    {label}

                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-lg border border-accent/30"
                        initial={false}
                        transition={{
                          type: 'spring',
                          bounce: 0.2,
                          duration: 0.4,
                        }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Server Status Indicator */}
          <div className="hidden sm:flex">
            <ServerStatusIndicator showLatency={true} />
          </div>

          {/* Mobile Compact Indicator */}
          <div className="flex sm:hidden">
            <ServerStatusIndicator compact={true} />
          </div>
        </div>
      </div>
    </header>
  );
}