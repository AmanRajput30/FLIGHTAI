import React from 'react';

export const TelemetryRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`grid grid-cols-2 gap-4 ${className}`}>
    {children}
  </div>
);
