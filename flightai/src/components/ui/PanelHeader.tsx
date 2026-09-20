import React from 'react';

export interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  className?: string;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({ title, subtitle, rightElement, className = '' }) => {
  return (
    <div className={`px-4 py-2 border-b border-aervyn-border-subtle bg-aervyn-panel-dark flex items-center justify-between ${className}`}>
      <div className="flex items-baseline gap-2">
        <h2 className="text-xs font-bold tracking-widest uppercase text-aervyn-text-primary font-labels">{title}</h2>
        {subtitle && <span className="text-[10px] tracking-wider uppercase text-aervyn-text-tertiary font-labels">{subtitle}</span>}
      </div>
      {rightElement && <div>{rightElement}</div>}
    </div>
  );
};
