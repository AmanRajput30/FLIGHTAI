"use client";

import React, { useState, useEffect } from 'react';

export const UTCClock: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <div className={`font-labels text-xs font-bold tracking-widest text-aervyn-text-tertiary ${className}`}>
        --:--:-- UTC
      </div>
    );
  }

  const pad = (n: number) => n.toString().padStart(2, '0');
  
  return (
    <div className={`font-labels text-xs font-bold tracking-widest text-aervyn-text-primary flex items-center gap-2 ${className}`}>
      <span>{pad(time.getUTCHours())}:{pad(time.getUTCMinutes())}:{pad(time.getUTCSeconds())}</span>
      <span className="text-[10px] text-aervyn-text-secondary">UTC</span>
    </div>
  );
};
