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
      className={`border border-aervyn-border-dark rounded-xl flex flex-col overflow-hidden ${bgColors[variant]} ${className} shadow-lg`}
      {...props}
    >
      {state === 'loading' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-aervyn-text-dark-muted text-sm font-medium gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-aervyn-border-dark-subtle border-t-aervyn-primary animate-spin"></div>
          Loading Data...
        </div>
      )}
      {state === 'error' && (
        <div className="flex-1 flex items-center justify-center p-8 text-aervyn-status-error text-sm font-medium">
          Data Unavailable
        </div>
      )}
      {state === 'empty' && (
        <div className="flex-1 flex items-center justify-center p-8 text-aervyn-text-dark-muted text-sm font-medium">
          No Data Available
        </div>
      )}
      {state === 'loaded' && children}
    </div>
  );
};
