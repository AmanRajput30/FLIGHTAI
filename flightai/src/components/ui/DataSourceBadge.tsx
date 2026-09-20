import React from 'react';
import { StatusIndicator, OperationalState } from './StatusIndicator';

export const DataSourceBadge: React.FC<{ name: string; state: OperationalState; statusText?: string }> = ({ name, state, statusText }) => {
  return (
    <div className="flex items-center justify-between py-1.5 px-3 border border-aervyn-border-subtle rounded bg-aervyn-panel-dark">
      <span className="font-labels text-[10px] font-bold tracking-wider text-aervyn-text-secondary">{name}</span>
      <div className="flex items-center gap-2">
        {statusText && <span className="font-labels text-[9px] tracking-widest uppercase text-aervyn-text-tertiary">{statusText}</span>}
        <StatusIndicator state={state} />
      </div>
    </div>
  );
};
