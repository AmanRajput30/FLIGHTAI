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
      <span className="text-[9px] tracking-widest uppercase text-aervyn-text-tertiary font-labels mb-0.5">{label}</span>
      <div className={`flex items-baseline gap-1 font-telemetry ${state === 'stale' ? 'text-aervyn-status-amber' : 'text-aervyn-text-primary'}`}>
        {isMissing ? (
          <span className="text-lg leading-none opacity-50">--</span>
        ) : (
          <>
            <span className="text-lg leading-none tracking-wide">{value}</span>
            {unit && <span className="text-[10px] leading-none text-aervyn-text-secondary font-labels ml-0.5">{unit}</span>}
          </>
        )}
      </div>
    </div>
  );
};
