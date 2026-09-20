import React from 'react';
import { StatusIndicator, OperationalState } from './StatusIndicator';

export interface FlightStatusProps {
  statusText: string;
  state: OperationalState;
  className?: string;
}

export const FlightStatus: React.FC<FlightStatusProps> = ({ statusText, state, className = '' }) => {
  const textColorMap = {
    blue: 'text-aervyn-status-blue',
    cyan: 'text-aervyn-status-cyan',
    green: 'text-aervyn-status-green',
    amber: 'text-aervyn-status-amber',
    red: 'text-aervyn-status-red',
    offline: 'text-aervyn-text-tertiary'
  };

  return (
    <div className={`flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase font-labels ${textColorMap[state]} ${className}`}>
      <StatusIndicator state={state} ping={state === 'green' || state === 'blue'} />
      {statusText}
    </div>
  );
};
