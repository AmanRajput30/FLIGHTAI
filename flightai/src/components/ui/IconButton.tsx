import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  isActive?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon: Icon, isActive, className = '', ...props }) => {
  return (
    <button 
      className={`p-1.5 rounded transition-colors flex items-center justify-center ${isActive ? 'bg-aervyn-border-active text-aervyn-text-primary' : 'text-aervyn-text-tertiary hover:bg-aervyn-border-subtle hover:text-aervyn-text-secondary'} ${className}`}
      {...props}
    >
      <Icon size={16} strokeWidth={2} />
    </button>
  );
};
