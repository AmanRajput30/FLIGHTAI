"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, LogIn } from 'lucide-react';
import { APP_NAVIGATION, WORKSPACE_NAVIGATION } from '@/config/navigation';
import { useAuth } from '@/context/AuthContext';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const renderNavItems = (items: typeof APP_NAVIGATION) => {
    return items.map((item) => {
      // Basic active route matching
      const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');

      return (
        <Link 
          key={item.label}
          href={item.href}
          className={`flex items-center gap-4 px-2 py-2.5 rounded-lg transition-colors group relative overflow-hidden w-full ${
            isActive 
              ? 'bg-aervyn-primary/10 text-white' 
              : 'text-aervyn-text-dark-secondary hover:bg-aervyn-surface-dark-elevated hover:text-white'
          }`}
        >
          {isActive && (
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-aervyn-primary rounded-r-full" />
          )}
          <div className="flex items-center justify-center min-w-[24px]">
            <item.icon size={18} strokeWidth={2} className={`shrink-0 ${isActive ? 'text-aervyn-primary' : ''}`} />
          </div>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-medium whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        </Link>
      );
    });
  };

  return (
    <motion.aside 
      initial={{ width: 64 }}
      whileHover={{ width: 240 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="hidden md:flex flex-col border-r border-aervyn-border-dark bg-aervyn-bg-dark h-full z-40 overflow-hidden relative shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Logo / App Nav */}
      <div className="flex-1 flex flex-col gap-6 mt-4 px-3 w-full overflow-y-auto overflow-x-hidden no-scrollbar">
        <nav className="flex flex-col gap-1 w-full">
          {renderNavItems(APP_NAVIGATION)}
        </nav>

        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-1 w-full"
            >
              <div className="px-3 py-2 text-[10px] font-bold tracking-widest text-aervyn-text-tertiary uppercase mt-2">
                Workspace
              </div>
              {renderNavItems(WORKSPACE_NAVIGATION)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Profile */}
      <div className="mt-auto border-t border-aervyn-border-dark p-3">
        {user ? (
          <Link href="/settings" className="flex items-center gap-3 p-2 rounded-lg hover:bg-aervyn-surface-dark-elevated transition-colors">
            <div className="w-8 h-8 rounded-full bg-aervyn-primary flex items-center justify-center text-white font-bold text-xs shrink-0 uppercase">
              {user.name.substring(0, 2)}
            </div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex items-center justify-between min-w-0"
            >
              <div className="flex flex-col truncate">
                <span className="text-sm font-medium text-white truncate">{user.name}</span>
                <span className="text-xs text-aervyn-text-tertiary truncate">Free Plan</span>
              </div>
              <ChevronRight size={16} className="text-aervyn-text-tertiary shrink-0" />
            </motion.div>
          </Link>
        ) : (
          <Link href="/login" className="flex items-center gap-3 p-2 rounded-lg hover:bg-aervyn-surface-dark-elevated transition-colors">
            <div className="w-8 h-8 rounded-full bg-aervyn-surface-dark-elevated flex items-center justify-center text-aervyn-text-dark-secondary shrink-0">
              <LogIn size={16} />
            </div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex items-center justify-between min-w-0"
            >
              <div className="flex flex-col truncate">
                <span className="text-sm font-medium text-white truncate">Sign In</span>
                <span className="text-xs text-aervyn-text-tertiary truncate">Sync Telemetry</span>
              </div>
              <ChevronRight size={16} className="text-aervyn-text-tertiary shrink-0" />
            </motion.div>
          </Link>
        )}
      </div>
    </motion.aside>
  );
};
