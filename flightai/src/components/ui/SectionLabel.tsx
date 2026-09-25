import React from 'react';

export const SectionLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-[10px] font-bold tracking-[0.15em] uppercase text-aervyn-text-secondary mb-2 ${className}`}>
    {children}
  </h3>
);
