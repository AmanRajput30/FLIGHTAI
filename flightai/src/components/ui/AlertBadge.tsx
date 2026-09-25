import React from 'react';

export type AlertLevel = 'critical' | 'warning' | 'info';

export const AlertBadge: React.FC<{ level: AlertLevel; message: string; className?: string }> = ({ level, message, className = '' }) => {
  const styles = {
    critical: 'bg-aervyn-status-red/10 border-aervyn-status-red text-aervyn-status-red',
    warning: 'bg-aervyn-status-amber/10 border-aervyn-status-amber text-aervyn-status-amber',
    info: 'bg-aervyn-status-blue/10 border-aervyn-status-blue text-aervyn-status-blue'
  };

  return (
    <div className={`px-2 py-1 border rounded text-[9px] font-bold tracking-widest uppercase ${styles[level]} ${className}`}>
      {message}
    </div>
  );
};
