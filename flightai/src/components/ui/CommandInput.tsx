import React from 'react';
import { Search } from 'lucide-react';

export interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const CommandInput: React.FC<CommandInputProps> = ({ className = '', ...props }) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search size={14} className="absolute left-3 text-aervyn-text-tertiary" />
      <input 
        className="w-full bg-aervyn-panel-dark border border-aervyn-border-subtle rounded py-1.5 pl-9 pr-3 text-xs font-labels text-aervyn-text-primary placeholder:text-aervyn-text-tertiary focus:outline-none focus:border-aervyn-status-cyan transition-colors"
        {...props}
      />
    </div>
  );
};
