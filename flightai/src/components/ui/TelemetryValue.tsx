import React from 'react';

export interface TelemetryValueProps {
  label: string;
  value: string | number | null;
  unit?: string;
  state?: 'live' | 'stale' | 'missing';
  className?: string;
}

export const TelemetryValue: React.FC<TelemetryValueProps> = ({ label, value, unit, state = 'live', className = '' }) => {
  const isMissing = value === null || value === undefined || state === 'missing';
  
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-xs text-aervyn-text-dark-muted font-medium mb-0.5">{label}</span>
      <div className={`flex items-baseline gap-1 ${state === 'stale' ? 'text-aervyn-status-warning' : 'text-aervyn-text-dark-primary'}`}>
        {isMissing ? (
          <span className="text-lg leading-none opacity-50 font-semibold">--</span>
        ) : (
          <>
            <span className="text-lg leading-none font-semibold">{value}</span>
            {unit && <span className="text-xs leading-none text-aervyn-text-dark-secondary font-medium ml-0.5">{unit}</span>}
          </>
        )}
      </div>
    </div>
  );
};
