import React from 'react';

export type OperationalState = 'blue' | 'cyan' | 'green' | 'amber' | 'red' | 'offline';

export const StatusIndicator: React.FC<{ state: OperationalState; ping?: boolean; className?: string }> = ({ state, ping = false, className = '' }) => {
  const colorMap = {
    blue: 'bg-aervyn-primary',
    cyan: 'bg-aervyn-primary',
    green: 'bg-aervyn-status-success',
    amber: 'bg-aervyn-status-warning',
    red: 'bg-aervyn-status-error',
    offline: 'bg-aervyn-text-dark-muted'
  };
  
  const color = colorMap[state];

  return (
    <span className={`relative flex h-2 w-2 ${className}`}>
      {ping && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color}`}></span>}
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`}></span>
    </span>
  );
};
