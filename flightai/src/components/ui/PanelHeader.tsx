import React from 'react';

export interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  className?: string;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({ title, subtitle, rightElement, className = '' }) => {
  return (
    <div className={`px-5 py-3 border-b border-aervyn-border-dark bg-aervyn-surface-dark-elevated flex items-center justify-between shrink-0 ${className}`}>
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-aervyn-text-dark-primary">{title}</h2>
        {subtitle && <span className="text-xs font-medium text-aervyn-text-dark-muted">{subtitle}</span>}
      </div>
      {rightElement && <div>{rightElement}</div>}
    </div>
  );
};
