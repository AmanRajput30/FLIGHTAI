"use client";

import React, { useState, useEffect } from 'react';

export const UTCClock: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [time, setTime] = useState<Date | null>(null);
  const [timeZone, setTimeZone] = useState('LOCAL');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now);
      try {
        const tz = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).format(now);
        const parts = tz.split(' ');
        if (parts.length > 0) setTimeZone(parts[parts.length - 1]);
      } catch (e) {}
    };
    tick(); // initial tick
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <div className={`text-xs font-bold tracking-widest text-aervyn-text-tertiary ${className}`}>
        --:--:-- LOCAL
      </div>
    );
  }

  const pad = (n: number) => n.toString().padStart(2, '0');
  
  return (
    <div className={`text-xs font-bold tracking-widest text-aervyn-text-primary flex items-center gap-2 ${className}`}>
      <span>{pad(time.getHours())}:{pad(time.getMinutes())}:{pad(time.getSeconds())}</span>
      <span className="text-[10px] text-aervyn-text-secondary">{timeZone}</span>
    </div>
  );
};
