import React from 'react';
import { StatusIndicator, OperationalState } from './StatusIndicator';

export interface FlightStatusProps {
  statusText: string;
  state: OperationalState;
  className?: string;
}

export const FlightStatus: React.FC<FlightStatusProps> = ({ statusText, state, className = '' }) => {
  const textColorMap = {
    blue: 'text-aervyn-primary',
    cyan: 'text-aervyn-primary',
    green: 'text-aervyn-status-success',
    amber: 'text-aervyn-status-warning',
    red: 'text-aervyn-status-error',
    offline: 'text-aervyn-text-dark-muted'
  };

  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${textColorMap[state]} ${className}`}>
      <StatusIndicator state={state} ping={state === 'green' || state === 'blue'} />
      {statusText}
    </div>
  );
};
