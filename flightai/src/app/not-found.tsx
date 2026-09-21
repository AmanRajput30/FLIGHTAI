"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-aervyn-bg-dark flex flex-col items-center justify-center p-6 text-center font-labels">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center max-w-md w-full bg-aervyn-bg-panel p-8 rounded-lg border border-aervyn-border-subtle shadow-2xl"
      >
        <div className="w-16 h-16 rounded-full bg-aervyn-status-red/10 flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-aervyn-status-red" />
        </div>
        
        <h1 className="text-4xl font-bold text-aervyn-text-primary font-numerals mb-2 tracking-wider">
          404
        </h1>
        <h2 className="text-xl font-bold text-aervyn-status-red uppercase tracking-widest mb-4">
          Airspace Not Found
        </h2>
        
        <p className="text-sm text-aervyn-text-secondary leading-relaxed mb-8">
          The requested vector is invalid or the page has been moved. Return to authorized airspace to continue operations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link href="/" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 bg-aervyn-bg-dark hover:bg-aervyn-panel-light text-aervyn-text-secondary border border-aervyn-border-subtle py-3 px-4 rounded text-xs uppercase tracking-widest font-bold transition-all">
              <ArrowLeft className="w-4 h-4" />
              Homepage
            </button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 bg-aervyn-status-cyan/10 hover:bg-aervyn-status-cyan/20 text-aervyn-status-cyan border border-aervyn-status-cyan/30 py-3 px-4 rounded text-xs uppercase tracking-widest font-bold transition-all">
              Dashboard
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
