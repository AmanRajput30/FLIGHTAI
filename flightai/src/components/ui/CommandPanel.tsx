import React from 'react';
import { motion } from 'framer-motion';

export interface CommandPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'dark' | 'light';
  state?: 'loaded' | 'loading' | 'empty' | 'error';
  children?: React.ReactNode;
}

export const CommandPanel: React.FC<CommandPanelProps> = ({ 
  variant = 'base', 
  state = 'loaded', 
  className = '', 
  children, 
  ...props 
}) => {
  const bgColors = {
    base: 'bg-aervyn-panel-base',
    dark: 'bg-aervyn-panel-dark',
    light: 'bg-aervyn-panel-light'
  };

  return (
    <div 
      className={`border border-aervyn-border-subtle rounded flex flex-col overflow-hidden ${bgColors[variant]} ${className}`}
      {...props}
    >
      {state === 'loading' && (
        <div className="flex-1 flex items-center justify-center p-8 text-aervyn-text-tertiary text-xs tracking-widest uppercase font-labels">
          <span className="animate-pulse">Loading Data...</span>
        </div>
      )}
      {state === 'error' && (
        <div className="flex-1 flex items-center justify-center p-8 text-aervyn-status-red text-xs tracking-widest uppercase font-labels">
          Data Unavailable
        </div>
      )}
      {state === 'empty' && (
        <div className="flex-1 flex items-center justify-center p-8 text-aervyn-text-tertiary text-xs tracking-widest uppercase font-labels">
          No Data Available
        </div>
      )}
      {state === 'loaded' && children}
    </div>
  );
};
